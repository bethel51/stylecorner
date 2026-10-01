import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Star,
  Scissors,
  Zap,
  Shield,
  MapPin,
  CheckCircle2,
  Clock,
  ChevronRight,
  Store,
  Home as HomeIcon,
  ShieldCheck,
  Award,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageContainer } from "../components/common/PageContainer";
import { preloadRoute } from "../App";

// SVG Icons for the 6 official services
const LashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
    <ellipse cx="12" cy="13" rx="7" ry="4" stroke="currentColor" fill="none" />
    <path d="M5 13 C8 8 16 8 19 13" />
    <path d="M7 11 L6 8" />
    <path d="M10 10 L10 7" />
    <path d="M14 10 L14 7" />
    <path d="M17 11 L18 8" />
    <circle cx="12" cy="13.5" r="1.5" fill="currentColor" />
  </svg>
);

const NailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <rect x="7" y="3" width="10" height="15" rx="3" />
    <path d="M7 11 H17" />
    <rect x="9.5" y="4" width="5" height="4" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <path d="M6 21 H18" />
  </svg>
);

const BraiderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <circle cx="12" cy="6" r="3" />
    <path d="M9 9 C9 13 8 17 9 21" />
    <path d="M15 9 C15 13 16 17 15 21" />
    <path d="M10 12 L14 15" />
    <path d="M14 12 L10 15" />
    <path d="M10 17 L14 20" />
  </svg>
);

const BarberIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M6 3 L10 12 L6 21" />
    <path d="M18 3 L14 12 L18 21" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" />
    <rect x="5" y="19" width="14" height="2" rx="1" />
  </svg>
);

const MakeupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M8 21 L16 21" />
    <path d="M9 13 L15 13" />
    <path d="M10 13 L10 7 C10 4.8 11 3 12 3 C13 3 14 4.8 14 7 L14 13" fill="currentColor" fillOpacity="0.3" />
    <rect x="8" y="13" width="8" height="8" rx="2" />
  </svg>
);

const WigIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M5 14 C4 8 8 4 12 4 C16 4 20 8 19 14" />
    <path d="M5 14 C4 18 6 21 8 21" />
    <path d="M19 14 C20 18 18 21 16 21" />
    <path d="M8 8 C10 6 14 6 16 8" />
  </svg>
);

// 6 Core Official Services
const SERVICES = [
  {
    id: "hair_braider",
    title: "Hair Braider & Stylist",
    subtitle: "Knotless braids, boho locs, cornrows & styling",
    price: 6500,
    duration: "120 mins",
    icon: BraiderIcon,
    accent: "#34d399",
    tag: "Most Popular",
  },
  {
    id: "barber",
    title: "Barber & Grooming",
    subtitle: "Precision fades, sharp line-ups & beard sculpting",
    price: 4000,
    duration: "45 mins",
    icon: BarberIcon,
    accent: "#60a5fa",
    tag: "Trending",
  },
  {
    id: "lash_tech",
    title: "Lash Tech",
    subtitle: "Classic, hybrid & Russian volume extensions",
    price: 6000,
    duration: "75 mins",
    icon: LashIcon,
    accent: "#F5B942",
    tag: "Top Rated",
  },
  {
    id: "nail_tech",
    title: "Nail Tech & Art",
    subtitle: "Gel manicure, acrylic overlays & custom nail art",
    price: 4500,
    duration: "60 mins",
    icon: NailIcon,
    accent: "#e879f9",
    tag: "Popular",
  },
  {
    id: "makeup_artist",
    title: "Makeup Artist",
    subtitle: "Soft glam, bridal beauty, editorial & event looks",
    price: 9000,
    duration: "90 mins",
    icon: MakeupIcon,
    accent: "#f87171",
    tag: "Glamour",
  },
  {
    id: "wig_installer",
    title: "Wig Installer & Revamper",
    subtitle: "Lace frontal melting, customization & revamping",
    price: 7500,
    duration: "90 mins",
    icon: WigIcon,
    accent: "#a78bfa",
    tag: "Hot Service",
  },
];

// How It Works Steps
const STEPS = [
  {
    num: "01",
    title: "Choose Your Style or Ask AI",
    desc: "Pick your service or describe your event vision. Our smart matcher pinpoints your exact aesthetic.",
    badge: "Instant Match",
    icon: Sparkles,
  },
  {
    num: "02",
    title: "Select Nearest Verified Stylist",
    desc: "Browse vetted professionals in Lagos & Ibadan. Check real portfolios, verified reviews, and fixed prices.",
    badge: "Verified Talent",
    icon: ShieldCheck,
  },
  {
    num: "03",
    title: "In-Salon or VIP Home Service",
    desc: "Enjoy the salon vibe or relax in your own home. Seamless booking with secure wallet escrow protection.",
    badge: "Flexible & Safe",
    icon: Store,
  },
];

