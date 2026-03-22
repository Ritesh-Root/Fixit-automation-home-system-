"""FixIt Database Seeder — Seeds categories, vendors, availability slots, and a demo user."""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from db import SupabaseClient

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    print("ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env")
    exit(1)

db = SupabaseClient(url, key)

# ─── Categories ──────────────────────────────────────────────────────────────

CATEGORIES = [
    {"name": "AC Repair", "slug": "ac_repair", "icon": "❄️", "description": "Air conditioning repair, maintenance, and installation"},
    {"name": "Plumbing", "slug": "plumbing", "icon": "🔧", "description": "Pipe repair, drain cleaning, water heater, and fixture installation"},
    {"name": "Electrician", "slug": "electrician", "icon": "⚡", "description": "Wiring, outlets, circuit breakers, lighting, and electrical repairs"},
    {"name": "House Cleaning", "slug": "cleaning", "icon": "🧹", "description": "Deep cleaning, regular cleaning, carpet cleaning, and sanitization"},
    {"name": "Pest Control", "slug": "pest_control", "icon": "🐛", "description": "Insect removal, rodent control, termite treatment, and prevention"},
    {"name": "Appliance Repair", "slug": "appliance_repair", "icon": "🔌", "description": "Washer, dryer, refrigerator, dishwasher, and oven repair"},
]

# ─── Vendors (3 per category = 18 total) ─────────────────────────────────────

VENDORS = {
    "ac_repair": [
        {"name": "CoolTech Solutions", "phone": "(415) 555-0101", "email": "info@cooltech.com", "rating": 4.8, "total_reviews": 142, "price_range": "$80-$120", "city": "San Francisco", "specialties": ["Samsung", "Daikin", "Split AC", "Central AC"], "response_time_minutes": 25},
        {"name": "AirCare Pro", "phone": "(415) 555-0102", "email": "service@aircarepro.com", "rating": 4.6, "total_reviews": 98, "price_range": "$60-$100", "city": "San Francisco", "specialties": ["LG", "Carrier", "Window AC"], "response_time_minutes": 35},
        {"name": "QuickFix HVAC", "phone": "(415) 555-0103", "email": "hello@quickfixhvac.com", "rating": 4.9, "total_reviews": 203, "price_range": "$90-$140", "city": "San Francisco", "specialties": ["All brands", "Emergency repair", "Installation"], "response_time_minutes": 20},
    ],
    "plumbing": [
        {"name": "FlowRight Plumbing", "phone": "(415) 555-0201", "email": "jobs@flowright.com", "rating": 4.7, "total_reviews": 167, "price_range": "$70-$130", "city": "San Francisco", "specialties": ["Leak repair", "Drain cleaning", "Pipe replacement"], "response_time_minutes": 30},
        {"name": "Bay Area Pipes", "phone": "(415) 555-0202", "email": "service@bayareapipes.com", "rating": 4.5, "total_reviews": 89, "price_range": "$60-$110", "city": "San Francisco", "specialties": ["Water heater", "Toilet repair", "Faucet installation"], "response_time_minutes": 40},
        {"name": "DrainMaster SF", "phone": "(415) 555-0203", "email": "info@drainmaster.com", "rating": 4.8, "total_reviews": 134, "price_range": "$80-$150", "city": "San Francisco", "specialties": ["Emergency", "Sewer line", "Hydro jetting"], "response_time_minutes": 25},
    ],
    "electrician": [
        {"name": "SparkPro Electric", "phone": "(415) 555-0301", "email": "info@sparkpro.com", "rating": 4.9, "total_reviews": 178, "price_range": "$85-$140", "city": "San Francisco", "specialties": ["Panel upgrade", "Rewiring", "Smart home"], "response_time_minutes": 30},
        {"name": "BrightWire Solutions", "phone": "(415) 555-0302", "email": "service@brightwire.com", "rating": 4.6, "total_reviews": 112, "price_range": "$70-$120", "city": "San Francisco", "specialties": ["Outlet installation", "Lighting", "Ceiling fans"], "response_time_minutes": 35},
        {"name": "PowerUp Electricians", "phone": "(415) 555-0303", "email": "hello@powerup.com", "rating": 4.7, "total_reviews": 145, "price_range": "$75-$130", "city": "San Francisco", "specialties": ["Emergency", "EV charger", "Generator"], "response_time_minutes": 25},
    ],
    "cleaning": [
        {"name": "SparkleClean Co", "phone": "(415) 555-0401", "email": "book@sparkleclean.com", "rating": 4.8, "total_reviews": 234, "price_range": "$100-$200", "city": "San Francisco", "specialties": ["Deep cleaning", "Move-in/out", "Office cleaning"], "response_time_minutes": 45},
        {"name": "FreshHome Services", "phone": "(415) 555-0402", "email": "info@freshhome.com", "rating": 4.5, "total_reviews": 156, "price_range": "$80-$160", "city": "San Francisco", "specialties": ["Regular cleaning", "Carpet cleaning", "Window cleaning"], "response_time_minutes": 60},
        {"name": "PureSpace Cleaners", "phone": "(415) 555-0403", "email": "clean@purespace.com", "rating": 4.7, "total_reviews": 189, "price_range": "$90-$180", "city": "San Francisco", "specialties": ["Eco-friendly", "Sanitization", "Post-renovation"], "response_time_minutes": 40},
    ],
    "pest_control": [
        {"name": "BugBusters SF", "phone": "(415) 555-0501", "email": "info@bugbusters.com", "rating": 4.7, "total_reviews": 123, "price_range": "$100-$250", "city": "San Francisco", "specialties": ["Cockroach", "Ant", "Bed bugs", "Rodent"], "response_time_minutes": 60},
        {"name": "GreenShield Pest", "phone": "(415) 555-0502", "email": "service@greenshield.com", "rating": 4.4, "total_reviews": 87, "price_range": "$80-$200", "city": "San Francisco", "specialties": ["Eco-friendly", "Termite", "Mosquito"], "response_time_minutes": 90},
        {"name": "CritterFree Solutions", "phone": "(415) 555-0503", "email": "hello@critterfree.com", "rating": 4.8, "total_reviews": 156, "price_range": "$120-$300", "city": "San Francisco", "specialties": ["Wildlife removal", "Preventive treatment", "Commercial"], "response_time_minutes": 45},
    ],
    "appliance_repair": [
        {"name": "FixAll Appliances", "phone": "(415) 555-0601", "email": "info@fixall.com", "rating": 4.6, "total_reviews": 167, "price_range": "$80-$150", "city": "San Francisco", "specialties": ["Washer", "Dryer", "Dishwasher", "All brands"], "response_time_minutes": 35},
        {"name": "ApplianceMD", "phone": "(415) 555-0602", "email": "repair@appliancemd.com", "rating": 4.8, "total_reviews": 198, "price_range": "$90-$170", "city": "San Francisco", "specialties": ["Refrigerator", "Oven", "Samsung", "LG"], "response_time_minutes": 30},
        {"name": "RapidRepair Tech", "phone": "(415) 555-0603", "email": "service@rapidrepair.com", "rating": 4.5, "total_reviews": 134, "price_range": "$70-$140", "city": "San Francisco", "specialties": ["Microwave", "Garbage disposal", "Ice maker"], "response_time_minutes": 40},
    ],
}

