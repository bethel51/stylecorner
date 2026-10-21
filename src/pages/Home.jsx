import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Star,
  Zap,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Store,
  ShieldCheck,
  Award,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { PageContainer } from "../components/common/PageContainer";
import { preloadRoute } from "../App";

/* ─── Service SVG Icons ──────────────────────────────────────────── */
const LashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
    <ellipse cx="12" cy="13" rx="7" ry="4" />
    <path d="M5 13 C8 8 16 8 19 13" />
    <path d="M7 11 L6 8" /><path d="M10 10 L10 7" />
    <path d="M14 10 L14 7" /><path d="M17 11 L18 8" />
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
    <path d="M9 9 C9 13 8 17 9 21" /><path d="M15 9 C15 13 16 17 15 21" />
    <path d="M10 12 L14 15" /><path d="M14 12 L10 15" /><path d="M10 17 L14 20" />
  </svg>
);
const BarberIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M6 3 L10 12 L6 21" /><path d="M18 3 L14 12 L18 21" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" />
    <rect x="5" y="19" width="14" height="2" rx="1" />
  </svg>
);
const MakeupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M8 21 L16 21" /><path d="M9 13 L15 13" />
    <path d="M10 13 L10 7 C10 4.8 11 3 12 3 C13 3 14 4.8 14 7 L14 13" fill="currentColor" fillOpacity="0.3" />
    <rect x="8" y="13" width="8" height="8" rx="2" />
  </svg>
);
const WigIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
    <path d="M5 14 C4 8 8 4 12 4 C16 4 20 8 19 14" />
    <path d="M5 14 C4 18 6 21 8 21" /><path d="M19 14 C20 18 18 21 16 21" />
    <path d="M8 8 C10 6 14 6 16 8" />
  </svg>
);

/* ─── Data ────────────────────────────────────────────────────────── */
const SERVICES = [
  { id: "hair_braider", title: "Hair Braider & Stylist", subtitle: "Knotless braids, boho locs, cornrows & styling", price: 6500, icon: BraiderIcon, accent: "#34d399", tag: "Most Popular" },
  { id: "barber", title: "Barber & Grooming", subtitle: "Precision fades, sharp line-ups & beard sculpting", price: 4000, icon: BarberIcon, accent: "#60a5fa", tag: "Trending" },
  { id: "lash_tech", title: "Lash Tech", subtitle: "Classic, hybrid & Russian volume extensions", price: 6000, icon: LashIcon, accent: "#F5B942", tag: "Top Rated" },
  { id: "nail_tech", title: "Nail Tech & Art", subtitle: "Gel manicure, acrylic overlays & custom nail art", price: 4500, icon: NailIcon, accent: "#e879f9", tag: "Popular" },
  { id: "makeup_artist", title: "Makeup Artist", subtitle: "Soft glam, bridal beauty, editorial & event looks", price: 9000, icon: MakeupIcon, accent: "#f87171", tag: "Glamour" },
  { id: "wig_installer", title: "Wig Installer & Revamper", subtitle: "Lace frontal melting, customization & revamping", price: 7500, icon: WigIcon, accent: "#a78bfa", tag: "Hot Service" },
];

const STEPS = [
  { num: "01", title: "Choose Your Style or Ask AI", desc: "Pick your service or describe your event vision. Our smart matcher pinpoints your exact aesthetic.", icon: Sparkles },
  { num: "02", title: "Select Nearest Verified Stylist", desc: "Browse vetted professionals in Lagos & Ibadan. Check real portfolios, verified reviews, and fixed prices.", icon: ShieldCheck },
  { num: "03", title: "In-Salon or VIP Home Service", desc: "Enjoy the salon vibe or relax in your own home. Seamless booking with secure wallet escrow protection.", icon: Store },
];

const TRUST_POINTS = [
  { icon: ShieldCheck, color: "#10b981", title: "100% Vetted Stylists", desc: "Every expert is identity-checked, portfolio-verified, and community rated." },
  { icon: MapPin, color: "#F5B942", title: "Lagos & Ibadan Focused", desc: "Accurate LGA matching across Ikeja, Lekki, Yaba, Bodija, Ring Road & beyond." },
  { icon: Zap, color: "#a78bfa", title: "Escrow Protected", desc: "Your payment is held safely until your appointment is completed satisfactorily." },
  { icon: Award, color: "#f59e0b", title: "Transparent Rates", desc: "Clear starting fees with zero hidden salon markups or surprise charges." },
];