// Why StyleCorner Trust Cards
const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    color: "#10b981",
    title: "100% Vetted Stylists",
    desc: "Every expert is identity-checked, portfolio-verified, and community rated.",
  },
  {
    icon: MapPin,
    color: "#F5B942",
    title: "Lagos & Ibadan Focused",
    desc: "Accurate LGA matching across Ikeja, Lekki, Yaba, Bodija, Ring Road & beyond.",
  },
  {
    icon: Zap,
    color: "#a78bfa",
    title: "Escrow Protected",
    desc: "Your payment is held safely until your appointment is completed satisfactorily.",
  },
  {
    icon: Award,
    color: "#f59e0b",
    title: "Transparent Rates",
    desc: "Clear starting fees with zero hidden salon markups or surprise charges.",
  },
];

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    preloadRoute("/signup");
    preloadRoute("/login");
    preloadRoute("/services");
    preloadRoute("/ai-matcher");
    preloadRoute("/booking");
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(role === "staff" ? "/expert-dashboard" : "/customer-dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleBookService = (serviceName) => {
    navigate(`/booking?service=${encodeURIComponent(serviceName)}`);
  };

  return (
    <PageContainer hideHeader={true} hideNav={true} noPadding={true}>
      {/* ── Global Keyframes & Responsive Utility CSS ── */}
      <style>{`
        @keyframes softFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes softFloatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.8deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.04); }
        }
        @keyframes shimmerText {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes heroCardFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.008); }
        }
        .sc-reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .sc-revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .soft-3d-card {
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s ease, border-color 0.28s ease;
          will-change: transform;
        }
        .soft-3d-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px -10px rgba(0,0,0,0.65), 0 0 24px rgba(245,185,66,0.14) !important;
          border-color: rgba(245,185,66,0.3) !important;
        }
        .soft-3d-card:active {
          transform: scale(0.985);
        }
        .btn-cta-gold {
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }
        .btn-cta-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -4px rgba(245,185,66,0.5) !important;
        }
        .btn-cta-gold:active {
          transform: scale(0.97);
        }
        .btn-glass-subtle {
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.16s ease;
        }
        .btn-glass-subtle:hover {
          background: rgba(255,255,255,0.08) !important;
          border-color: rgba(245,185,66,0.35) !important;
          transform: translateY(-2px);
        }
        .btn-glass-subtle:active {
          transform: scale(0.97);
        }
      `}</style>

      {/* ── Page Root Background ── */}
      <div
        style={{
          minHeight: "100dvh",
          width: "100%",
          background: "#08090C",
          color: "#FFFFFF",
          overflowX: "hidden",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "Outfit, -apple-system, sans-serif",
        }}
      >
        {/* Soft 3D Ambient Atmospheric Lighting (Placed gently in background, not on top of content) */}
        <div
          style={{
            position: "fixed",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "clamp(300px, 80vw, 750px)",
            height: "clamp(300px, 80vw, 750px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245,185,66,0.18) 0%, rgba(124,58,237,0.1) 45%, transparent 72%)",
            filter: "blur(90px)",
            pointerEvents: "none",
            zIndex: 0,
            animation: "pulseGlow 7s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "fixed",
            top: "45%",
            right: "-100px",
            width: "clamp(260px, 50vw, 520px)",
            height: "clamp(260px, 50vw, 520px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, rgba(245,185,66,0.08) 50%, transparent 75%)",
            filter: "blur(100px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── Main Responsive Content Column ── */}
        <div
          style={{
            width: "100%",
            maxWidth: "760px",
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 1,
            boxSizing: "border-box",
            padding: "0 clamp(1rem, 4vw, 2rem)",
          }}
        >

          {/* ── Top Navigation Bar ── */}
          <header
            style={{
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)",
              paddingBottom: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Logo */}
            <div
              onClick={() => navigate("/")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "11px",
                  background: "linear-gradient(135deg, #F5B942 0%, #d4891a 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 16px rgba(245,185,66,0.45)",
                }}
              >
                <Scissors size={18} color="#08090C" strokeWidth={2.6} />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    color: "#FFFFFF",
                    display: "block",
                    lineHeight: 1.1,
                  }}
                >
                  StyleCorner
                </span>
                <span
                  style={{
                    fontSize: "0.62rem",
                    fontWeight: 700,
                    color: "#F5B942",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Lagos · Ibadan
                </span>
              </div>
            </div>

            {/* Quick Auth Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
              {!isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="btn-glass-subtle"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "50px",
                      padding: "0.45rem 0.95rem",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#cbd5e1",
                      cursor: "pointer",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    onClick={handleGetStarted}
                    className="btn-cta-gold"
                    style={{
                      background: "linear-gradient(135deg, #F5B942 0%, #e8912d 100%)",
                      border: "none",
                      borderRadius: "50px",
                      padding: "0.45rem 1rem",
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      color: "#08090C",
                      cursor: "pointer",
                      fontFamily: "Outfit, sans-serif",
                      boxShadow: "0 4px 14px rgba(245,185,66,0.35)",
                    }}
                  >
                    Join Free
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="btn-cta-gold"
                  style={{
                    background: "linear-gradient(135deg, #F5B942 0%, #e8912d 100%)",
                    border: "none",
                    borderRadius: "50px",
                    padding: "0.45rem 1rem",
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    color: "#08090C",
                    cursor: "pointer",
                    fontFamily: "Outfit, sans-serif",
                    boxShadow: "0 4px 14px rgba(245,185,66,0.35)",
                  }}
                >
                  Dashboard →
                </button>
              )}
            </div>
          </header>

          {/* ── HERO SECTION (Ultra Neat & High Impact) ── */}
          <section
            style={{
              paddingTop: "1.2rem",
              paddingBottom: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.6s ease, transform 0.6s ease",
            }}
          >
            {/* Pulsing Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                background: "rgba(245,185,66,0.12)",
                border: "1px solid rgba(245,185,66,0.32)",
                borderRadius: "50px",
                padding: "0.38rem 0.95rem",
                marginBottom: "1rem",
                boxShadow: "0 0 20px rgba(245,185,66,0.15)",
              }}
            >
              <Sparkles size={13} color="#F5B942" />
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "#F5B942",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                AI-Powered Beauty & Grooming Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1
              style={{
                fontSize: "clamp(2rem, 7.5vw, 3rem)",
                fontWeight: 900,
                letterSpacing: "-0.035em",
                lineHeight: 1.12,
                margin: "0 0 1rem",
                maxWidth: "620px",
              }}
            >
              Your look. Verified talent.{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #F5B942 0%, #fbbf24 45%, #ea580c 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmerText 4s linear infinite",
                  display: "inline",
                }}
              >
                Booked in seconds.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(0.9rem, 3.2vw, 1.05rem)",
                color: "#94a3b8",
                lineHeight: 1.6,
                margin: "0 0 1.6rem",
                maxWidth: "520px",
              }}
            >
              Connect with vetted barbers, braiders, lash techs, nail artists, and makeup specialists across Lagos & Ibadan. Salon appointments or VIP home visits.
            </p>

            {/* Primary Action Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                width: "100%",
                maxWidth: "460px",
                marginBottom: "2rem",
              }}
            >
              <button
                type="button"
                onClick={handleGetStarted}
                className="btn-cta-gold"
                style={{
                  flex: "1 1 200px",
                  minHeight: "52px",
                  background: "linear-gradient(135deg, #F5B942 0%, #e8912d 100%)",
                  color: "#08090C",
                  borderRadius: "50px",
                  border: "none",
                  fontSize: "0.98rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 8px 24px -2px rgba(245,185,66,0.45)",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                <span>{isAuthenticated ? "Go to Dashboard" : "Book a Stylist"}</span>
                <ArrowRight size={18} strokeWidth={2.8} />
              </button>

              <button
                type="button"
                onClick={() => navigate("/ai-matcher")}
                className="btn-glass-subtle"
                style={{
                  flex: "1 1 180px",
                  minHeight: "52px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(255,255,255,0.12)",
                  color: "#ffffff",
                  borderRadius: "50px",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.45rem",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                <Sparkles size={16} color="#F5B942" />
                <span>Try AI Matcher</span>
              </button>
            </div>

            {/* ── NEAT & UNCLUSTERED HERO VISUAL (Soft 3D Showcase) ── */}
            {/* Clean presentation with no clutter tags plastered across the image */}
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "640px",
                borderRadius: "28px",
                padding: "0.5rem",
                background: "linear-gradient(145deg, rgba(245,185,66,0.22) 0%, rgba(255,255,255,0.06) 40%, rgba(13,14,18,0.8) 100%)",
                boxShadow: "0 30px 70px -15px rgba(0,0,0,0.9), 0 0 35px rgba(245,185,66,0.12)",
                animation: "heroCardFloat 6s ease-in-out infinite",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "clamp(240px, 42vw, 360px)",
                  borderRadius: "22px",
                  overflow: "hidden",
                  background: "#12141c",
                }}
              >
                <img
                  src="/images/stylecorner-salon-top.jpg"
                  alt="StyleCorner Luxury Atelier"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center 28%",
                    display: "block",
                    filter: "contrast(1.05) brightness(0.98)",
                    transition: "transform 0.8s ease",
                  }}
                />

                {/* Subtle Luxury Gradient Vignette for depth (keeps image visible & crisp) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(8,9,12,0.1) 0%, rgba(8,9,12,0.4) 65%, rgba(8,9,12,0.85) 100%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Floating Soft 3D Pill: Top Left Status */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    left: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "rgba(12,14,20,0.8)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "50px",
                    padding: "0.35rem 0.85rem",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                  <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#FFFFFF" }}>Verified Artists Active</span>
                </div>

                {/* Floating Soft 3D Pill: Top Right Location */}
                <div
                  style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "rgba(12,14,20,0.8)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(245,185,66,0.3)",
                    borderRadius: "50px",
                    padding: "0.35rem 0.85rem",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  <MapPin size={12} color="#F5B942" />
                  <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "#F5B942" }}>Lagos & Ibadan</span>
                </div>

                {/* Floating Soft 3D Feature Card: Bottom Overlay */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "12px",
                    left: "12px",
                    right: "12px",
                    background: "rgba(13,15,22,0.82)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div
                      style={{
                        width: "34px",
                        height: "34px",
                        borderRadius: "10px",
                        background: "rgba(245,185,66,0.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F5B942",
                        flexShrink: 0,
                      }}
                    >
                      <Star size={17} fill="#F5B942" />
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontSize: "0.84rem", fontWeight: 800, color: "#FFFFFF" }}>4.92 ★ Average Rating</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Over 1,200+ satisfied appointments</div>
                    </div>
                  </div>

                  <div
                    onClick={() => navigate("/services")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      fontSize: "0.76rem",
                      fontWeight: 800,
                      color: "#F5B942",
                      cursor: "pointer",
                      padding: "0.35rem 0.65rem",
                      borderRadius: "8px",
                      background: "rgba(245,185,66,0.12)",
                    }}
                  >
                    <span>Explore</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Service Category Pills underneath showcase */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "1.4rem",
                maxWidth: "600px",
              }}
            >
              {[
                { name: "Hair Braider", query: "Hair Braider & Stylist" },
                { name: "Barber", query: "Barber" },
                { name: "Lash Tech", query: "Lash Tech" },
                { name: "Nail Tech", query: "Nail Tech" },
                { name: "Makeup Artist", query: "Makeup Artist" },
                { name: "Wig Installer", query: "Wig Installer & Revamper" },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleBookService(item.query)}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "50px",
                    padding: "0.35rem 0.8rem",
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "#cbd5e1",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    fontFamily: "Outfit, sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#F5B942";
                    e.currentTarget.style.color = "#F5B942";
                    e.currentTarget.style.background = "rgba(245,185,66,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "#cbd5e1";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  ✦ {item.name}
                </button>
              ))}
            </div>
          </section>

          {/* ── SECTION 2: POPULAR SERVICES (Soft 3D Cards) ── */}
          <section
            style={{
              paddingTop: "2.5rem",
              paddingBottom: "2.5rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <div
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "#F5B942",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}
              >
                Tailored Services
              </div>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 2.1rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  margin: "0 0 0.5rem",
                  color: "#FFFFFF",
                }}
              >
                Top Booked Specialties
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#94a3b8", margin: 0 }}>
                Transparent pricing, verified talent, and instant booking confirmation.
              </p>
            </div>

            {/* 6 Service Cards Grid (Responsive 2-col minmax) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {SERVICES.map((s) => {
                const IconComp = s.icon;
                return (
                  <div
                    key={s.id}
                    className="soft-3d-card"
                    onClick={() => handleBookService(s.title)}
                    style={{
                      background: "linear-gradient(145deg, #12141D 0%, #0D0E14 100%)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "22px",
                      padding: "1.25rem",
                      cursor: "pointer",
                      boxShadow: "0 10px 25px -8px rgba(0,0,0,0.5)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Top Row: Icon + Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "14px",
                          background: s.accent + "20",
                          border: `1px solid ${s.accent}45`,
                          color: s.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 4px 14px ${s.accent}25`,
                        }}
                      >
                        <IconComp />
                      </div>

                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          color: s.accent,
                          background: s.accent + "18",
                          border: `1px solid ${s.accent}30`,
                          borderRadius: "50px",
                          padding: "0.25rem 0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {s.tag}
                      </span>
                    </div>

                    {/* Middle: Title & Description */}
                    <div style={{ marginBottom: "1.25rem" }}>
                      <h3
                        style={{
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          margin: "0 0 0.35rem",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {s.title}
                      </h3>
                      <p style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.45, margin: 0 }}>
                        {s.subtitle}
                      </p>
                    </div>

                    {/* Bottom: Price + Action Pill */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "0.85rem",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.68rem", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
                          Starting from
                        </span>
                        <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#F5B942" }}>
                          ₦{s.price.toLocaleString()}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          color: "#FFFFFF",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "10px",
                          padding: "0.45rem 0.85rem",
                        }}
                      >
                        <span>Book</span>
                        <ArrowRight size={14} color="#F5B942" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 3: HOW STYLECORNER WORKS (3D Step Progression) ── */}
          <section
            style={{
              paddingTop: "2.5rem",
              paddingBottom: "2.5rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <div
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "#F5B942",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.4rem",
                }}
              >
                Seamless Experience
              </div>
              <h2
                style={{
                  fontSize: "clamp(1.5rem, 5vw, 2.1rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  margin: "0 0 0.5rem",
                  color: "#FFFFFF",
                }}
              >
                How It Works
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#94a3b8", margin: 0 }}>
                From choosing a look to looking sharp — 3 easy steps.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {STEPS.map((st) => {
                const IconComp = st.icon;
                return (
                  <div
                    key={st.num}
                    className="soft-3d-card"
                    style={{
                      background: "linear-gradient(160deg, #131520 0%, #0C0E14 100%)",
                      border: "1px solid rgba(245,185,66,0.15)",
                      borderRadius: "22px",
                      padding: "1.4rem",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 900,
                          color: "#F5B942",
                          fontFamily: "Outfit, sans-serif",
                        }}
                      >
                        {st.num}
                      </span>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: "rgba(245,185,66,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#F5B942",
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                    </div>

                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 800,
                        color: "#FFFFFF",
                        margin: "0 0 0.45rem",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {st.title}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>
                      {st.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── SECTION 4: TRUST & SAFETY GUARANTEE (Soft 3D Bento) ── */}
          <section
            style={{
              paddingTop: "2.5rem",
              paddingBottom: "2.5rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, rgba(245,185,66,0.08) 0%, rgba(13,14,18,0.95) 75%)",
                border: "1.5px solid rgba(245,185,66,0.25)",
                borderRadius: "28px",
                padding: "clamp(1.5rem, 5vw, 2.2rem)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                boxSizing: "border-box",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    background: "rgba(245,185,66,0.15)",
                    borderRadius: "50px",
                    padding: "0.3rem 0.8rem",
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    color: "#F5B942",
                    marginBottom: "0.5rem",
                  }}
                >
                  <ShieldCheck size={14} />
                  <span>The StyleCorner Standard</span>
                </div>
                <h2
                  style={{
                    fontSize: "clamp(1.4rem, 4.5vw, 1.95rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.025em",
                    margin: "0 0 0.5rem",
                    color: "#FFFFFF",
                  }}
                >
                  Built for Confidence & Peace of Mind
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", margin: 0 }}>
                  We took the uncertainty out of booking hair, lash, barber and beauty sessions.
                </p>
              </div>

              {/* 4 Trust Points Bento */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
                  gap: "1rem",
                }}
              >
                {TRUST_POINTS.map((tp) => {
                  const IconComp = tp.icon;
                  return (
                    <div
                      key={tp.title}
                      style={{
                        background: "rgba(10,12,18,0.7)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "18px",
                        padding: "1.1rem",
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "10px",
                          background: tp.color + "18",
                          border: `1px solid ${tp.color}35`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: tp.color,
                          marginBottom: "0.75rem",
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <h4 style={{ fontSize: "0.92rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 0.3rem" }}>
                        {tp.title}
                      </h4>
                      <p style={{ fontSize: "0.76rem", color: "#94a3b8", lineHeight: 1.45, margin: 0 }}>
                        {tp.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── SECTION 5: REAL CLIENT TESTIMONIAL ── */}
          <section
            style={{
              paddingTop: "1.5rem",
              paddingBottom: "2.5rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              className="soft-3d-card"
              style={{
                background: "linear-gradient(145deg, #131622 0%, #0d0e14 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "24px",
                padding: "1.5rem",
                boxShadow: "0 15px 35px rgba(0,0,0,0.5)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#F5B942" color="#F5B942" />
                ))}
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "#F5B942", marginLeft: "0.4rem" }}>
                  Verified Client Review
                </span>
              </div>

              <blockquote
                style={{
                  fontSize: "clamp(0.92rem, 3vw, 1.05rem)",
                  color: "#e2e8f0",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                "I needed knotless bohemian braids on short notice in Victoria Island. StyleCorner’s AI matched me with an amazing braider in 30 seconds. She arrived promptly, did an exquisite job, and payment via wallet was completely seamless!"
              </blockquote>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #F5B942, #e879f9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    color: "#08090C",
                    fontSize: "0.95rem",
                  }}
                >
                  T
                </div>
                <div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#FFFFFF" }}>Tiwa O.</div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Lekki Phase 1, Lagos · Knotless Braids</div>
                </div>
              </div>
            </div>
          </section>

          {/* ── SECTION 6: HIGH IMPACT BOTTOM CTA ── */}
          <section
            style={{
              paddingTop: "1rem",
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 3rem)",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #181c2b 0%, #10121a 50%, #0d0f16 100%)",
                border: "1.5px solid rgba(245,185,66,0.35)",
                borderRadius: "28px",
                padding: "clamp(1.75rem, 6vw, 2.5rem)",
                textAlign: "center",
                boxShadow: "0 25px 60px -15px rgba(245,185,66,0.25), 0 15px 40px rgba(0,0,0,0.8)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 5.5vw, 2.3rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  margin: "0 0 0.6rem",
                  color: "#FFFFFF",
                }}
              >
                Ready to Experience StyleCorner?
              </h2>
              <p
                style={{
                  fontSize: "clamp(0.85rem, 3vw, 0.95rem)",
                  color: "#94a3b8",
                  maxWidth: "460px",
                  margin: "0 auto 1.75rem",
                  lineHeight: 1.6,
                }}
              >
                Join thousands of satisfied clients booking verified beauty & grooming professionals in Lagos and Ibadan.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.85rem",
                  maxWidth: "440px",
                  margin: "0 auto",
                }}
              >
                <button
                  type="button"
                  onClick={handleGetStarted}
                  className="btn-cta-gold"
                  style={{
                    flex: "1 1 200px",
                    minHeight: "54px",
                    background: "linear-gradient(135deg, #F5B942 0%, #e8912d 100%)",
                    color: "#08090C",
                    borderRadius: "50px",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    boxShadow: "0 10px 28px -4px rgba(245,185,66,0.45)",
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  <span>{isAuthenticated ? "Open Dashboard" : "Get Started — It's Free"}</span>
                  <ArrowRight size={19} strokeWidth={3} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/services")}
                  className="btn-glass-subtle"
                  style={{
                    flex: "1 1 180px",
                    minHeight: "54px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    borderRadius: "50px",
                    fontSize: "0.92rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  <span>Explore Services</span>
                </button>
              </div>

              {/* Are you a stylist? Link */}
              <div style={{ marginTop: "1.25rem" }}>
                <button
                  type="button"
                  onClick={() => navigate("/role-selection")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 600,
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F5B942")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                >
                  Are you a stylist or salon owner? Join our verified network →
                </button>
              </div>
            </div>
          </section>

          {/* ── Footer ── */}
          <footer
            style={{
              paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#475569",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              paddingTop: "1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", gap: "1.25rem", marginBottom: "0.75rem" }}>
              <span onClick={() => navigate("/about")} style={{ cursor: "pointer", color: "#64748b" }}>About</span>
              <span onClick={() => navigate("/services")} style={{ cursor: "pointer", color: "#64748b" }}>Services</span>
              <span onClick={() => navigate("/policies")} style={{ cursor: "pointer", color: "#64748b" }}>Policies</span>
              <span onClick={() => navigate("/contact")} style={{ cursor: "pointer", color: "#64748b" }}>Contact</span>
            </div>
            <div>© {new Date().getFullYear()} StyleCorner. All rights reserved. Lagos & Ibadan, Nigeria.</div>
          </footer>

        </div>
      </div>
    </PageContainer>
  );
};

export default Home;