# ─── Time Slots (4 per day, 7 days) ──────────────────────────────────────────

TIME_SLOTS = ["9:00 AM", "11:00 AM", "2:00 PM", "4:30 PM"]


def seed_database():
    """Run the complete seed operation."""
    print("🔧 Seeding FixIt database...\n")

    # 1. Seed demo user
    print("👤 Creating demo user...")
    demo_user = {
        "name": "Demo User",
        "email": "demo@fixit.app",
        "phone": "(415) 555-0000",
        "address": "123 Market St",
        "city": "San Francisco",
    }
    try:
        user_result = db.upsert("users", demo_user, on_conflict="email")
        demo_user_id = user_result[0]["id"] if user_result else None
        print(f"   ✅ Demo user created (ID: {demo_user_id})")
    except Exception as e:
        print(f"   ⚠️ User creation: {e}")

    # 2. Seed categories
    print("\n📂 Seeding categories...")
    category_ids = {}
    for cat in CATEGORIES:
        try:
            result = db.upsert("categories", cat, on_conflict="slug")
            if result:
                category_ids[cat["slug"]] = result[0]["id"]
                print(f"   ✅ {cat['icon']} {cat['name']}")
        except Exception as e:
            print(f"   ❌ {cat['name']}: {e}")

    # 3. Seed vendors
    print("\n🏪 Seeding vendors...")
    vendor_ids = []
    for slug, vendors in VENDORS.items():
        category_id = category_ids.get(slug)
        if not category_id:
            print(f"   ⚠️ Skipping {slug} — category not found")
            continue

        for vendor in vendors:
            vendor_data = {**vendor, "category_id": category_id, "available": True}
            try:
                result = db.upsert("vendors", vendor_data, on_conflict="email")
                if result:
                    vendor_ids.append(result[0]["id"])
                    print(f"   ✅ {vendor['name']} ({slug})")
            except Exception as e:
                print(f"   ❌ {vendor['name']}: {e}")

    # 4. Seed availability slots (7 days × 4 slots per vendor)
    print(f"\n📅 Seeding availability slots for {len(vendor_ids)} vendors...")
    today = datetime.now().date()
    total_slots = 0

    for vendor_id in vendor_ids:
        slots = []
        for day_offset in range(7):
            date = today + timedelta(days=day_offset)
            for time_slot in TIME_SLOTS:
                slots.append({
                    "vendor_id": vendor_id,
                    "date": date.isoformat(),
                    "time_slot": time_slot,
                    "available": True,
                })

        try:
            db.upsert("vendor_slots", slots, on_conflict="vendor_id,date,time_slot")
            total_slots += len(slots)
        except Exception as e:
            print(f"   ❌ Slots for vendor {vendor_id}: {e}")

    print(f"   ✅ {total_slots} time slots created")

    # Summary
    print(f"\n{'='*50}")
    print(f"✅ Seeding complete!")
    print(f"   • 1 demo user")
    print(f"   • {len(CATEGORIES)} categories")
    print(f"   • {len(vendor_ids)} vendors")
    print(f"   • {total_slots} availability slots")
    print(f"{'='*50}")


if __name__ == "__main__":
    seed_database()
