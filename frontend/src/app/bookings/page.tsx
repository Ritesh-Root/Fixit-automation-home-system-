"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserBookings, BookingData } from "@/lib/api";

/* ─── Material Icon Helper ──────────────────────────────────────── */
const MIcon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const STATUS_STEPS = [
  { key: "confirmed", label: "Confirmed", icon: "check_circle" },
  { key: "dispatched", label: "Dispatched", icon: "local_shipping" },
  { key: "en_route", label: "En Route", icon: "directions_car" },
  { key: "in_progress", label: "In Progress", icon: "build" },
  { key: "completed", label: "Completed", icon: "task_alt" },
];

function getStatusIndex(status: string): number {
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

const SERVICE_ICONS: Record<string, string> = {
  "AC Repair": "ac_unit",
  "Plumbing": "plumbing",
  "Electrician": "bolt",
  "House Cleaning": "auto_awesome",
  "Pest Control": "pest_control",
  "Appliance Repair": "kitchen",
};

function BookingRow({ booking }: { booking: BookingData }) {
  const [expanded, setExpanded] = useState(false);
  const currentIdx = getStatusIndex(booking.status);

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    confirmed: { bg: "rgba(46, 125, 50, 0.06)", text: "#2E7D32", border: "rgba(46, 125, 50, 0.15)" },
    in_progress: { bg: "rgba(0, 102, 111, 0.06)", text: "#00666f", border: "rgba(0, 102, 111, 0.15)" },
    completed: { bg: "rgba(131, 75, 85, 0.06)", text: "#834b55", border: "rgba(131, 75, 85, 0.15)" },
    dispatched: { bg: "rgba(131, 75, 85, 0.06)", text: "#834b55", border: "rgba(131, 75, 85, 0.15)" },
    en_route: { bg: "rgba(245, 168, 0, 0.06)", text: "#E6A300", border: "rgba(245, 168, 0, 0.15)" },
    cancelled: { bg: "rgba(179, 27, 37, 0.06)", text: "#b31b25", border: "rgba(179, 27, 37, 0.15)" },
  };

  const sc = statusColors[booking.status] || statusColors.confirmed;

  return (
    <div
      className="glass"
      style={{
        marginBottom: "16px",
        cursor: "pointer",
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        transition: "all 0.3s",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--radius-md)",
              background: "rgba(255, 182, 193, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MIcon name={SERVICE_ICONS[booking.vendor_name?.split(" ")[0] || ""] || "build"} className="text-2xl text-[#834B55]" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {booking.confirmation_code}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "4px" }}>
              <MIcon name="store" className="text-xs" />
              {booking.vendor_name}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              background: sc.bg,
              color: sc.text,
              border: `1px solid ${sc.border}`,
              backdropFilter: "blur(20px)",
            }}
          >
            {booking.status?.replace(/_/g, " ")}
          </span>
          <span
            style={{
              color: "var(--text-muted)",
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
              display: "flex",
            }}
          >
            <MIcon name="expand_more" className="text-lg" />
          </span>
        </div>
      </div>

      {/* Details row */}
      <div style={{ display: "flex", gap: "16px", marginTop: "12px" }}>
        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
          <MIcon name="calendar_today" className="text-xs" />
          {booking.date} at {booking.time_slot}
        </div>
        {booking.estimated_cost && (
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
            <MIcon name="payments" className="text-xs" />
            Est: ${booking.estimated_cost}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "16px", justifyContent: "flex-end" }}>
        {booking.status !== "completed" && (
          <>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(131, 75, 85, 0.3)",
                background: "transparent",
                color: "var(--primary)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Track
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-full)",
                background: "var(--accent-gradient)",
                border: "none",
                color: "white",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(131, 75, 85, 0.2)",
                transition: "all 0.2s",
              }}
            >
              Chat
            </button>
          </>
        )}
        {booking.status === "completed" && (
          <>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-full)",
                border: "1px solid rgba(131, 75, 85, 0.3)",
                background: "transparent",
                color: "var(--primary)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Rebook
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                padding: "8px 20px",
                borderRadius: "var(--radius-full)",
                background: "var(--accent-gradient)",
                border: "none",
                color: "white",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(131, 75, 85, 0.2)",
              }}
            >
              Review
            </button>
          </>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.2)" }}>
          {/* Status Timeline */}
          <div className="timeline">
            {STATUS_STEPS.map((step, i) => {
              const completed = i <= currentIdx;
              const current = i === currentIdx;
              return (
                <div
                  key={step.key}
                  className={`timeline-item ${completed ? "completed" : ""}`}
                >
                  <div
                    className={`timeline-dot ${
                      current ? "current" : completed ? "completed" : "pending"
                    }`}
                  />
                  <div>
                    <div
                      style={{
                        fontWeight: current ? 700 : 500,
                        color: completed
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                        fontSize: "0.9rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <MIcon name={step.icon} className="text-sm" />
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  useEffect(() => {
    getUserBookings("demo-user")
      .then((data) => {
        setBookings(data.bookings || []);
      })
      .catch(() => {
        setError("Could not load bookings. Is the backend running?");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = bookings.filter((b) =>
    activeTab === "active"
      ? b.status !== "completed" && b.status !== "cancelled"
      : b.status === "completed" || b.status === "cancelled"
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="glass-strong"
        style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottomLeftRadius: "var(--radius-xl)",
          borderBottomRightRadius: "var(--radius-xl)",
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
          <span className="gradient-text" style={{ fontWeight: 700, fontSize: "1.15rem", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            My Bookings
          </span>
        </div>
        <Link
          href="/chat"
          className="btn-primary"
          style={{ padding: "8px 20px", fontSize: "0.85rem" }}
        >
          <MIcon name="add" className="text-sm mr-1" /> New
        </Link>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "24px 16px" }}>
        {/* Tab Selector */}
        <div
          className="glass-card"
          style={{
            display: "flex",
            padding: "6px",
            borderRadius: "var(--radius-full)",
            marginBottom: "24px",
            gap: "4px",
          }}
        >
          <button
            onClick={() => setActiveTab("active")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "var(--radius-full)",
              border: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.3s",
              ...(activeTab === "active"
                ? {
                    background: "var(--accent-gradient)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(131, 75, 85, 0.3)",
                  }
                : {
                    background: "transparent",
                    color: "var(--text-muted)",
                  }),
            }}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("history")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "var(--radius-full)",
              border: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              cursor: "pointer",
              transition: "all 0.3s",
              ...(activeTab === "history"
                ? {
                    background: "var(--accent-gradient)",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(131, 75, 85, 0.3)",
                  }
                : {
                    background: "transparent",
                    color: "var(--text-muted)",
                  }),
            }}
          >
            History
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
            <div className="typing-dot" style={{ display: "inline-block", marginRight: "4px" }} />
            <div className="typing-dot" style={{ display: "inline-block", marginRight: "4px" }} />
            <div className="typing-dot" style={{ display: "inline-block" }} />
            <p style={{ marginTop: "16px" }}>Loading bookings...</p>
          </div>
        )}

        {error && (
          <div
            className="glass"
            style={{
              textAlign: "center",
              padding: "60px 24px",
              color: "var(--text-secondary)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MIcon name="power_off" className="text-3xl text-[#834B55]" />
              </div>
            </div>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredBookings.length === 0 && (
          <div
            className="glass"
            style={{
              textAlign: "center",
              padding: "60px 24px",
              color: "var(--text-muted)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255, 255, 255, 0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MIcon name="calendar_today" className="text-3xl text-[#834B55]" />
              </div>
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: "8px", color: "var(--text-secondary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {activeTab === "active" ? "No active bookings" : "No past bookings"}
            </h3>
            <p style={{ marginBottom: "24px" }}>
              {activeTab === "active"
                ? "Start a conversation with FixIt to book your first service."
                : "Your completed and cancelled bookings will appear here."}
            </p>
            {activeTab === "active" && (
              <Link href="/chat" className="btn-primary">
                Start Fixing →
              </Link>
            )}
          </div>
        )}

        {filteredBookings.map((b, i) => (
          <BookingRow key={i} booking={b} />
        ))}
      </div>
    </div>
  );
}
