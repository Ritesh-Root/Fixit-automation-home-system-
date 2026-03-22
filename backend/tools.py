"""FixIt Agent Tools — 7 tool definitions + execute_tool() dispatcher.

Each tool queries/mutates the Supabase database and returns structured data
that the Claude agent uses to drive the conversation.
"""

import os
import json
import random
from datetime import datetime, timedelta
from db import get_db


# ─── Tool Definitions for Claude API ─────────────────────────────────────────

TOOL_DEFINITIONS = [
    {
        "name": "classify_issue",
        "description": "Classify the user's home service issue into a category and urgency level. ALWAYS call this on the user's FIRST message describing a problem. Returns the service category, urgency, and any follow-up questions to ask.",
        "input_schema": {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "description": "The user's message describing their home service issue",
                },
            },
            "required": ["message"],
        },
    },
    {
        "name": "search_vendors",
        "description": "Search for available vendors/service providers based on the service category and location. Returns the top 3-5 vendors with ratings, prices, and availability. Call this after classifying the issue when you know the category.",
        "input_schema": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "description": "The service category slug (e.g., 'ac_repair', 'plumbing', 'electrician', 'cleaning', 'pest_control', 'appliance_repair')",
                },
                "location": {
                    "type": "string",
                    "description": "The user's city or location",
                    "default": "San Francisco",
                },
                "urgency": {
                    "type": "string",
                    "enum": ["low", "medium", "high", "emergency"],
                    "description": "How urgent the service is needed",
                },
                "preferred_date": {
                    "type": "string",
                    "description": "Preferred date in YYYY-MM-DD format (optional)",
                },
            },
            "required": ["category"],
        },
    },
    {
        "name": "check_availability",
        "description": "Check available time slots for a specific vendor on a given date. Use this when the user shows interest in a specific vendor or wants to see available times.",
        "input_schema": {
            "type": "object",
            "properties": {
                "vendor_id": {
                    "type": "string",
                    "description": "The UUID of the vendor to check",
                },
                "date": {
                    "type": "string",
                    "description": "Date to check in YYYY-MM-DD format",
                },
                "preferred_time": {
                    "type": "string",
                    "description": "Preferred time of day (e.g., 'morning', 'afternoon', 'evening', or specific time like '2:00 PM')",
                },
            },
            "required": ["vendor_id", "date"],
        },
    },
    {
        "name": "create_booking",
        "description": "Create a confirmed booking for a vendor. NEVER call this without explicit user confirmation. The user must clearly say 'book', 'yes', 'go ahead', or similar.",
        "input_schema": {
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The user's UUID",
                },
                "vendor_id": {
                    "type": "string",
                    "description": "The vendor's UUID",
                },
                "category_slug": {
                    "type": "string",
                    "description": "The service category slug",
                },
                "date": {
                    "type": "string",
                    "description": "Booking date in YYYY-MM-DD format",
                },
                "time_slot": {
                    "type": "string",
                    "description": "The selected time slot (e.g., '2:00 PM')",
                },
                "issue_description": {
                    "type": "string",
                    "description": "Description of the issue to be fixed",
                },
                "estimated_cost": {
                    "type": "number",
                    "description": "Estimated cost in dollars",
                },
            },
            "required": ["user_id", "vendor_id", "category_slug", "date", "time_slot", "issue_description"],
        },
    },
    {
        "name": "process_payment",
        "description": "Process a payment for a booking. NEVER call this without explicit user confirmation. Supports deposit, full, or tip payments.",
        "input_schema": {
            "type": "object",
            "properties": {
                "booking_id": {
                    "type": "string",
                    "description": "The booking UUID",
                },
                "amount": {
                    "type": "number",
                    "description": "Payment amount in dollars",
                },
                "payment_type": {
                    "type": "string",
                    "enum": ["deposit", "full", "tip"],
                    "description": "Type of payment",
                },
            },
            "required": ["booking_id", "amount", "payment_type"],
        },
    },
    {
        "name": "get_booking_status",
        "description": "Get the current status of a booking including vendor info and timeline. Use this when the user asks about an existing booking or wants an update.",
        "input_schema": {
            "type": "object",
            "properties": {
                "booking_id": {
                    "type": "string",
                    "description": "The booking UUID or confirmation code (FX-XXXX)",
                },
            },
            "required": ["booking_id"],
        },
    },
    {
        "name": "submit_review",
        "description": "Submit a review for a completed service. Use this when the user provides a rating or feedback after service completion.",
        "input_schema": {
            "type": "object",
            "properties": {
                "booking_id": {
                    "type": "string",
                    "description": "The booking UUID",
                },
                "rating": {
                    "type": "integer",
                    "description": "Rating from 1 to 5 stars",
                },
                "review_text": {
                    "type": "string",
                    "description": "Optional review text",
                },
            },
            "required": ["booking_id", "rating"],
        },
    },
]


