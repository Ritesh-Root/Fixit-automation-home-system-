"""FixIt Backend — FastAPI server with CORS, routes, and Supabase integration."""

import os
from contextlib import asynccontextmanager
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agent import chat_with_agent
from db import init_supabase, get_db

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    if not os.getenv("ANTHROPIC_API_KEY"):
        print("WARNING: ANTHROPIC_API_KEY not set. Chat endpoint will fail.")
    init_supabase()
    print("FixIt backend started!")
    yield
    print("FixIt backend shutting down.")


app = FastAPI(
    title="FixIt API",
    description="AI agent that books home services through natural conversation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request/Response Models ─────────────────────────────────────────────────


class ChatRequest(BaseModel):
    message: str
    user_id: str = "demo-user"
    history: list[dict] = []


class ChatResponse(BaseModel):
    response: str
    booking: dict | None = None
    payment: dict | None = None
    vendor_list: list | None = None
    review: dict | None = None
    tool_calls: list[dict] = []
    history: list[dict] = []


class StatusUpdateRequest(BaseModel):
    status: str
    eta: int | None = None


class WebhookRequest(BaseModel):
    booking_id: str
    status: str
    eta: int | None = None


# ─── Routes ──────────────────────────────────────────────────────────────────


@app.get("/")
def root():
    return {"name": "FixIt API", "status": "running", "version": "1.0.0", "tagline": "Say it. We fix it."}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main agent chat endpoint — sends user message through Claude's agentic loop."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    try:
        result = await chat_with_agent(
            user_message=request.message,
            conversation_history=request.history,
            user_id=request.user_id,
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/categories")
def get_categories():
    """List all service categories."""
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database not connected")
    result = db.select("categories")
    return {"categories": result}


@app.get("/vendors/{category_slug}")
def get_vendors(category_slug: str):
    """List vendors by category slug."""
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database not connected")

    cats = db.select("categories", columns="id", filters={"slug": category_slug})
    if not cats:
        raise HTTPException(status_code=404, detail=f"Category '{category_slug}' not found")

    category_id = cats[0]["id"]
    vendors = db.select("vendors", filters={"category_id": category_id}, order="-rating")
    return {"vendors": vendors, "category": category_slug}


@app.get("/bookings/{user_id}")
def get_user_bookings(user_id: str):
    """List all bookings for a user."""
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database not connected")

    bookings = db.select("bookings", filters={"user_id": user_id}, order="-created_at")

    # Enrich each booking with vendor info
    for booking in bookings:
        vendor_rows = db.select("vendors", columns="name,phone,rating", filters={"id": booking["vendor_id"]})
        booking["vendors"] = vendor_rows[0] if vendor_rows else {}

    return {"bookings": bookings}


@app.get("/bookings/{user_id}/{booking_id}")
def get_booking_detail(user_id: str, booking_id: str):
    """Get a single booking with payment and timeline info."""
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database not connected")

    bookings = db.select("bookings", filters={"id": booking_id, "user_id": user_id})
    if not bookings:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking = bookings[0]
    vendor_rows = db.select("vendors", columns="name,phone,rating", filters={"id": booking["vendor_id"]})
    booking["vendors"] = vendor_rows[0] if vendor_rows else {}

    payments = db.select("payments", filters={"booking_id": booking_id}, order="-created_at")

    return {
        "booking": booking,
        "payments": payments,
    }


@app.patch("/bookings/{booking_id}/status")
def update_booking_status(booking_id: str, request: StatusUpdateRequest):
    """Update booking status (for demo simulation)."""
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database not connected")

    valid_statuses = ["confirmed", "vendor_dispatched", "vendor_en_route", "in_progress", "completed", "cancelled"]
    if request.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    update_data = {"status": request.status, "updated_at": datetime.utcnow().isoformat()}
    if request.eta is not None:
        update_data["vendor_eta_minutes"] = request.eta

    result = db.update("bookings", update_data, {"id": booking_id})
    if not result:
        raise HTTPException(status_code=404, detail="Booking not found")

    return {"booking": result[0]}


@app.post("/webhooks/booking-update")
def webhook_booking_update(request: WebhookRequest):
    """Simulate vendor status updates (for demo)."""
    db = get_db()
    if not db:
        raise HTTPException(status_code=503, detail="Database not connected")

    update_data = {"status": request.status, "updated_at": datetime.utcnow().isoformat()}
    if request.eta is not None:
        update_data["vendor_eta_minutes"] = request.eta

    db.update("bookings", update_data, {"id": request.booking_id})
    return {"success": True, "booking_id": request.booking_id, "new_status": request.status}
