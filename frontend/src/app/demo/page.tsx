"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const MIcon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

// ─── Demo Script ──────────────────────────────────────────────

const SCRIPT = [
  {
    delay: 800,
    role: "user" as const,
    content: "Fix my AC",
    typing: true,
  },
  {
    delay: 2200,
    role: "assistant" as const,
    content:
      "I found 3 top-rated AC repair technicians near you in San Francisco. They're all available today — let me know which one you'd like to book!",
    toolCalls: [
      { tool_name: "search_vendors", result_summary: "3 vendors found", duration_ms: 312 },
      { tool_name: "check_availability", result_summary: "all available", duration_ms: 188 },
    ],
    vendors: [
      { name: "CoolBreeze AC Pros", rating: 4.9, reviews: 312, price: "$80–$150/hr", city: "San Francisco", tags: ["AC repair", "HVAC install", "Duct cleaning"], time: 15 },
      { name: "AirFix Elite", rating: 4.7, reviews: 198, price: "$70–$130/hr", city: "San Francisco", tags: ["Central AC", "Split units", "Emergency"], time: 22 },
      { name: "TechChill HVAC", rating: 4.8, reviews: 245, price: "$90–$160/hr", city: "San Francisco", tags: ["AC diagnostics", "Compressor repair"], time: 30 },
    ],
  },
  {
    delay: 3500,
    role: "user" as const,
    content: "Book CoolBreeze AC Pros",
    typing: true,
  },
  {
    delay: 2000,
    role: "assistant" as const,
    content:
      "Done! CoolBreeze AC Pros is booked. Marco will arrive today between 2–4 PM. Confirmation code FX-2847 sent to your phone!",
    toolCalls: [
      { tool_name: "create_booking", result_summary: "Booking #FX-2847 confirmed", duration_ms: 421 },
      { tool_name: "send_notification", result_summary: "SMS sent", duration_ms: 95 },
    ],
    booking: {
      code: "FX-2847",
      vendor: "CoolBreeze AC Pros",
      date: "Today, March 22",
      slot: "2:00 PM – 4:00 PM",
      cost: 120,
    },
  },
  {
    delay: 2500,
    role: "assistant" as const,
    content: "Payment of $120 deposit processed. You'll get a receipt by email. Anything else?",
    toolCalls: [
      { tool_name: "process_payment", result_summary: "Payment authorized", duration_ms: 287 },
    ],
    payment: { amount: 120.0 },
  },
  {
    delay: 2800,
    role: "user" as const,
    content: "Thank you!",
    typing: true,
  },
  {
    delay: 1200,
    role: "assistant" as const,
    content: "Happy to help! Your booking is confirmed. Let me know if you need anything else fixed around the house.",
  },
];

type ScriptEntry = (typeof SCRIPT)[number];

interface RenderedMessage {
  role: "user" | "assistant";
  content: string;
  toolCalls?: { tool_name: string; result_summary: string; duration_ms: number }[];
  vendors?: { name: string; rating: number; reviews: number; price: string; city: string; tags: string[]; time: number }[];
  booking?: { code: string; vendor: string; date: string; slot: string; cost: number };
  payment?: { amount: number };
}

