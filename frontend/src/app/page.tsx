"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/* ─── Material Icon Helper ──────────────────────────────────────── */
const MIcon = ({ name, className = "" }: { name: string; className?: string }) => (
  <span className={`material-symbols-outlined ${className}`}>{name}</span>
);

const CATEGORIES = [
  { name: "AC Repair", icon: "ac_unit", slug: "ac_repair", desc: "Cooling systems & HVAC", color: "#60A5FA" },
  { name: "Plumbing", icon: "plumbing", slug: "plumbing", desc: "Pipes, drains & fixtures", color: "#38BDF8" },
  { name: "Electrician", icon: "bolt", slug: "electrician", desc: "Wiring & power systems", color: "#FACC15" },
  { name: "House Cleaning", icon: "auto_awesome", slug: "cleaning", desc: "Deep & regular cleaning", color: "#34D399" },
  { name: "Pest Control", icon: "pest_control", slug: "pest_control", desc: "Insects & rodents", color: "#F87171" },
  { name: "Appliance Repair", icon: "kitchen", slug: "appliance_repair", desc: "Washers, fridges & more", color: "#A78BFA" },
];

const STEPS = [
  {
    num: "01",
    title: "Describe Your Problem",
    desc: "Just type what's wrong in plain English. No forms, no dropdowns.",
    icon: "chat_bubble",
  },
  {
    num: "02",
    title: "AI Finds & Books",
    desc: "FixIt classifies your issue, finds top-rated vendors, and handles booking.",
    icon: "memory",
  },
  {
    num: "03",
    title: "Sit Back & Relax",
    desc: "Track your technician in real-time. Pay through the chat. Leave a review.",
    icon: "check_circle",
  },
];

const DEMO_MESSAGES = [
  { role: "user", text: "My AC is broken and making a weird noise" },
  {
    role: "assistant",
    text: "I can help with that! I've found 3 top-rated AC repair technicians near you. CoolTech Solutions specializes in Samsung ACs ★ 4.8/5",
  },
  { role: "user", text: "Book CoolTech at 2 PM tomorrow" },
  {
    role: "assistant",
    text: "Done! Booking confirmed: FX-1234 — CoolTech Solutions, tomorrow at 2:00 PM. Estimated cost: $80-$120",
  },
];

export default function LandingPage() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setVisibleMessages((prev) => {
        if (prev < DEMO_MESSAGES.length) return prev + 1;
        clearInterval(timer);
        return prev;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ─── Nav ────────────────────────────────────────── */}
      <nav
        className="glass-strong"
        style={{
          padding: "16px 6vw",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          borderBottomLeftRadius: "var(--radius-2xl)",
          borderBottomRightRadius: "var(--radius-2xl)",
          boxShadow: "0 8px 32px rgba(51, 51, 51, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MIcon name="build" className="text-[#834B55]" />
          <span
            style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}
            className="gradient-text"
          >
            FixIt
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/bookings" className="btn-secondary">
            My Bookings
          </Link>
          <Link href="/chat" className="btn-primary">
            Start Fixing →
          </Link>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 40px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="animate-fade-in-up"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div
            className="glass-card"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8rem",
              fontWeight: 700,
              marginBottom: "24px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-secondary)",
            }}
          >
            <MIcon name="emoji_events" className="text-sm" />
            MidNight Hackers 2026
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              margin: "0 auto 24px",
              maxWidth: "700px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            <span className="gradient-text">Say it.</span>
            <br />
            <span style={{ color: "var(--text-primary)" }}>We fix it.</span>
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: "var(--text-secondary)",
              maxWidth: "560px",
              margin: "0 auto 40px",
              lineHeight: 1.7,
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            The AI agent that turns one sentence into a fully booked home
            service. Zero forms. Zero phone calls. Zero hassle.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/chat" className="btn-primary" style={{ fontSize: "1.1rem", padding: "16px 40px" }}>
              Start Fixing →
            </Link>
            <a
              href="#how-it-works"
              className="btn-secondary"
              style={{ fontSize: "1.1rem", padding: "16px 32px" }}
            >
              How it Works
            </a>
          </div>
        </div>

        {/* ─── Demo Chat Preview ──────────────────────── */}
        <div
          className="animate-fade-in-up"
          style={{
            maxWidth: "520px",
            margin: "60px auto 0",
            animationDelay: "0.3s",
          }}
        >
          <div
            className="glass"
            style={{
              borderRadius: "var(--radius-xl)",
              overflow: "hidden",
            }}
          >
            {/* Fake header */}
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MIcon name="build" className="text-[#834B55] text-lg" />
              <span style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.9rem" }}>
                FixIt Assistant
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                fixit.app/chat
              </span>
            </div>

            {/* Messages */}
            <div style={{ padding: "20px", minHeight: "240px" }}>
              {DEMO_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
                <div
                  key={i}
                  className={`message-bubble ${
                    msg.role === "user" ? "message-user" : "message-assistant"
                  }`}
                  style={{
                    animation: "fadeInUp 0.4s ease-out",
                    fontSize: "0.85rem",
                    padding: "10px 14px",
                  }}
                >
                  {msg.text}
                </div>
              ))}
              {visibleMessages < DEMO_MESSAGES.length && (
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    padding: "10px 14px",
                    marginRight: "auto",
                    maxWidth: "60px",
                  }}
                >
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it Works ───────────────────────────────── */}
      <section
        id="how-it-works"
        style={{ padding: "80px 40px", maxWidth: "1000px", margin: "0 auto" }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "60px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          How it <span className="gradient-text">Works</span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
          }}
        >
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="card"
              style={{
                textAlign: "center",
              }}
            >
              <div
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "center",
                }}
                className="animate-float"
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MIcon name={step.icon} className="text-[#834B55] text-3xl" />
                </div>
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--primary)",
                  fontWeight: 700,
                  marginBottom: "8px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                STEP {step.num}
              </div>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 700,
                  marginBottom: "8px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Categories ─────────────────────────────────── */}
      <section style={{ padding: "40px 40px 100px", maxWidth: "1000px", margin: "0 auto" }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "16px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Services We <span className="gradient-text">Cover</span>
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-secondary)",
            marginBottom: "48px",
            fontSize: "1.05rem",
          }}
        >
          6 categories, one conversation.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "16px",
          }}
        >
          {CATEGORIES.map((cat, i) => (
            <Link
              key={i}
              href={`/chat?q=${encodeURIComponent(`I need help with ${cat.name.toLowerCase()}`)}`}
              className="card"
              style={{
                textAlign: "center",
                textDecoration: "none",
                color: "inherit",
                padding: "28px 16px",
              }}
            >
              <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MIcon name={cat.icon} className="text-2xl" />
                </div>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: "4px",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {cat.name}
              </div>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.8rem",
                }}
              >
                {cat.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer
        className="glass-strong"
        style={{
          padding: "40px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <MIcon name="build" className="text-[#834B55]" />
          <span className="gradient-text" style={{ fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            FixIt
          </span>
        </div>
        Built for MidNight Hackers 2026 · Say it. We fix it.
      </footer>
    </div>
  );
}
