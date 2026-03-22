"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  sendMessage,
  ChatResponse,
  Vendor,
  BookingData,
  PaymentData,
  ToolCall,
} from "@/lib/api";

/* ─── Material Icon Helper ──────────────────────────────────────── */
const MIcon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// ─── Sub-components ────────────────────────────────────────────

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="vendor-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "rgba(147, 241, 253, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MIcon name="plumbing" className="text-[#00666f]" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{vendor.name}</div>
            <div
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.8rem",
                marginTop: "2px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MIcon name="star" className="text-xs text-[#834B55]" />
              {vendor.rating}/5 · {vendor.city}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>
            {vendor.price_range}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
            {vendor.total_reviews} reviews
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <span
          style={{ fontSize: "0.75rem", color: "var(--secondary)", fontWeight: 600 }}
        >
          ~{vendor.response_time_minutes} min response
        </span>
        <MIcon name="chevron_right" className="text-[#834B55] text-lg" />
      </div>
      {vendor.specialties && vendor.specialties.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginTop: "10px",
          }}
        >
          {vendor.specialties.slice(0, 4).map((s, i) => (
            <span
              key={i}
              style={{
                padding: "3px 10px",
                borderRadius: "var(--radius-full)",
                background: "rgba(131, 75, 85, 0.08)",
                border: "1px solid rgba(131, 75, 85, 0.15)",
                fontSize: "0.75rem",
                color: "var(--primary)",
                fontWeight: 600,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingData }) {
  return (
    <div className="booking-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "1.2rem",
            fontWeight: 800,
            color: "var(--primary)",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {booking.confirmation_code}
        </span>
        <span className={`status-badge status-${booking.status?.replace("_", "-")}`}>
          {booking.status?.replace(/_/g, " ")}
        </span>
      </div>
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
          <MIcon name="store" className="text-sm" />
          <strong>{booking.vendor_name}</strong>
        </div>
        <div style={{ marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
          <MIcon name="calendar_today" className="text-sm" />
          {booking.date} at {booking.time_slot}
        </div>
        {booking.estimated_cost && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <MIcon name="payments" className="text-sm" />
            Estimated: ${booking.estimated_cost}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentCard({ payment }: { payment: PaymentData }) {
  return (
    <div className="payment-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <MIcon name="credit_card" className="text-[#00666f]" />
            ${payment.amount.toFixed(2)}
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
              marginTop: "2px",
            }}
          >
            {payment.payment_type.charAt(0).toUpperCase() +
              payment.payment_type.slice(1)}{" "}
            payment
          </div>
        </div>
        <span className="status-badge status-completed">
          <MIcon name="check_circle" className="text-xs" /> {payment.status}
        </span>
      </div>
    </div>
  );
}

function AgentActionsPanel({ toolCalls }: { toolCalls: ToolCall[] }) {
  const [open, setOpen] = useState(false);

  if (!toolCalls || toolCalls.length === 0) return null;

  return (
    <div className="agent-panel">
      <button className="agent-panel-toggle" onClick={() => setOpen(!open)}>
        <span style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>
          <MIcon name="play_arrow" className="text-sm" />
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <MIcon name="settings" className="text-sm" />
          {toolCalls.length} tool{toolCalls.length > 1 ? "s" : ""} called
        </span>
      </button>
      {open && (
        <div className="agent-panel-content">
          {toolCalls.map((tc, i) => (
            <div key={i} className="tool-call-item">
              <span className="tool-name">{tc.tool_name}</span>
              <span className="tool-result">{tc.result_summary}</span>
              <span className="tool-time">{tc.duration_ms}ms</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Message Types ─────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  vendors?: Vendor[];
  booking?: BookingData | null;
  payment?: PaymentData | null;
  toolCalls?: ToolCall[];
}

const QUICK_ACTIONS = [
  { label: "Fix my AC", icon: "ac_unit" },
  { label: "Book a plumber", icon: "plumbing" },
  { label: "Electrician needed", icon: "bolt" },
  { label: "Deep clean my house", icon: "auto_awesome" },
  { label: "Pest problem", icon: "pest_control" },
  { label: "Fix my washer", icon: "kitchen" },
];

// ─── Demo Responses ─────────────────────────────────────────────
// Pre-scripted responses so the demo works without a backend

type DemoStep = {
  response: string;
  vendors?: Vendor[];
  booking?: BookingData | null;
  payment?: PaymentData | null;
  toolCalls?: ToolCall[];
};

const DEMO_SCRIPTS: Record<string, DemoStep[]> = {
  "fix my ac": [
    {
      response:
        "I found 3 top-rated AC repair technicians near you in San Francisco. They're all available today — let me know which one you'd like to book!",
      toolCalls: [
        { tool_name: "search_vendors", input_summary: "AC repair, San Francisco", result_summary: "3 vendors found", duration_ms: 312 },
        { tool_name: "check_availability", input_summary: "today slots", result_summary: "all available", duration_ms: 188 },
      ],
      vendors: [
        { vendor_id: "v1", name: "CoolBreeze AC Pros", rating: 4.9, total_reviews: 312, price_range: "$80–$150/hr", specialties: ["AC repair", "HVAC install", "Duct cleaning", "Refrigerant recharge"], response_time_minutes: 15, city: "San Francisco" },
        { vendor_id: "v2", name: "AirFix Elite", rating: 4.7, total_reviews: 198, price_range: "$70–$130/hr", specialties: ["Central AC", "Split units", "Emergency repair"], response_time_minutes: 22, city: "San Francisco" },
        { vendor_id: "v3", name: "TechChill HVAC", rating: 4.8, total_reviews: 245, price_range: "$90–$160/hr", specialties: ["AC diagnostics", "Compressor repair", "Smart thermostats"], response_time_minutes: 30, city: "San Francisco" },
      ],
    },
    {
      response:
        "Great choice! I've booked CoolBreeze AC Pros for you this afternoon. Your technician Marco will arrive between 2–4 PM. Confirmation sent to your phone!",
      toolCalls: [
        { tool_name: "create_booking", input_summary: "CoolBreeze AC Pros, today 2-4PM", result_summary: "Booking confirmed #FX-2847", duration_ms: 421 },
        { tool_name: "send_notification", input_summary: "SMS confirmation", result_summary: "Sent", duration_ms: 95 },
      ],
      booking: {
        booking_id: "b1",
        confirmation_code: "FX-2847",
        vendor_name: "CoolBreeze AC Pros",
        date: "Today, March 22",
        time_slot: "2:00 PM – 4:00 PM",
        estimated_cost: 120,
        status: "confirmed",
        eta_minutes: 45,
      },
    },
    {
      response:
        "Payment of $120 has been processed successfully. You'll receive a receipt via email. Is there anything else I can help you with?",
      toolCalls: [
        { tool_name: "process_payment", input_summary: "$120 deposit", result_summary: "Payment authorized", duration_ms: 287 },
      ],
      payment: { payment_id: "p1", amount: 120.00, payment_type: "deposit", status: "completed", message: "Payment processed successfully" },
    },
  ],
  "book a plumber": [
    {
      response:
        "Found 3 licensed plumbers available in your area. All are background-checked and insured!",
      toolCalls: [
        { tool_name: "search_vendors", input_summary: "plumber, licensed, San Francisco", result_summary: "3 vendors found", duration_ms: 298 },
      ],
      vendors: [
        { vendor_id: "v4", name: "FlowMaster Plumbing", rating: 4.9, total_reviews: 487, price_range: "$85–$160/hr", specialties: ["Pipe repair", "Drain cleaning", "Water heater", "Leak detection"], response_time_minutes: 20, city: "San Francisco" },
        { vendor_id: "v5", name: "QuickFix Plumbers", rating: 4.6, total_reviews: 203, price_range: "$75–$140/hr", specialties: ["Emergency plumbing", "Toilet repair", "Faucet install"], response_time_minutes: 18, city: "San Francisco" },
        { vendor_id: "v6", name: "PipePro Solutions", rating: 4.8, total_reviews: 356, price_range: "$90–$170/hr", specialties: ["Sewer lines", "Re-piping", "Commercial plumbing"], response_time_minutes: 35, city: "San Francisco" },
      ],
    },
    {
      response: "FlowMaster Plumbing is booked! Jake will arrive tomorrow between 9–11 AM. They have a 5-star leak repair record.",
      toolCalls: [
        { tool_name: "create_booking", input_summary: "FlowMaster, tomorrow 9-11AM", result_summary: "Booking #FX-3190 confirmed", duration_ms: 389 },
      ],
      booking: { booking_id: "b2", confirmation_code: "FX-3190", vendor_name: "FlowMaster Plumbing", date: "Tomorrow, March 23", time_slot: "9:00 AM – 11:00 AM", estimated_cost: 95, status: "confirmed" },
    },
  ],
  "electrician needed": [
    {
      response:
        "I found certified electricians near you. All are licensed and have completed safety certifications. Here are the top picks:",
      toolCalls: [
        { tool_name: "search_vendors", input_summary: "electrician, certified, San Francisco", result_summary: "3 vendors found", duration_ms: 267 },
        { tool_name: "verify_licenses", input_summary: "license check", result_summary: "All verified", duration_ms: 143 },
      ],
      vendors: [
        { vendor_id: "v7", name: "Sparks Electric Co.", rating: 4.9, total_reviews: 521, price_range: "$95–$180/hr", specialties: ["Panel upgrades", "EV charger install", "Rewiring", "Safety inspection"], response_time_minutes: 25, city: "San Francisco" },
        { vendor_id: "v8", name: "VoltPro Electricians", rating: 4.7, total_reviews: 289, price_range: "$80–$155/hr", specialties: ["Outlet install", "Circuit breaker", "Smart home wiring"], response_time_minutes: 30, city: "San Francisco" },
        { vendor_id: "v9", name: "PowerGrid Services", rating: 4.8, total_reviews: 412, price_range: "$100–$190/hr", specialties: ["Commercial electrical", "Generator install", "Emergency service"], response_time_minutes: 20, city: "San Francisco" },
      ],
    },
  ],
  "deep clean my house": [
    {
      response:
        "Here are the best deep cleaning services in your area — all eco-friendly and 5-star rated!",
      toolCalls: [
        { tool_name: "search_vendors", input_summary: "deep cleaning, eco-friendly", result_summary: "3 vendors found", duration_ms: 234 },
      ],
      vendors: [
        { vendor_id: "v10", name: "SparkleClean Pro", rating: 4.9, total_reviews: 678, price_range: "$150–$350/visit", specialties: ["Deep clean", "Move-out clean", "Eco products", "Same-day service"], response_time_minutes: 10, city: "San Francisco" },
        { vendor_id: "v11", name: "CleanSweep SF", rating: 4.8, total_reviews: 445, price_range: "$120–$280/visit", specialties: ["Apartment cleaning", "Office cleaning", "Window cleaning"], response_time_minutes: 15, city: "San Francisco" },
        { vendor_id: "v12", name: "GreenMaid Services", rating: 4.7, total_reviews: 312, price_range: "$130–$300/visit", specialties: ["Green cleaning", "Recurring service", "Organizing"], response_time_minutes: 20, city: "San Francisco" },
      ],
    },
  ],
  "pest problem": [
    {
      response:
        "Got it! I found licensed pest control specialists. They'll identify the pest and create a custom treatment plan.",
      toolCalls: [
        { tool_name: "search_vendors", input_summary: "pest control, licensed", result_summary: "3 vendors found", duration_ms: 256 },
      ],
      vendors: [
        { vendor_id: "v13", name: "BugBusters SF", rating: 4.8, total_reviews: 389, price_range: "$120–$250/visit", specialties: ["Rodent control", "Termite treatment", "Ant removal", "Cockroach extermination"], response_time_minutes: 30, city: "San Francisco" },
        { vendor_id: "v14", name: "EcoPest Solutions", rating: 4.9, total_reviews: 267, price_range: "$140–$300/visit", specialties: ["Organic treatments", "Bed bug removal", "Wasp nests"], response_time_minutes: 25, city: "San Francisco" },
      ],
    },
  ],
  "fix my washer": [
    {
      response:
        "Found appliance repair experts who specialize in washing machines. Most issues are fixed same-day!",
      toolCalls: [
        { tool_name: "search_vendors", input_summary: "appliance repair, washer, same-day", result_summary: "3 vendors found", duration_ms: 278 },
      ],
      vendors: [
        { vendor_id: "v15", name: "AppliancePro SF", rating: 4.9, total_reviews: 534, price_range: "$75–$150/hr", specialties: ["Washer repair", "Dryer repair", "Dishwasher", "All brands"], response_time_minutes: 20, city: "San Francisco" },
        { vendor_id: "v16", name: "FixRight Appliances", rating: 4.7, total_reviews: 298, price_range: "$65–$130/hr", specialties: ["Samsung", "LG", "Whirlpool", "Bosch"], response_time_minutes: 35, city: "San Francisco" },
      ],
    },
  ],
};

// Tracks which step of each demo script we're on
const demoStepState: Record<string, number> = {};

function getDemoResponse(message: string): DemoStep | null {
  const key = message.toLowerCase().trim();
  const script = DEMO_SCRIPTS[key];
  if (!script) return null;
  const step = demoStepState[key] ?? 0;
  demoStepState[key] = (step + 1) % script.length;
  return script[step];
}

// Follow-up message responses for demo flow
const FOLLOW_UP_RESPONSES: Record<string, string> = {
  thanks: "You're welcome! Your booking is all set. Let me know if you need anything else.",
  "thank you": "Happy to help! Your service is confirmed. Anything else I can fix for you?",
  "how does it work": "Just describe your home problem and I'll search nearby verified pros, show you top options with pricing, and handle the full booking and payment — all in one chat!",
};

// ─── Chat Content Component ───────────────────────────────────

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      handleSend(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (overrideMessage?: string) => {
    const msg = overrideMessage || input.trim();
    if (!msg || isLoading) return;

    const userMessage: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Try demo response first (works without backend)
      const demo = getDemoResponse(msg)
        ?? (FOLLOW_UP_RESPONSES[msg.toLowerCase().trim()]
          ? { response: FOLLOW_UP_RESPONSES[msg.toLowerCase().trim()] }
          : null);

      if (demo) {
        // Simulate network delay for realism
        await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
        const assistantMessage: Message = {
          role: "assistant",
          content: demo.response,
          vendors: demo.vendors,
          booking: demo.booking,
          payment: demo.payment,
          toolCalls: demo.toolCalls,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setHistory((prev) => [
          ...prev,
          { role: "user", content: msg },
          { role: "assistant", content: demo.response },
        ]);
      } else {
        const response: ChatResponse = await sendMessage({
          message: msg,
          user_id: "demo-user",
          history: history,
        });

        const assistantMessage: Message = {
          role: "assistant",
          content: response.response,
          vendors: response.vendor_list || undefined,
          booking: response.booking,
          payment: response.payment,
          toolCalls: response.tool_calls,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setHistory(response.history);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I'm having trouble connecting right now. Please make sure the backend is running on port 8000 and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="chat-container" style={{ background: "transparent" }}>
      {/* ─── Header ────────────────────────────── */}
      <div
        className="glass-strong"
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomLeftRadius: "var(--radius-2xl)",
          borderBottomRightRadius: "var(--radius-2xl)",
          boxShadow: "0 12px 40px rgba(51, 51, 51, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/"
            style={{
              color: "var(--primary)",
              textDecoration: "none",
            }}
          >
            <MIcon name="arrow_back" />
          </Link>
          <span style={{ fontWeight: 700, fontSize: "1.15rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            FixIt Assistant
          </span>
        </div>
        <Link href="/bookings" className="btn-secondary" style={{ padding: "6px 16px", fontSize: "0.8rem" }}>
          <MIcon name="calendar_today" className="text-sm mr-1" /> Bookings
        </Link>
      </div>

      {/* ─── Messages ──────────────────────────── */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MIcon name="build" className="text-4xl text-[#834B55]" />
              </div>
            </div>
            <h2
              className="gradient-text"
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "8px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              What can I fix for you?
            </h2>
            <p style={{ fontSize: "0.95rem", maxWidth: "400px", margin: "0 auto", color: "var(--text-secondary)" }}>
              Describe your problem in plain English &mdash; I&apos;ll find the best
              professionals and handle the booking.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i}>
            <div
              className={`message-bubble ${
                msg.role === "user" ? "message-user" : "message-assistant"
              }`}
              style={{
                animation: "fadeInUp 0.3s ease-out",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </div>

            {/* Rich cards for assistant messages */}
            {msg.role === "assistant" && (
              <div style={{ maxWidth: "85%", marginRight: "auto" }}>
                {/* Tool call chips */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                    {msg.toolCalls.map((tc, ti) => (
                      <div
                        key={ti}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "rgba(255, 255, 255, 0.4)",
                          border: "1px solid rgba(255, 255, 255, 0.4)",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-full)",
                        }}
                      >
                        <MIcon name="settings" className="text-xs text-[#834B55]" />
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--primary)" }}>
                          {tc.tool_name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {msg.vendors &&
                  msg.vendors.map((v, vi) => (
                    <VendorCard key={vi} vendor={v} />
                  ))}
                {msg.booking && <BookingCard booking={msg.booking} />}
                {msg.payment && <PaymentCard payment={msg.payment} />}
                {msg.toolCalls && (
                  <AgentActionsPanel toolCalls={msg.toolCalls} />
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div
            className="message-bubble message-assistant"
            style={{ display: "flex", gap: "6px", padding: "16px 20px" }}
          >
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ─── Quick Actions ─────────────────────── */}
      {messages.length === 0 && (
        <div className="quick-actions">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              className="quick-action-pill"
              onClick={() => handleSend(action.label)}
              style={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              <MIcon name={action.icon} className="text-sm" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* ─── Input ─────────────────────────────── */}
      <div style={{ padding: "16px 20px" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="glass"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "6px",
            borderRadius: "var(--radius-full)",
            boxShadow: "0 8px 32px rgba(51, 51, 51, 0.06)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder="Describe your problem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "var(--accent-gradient)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              opacity: isLoading || !input.trim() ? 0.5 : 1,
              transition: "all 0.2s",
              flexShrink: 0,
              boxShadow: "0 4px 16px rgba(131, 75, 85, 0.2)",
            }}
          >
            <MIcon name="arrow_upward" className="text-white text-xl" />
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            color: "var(--text-muted)",
          }}
        >
          Loading...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
