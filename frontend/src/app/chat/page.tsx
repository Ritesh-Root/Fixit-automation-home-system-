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