export default function DemoPage() {
  const [messages, setMessages] = useState<RenderedMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let totalDelay = 1000;

    const run = async () => {
      for (const entry of SCRIPT) {
        await new Promise((r) => setTimeout(r, entry.delay));
        if (cancelled) return;

        if (entry.role === "user" && (entry as ScriptEntry & { typing?: boolean }).typing) {
          // Animate typing
          setTyping(true);
          const text = entry.content;
          for (let i = 0; i <= text.length; i++) {
            if (cancelled) return;
            setTypingText(text.slice(0, i));
            await new Promise((r) => setTimeout(r, 40));
          }
          await new Promise((r) => setTimeout(r, 300));
          setTyping(false);
          setTypingText("");
        }

        if (!cancelled) {
          setMessages((prev) => [
            ...prev,
            { role: entry.role, content: entry.content, ...(entry as Record<string, unknown>) } as RenderedMessage,
          ]);
        }
      }
      setDone(true);
    };

    void run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdf4f5 0%, #f0fafa 50%, #fdf4f5 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "0",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          padding: "16px 24px",
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #834B55, #00666f)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MIcon name="build" className="text-white text-base" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1a1a1a" }}>
              FixIt Assistant
            </div>
            <div style={{ fontSize: "0.7rem", color: "#00666f", fontWeight: 600 }}>● Online</div>
          </div>
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            background: "rgba(131,75,85,0.1)",
            color: "#834B55",
            padding: "4px 10px",
            borderRadius: 20,
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          DEMO
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          flex: 1,
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Message bubble */}
            <div
              style={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "85%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #834B55, #a85f6b)"
                  : "rgba(255,255,255,0.75)",
                backdropFilter: "blur(12px)",
                border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.5)",
                color: msg.role === "user" ? "#fff" : "#1a1a1a",
                fontSize: "0.9rem",
                lineHeight: 1.5,
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                animation: "fadeInUp 0.3s ease-out",
              }}
            >
              {msg.content}
            </div>

            {/* Tool call chips */}
            {msg.toolCalls && msg.toolCalls.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxWidth: "85%" }}>
                {msg.toolCalls.map((tc, ti) => (
                  <div
                    key={ti}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      background: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.5)",
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    <MIcon name="settings" className="text-xs text-[#834B55]" />
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#834B55" }}>
                      {tc.tool_name}
                    </span>
                    <span style={{ fontSize: "0.65rem", color: "#666" }}>{tc.duration_ms}ms</span>
                  </div>
                ))}
              </div>
            )}

            {/* Vendor cards */}
            {msg.vendors && msg.vendors.map((v, vi) => (
              <div
                key={vi}
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  maxWidth: "85%",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                  animation: `fadeInUp 0.3s ease-out ${vi * 0.1}s both`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,102,111,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <MIcon name="ac_unit" className="text-sm text-[#00666f]" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{v.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#666", marginTop: 2 }}>
                        ⭐ {v.rating} · {v.city}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1a1a1a" }}>{v.price}</div>
                    <div style={{ fontSize: "0.65rem", color: "#999" }}>{v.reviews} reviews</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  {v.tags.slice(0, 3).map((t, ti) => (
                    <span key={ti} style={{ padding: "2px 8px", borderRadius: 20, background: "rgba(131,75,85,0.08)", border: "1px solid rgba(131,75,85,0.15)", fontSize: "0.7rem", color: "#834B55", fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Booking card */}
            {msg.booking && (
              <div
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,102,111,0.2)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  maxWidth: "85%",
                  boxShadow: "0 4px 16px rgba(0,102,111,0.08)",
                  animation: "fadeInUp 0.3s ease-out",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#834B55", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {msg.booking.code}
                  </span>
                  <span style={{ background: "rgba(0,102,111,0.1)", color: "#00666f", padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                    CONFIRMED
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#555", display: "flex", flexDirection: "column", gap: 4 }}>
                  <div>🏪 <strong>{msg.booking.vendor}</strong></div>
                  <div>📅 {msg.booking.date} at {msg.booking.slot}</div>
                  <div>💰 Estimated: ${msg.booking.cost}</div>
                </div>
              </div>
            )}

            {/* Payment card */}
            {msg.payment && (
              <div
                style={{
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(0,102,111,0.2)",
                  borderRadius: 16,
                  padding: "14px 16px",
                  maxWidth: "85%",
                  boxShadow: "0 4px 16px rgba(0,102,111,0.08)",
                  animation: "fadeInUp 0.3s ease-out",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", display: "flex", alignItems: "center", gap: 6 }}>
                      <MIcon name="credit_card" className="text-sm text-[#00666f]" />
                      ${msg.payment.amount.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 2 }}>Deposit payment</div>
                  </div>
                  <span style={{ background: "rgba(0,160,60,0.1)", color: "#00a03c", padding: "4px 12px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                    ✓ PAID
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div style={{ alignSelf: "flex-end", maxWidth: "70%" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "20px 20px 4px 20px",
                background: "rgba(131,75,85,0.15)",
                color: "#834B55",
                fontSize: "0.9rem",
                fontStyle: "italic",
                minWidth: 40,
              }}
            >
              {typingText || "…"}
            </div>
          </div>
        )}

        {/* Done badge */}
        {done && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(0,102,111,0.1)",
                border: "1px solid rgba(0,102,111,0.2)",
                borderRadius: 20,
                padding: "8px 20px",
                fontSize: "0.8rem",
                color: "#00666f",
                fontWeight: 700,
              }}
            >
              <MIcon name="check_circle" className="text-sm" />
              Demo complete — try the real thing!
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10, justifyContent: "center" }}>
              <Link
                href="/chat"
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #834B55, #a85f6b)",
                  color: "#fff",
                  borderRadius: 20,
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  boxShadow: "0 4px 16px rgba(131,75,85,0.25)",
                }}
              >
                Try Live Chat
              </Link>
              <button
                onClick={() => { window.location.reload(); }}
                style={{
                  padding: "10px 24px",
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(131,75,85,0.2)",
                  color: "#834B55",
                  borderRadius: 20,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Replay Demo
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
