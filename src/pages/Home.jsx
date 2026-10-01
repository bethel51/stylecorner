import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Star, Scissors, Zap, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageContainer } from "../components/common/PageContainer";
import { preloadRoute } from "../App";

/* ─── Floating 3D Orb ──────────────────────────────────────────────── */
const Orb = ({ size, x, y, color, delay, duration, blur }) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      left: x,
      top: y,
      background: color,
      filter: `blur(${blur || size / 2}px)`,
      opacity: 0.55,
      animation: `orbFloat ${duration}s ease-in-out ${delay}s infinite alternate`,
      pointerEvents: "none",
      willChange: "transform",
    }}
  />
);

/* ─── Trust badge pill ──────────────────────────────────────────────── */
const TrustPill = ({ icon: Icon, label, color }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.4rem",
      background: "rgba(255,255,255,0.045)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "50px",
      padding: "0.42rem 0.85rem",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}
  >
    <Icon size={13} color={color} strokeWidth={2.5} />
    <span
      style={{
        fontSize: "0.7rem",
        fontFamily: "Outfit, sans-serif",
        fontWeight: 700,
        color: "#e2e8f0",
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  </div>
);

/* ─── Floating service tag ──────────────────────────────────────────── */
const FloatingTag = ({ label, top, left, right, delay }) => (
  <div
    style={{
      position: "absolute",
      top,
      left,
      right,
      background: "rgba(13,14,18,0.72)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(245,185,66,0.25)",
      borderRadius: "50px",
      padding: "0.35rem 0.85rem",
      fontSize: "0.72rem",
      fontFamily: "Outfit, sans-serif",
      fontWeight: 800,
      color: "#F5B942",
      pointerEvents: "none",
      animation: `tagFloat 3.5s ease-in-out ${delay}s infinite alternate`,
      whiteSpace: "nowrap",
      zIndex: 5,
    }}
  >
    {label}
  </div>
);

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const heroRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    preloadRoute("/signup");
    preloadRoute("/login");
    preloadRoute("/services");
    // Trigger entrance animation
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Subtle parallax on scroll
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (el) el.style.transform = `translateY(${y * 0.18}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGetStarted = () =>
    navigate(isAuthenticated ? (role === "staff" ? "/expert-dashboard" : "/customer-dashboard") : "/signup");

  const handleLogin = () =>
    navigate(isAuthenticated ? (role === "staff" ? "/expert-dashboard" : "/customer-dashboard") : "/login");

  return (
    <PageContainer hideHeader={true} hideNav={true} noPadding={true}>
      {/* ── Global keyframes injected inline ── */}
      <style>{`
        @keyframes orbFloat {
          0%   { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-28px) scale(1.08); }
        }
        @keyframes tagFloat {
          0%   { transform: translateY(0px) rotate(-1deg); }
          100% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245,185,66,0.45); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 14px rgba(245,185,66,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(245,185,66,0); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .home-cta-btn:active { transform: scale(0.96) !important; }
      `}</style>

      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#07080B",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            background: "#0D0E12",
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.9)",
            position: "relative",
            overflow: "hidden",
          }}
        >

          {/* ── HERO VISUAL ─────────────────────────────────────────── */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "clamp(280px, 58vh, 530px)",
              flexShrink: 0,
              overflow: "hidden",
              background: "linear-gradient(160deg, #0d0e12 0%, #141620 100%)",
            }}
          >
            {/* Soft 3D ambient orbs */}
            <Orb size={220} x="-60px"  y="-40px"  color="radial-gradient(circle, rgba(245,185,66,0.55) 0%, transparent 70%)" delay={0}   duration={4.5} blur={70} />
            <Orb size={180} x="55%"   y="15%"    color="radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)"  delay={1.2} duration={5.2} blur={65} />
            <Orb size={140} x="10%"   y="55%"    color="radial-gradient(circle, rgba(59,130,246,0.35) 0%, transparent 70%)" delay={0.7} duration={6}   blur={55} />
            <Orb size={100} x="72%"   y="62%"    color="radial-gradient(circle, rgba(245,185,66,0.45) 0%, transparent 70%)" delay={2}   duration={4}   blur={40} />

            {/* 3D mesh ring */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "260px",
                height: "260px",
                borderRadius: "50%",
                border: "1.5px solid rgba(245,185,66,0.12)",
                animation: "rotateSlow 20s linear infinite",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "190px",
                height: "190px",
                borderRadius: "50%",
                border: "1px dashed rgba(245,185,66,0.18)",
                animation: "rotateSlow 14s linear infinite reverse",
                pointerEvents: "none",
              }}
            />

            {/* Hero image with parallax ref */}
            <div
              ref={heroRef}
              style={{
                position: "absolute",
                inset: 0,
                willChange: "transform",
              }}
            >
              <img
                src="/images/stylecorner-salon-top.jpg"
                alt="Style Corner Luxury Atelier"
                style={{
                  width: "100%",
                  height: "115%",
                  objectFit: "cover",
                  objectPosition: "center top",
                  display: "block",
                  opacity: 0.62,
                  mixBlendMode: "luminosity",
                }}
              />
            </div>

            {/* Colour tint overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(245,185,66,0.08) 0%, rgba(124,58,237,0.06) 50%, rgba(13,14,18,0) 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Bottom fade */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "120px",
                background: "linear-gradient(180deg, rgba(13,14,18,0) 0%, rgba(13,14,18,0.92) 65%, #0D0E12 100%)",
                pointerEvents: "none",
              }}
            />

            {/* ── Floating Service Tags ── */}
            <FloatingTag label="✦ Lash Tech"              top="18%"  left="8%"        delay={0}   />
            <FloatingTag label="Nail Art ✦"               top="28%"  right="6%"       delay={0.6} />
            <FloatingTag label="✦ Braids & Twists"        top="58%"  left="5%"        delay={1.1} />
            <FloatingTag label="Makeup Artist ✦"          top="48%"  right="4%"       delay={1.7} />

            {/* ── Brand logo mark ── */}
            <div
              style={{
                position: "absolute",
                top: "calc(env(safe-area-inset-top, 0px) + 1.1rem)",
                left: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #F5B942, #d4891a)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 14px rgba(245,185,66,0.45)",
                }}
              >
                <Scissors size={16} color="#0D0E12" strokeWidth={2.5} />
              </div>
              <span
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                }}
              >
                StyleCorner
              </span>
            </div>

            {/* ── Pulsing CTA hint badge ── */}
            <div
              style={{
                position: "absolute",
                bottom: "2.2rem",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(245,185,66,0.14)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(245,185,66,0.35)",
                borderRadius: "50px",
                padding: "0.5rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
                zIndex: 10,
                animation: "pulseRing 2.5s ease-in-out infinite",
              }}
            >
              <Sparkles size={14} color="#F5B942" />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  color: "#F5B942",
                  whiteSpace: "nowrap",
                }}
              >
                AI-Powered Matching
              </span>
            </div>
          </div>

          {/* ── CTA SECTION ─────────────────────────────────────────── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "1.75rem clamp(1.25rem, 5vw, 1.75rem) calc(env(safe-area-inset-bottom, 0px) + 2rem)",
              background: "#0D0E12",
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.55s ease, transform 0.55s ease",
            }}
          >
            {/* Headline */}
            <div style={{ width: "100%", maxWidth: "360px", margin: "0 auto", textAlign: "center" }}>

              {/* Shimmer pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "linear-gradient(90deg, rgba(245,185,66,0.08) 0%, rgba(245,185,66,0.2) 50%, rgba(245,185,66,0.08) 100%)",
                  backgroundSize: "200% auto",
                  animation: "shimmer 2.8s linear infinite",
                  border: "1px solid rgba(245,185,66,0.3)",
                  borderRadius: "50px",
                  padding: "0.3rem 0.85rem",
                  marginBottom: "0.9rem",
                }}
              >
                <Zap size={12} color="#F5B942" fill="#F5B942" />
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontFamily: "Outfit, sans-serif",
                    fontWeight: 800,
                    color: "#F5B942",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Lagos & Ibadan · Book in Seconds
                </span>
              </div>

              <h1
                style={{
                  fontFamily: "Outfit, -apple-system, sans-serif",
                  fontSize: "clamp(1.9rem, 7vw, 2.45rem)",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  margin: "0 0 0.8rem",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.12,
                }}
              >
                {isAuthenticated
                  ? `Welcome back,\n`
                  : "Your "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #F5B942 0%, #e8912d 50%, #F5B942 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "shimmer 3s linear infinite",
                    display: "inline",
                  }}
                >
                  {isAuthenticated ? (user?.firstname || "Stylist") : "beauty journey"}
                </span>
                {isAuthenticated ? "" : " starts here"}
              </h1>

              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "clamp(0.85rem, 3.2vw, 0.95rem)",
                  color: "#8A94A8",
                  margin: "0 0 1.5rem",
                  lineHeight: 1.65,
                  fontWeight: 400,
                }}
              >
                {isAuthenticated
                  ? "Your bookings, wallet & expert matches — all in one place."
                  : "Book verified barbers, lash techs, nail artists & more. AI matches you with the nearest specialist."}
              </p>

              {/* Trust pills row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: "0.45rem",
                  marginBottom: "0.25rem",
                }}
              >
                <TrustPill icon={Shield}   label="Verified Experts"    color="#10b981" />
                <TrustPill icon={Star}     label="Rated 4.9 ★"        color="#F5B942" />
                <TrustPill icon={Sparkles} label="AI-Matched"          color="#a78bfa" />
              </div>
            </div>

            {/* CTA Buttons */}
            <div
              style={{
                marginTop: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              {/* Primary CTA */}
              <button
                type="button"
                className="home-cta-btn"
                onClick={handleGetStarted}
                onMouseEnter={() => preloadRoute("/signup")}
                style={{
                  width: "100%",
                  minHeight: "56px",
                  background: "linear-gradient(135deg, #F5B942 0%, #e8912d 100%)",
                  color: "#0D0E12",
                  borderRadius: "50px",
                  border: "none",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.55rem",
                  boxShadow: "0 10px 30px -6px rgba(245,185,66,0.5), 0 4px 12px rgba(0,0,0,0.35)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  letterSpacing: "-0.01em",
                }}
              >
                <span>{isAuthenticated ? "Go to Dashboard" : "Get Started — It's Free"}</span>
                <ArrowRight size={20} strokeWidth={3} />
              </button>

              {/* Secondary: Log in or already in */}
              {!isAuthenticated ? (
                <button
                  type="button"
                  className="home-cta-btn"
                  onClick={handleLogin}
                  onMouseEnter={() => preloadRoute("/login")}
                  style={{
                    width: "100%",
                    minHeight: "50px",
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "50px",
                    color: "#ffffff",
                    fontFamily: "Outfit, sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.15s ease, border-color 0.15s ease",
                    touchAction: "manipulation",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  Log In to My Account
                </button>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: "0.82rem",
                    color: "#4a5568",
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  Logged in as <strong style={{ color: "#F5B942" }}>{user?.email}</strong>
                </div>
              )}

              {/* Ghost explore link */}
              <button
                type="button"
                onClick={() => navigate("/services")}
                onMouseEnter={() => preloadRoute("/services")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4a5568",
                  fontSize: "0.8rem",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                  letterSpacing: "0.015em",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Browse services without signing up →
              </button>
            </div>
          </div>

        </div>
      </div>
    </PageContainer>
  );
};