# ─── Tool Implementations ────────────────────────────────────────────────────

CATEGORY_KEYWORDS = {
    "ac_repair": ["ac", "air conditioning", "air conditioner", "cooling", "hvac", "heat", "thermostat", "compressor", "refrigerant", "split ac", "window ac"],
    "plumbing": ["plumber", "plumbing", "pipe", "leak", "drain", "faucet", "toilet", "water heater", "clogged", "sewage", "tap", "bathroom"],
    "electrician": ["electrician", "electrical", "wiring", "outlet", "switch", "power", "circuit", "breaker", "light", "fan", "voltage", "short circuit"],
    "cleaning": ["cleaning", "clean", "maid", "housekeeping", "deep clean", "carpet", "window cleaning", "sanitize", "dust"],
    "pest_control": ["pest", "cockroach", "ant", "termite", "rat", "mouse", "bug", "insect", "rodent", "mosquito", "bed bug", "spider"],
    "appliance_repair": ["appliance", "washer", "dryer", "dishwasher", "refrigerator", "fridge", "oven", "microwave", "washing machine", "stove"],
}


def classify_issue(tool_input: dict) -> dict:
    """Classify a user's issue into a service category and urgency."""
    message = tool_input["message"].lower()

    # Find matching category
    matched_category = None
    max_matches = 0
    for slug, keywords in CATEGORY_KEYWORDS.items():
        matches = sum(1 for kw in keywords if kw in message)
        if matches > max_matches:
            max_matches = matches
            matched_category = slug

    # Determine urgency
    urgency = "medium"
    emergency_words = ["emergency", "urgent", "immediately", "flooding", "fire", "sparking", "dangerous", "gas leak"]
    high_words = ["broken", "not working", "stopped", "weird noise", "leaking", "no power", "won't turn on"]
    low_words = ["maintenance", "check", "inspect", "routine", "service", "tune up"]

    if any(w in message for w in emergency_words):
        urgency = "emergency"
    elif any(w in message for w in high_words):
        urgency = "high"
    elif any(w in message for w in low_words):
        urgency = "low"

    category_names = {
        "ac_repair": "AC Repair",
        "plumbing": "Plumbing",
        "electrician": "Electrician",
        "cleaning": "House Cleaning",
        "pest_control": "Pest Control",
        "appliance_repair": "Appliance Repair",
    }

    if not matched_category:
        return {
            "category": None,
            "urgency": urgency,
            "details": "Could not determine the specific service category.",
            "follow_up_questions": ["What type of home service do you need? We offer: AC Repair, Plumbing, Electrician, House Cleaning, Pest Control, and Appliance Repair."],
        }

    return {
        "category": matched_category,
        "category_name": category_names.get(matched_category, matched_category),
        "urgency": urgency,
        "details": f"Classified as {category_names.get(matched_category)} service with {urgency} urgency.",
        "follow_up_questions": [],
    }