/* ═══════════════════════════════════════════════════════════════════
   Home Component
═══════════════════════════════════════════════════════════════════ */
export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const { toggleTheme, isDark } = useTheme();
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
    if (isAuthenticated) navigate(role === "staff" ? "/expert-dashboard" : "/customer-dashboard");
    else navigate("/signup");
  };

  const handleBookService = (name) =>
    navigate(`/booking?service=${encodeURIComponent(name)}`);

  return (
    <PageContainer hideHeader={true} hideNav={true} noPadding={true}>
      {/* ─── Global Styles ─── */}
      <style>{`
        @keyframes pulseGlow {
          0%,100%{opacity:.45;transform:scale(1)}
          50%{opacity:.75;transform:scale(1.04)}
        }
        @keyframes shimmerText {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        @keyframes heroCardFloat {
          0%,100%{transform:translateY(0) scale(1)}
          50%{transform:translateY(-6px) scale(1.007)}
        }

        /* card hover */
        .sc-card {
          transition: transform .26s cubic-bezier(.16,1,.3,1),
                      box-shadow .26s ease, border-color .26s ease;
          will-change: transform;
        }
        .sc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 44px -12px rgba(0,0,0,.7),
                      0 0 28px rgba(245,185,66,.13) !important;
          border-color: rgba(245,185,66,.28) !important;
        }
        .sc-card:active { transform: scale(.985); }

        /* buttons */
        .btn-gold {
          transition: transform .16s ease, box-shadow .16s ease;
        }
        .btn-gold:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px -4px rgba(245,185,66,.52) !important;
        }
        .btn-gold:active { transform: scale(.97); }

        .btn-ghost {
          transition: background .18s ease, border-color .18s ease, transform .16s ease;
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,.09) !important;
          border-color: rgba(245,185,66,.38) !important;
          transform: translateY(-2px);
        }
        .btn-ghost:active { transform: scale(.97); }

        /* ── layout shell ── */
        .lp-shell {
          width: 100%;
          max-width: 780px;
          margin: 0 auto;
          padding: 0 1.15rem;
          box-sizing: border-box;
        }

        /* ── section rhythm ── */
        .lp-section {
          padding-top: 3.5rem;
          padding-bottom: 3.5rem;
          width: 100%;
        }

        /* ── grids ── */
        .lp-services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 380px) {
          .lp-services-grid { grid-template-columns: 1fr; gap: .85rem; }
        }

        .lp-steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .lp-trust-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .9rem;
        }
        @media (max-width: 360px) {
          .lp-trust-grid { grid-template-columns: 1fr; }
        }

        /* ── pill strip ── */
        .lp-pill-strip {
          display: flex;
          flex-wrap: wrap;
          gap: .5rem;
          justify-content: center;
        }
        .lp-pill-strip button {
          transition: color .16s, border-color .16s, background .16s;
        }
        .lp-pill-strip button:hover {
          color: #F5B942 !important;
          border-color: rgba(245,185,66,.45) !important;
          background: rgba(245,185,66,.08) !important;
        }

        /* ── desktop nav (hidden mobile) ── */
        .lp-desktop-nav { display: none; }

        /* ── hero visual (hidden mobile, shown desktop) ── */
        .lp-hero-visual { display: none; }

        /* ── small phone header tweaks ── */
        .lp-ai-pill-text { display: inline; }
        @media (max-width: 480px) {
          .lp-ai-pill-text { display: none !important; }
          .lp-ai-pill {
            padding: .38rem !important;
            border-radius: 50% !important;
            width: 34px !important;
            height: 34px !important;
            justify-content: center !important;
          }
        }
        @media (max-width: 340px) {
          .lp-login-btn { display: none !important; }
        }

        /* ── desktop overrides ── */
        @media (min-width: 1024px) {
          .lp-shell {
            max-width: 1320px;
            padding: 0 2.5rem;
          }
          .lp-section {
            padding-top: 5rem;
            padding-bottom: 5rem;
          }
          .lp-desktop-nav { display: flex !important; }
          .lp-hero-visual { display: block !important; }
          .lp-hero-grid {
            display: grid !important;
            grid-template-columns: 1.1fr .9fr !important;
            gap: 4rem !important;
            align-items: center !important;
          }
          .lp-hero-text {
            text-align: left !important;
            align-items: flex-start !important;
          }
          .lp-hero-text h1,
          .lp-hero-text p { text-align: left !important; }
          .lp-hero-btns { justify-content: flex-start !important; }
          .lp-services-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.5rem !important;
          }
          .lp-steps-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 1.5rem !important;
          }
          .lp-trust-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 1.5rem !important;
          }
          .lp-mobile-footer { display: none !important; }
        }
      `}</style>

      {/* ─── Page root ─── */}
      <div className="keep-white" style={{
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
      }}>

        {/* ambient glow top */}
        <div style={{
          position: "fixed", top: "-120px", left: "50%", transform: "translateX(-50%)",
          width: "clamp(280px,80vw,700px)", height: "clamp(280px,80vw,700px)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(245,185,66,.18) 0%,rgba(124,58,237,.1) 45%,transparent 72%)",
          filter: "blur(90px)", pointerEvents: "none", zIndex: 0,
          animation: "pulseGlow 7s ease-in-out infinite",
        }} />
        {/* ambient glow bottom-right */}
        <div style={{
          position: "fixed", bottom: "-60px", right: "-80px",
          width: "clamp(200px,45vw,480px)", height: "clamp(200px,45vw,480px)",
          borderRadius: "50%",
          background: "radial-gradient(circle,rgba(59,130,246,.1) 0%,rgba(245,185,66,.07) 55%,transparent 75%)",
          filter: "blur(90px)", pointerEvents: "none", zIndex: 0,
        }} />

        {/* ─── Main column ─── */}
        <div className="lp-shell" style={{ zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>

          {/* ══ HEADER ══ */}
          <header style={{
            paddingTop: "calc(env(safe-area-inset-top,0px) + 1rem)",
            paddingBottom: "1rem",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", boxSizing: "border-box",
          }}>
            {/* Logo */}
            <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: ".55rem", cursor: "pointer", userSelect: "none" }}>
              <img src="/pwa-icon-192.png" alt="StyleCorner" style={{ width: "36px", height: "36px", borderRadius: "11px", boxShadow: "0 4px 16px rgba(245,185,66,.45)", objectFit: "cover", display: "block", flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: "1.05rem", fontWeight: 900, letterSpacing: "-0.02em", color: "#FFF", display: "block", lineHeight: 1.1 }}>StyleCorner</span>
                <span style={{ fontSize: ".6rem", fontWeight: 700, color: "#F5B942", letterSpacing: ".08em", textTransform: "uppercase" }}>Lagos · Ibadan</span>
              </div>
            </div>

            {/* Desktop nav */}
            <nav className="lp-desktop-nav" style={{ alignItems: "center", gap: ".15rem" }}>
              {[
                { l: "Home", p: "/" }, { l: "Services", p: "/services" },
                { l: "Specialists", p: "/experts" }, { l: "Gallery", p: "/gallery" },
                { l: "Store", p: "/store" }, { l: "About", p: "/about" },
              ].map(item => (
                <button key={item.p} type="button"
                  onClick={() => { preloadRoute(item.p); navigate(item.p); }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFF"; preloadRoute(item.p); }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = item.p === "/" ? "#F5B942" : "#94a3b8"; }}
                  style={{ background: "none", border: "none", color: item.p === "/" ? "#F5B942" : "#94a3b8", fontSize: ".82rem", fontWeight: 700, padding: ".4rem .65rem", borderRadius: "8px", cursor: "pointer", fontFamily: "Outfit,sans-serif", transition: "color .15s" }}
                >{item.l}</button>
              ))}
            </nav>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: ".45rem", flexShrink: 0 }}>
              <button type="button" onClick={toggleTheme} className="btn-ghost"
                style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "50%", width: "34px", height: "34px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun size={15} color="#F5B942" /> : <Moon size={15} color="#F5B942" />}
              </button>

              <button type="button" onClick={() => navigate("/ai-matcher")} onMouseEnter={() => preloadRoute("/ai-matcher")}
                className="btn-ghost lp-ai-pill"
                style={{ display: "inline-flex", alignItems: "center", gap: ".3rem", background: "rgba(245,185,66,.1)", border: "1px solid rgba(245,185,66,.35)", borderRadius: "50px", padding: ".38rem .7rem", fontSize: ".76rem", fontWeight: 800, color: "#F5B942", cursor: "pointer", fontFamily: "Outfit,sans-serif", flexShrink: 0 }}
              >
                <Sparkles size={14} /><span className="lp-ai-pill-text">AI Matcher</span>
              </button>

              {!isAuthenticated ? (
                <>
                  <button type="button" onClick={() => navigate("/login")} className="btn-ghost lp-login-btn"
                    style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "50px", padding: ".38rem .8rem", fontSize: ".76rem", fontWeight: 700, color: "#cbd5e1", cursor: "pointer", fontFamily: "Outfit,sans-serif", whiteSpace: "nowrap", flexShrink: 0 }}
                  >Log In</button>
                  <button type="button" onClick={handleGetStarted} className="btn-gold"
                    style={{ background: "linear-gradient(135deg,#F5B942 0%,#e8912d 100%)", border: "none", borderRadius: "50px", padding: ".38rem .85rem", fontSize: ".76rem", fontWeight: 800, color: "#08090C", cursor: "pointer", fontFamily: "Outfit,sans-serif", boxShadow: "0 4px 14px rgba(245,185,66,.35)", whiteSpace: "nowrap", flexShrink: 0 }}
                  >Join Free</button>
                </>
              ) : (
                <button type="button" onClick={handleGetStarted} className="btn-gold"
                  style={{ background: "linear-gradient(135deg,#F5B942 0%,#e8912d 100%)", border: "none", borderRadius: "50px", padding: ".38rem .85rem", fontSize: ".76rem", fontWeight: 800, color: "#08090C", cursor: "pointer", fontFamily: "Outfit,sans-serif", boxShadow: "0 4px 14px rgba(245,185,66,.35)", whiteSpace: "nowrap", flexShrink: 0 }}
                >Dashboard →</button>
              )}
            </div>
          </header>

          {/* ══ HERO ══ */}
          <section
            className="lp-hero-grid"
            style={{
              paddingTop: "2.5rem", paddingBottom: "0.5rem",
              display: "flex", flexDirection: "column",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(18px)",
              transition: "opacity .6s ease, transform .6s ease",
            }}
          >
            {/* Text column */}
            <div className="lp-hero-text" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>

              {/* eyebrow */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: ".4rem",
                background: "rgba(245,185,66,.12)", border: "1px solid rgba(245,185,66,.32)",
                borderRadius: "50px", padding: ".32rem .9rem",
                marginBottom: "1.4rem",
                fontSize: ".72rem", fontWeight: 800, color: "#F5B942",
                letterSpacing: ".04em", textTransform: "uppercase",
              }}>
                <Sparkles size={12} />AI-Powered Beauty &amp; Grooming Platform
              </div>

              {/* headline */}
              <h1 style={{
                fontSize: "clamp(2.05rem,7.5vw,3.4rem)",
                fontWeight: 900, letterSpacing: "-.035em", lineHeight: 1.1,
                margin: "0 0 1.25rem", maxWidth: "580px",
              }}>
                Your look. Verified talent.{" "}
                <span style={{
                  background: "linear-gradient(135deg,#F5B942 0%,#fbbf24 45%,#ea580c 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "shimmerText 4s linear infinite", display: "inline",
                }}>
                  Booked in seconds.
                </span>
              </h1>

              {/* subtitle */}
              <p style={{ fontSize: "clamp(.93rem,3vw,1.05rem)", color: "#94a3b8", lineHeight: 1.7, margin: "0 0 2rem", maxWidth: "480px" }}>
                Connect with vetted barbers, braiders, lash techs, nail artists &amp; makeup specialists across Lagos &amp; Ibadan — salon visits or VIP home service.
              </p>

              {/* CTA buttons */}
              <div className="lp-hero-btns"
                style={{ display: "flex", flexWrap: "wrap", gap: ".75rem", width: "100%", maxWidth: "440px", justifyContent: "center", marginBottom: "2.25rem" }}>
                <button type="button" onClick={handleGetStarted} className="btn-gold"
                  style={{ flex: "1 1 190px", minHeight: "52px", background: "linear-gradient(135deg,#F5B942 0%,#e8912d 100%)", color: "#08090C", borderRadius: "50px", border: "none", fontSize: ".97rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem", boxShadow: "0 8px 26px -2px rgba(245,185,66,.45)", fontFamily: "Outfit,sans-serif" }}
                >
                  <span>{isAuthenticated ? "Go to Dashboard" : "Book a Stylist"}</span>
                  <ArrowRight size={17} strokeWidth={2.8} />
                </button>
                <button type="button" onClick={() => navigate("/ai-matcher")} className="btn-ghost"
                  style={{ flex: "1 1 170px", minHeight: "52px", background: "rgba(255,255,255,.05)", border: "1.5px solid rgba(255,255,255,.12)", color: "#fff", borderRadius: "50px", fontSize: ".88rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: ".4rem", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", fontFamily: "Outfit,sans-serif" }}
                >
                  <Sparkles size={15} color="#F5B942" /><span>Try AI Matcher</span>
                </button>
              </div>

              {/* social proof strip */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                flexWrap: "wrap", gap: "1rem 1.8rem",
                paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,.07)",
                width: "100%", maxWidth: "480px",
              }}>
                {[
                  { val: "4.92 ★", lbl: "Verified Rating", icon: <Star size={13} fill="#F5B942" color="#F5B942" /> },
                  { val: "1,200+", lbl: "Booked Sessions", icon: <CheckCircle2 size={13} color="#10b981" /> },
                  { val: "Lagos & Ibadan", lbl: "Salon & Home", icon: <MapPin size={13} color="#F5B942" /> },
                ].map(item => (
                  <div key={item.val} style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
                    {item.icon}
                    <div>
                      <div style={{ fontSize: ".8rem", fontWeight: 800, color: "#FFF", lineHeight: 1 }}>{item.val}</div>
                      <div style={{ fontSize: ".67rem", color: "#64748b", lineHeight: 1.2 }}>{item.lbl}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual column — desktop only */}
            <div className="lp-hero-visual">
              <div style={{
                position: "relative", width: "100%", maxWidth: "520px",
                borderRadius: "26px", padding: ".5rem",
                background: "linear-gradient(145deg,rgba(245,185,66,.22) 0%,rgba(255,255,255,.05) 40%,rgba(13,14,18,.8) 100%)",
                boxShadow: "0 32px 70px -15px rgba(0,0,0,.9), 0 0 36px rgba(245,185,66,.12)",
                animation: "heroCardFloat 6s ease-in-out infinite",
                boxSizing: "border-box", overflow: "hidden",
              }}>
                <div style={{ position: "relative", width: "100%", height: "clamp(260px,30vw,370px)", borderRadius: "20px", overflow: "hidden", background: "#12141c" }}>
                  <img src="/images/stylecorner-salon-top.jpg" alt="StyleCorner Luxury Atelier"
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 28%", display: "block" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(8,9,12,.08) 0%,rgba(8,9,12,.38) 60%,rgba(8,9,12,.82) 100%)", pointerEvents: "none" }} />

                  {/* status pill */}
                  <div style={{ position: "absolute", top: "14px", left: "14px", display: "inline-flex", alignItems: "center", gap: ".4rem", background: "rgba(12,14,20,.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "50px", padding: ".35rem .85rem" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                    <span style={{ fontSize: ".73rem", fontWeight: 800, color: "#FFF" }}>Verified Artists Active</span>
                  </div>
                  {/* location pill */}
                  <div style={{ position: "absolute", top: "14px", right: "14px", display: "inline-flex", alignItems: "center", gap: ".35rem", background: "rgba(12,14,20,.82)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(245,185,66,.3)", borderRadius: "50px", padding: ".35rem .85rem" }}>
                    <MapPin size={12} color="#F5B942" />
                    <span style={{ fontSize: ".73rem", fontWeight: 800, color: "#F5B942" }}>Lagos &amp; Ibadan</span>
                  </div>
                  {/* bottom bar */}
                  <div style={{ position: "absolute", bottom: "12px", left: "12px", right: "12px", background: "rgba(13,15,22,.83)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "14px", padding: ".7rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: ".55rem" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "rgba(245,185,66,.18)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5B942", flexShrink: 0 }}>
                        <Star size={16} fill="#F5B942" />
                      </div>
                      <div>
                        <div style={{ fontSize: ".82rem", fontWeight: 800, color: "#FFF" }}>4.92 ★ Average Rating</div>
                        <div style={{ fontSize: ".7rem", color: "#94a3b8" }}>1,200+ satisfied appointments</div>
                      </div>
                    </div>
                    <div onClick={() => navigate("/services")} style={{ display: "flex", alignItems: "center", gap: ".25rem", fontSize: ".75rem", fontWeight: 800, color: "#F5B942", cursor: "pointer", padding: ".32rem .6rem", borderRadius: "8px", background: "rgba(245,185,66,.12)" }}>
                      <span>Explore</span><ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick-service pill strip */}
          <div className="lp-pill-strip" style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
            {[
              { name: "Hair Braider", query: "Hair Braider & Stylist" },
              { name: "Barber", query: "Barber" },
              { name: "Lash Tech", query: "Lash Tech" },
              { name: "Nail Tech", query: "Nail Tech" },
              { name: "Makeup Artist", query: "Makeup Artist" },
              { name: "Wig Installer", query: "Wig Installer & Revamper" },
            ].map(item => (
              <button key={item.name} type="button" onClick={() => handleBookService(item.query)}
                style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)", borderRadius: "50px", padding: ".35rem .85rem", fontSize: ".73rem", fontWeight: 700, color: "#94a3b8", cursor: "pointer", fontFamily: "Outfit,sans-serif" }}
              >✦ {item.name}</button>
            ))}
          </div>

          {/* ══ SECTION: SERVICES ══ */}
          <section className="lp-section">
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: ".71rem", fontWeight: 800, color: "#F5B942", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: ".45rem" }}>Tailored Services</div>
              <h2 style={{ fontSize: "clamp(1.5rem,5vw,2.1rem)", fontWeight: 900, letterSpacing: "-.03em", margin: "0 0 .5rem", color: "#FFF" }}>Top Booked Specialties</h2>
              <p style={{ fontSize: ".88rem", color: "#94a3b8", margin: 0 }}>Transparent pricing, verified talent, and instant booking confirmation.</p>
            </div>

            <div className="lp-services-grid">
              {SERVICES.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.id} className="sc-card" onClick={() => handleBookService(s.title)}
                    style={{ background: "linear-gradient(145deg,#12141D 0%,#0D0E14 100%)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "22px", padding: "1.25rem", cursor: "pointer", boxShadow: "0 10px 26px -8px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: s.accent + "20", border: `1px solid ${s.accent}45`, color: s.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${s.accent}25` }}>
                        <Icon />
                      </div>
                      <span style={{ fontSize: ".65rem", fontWeight: 800, color: s.accent, background: s.accent + "18", border: `1px solid ${s.accent}30`, borderRadius: "50px", padding: ".22rem .6rem", textTransform: "uppercase", letterSpacing: ".04em" }}>
                        {s.tag}
                      </span>
                    </div>

                    <div style={{ marginBottom: "1.1rem", flex: 1 }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#FFF", margin: "0 0 .32rem", letterSpacing: "-.01em" }}>{s.title}</h3>
                      <p style={{ fontSize: ".76rem", color: "#94a3b8", lineHeight: 1.45, margin: 0 }}>{s.subtitle}</p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: ".8rem", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                      <div>
                        <span style={{ fontSize: ".65rem", color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 700 }}>From</span>
                        <span style={{ fontSize: "1.05rem", fontWeight: 900, color: "#F5B942" }}>&#8358;{s.price.toLocaleString()}</span>
                      </div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: ".28rem", fontSize: ".76rem", fontWeight: 800, color: "#FFF", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "10px", padding: ".4rem .8rem" }}>
                        <span>Book</span><ArrowRight size={13} color="#F5B942" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══ SECTION: HOW IT WORKS ══ */}
          <section className="lp-section" style={{ paddingTop: 0 }}>
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: ".71rem", fontWeight: 800, color: "#F5B942", letterSpacing: ".09em", textTransform: "uppercase", marginBottom: ".45rem" }}>Seamless Experience</div>
              <h2 style={{ fontSize: "clamp(1.5rem,5vw,2.1rem)", fontWeight: 900, letterSpacing: "-.03em", margin: "0 0 .5rem", color: "#FFF" }}>How It Works</h2>
              <p style={{ fontSize: ".88rem", color: "#94a3b8", margin: 0 }}>From choosing a look to looking sharp — 3 easy steps.</p>
            </div>

            <div className="lp-steps-grid">
              {STEPS.map(st => {
                const Icon = st.icon;
                return (
                  <div key={st.num} className="sc-card"
                    style={{ background: "linear-gradient(160deg,#131520 0%,#0C0E14 100%)", border: "1px solid rgba(245,185,66,.14)", borderRadius: "22px", padding: "1.5rem", boxShadow: "0 12px 30px rgba(0,0,0,.4)", position: "relative", overflow: "hidden", display: "flex", gap: "1.1rem", alignItems: "flex-start" }}
                  >
                    {/* big ghost number */}
                    <span style={{ fontSize: "2.2rem", fontWeight: 900, color: "rgba(245,185,66,.18)", fontFamily: "Outfit,sans-serif", lineHeight: 1, flexShrink: 0, userSelect: "none", paddingTop: ".1rem" }}>{st.num}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: ".55rem", marginBottom: ".65rem" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(245,185,66,.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#F5B942", flexShrink: 0 }}>
                          <Icon size={17} />
                        </div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#FFF", margin: 0, letterSpacing: "-.01em" }}>{st.title}</h3>
                      </div>
                      <p style={{ fontSize: ".8rem", color: "#94a3b8", lineHeight: 1.55, margin: 0 }}>{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ══ SECTION: TRUST & SAFETY ══ */}
          <section className="lp-section" style={{ paddingTop: 0 }}>
            <div style={{
              background: "linear-gradient(135deg,rgba(245,185,66,.08) 0%,rgba(13,14,18,.95) 75%)",
              border: "1.5px solid rgba(245,185,66,.24)",
              borderRadius: "28px",
              padding: "clamp(1.75rem,6vw,2.5rem)",
              boxShadow: "0 22px 55px rgba(0,0,0,.6)",
              boxSizing: "border-box",
            }}>
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: ".4rem", background: "rgba(245,185,66,.14)", borderRadius: "50px", padding: ".3rem .85rem", fontSize: ".71rem", fontWeight: 800, color: "#F5B942", marginBottom: ".6rem" }}>
                  <ShieldCheck size={13} /><span>The StyleCorner Standard</span>
                </div>
                <h2 style={{ fontSize: "clamp(1.4rem,4.5vw,2rem)", fontWeight: 900, letterSpacing: "-.025em", margin: "0 0 .5rem", color: "#FFF" }}>
                  Built for Confidence &amp; Peace of Mind
                </h2>
                <p style={{ fontSize: ".86rem", color: "#94a3b8", margin: 0 }}>
                  We took the uncertainty out of booking hair, lash, barber and beauty sessions.
                </p>
              </div>

              <div className="lp-trust-grid">
                {TRUST_POINTS.map(tp => {
                  const Icon = tp.icon;
                  return (
                    <div key={tp.title} style={{ background: "rgba(10,12,18,.75)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "18px", padding: "1.2rem", boxSizing: "border-box" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: tp.color + "18", border: `1px solid ${tp.color}35`, display: "flex", alignItems: "center", justifyContent: "center", color: tp.color, marginBottom: ".8rem" }}>
                        <Icon size={18} />
                      </div>
                      <h4 style={{ fontSize: ".92rem", fontWeight: 800, color: "#FFF", margin: "0 0 .32rem" }}>{tp.title}</h4>
                      <p style={{ fontSize: ".75rem", color: "#94a3b8", lineHeight: 1.5, margin: 0 }}>{tp.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ══ SECTION: TESTIMONIAL ══ */}
          <section className="lp-section" style={{ paddingTop: 0 }}>
            <div className="sc-card"
              style={{ background: "linear-gradient(145deg,#131622 0%,#0d0e14 100%)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "24px", padding: "1.75rem", boxShadow: "0 16px 38px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", gap: "1.1rem" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: ".3rem" }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F5B942" color="#F5B942" />)}
                <span style={{ fontSize: ".74rem", fontWeight: 800, color: "#F5B942", marginLeft: ".4rem" }}>Verified Client Review</span>
              </div>

              <blockquote style={{ fontSize: "clamp(.92rem,3vw,1.04rem)", color: "#e2e8f0", lineHeight: 1.65, fontStyle: "italic", margin: 0 }}>
                "I needed knotless bohemian braids on short notice in Victoria Island. StyleCorner's AI matched me with an amazing braider in 30 seconds. She arrived promptly, did an exquisite job, and payment via wallet was completely seamless!"
              </blockquote>

              <div style={{ display: "flex", alignItems: "center", gap: ".75rem", paddingTop: ".6rem", borderTop: "1px solid rgba(255,255,255,.06)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg,#F5B942,#e879f9)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#08090C", fontSize: ".95rem", flexShrink: 0 }}>T</div>
                <div>
                  <div style={{ fontSize: ".88rem", fontWeight: 800, color: "#FFF" }}>Tiwa O.</div>
                  <div style={{ fontSize: ".71rem", color: "#94a3b8" }}>Lekki Phase 1, Lagos · Knotless Braids</div>
                </div>
              </div>
            </div>
          </section>

          {/* ══ SECTION: BOTTOM CTA ══ */}
          <section className="lp-section" style={{ paddingTop: 0, paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 3.5rem)" }}>
            <div style={{
              background: "linear-gradient(135deg,#181c2b 0%,#10121a 50%,#0d0f16 100%)",
              border: "1.5px solid rgba(245,185,66,.35)",
              borderRadius: "28px",
              padding: "clamp(2rem,7vw,2.75rem)",
              textAlign: "center",
              boxShadow: "0 28px 65px -15px rgba(245,185,66,.24), 0 16px 44px rgba(0,0,0,.8)",
              position: "relative", overflow: "hidden",
            }}>
              {/* glow behind heading */}
              <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "60%", height: "200px", borderRadius: "50%", background: "radial-gradient(circle,rgba(245,185,66,.14) 0%,transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

              <h2 style={{ fontSize: "clamp(1.65rem,5.5vw,2.3rem)", fontWeight: 900, letterSpacing: "-.03em", margin: "0 0 .7rem", color: "#FFF", position: "relative" }}>
                Ready to Experience StyleCorner?
              </h2>
              <p style={{ fontSize: "clamp(.85rem,3vw,.96rem)", color: "#94a3b8", maxWidth: "440px", margin: "0 auto 2rem", lineHeight: 1.65, position: "relative" }}>
                Join thousands of satisfied clients booking verified beauty &amp; grooming professionals in Lagos and Ibadan.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: ".85rem", maxWidth: "420px", margin: "0 auto", position: "relative" }}>
                <button type="button" onClick={handleGetStarted} className="btn-gold"
                  style={{ flex: "1 1 190px", minHeight: "54px", background: "linear-gradient(135deg,#F5B942 0%,#e8912d 100%)", color: "#08090C", borderRadius: "50px", border: "none", fontSize: "1rem", fontWeight: 900, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: ".5rem", boxShadow: "0 10px 30px -4px rgba(245,185,66,.45)", fontFamily: "Outfit,sans-serif" }}
                >
                  <span>{isAuthenticated ? "Open Dashboard" : "Get Started — It's Free"}</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </button>
                <button type="button" onClick={() => navigate("/services")} className="btn-ghost"
                  style={{ flex: "1 1 165px", minHeight: "54px", background: "rgba(255,255,255,.06)", border: "1.5px solid rgba(255,255,255,.12)", color: "#fff", borderRadius: "50px", fontSize: ".9rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit,sans-serif" }}
                >Explore Services</button>
              </div>

              <div style={{ marginTop: "1.25rem", position: "relative" }}>
                <button type="button" onClick={() => navigate("/role-selection")}
                  style={{ background: "none", border: "none", color: "#64748b", fontSize: ".78rem", cursor: "pointer", fontFamily: "Outfit,sans-serif", fontWeight: 600, transition: "color .15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "#F5B942"}
                  onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                >
                  Are you a stylist or salon owner? Join our verified network →
                </button>
              </div>
            </div>
          </section>

          {/* ══ MOBILE FOOTER ══ */}
          <footer className="lp-mobile-footer"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom,0px) + 2rem)", textAlign: "center", fontSize: ".74rem", color: "#475569", borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: "1.5rem" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: ".75rem 1.2rem", marginBottom: ".7rem" }}>
              {[{ l: "About", p: "/about" }, { l: "Services", p: "/services" }, { l: "Policies", p: "/policies" }, { l: "Contact", p: "/contact" }].map(item => (
                <span key={item.p} onClick={() => navigate(item.p)} style={{ cursor: "pointer", color: "#64748b" }}>{item.l}</span>
              ))}
            </div>
            <div>&#169; {new Date().getFullYear()} StyleCorner. All rights reserved. Lagos &amp; Ibadan, Nigeria.</div>
          </footer>

        </div>
      </div>
    </PageContainer>
  );
};

export default Home;
