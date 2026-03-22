/**
 * FixIt API Client — Fetch wrapper for all backend endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatRequest {
  message: string;
  user_id?: string;
  history?: Array<{ role: string; content: string }>;
}

export interface ToolCall {
  tool_name: string;
  input_summary: string;
  result_summary: string;
  duration_ms: number;
}

export interface Vendor {
  vendor_id: string;
  name: string;
  rating: number;
  total_reviews: number;
  price_range: string;
  specialties: string[];
  response_time_minutes: number;
  city: string;
}

export interface BookingData {
  booking_id: string;
  confirmation_code: string;
  vendor_name: string;
  date: string;
  time_slot: string;
  estimated_cost: number | null;
  status: string;
  eta_minutes?: number;
  timeline?: TimelineItem[];
}

export interface TimelineItem {
  status: string;
  label: string;
  completed: boolean;
  current: boolean;
}

export interface PaymentData {
  payment_id: string;
  amount: number;
  payment_type: string;
  status: string;
  message: string;
}

export interface ChatResponse {
  response: string;
  booking: BookingData | null;
  payment: PaymentData | null;
  vendor_list: Vendor[] | null;
  review: { success: boolean; message: string } | null;
  tool_calls: ToolCall[];
  history: Array<{ role: string; content: string }>;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

// ─── API Functions ──────────────────────────────────────────────

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: request.message,
      user_id: request.user_id || "demo-user",
      history: request.history || [],
    }),
  });

  if (!res.ok) {
    throw new Error(`Chat failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getCategories(): Promise<{ categories: Category[] }> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getUserBookings(
  userId: string
): Promise<{ bookings: BookingData[] }> {
  const res = await fetch(`${API_BASE}/bookings/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

export async function getBookingDetail(
  userId: string,
  bookingId: string
): Promise<{ booking: BookingData; payments: PaymentData[] }> {
  const res = await fetch(`${API_BASE}/bookings/${userId}/${bookingId}`);
  if (!res.ok) throw new Error("Failed to fetch booking detail");
  return res.json();
}

export async function updateBookingStatus(
  bookingId: string,
  status: string,
  eta?: number
): Promise<{ booking: BookingData }> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, eta }),
  });
  if (!res.ok) throw new Error("Failed to update booking status");
  return res.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend unhealthy");
  return res.json();
}