def search_vendors(tool_input: dict) -> dict:
    """Search for vendors by category from Supabase."""
    category_slug = tool_input["category"]
    db = get_db()
    if not db:
        return {"vendors": [], "error": "Database not connected"}

    try:
        # Get category ID
        cats = db.select("categories", columns="id", filters={"slug": category_slug})
        if not cats:
            return {"vendors": [], "error": f"Category '{category_slug}' not found"}

        category_id = cats[0]["id"]

        # Get vendors for this category, ordered by rating desc
        rows = db.select(
            "vendors",
            columns="*",
            filters={"category_id": category_id, "available": "true"},
            order="-rating",
            limit=5,
        )

        vendors = []
        for v in rows:
            vendors.append({
                "vendor_id": v["id"],
                "name": v["name"],
                "rating": float(v["rating"]),
                "total_reviews": v["total_reviews"],
                "price_range": v["price_range"],
                "specialties": v.get("specialties", []),
                "response_time_minutes": v["response_time_minutes"],
                "city": v["city"],
            })

        return {"vendors": vendors, "count": len(vendors), "category": category_slug}

    except Exception as e:
        return {"vendors": [], "error": str(e)}


def check_availability(tool_input: dict) -> dict:
    """Check available time slots for a vendor on a given date."""
    vendor_id = tool_input["vendor_id"]
    date = tool_input["date"]
    db = get_db()
    if not db:
        return {"available_slots": [], "error": "Database not connected"}

    try:
        # Get vendor name
        vendor_rows = db.select("vendors", columns="name", filters={"id": vendor_id})
        vendor_name = vendor_rows[0]["name"] if vendor_rows else "Unknown"

        # Get available slots
        slots = db.select(
            "vendor_slots",
            columns="time_slot",
            filters={"vendor_id": vendor_id, "date": date, "available": "true"},
        )

        available_slots = [s["time_slot"] for s in slots]

        return {
            "vendor_id": vendor_id,
            "vendor_name": vendor_name,
            "date": date,
            "available_slots": available_slots,
        }

    except Exception as e:
        return {"available_slots": [], "error": str(e)}


def create_booking(tool_input: dict) -> dict:
    """Create a new booking."""
    db = get_db()
    if not db:
        return {"error": "Database not connected"}

    try:
        # Get category ID from slug
        cats = db.select("categories", columns="id", filters={"slug": tool_input["category_slug"]})
        category_id = cats[0]["id"] if cats else None

        # Generate confirmation code
        confirmation_code = f"FX-{random.randint(1000, 9999)}"

        # Create the booking
        booking_data = {
            "user_id": tool_input["user_id"],
            "vendor_id": tool_input["vendor_id"],
            "category_id": category_id,
            "confirmation_code": confirmation_code,
            "issue_description": tool_input["issue_description"],
            "date": tool_input["date"],
            "time_slot": tool_input["time_slot"],
            "estimated_cost": tool_input.get("estimated_cost"),
            "status": "confirmed",
        }

        result = db.insert("bookings", booking_data)
        booking = result[0] if result else {}

        # Mark the vendor slot as taken
        db.update(
            "vendor_slots",
            {"available": False},
            {"vendor_id": tool_input["vendor_id"], "date": tool_input["date"], "time_slot": tool_input["time_slot"]},
        )

        # Get vendor name
        vendor_rows = db.select("vendors", columns="name", filters={"id": tool_input["vendor_id"]})
        vendor_name = vendor_rows[0]["name"] if vendor_rows else "Unknown"

        return {
            "booking_id": booking.get("id"),
            "confirmation_code": confirmation_code,
            "vendor_name": vendor_name,
            "date": tool_input["date"],
            "time_slot": tool_input["time_slot"],
            "estimated_cost": tool_input.get("estimated_cost"),
            "status": "confirmed",
        }

    except Exception as e:
        return {"error": str(e)}


def process_payment(tool_input: dict) -> dict:
    """Process a payment for a booking (mock payment processor)."""
    db = get_db()
    if not db:
        return {"error": "Database not connected"}

    try:
        payment_data = {
            "booking_id": tool_input["booking_id"],
            "amount": tool_input["amount"],
            "payment_type": tool_input["payment_type"],
            "status": "completed",
        }

        result = db.insert("payments", payment_data)
        payment = result[0] if result else {}

        return {
            "payment_id": payment.get("id"),
            "amount": tool_input["amount"],
            "payment_type": tool_input["payment_type"],
            "status": "completed",
            "message": f"${tool_input['amount']:.2f} {tool_input['payment_type']} payment processed successfully.",
        }

    except Exception as e:
        return {"error": str(e)}


