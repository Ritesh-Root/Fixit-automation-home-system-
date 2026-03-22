-- FixIt Database Schema
-- Run this in Supabase SQL Editor

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100) DEFAULT 'San Francisco',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Categories (6 seeded)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(10),
    description TEXT
);

-- Vendors (18 seeded — 3 per category)
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    category_id UUID REFERENCES categories(id),
    rating DECIMAL(2,1) DEFAULT 4.5,
    total_reviews INT DEFAULT 0,
    price_range VARCHAR(50),
    city VARCHAR(100),
    specialties TEXT[],
    response_time_minutes INT DEFAULT 30,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vendor Time Slots (7 days of availability per vendor)
CREATE TABLE vendor_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    available BOOLEAN DEFAULT TRUE,
    UNIQUE(vendor_id, date, time_slot)
);

-- Bookings
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    vendor_id UUID REFERENCES vendors(id),
    category_id UUID REFERENCES categories(id),
    confirmation_code VARCHAR(20) UNIQUE NOT NULL,
    issue_description TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'confirmed',
    vendor_eta_minutes INT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation Messages (with tool call audit trail)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    tool_calls JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) UNIQUE,
    user_id UUID REFERENCES users(id),
    vendor_id UUID REFERENCES vendors(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_vendor_slots_lookup ON vendor_slots(vendor_id, date);
CREATE INDEX idx_vendors_category ON vendors(category_id);