def get_booking_status(tool_input: dict) -> dict:
    """Get the status of a booking, including vendor details and timeline."""
    booking_identifier = tool_input["booking_id"]
    db = get_db()
    if not db:
        return {"error": "Database not connected"}

    try:
        # Try both UUID and confirmation code
        if booking_identifier.startswith("FX-"):
            bookings = db.select("bookings", columns="*", filters={"confirmation_code": booking_identifier})
        else:
            bookings = db.select("bookings", columns="*", filters={"id": booking_identifier})

        if not bookings:
            return {"error": "Booking not found"}

        booking = bookings[0]

        # Get vendor info
        vendor_rows = db.select("vendors", columns="name,phone,rating", filters={"id": booking["vendor_id"]})
        vendor = vendor_rows[0] if vendor_rows else {}

        # Build timeline based on status
        status_flow = ["confirmed", "vendor_dispatched", "vendor_en_route", "in_progress", "completed"]
        current_status = booking["status"]
        current_idx = status_flow.index(current_status) if current_status in status_flow else 0

        timeline = []
        status_labels = {
            "confirmed": "Booking Confirmed",
            "vendor_dispatched": "Vendor Dispatched",
            "vendor_en_route": "Vendor En Route",
            "in_progress": "Service In Progress",
            "completed": "Service Completed",
        }

        for i, status in enumerate(status_flow):
            timeline.append({
                "status": status,
                "label": status_labels[status],
                "completed": i <= current_idx,
                "current": i == current_idx,
            })

        return {
            "booking_id": booking["id"],
            "confirmation_code": booking["confirmation_code"],
            "status": current_status,
            "vendor_name": vendor.get("name", "Unknown"),
            "vendor_phone": vendor.get("phone", "N/A"),
            "date": booking["date"],
            "time_slot": booking["time_slot"],
            "estimated_cost": float(booking["estimated_cost"]) if booking.get("estimated_cost") else None,
            "eta_minutes": booking.get("vendor_eta_minutes"),
            "timeline": timeline,
        }

    except Exception as e:
        return {"error": str(e)}


def submit_review(tool_input: dict) -> dict:
    """Submit a review for a completed booking."""
    db = get_db()
    if not db:
        return {"error": "Database not connected"}

    try:
        # Get the booking to find user_id and vendor_id
        bookings = db.select("bookings", columns="user_id,vendor_id", filters={"id": tool_input["booking_id"]})
        if not bookings:
            return {"error": "Booking not found"}

        booking = bookings[0]

        # Insert review
        review_data = {
            "booking_id": tool_input["booking_id"],
            "user_id": booking["user_id"],
            "vendor_id": booking["vendor_id"],
            "rating": tool_input["rating"],
            "review_text": tool_input.get("review_text", ""),
        }

        db.insert("reviews", review_data)

        # Update vendor's average rating
        vendor_id = booking["vendor_id"]
        reviews = db.select("reviews", columns="rating", filters={"vendor_id": vendor_id})
        if reviews:
            avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
            db.update("vendors", {"rating": round(avg_rating, 1), "total_reviews": len(reviews)}, {"id": vendor_id})

        return {
            "success": True,
            "message": f"Thank you! Your {tool_input['rating']}-star review has been submitted.",
        }

    except Exception as e:
        return {"error": str(e)}


# ─── Tool Dispatcher ─────────────────────────────────────────────────────────

def execute_tool(tool_name: str, tool_input: dict) -> dict:
    """Execute a tool and return the result."""
    tools_map = {
        "classify_issue": classify_issue,
        "search_vendors": search_vendors,
        "check_availability": check_availability,
        "create_booking": create_booking,
        "process_payment": process_payment,
        "get_booking_status": get_booking_status,
        "submit_review": submit_review,
    }

    tool_fn = tools_map.get(tool_name)
    if tool_fn:
        return tool_fn(tool_input)
    return {"error": f"Unknown tool: {tool_name}"}
