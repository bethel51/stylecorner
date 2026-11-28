import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sun,
  Moon,
  Compass,
  Check,
  ShieldCheck,
  QrCode,
  Wallet,
  Layers,
} from "lucide-react";
import { SEOHead } from "../components/common/SEOHead";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { PageContainer } from "../components/common/PageContainer";
import { PushNotificationManager } from "../components/common/PushNotificationManager";
import { preloadRoute } from "../App";

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Phase state: 'landing' (split screen artwork) -> 'onboarding' (editorial role selection)
  const [phase, setPhase] = useState("landing");
  const [isSplitting, setIsSplitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState("customer"); // 'customer' or 'staff'

  useEffect(() => {
    preloadRoute("/signup");
    preloadRoute("/login");
    preloadRoute("/services");
    preloadRoute("/experts");
    preloadRoute("/ai-matcher");
    preloadRoute("/role-selection");
  }, []);

  // Split reveal animation triggered by clicking the center logo
  const handleTriggerSplit = () => {
    if (isSplitting) return;
    try {
      if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(35);
      }
    } catch (e) {}

    setIsSplitting(true);

    // Slide doors apart, then navigate directly to the role selector page
    setTimeout(() => {
      navigate("/role-selection");
    }, 700);
  };

  const handleProceedRegistration = () => {
    navigate(`/signup?role=${selectedRole}`);
  };

  const handleExploreGuest = () => {
    navigate("/services");
  };

  const isCustomer = selectedRole === "customer";
  const isSpecialist = selectedRole === "staff";

  // ══════════════════════════════════════════════════════════════════
  // STANDALONE SPLIT HORIZONTAL LANDING PAGE (Artwork in Two Halves)
  // ══════════════════════════════════════════════════════════════════
  if (phase === "landing") {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          height: "100%",
          minHeight: "100vh",
          zIndex: 99999,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          userSelect: "none",
          WebkitUserSelect: "none",
          overscrollBehavior: "none",
          touchAction: "manipulation",
        }}
      >
        <SEOHead
          title="Book Barbers, Hairstylists, Nail Techs & Lash Artists"
          description="Book top-rated beauty professionals on Style Corner. Connect with verified barbers, hairstylists, wig installers, nail technicians, and lash artists for bespoke salon and grooming appointments."
          canonicalPath="/"
          keywords="beauty professionals, nail technicians, lash artists, hairstylists, barbers, wig installers, salon booking, haircut appointment, braiders"
        />

        <style>{`
          @keyframes emblemBreath {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(245, 185, 66, 0.4);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.05);
              box-shadow: 0 12px 38px rgba(0, 0, 0, 0.5), 0 0 40px rgba(245, 185, 66, 0.7);
            }
          }

          @keyframes promptPulse {
            0%, 100% { opacity: 0.92; transform: translateX(-50%) translateY(0); }
            50% { opacity: 1; transform: translateX(-50%) translateY(-2px); }
          }

          /* Desktop View Upgrade (>= 1024px) */
          @media (min-width: 1024px) {
            .landing-door-art-top,
            .landing-door-art-bottom {
              background-size: contain !important;
              background-position: center top !important;
            }
            .landing-center-logo {
              width: 96px !important;
              height: 96px !important;
              border-radius: 24px !important;
              border-width: 3px !important;
            }
            .landing-prompt-pill {
              top: calc(50% + 64px) !important;
              padding: 0.45rem 1.25rem !important;
              font-size: 0.82rem !important;
            }
            .landing-header-badge {
              top: 2rem !important;
            }
            .landing-header-badge > div {
              padding: 0.45rem 1.25rem !important;
            }
            .landing-header-badge span {
              font-size: 0.82rem !important;
            }
            .landing-bottom-badge {
              bottom: 2rem !important;
            }
            .landing-bottom-badge > div {
              padding: 0.5rem 1.4rem !important;
            }
            .landing-bottom-badge span:first-child {
              font-size: 0.95rem !important;
            }
          }
        `}</style>

        {/* Top Half (Slides UP when clicked) */}
        <div
          onClick={handleTriggerSplit}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "50%",
            overflow: "hidden",
            transform: isSplitting ? "translate3d(0, -100%, 0)" : "translate3d(0, 0, 0)",
            transition: "transform 0.75s cubic-bezier(0.77, 0, 0.175, 1)",
            zIndex: 20,
            borderBottom: "1.5px solid #F5B942",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            backgroundColor: "#FFFFFF",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Top Half Artwork - Top 50% of the single image */}
          <div
            className="landing-door-art-top"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "200%",
              backgroundImage: "url('/images/landing-art.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Top Header Branding Badge */}
          <div
            className="landing-header-badge"
            style={{
              position: "absolute",
              top: "calc(env(safe-area-inset-top, 0px) + 1.15rem)",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 25,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.32rem 0.95rem",
                borderRadius: "50px",
                background: "rgba(255, 255, 255, 0.94)",
                border: "1.5px solid rgba(245, 185, 66, 0.65)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 4px 18px rgba(0, 0, 0, 0.08)",
              }}
            >
              <Sparkles size={13} color="#F5B942" />
              <span
                style={{
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  color: "#B47806",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Style Corner Atelier
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Half (Slides DOWN when clicked) */}
        <div
          onClick={handleTriggerSplit}
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: "100%",
            height: "50%",
            overflow: "hidden",
            transform: isSplitting ? "translate3d(0, 100%, 0)" : "translate3d(0, 0, 0)",
            transition: "transform 0.75s cubic-bezier(0.77, 0, 0.175, 1)",
            zIndex: 20,
            borderTop: "1.5px solid #F5B942",
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.08)",
            backgroundColor: "#FFFFFF",
            cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {/* Bottom Half Artwork - Bottom 50% of the single image */}
          <div
            className="landing-door-art-bottom"
            style={{
              position: "absolute",
              top: "-100%",
              left: 0,
              width: "100%",
              height: "200%",
              backgroundImage: "url('/images/landing-art.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Bottom Tagline */}
          <div
            className="landing-bottom-badge"
            style={{
              position: "absolute",
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 25,
              pointerEvents: "none",
              padding: "0 1rem",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.92)",
                padding: "0.35rem 1rem",
                borderRadius: "50px",
                border: "1px solid rgba(0, 0, 0, 0.08)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.06)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#0F172A",
                  letterSpacing: "0.02em",
                }}
              >
                Luxury Grooming &amp; Verified Artistry
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', monospace",
                  fontSize: "0.68rem",
                  color: "#B47806",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Lagos &bull; Ibadan
              </span>
            </div>
          </div>
        </div>

        {/* ── Exact Center Seam: Squared Style Corner Logo ── */}
        <div
          onClick={handleTriggerSplit}
          className="landing-center-logo"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: isSplitting ? "translate(-50%, -50%) scale(1.2)" : "translate(-50%, -50%)",
            opacity: isSplitting ? 0 : 1,
            transition: "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease",
            zIndex: 60,
            cursor: "pointer",
            width: "80px",
            height: "80px",
            borderRadius: "20px",
            background: "#08090C",
            border: "2.5px solid #F5B942",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            padding: "4px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(245, 185, 66, 0.4)",
            animation: isSplitting ? "none" : "emblemBreath 2.6s ease-in-out infinite",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <img
            src="/pwa-icon-192.png"
            alt="Style Corner Logo"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "14px",
              display: "block",
            }}
          />
        </div>

        {/* ── Tap to Enter Interactive Prompt (Positioned cleanly below the centered logo) ── */}
        <div
          onClick={handleTriggerSplit}
          className="landing-prompt-pill"
          style={{
            position: "absolute",
            top: "calc(50% + 54px)",
            left: "50%",
            transform: "translateX(-50%)",
            opacity: isSplitting ? 0 : 1,
            transition: "opacity 0.35s ease",
            zIndex: 60,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.38rem 0.95rem",
            borderRadius: "50px",
            background: "rgba(8, 9, 12, 0.9)",
            border: "1.5px solid rgba(245, 185, 66, 0.65)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
            color: "#F5B942",
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            whiteSpace: "nowrap",
            animation: isSplitting ? "none" : "promptPulse 2s ease-in-out infinite",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <Sparkles size={13} color="#F5B942" />
          <span>Tap Logo to Enter</span>
          <span style={{ color: "#FFFFFF" }}>&rarr;</span>
        </div>
      </div>
    );
  }

  return (
    <PageContainer hideHeader={true} hideNav={true} noPadding={true}>
      <SEOHead
        title="Book Barbers, Hairstylists, Nail Techs & Lash Artists"
        description="Book top-rated beauty professionals on Style Corner. Connect with verified barbers, hairstylists, wig installers, nail technicians, and lash artists for bespoke salon and grooming appointments."
        canonicalPath="/"
        keywords="beauty professionals, nail technicians, lash artists, hairstylists, barbers, wig installers, salon booking, haircut appointment, braiders"
      />

      {/* ── Hardware-Accelerated Keyframes & Editorial Typography Styles ── */}
      <style>{`
        /* GPU Promotion */
        .gpu-layer {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
          will-change: transform, opacity;
        }

        .role-editorial-item {
          cursor: pointer;
          position: relative;
          padding: 1.3rem 1.15rem;
          border-radius: 16px;
          border: 1.5px solid transparent;
          transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .role-editorial-item:hover {
          transform: translate3d(0, -2px, 0);
        }

        .role-editorial-item:active {
          transform: scale(0.99);
        }

        .cta-gold-btn {
          background: linear-gradient(135deg, #F5B942 0%, #E8912D 100%);
          box-shadow: 0 10px 28px -4px rgba(245, 185, 66, 0.45);
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease;
        }

        .cta-gold-btn:hover {
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 14px 34px -4px rgba(245, 185, 66, 0.65);
        }

        .feature-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.74rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: ${isDark ? "#cbd5e1" : "#475569"};
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 2: ONBOARDING & REDESIGNED EDITORIAL ROLE SELECTION
         ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          width: "100%",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          padding: "0 1rem",
          boxSizing: "border-box",
        }}
      >
        {/* Top Floating App Bar */}
        <header
          style={{
            width: "100%",
            maxWidth: "480px",
            margin: "0 auto",
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "calc(env(safe-area-inset-top, 0px) + 0.85rem)",
            paddingBottom: "0.85rem",
            marginBottom: "0.5rem",
            boxSizing: "border-box",
          }}
        >
          {/* Brand Mark & Label */}
          <div
            onClick={() => setPhase("landing")}
            title="Return to Artwork Screen"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "11px",
                overflow: "hidden",
                border: "1.5px solid rgba(245, 185, 66, 0.45)",
                boxShadow: "0 4px 14px rgba(245, 185, 66, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#08090C",
                flexShrink: 0,
              }}
            >
              <img
                src="/pwa-icon-192.png"
                alt="Style Corner"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.96rem",
                  fontWeight: 800,
                  letterSpacing: "-0.015em",
                  color: isDark ? "#FFFFFF" : "#0F172A",
                  lineHeight: 1.1,
                }}
              >
                Style Corner
              </span>
              <span
                style={{
                  fontSize: "0.64rem",
                  fontWeight: 800,
                  color: "#F5B942",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Atelier
              </span>
            </div>
          </div>

          {/* Right Action Chips: Push Notification & Theme Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <PushNotificationManager />
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                background: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)",
                border: `1.5px solid ${isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"}`,
                borderRadius: "12px",
                width: "38px",
                height: "38px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: isDark ? "#F5B942" : "#334155",
                transition: "all 0.15s ease",
              }}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* ── Main Editorial Content Container ── */}
        <div
          className="gpu-layer"
          style={{
            width: "100%",
            maxWidth: "460px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "0 auto",
            paddingBottom: "3.5rem",
          }}
        >
          {/* Header Mark */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            {/* Center Logo Icon */}
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(245, 185, 66, 0.3)",
                marginBottom: "0.85rem",
                border: "2px solid rgba(245, 185, 66, 0.55)",
                background: "#08090C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="/pwa-icon-192.png"
                alt="Style Corner"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>

            {/* Welcome Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                background: isDark ? "rgba(245, 185, 66, 0.12)" : "rgba(245, 185, 66, 0.16)",
                border: "1px solid rgba(245, 185, 66, 0.35)",
                borderRadius: "50px",
                padding: "0.28rem 0.85rem",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: isDark ? "#F5B942" : "#B47806",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.55rem",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: "0 2px 10px rgba(245, 185, 66, 0.12)",
              }}
            >
              <Sparkles size={12} color="#F5B942" />
              Welcome to Style Corner
            </div>

            {/* Editorial Title (Matching Image 2 Reference) */}
            <h1
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(1.75rem, 5.5vw, 2.15rem)",
                fontWeight: 800,
                color: isDark ? "#FFFFFF" : "#0F172A",
                margin: "0 0 0.4rem",
                letterSpacing: "-0.025em",
                lineHeight: 1.2,
              }}
            >
              Select Your Role
            </h1>

            <p
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "0.88rem",
                color: isDark ? "#94a3b8" : "#64748b",
                margin: 0,
                lineHeight: 1.55,
                maxWidth: "380px",
                fontWeight: 400,
              }}
            >
              Choose how you will experience Style Corner to set up your personalized atelier account.
            </p>
          </div>

          {/* Authenticated Fast Banner (If user is already signed in) */}
          {isAuthenticated && (
            <div
              onClick={() =>
                navigate(role === "staff" ? "/expert-dashboard" : "/customer-dashboard")
              }
              className="role-editorial-item"
              style={{
                width: "100%",
                background: isDark
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(245, 185, 66, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(16, 185, 129, 0.10) 0%, rgba(245, 185, 66, 0.12) 100%)",
                border: isDark
                  ? "1.5px solid rgba(16, 185, 129, 0.35)"
                  : "1.5px solid rgba(16, 185, 129, 0.45)",
                borderRadius: "16px",
                padding: "0.95rem 1.15rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                boxSizing: "border-box",
                boxShadow: "0 8px 24px -6px rgba(16, 185, 129, 0.18)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(16, 185, 129, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CheckCircle2 size={20} color="#10b981" />
                </div>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      color: isDark ? "#FFF" : "#0F172A",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Signed in as <span style={{ color: "#F5B942" }}>{user?.firstname || user?.fullName || "Member"}</span>
                  </div>
                  <div style={{ fontSize: "0.74rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "2px" }}>
                    Tap to open your {role === "staff" ? "Expert" : "Customer"} Dashboard
                  </div>
                </div>
              </div>
              <ArrowRight size={17} color="#F5B942" strokeWidth={2.4} />
            </div>
          )}

          {/* ── Editorial Numbered Role Cards (Inspired by Image 2 - Ademola Commerciale) ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              width: "100%",
              marginBottom: "1.5rem",
            }}
          >
            {/* Card 01: Client / Customer */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRole("customer")}
              onKeyDown={(e) => e.key === "Enter" && setSelectedRole("customer")}
              className="role-editorial-item"
              style={{
                background: isCustomer
                  ? isDark
                    ? "rgba(245, 185, 66, 0.08)"
                    : "rgba(245, 185, 66, 0.06)"
                  : isDark
                  ? "#12151E"
                  : "#FFFFFF",
                borderColor: isCustomer
                  ? "#F5B942"
                  : isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.08)",
                borderLeft: isCustomer
                  ? "4px solid #F5B942"
                  : `1.5px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}`,
                boxShadow: isCustomer
                  ? "0 10px 28px -4px rgba(245, 185, 66, 0.22)"
                  : isDark
                  ? "0 4px 18px rgba(0, 0, 0, 0.2)"
                  : "0 4px 18px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                {/* Index 01 */}
                <div
                  style={{
                    fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', monospace",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: isCustomer ? "#F5B942" : isDark ? "#64748b" : "#94a3b8",
                    lineHeight: 1.3,
                    paddingTop: "2px",
                    flexShrink: 0,
                    transition: "color 0.2s ease",
                  }}
                >
                  01
                </div>

                {/* Details */}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                    <h3
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: isDark ? "#FFFFFF" : "#0F172A",
                        margin: 0,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      Client / Customer
                    </h3>
                    <span
                      style={{
                        fontSize: "0.66rem",
                        fontWeight: 700,
                        padding: "0.16rem 0.55rem",
                        borderRadius: "50px",
                        background: "rgba(16, 185, 129, 0.14)",
                        color: "#10b981",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Book Sessions
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.84rem",
                      color: isDark ? "#94a3b8" : "#64748b",
                      lineHeight: 1.5,
                      margin: "0 0 0.65rem",
                      fontWeight: 400,
                    }}
                  >
                    Book verified barbers, lash techs, nail artists, braiders &amp; wig stylists across Lagos &amp; Ibadan.
                  </p>

                  {/* Feature Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    <span className="feature-tag">
                      <ShieldCheck size={14} color="#10b981" />
                      <span>100% Escrow Protected</span>
                    </span>
                    <span className="feature-tag">
                      <QrCode size={13} color="#F5B942" />
                      <span>Digital Pass Check-In</span>
                    </span>
                  </div>
                </div>

                {/* Radio check & sleek arrow */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, paddingTop: "3px" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      border: `1.5px solid ${isCustomer ? "#F5B942" : isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}`,
                      background: isCustomer ? "#F5B942" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isCustomer && <Check size={13} color="#08090C" strokeWidth={3} />}
                  </div>
                  <ArrowRight
                    size={18}
                    style={{
                      color: isCustomer ? "#F5B942" : isDark ? "#475569" : "#94a3b8",
                      transform: isCustomer ? "translateX(3px)" : "translateX(0)",
                      transition: "transform 0.2s ease, color 0.2s ease",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Card 02: Specialist / Expert */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRole("staff")}
              onKeyDown={(e) => e.key === "Enter" && setSelectedRole("staff")}
              className="role-editorial-item"
              style={{
                background: isSpecialist
                  ? isDark
                    ? "rgba(245, 185, 66, 0.08)"
                    : "rgba(245, 185, 66, 0.06)"
                  : isDark
                  ? "#12151E"
                  : "#FFFFFF",
                borderColor: isSpecialist
                  ? "#F5B942"
                  : isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "rgba(0, 0, 0, 0.08)",
                borderLeft: isSpecialist
                  ? "4px solid #F5B942"
                  : `1.5px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}`,
                boxShadow: isSpecialist
                  ? "0 10px 28px -4px rgba(245, 185, 66, 0.22)"
                  : isDark
                  ? "0 4px 18px rgba(0, 0, 0, 0.2)"
                  : "0 4px 18px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                {/* Index 02 */}
                <div
                  style={{
                    fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', monospace",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: isSpecialist ? "#F5B942" : isDark ? "#64748b" : "#94a3b8",
                    lineHeight: 1.3,
                    paddingTop: "2px",
                    flexShrink: 0,
                    transition: "color 0.2s ease",
                  }}
                >
                  02
                </div>

                {/* Details */}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                    <h3
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color: isDark ? "#FFFFFF" : "#0F172A",
                        margin: 0,
                        letterSpacing: "-0.015em",
                      }}
                    >
                      Specialist / Expert
                    </h3>
                    <span
                      style={{
                        fontSize: "0.66rem",
                        fontWeight: 700,
                        padding: "0.16rem 0.55rem",
                        borderRadius: "50px",
                        background: "rgba(245, 185, 66, 0.15)",
                        color: "#F5B942",
                        border: "1px solid rgba(245, 185, 66, 0.35)",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Earn &amp; Grow
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: "0.84rem",
                      color: isDark ? "#94a3b8" : "#64748b",
                      lineHeight: 1.5,
                      margin: "0 0 0.65rem",
                      fontWeight: 400,
                    }}
                  >
                    Showcase your portfolio, receive client appointments &amp; get paid directly to your wallet.
                  </p>

                  {/* Feature Tags */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    <span className="feature-tag">
                      <Layers size={13} color="#a855f7" />
                      <span>Lookbook Showcase</span>
                    </span>
                    <span className="feature-tag">
                      <Wallet size={13} color="#10b981" />
                      <span>Direct Wallet Payout</span>
                    </span>
                  </div>
                </div>

                {/* Radio check & sleek arrow */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, paddingTop: "3px" }}>
                  <div
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "50%",
                      border: `1.5px solid ${isSpecialist ? "#F5B942" : isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"}`,
                      background: isSpecialist ? "#F5B942" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isSpecialist && <Check size={13} color="#08090C" strokeWidth={3} />}
                  </div>
                  <ArrowRight
                    size={18}
                    style={{
                      color: isSpecialist ? "#F5B942" : isDark ? "#475569" : "#94a3b8",
                      transform: isSpecialist ? "translateX(3px)" : "translateX(0)",
                      transition: "transform 0.2s ease, color 0.2s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Primary Registration CTA Button ── */}
          <button
            type="button"
            onClick={handleProceedRegistration}
            className="cta-gold-btn"
            style={{
              width: "100%",
              minHeight: "52px",
              border: "none",
              borderRadius: "14px",
              color: "#08090C",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.98rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.55rem",
              marginBottom: "1.1rem",
            }}
          >
            <span>{isCustomer ? "Continue as Client" : "Continue as Specialist"}</span>
            <ArrowRight size={18} strokeWidth={2.8} />
          </button>

          {/* Sign In Secondary Link */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              fontSize: "0.86rem",
              color: isDark ? "#94a3b8" : "#64748b",
              marginBottom: "1.5rem",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span>Already have an account?</span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "#F5B942",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                padding: "0.2rem 0.35rem",
                fontSize: "0.86rem",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Sign In
            </button>
          </div>

          {/* ── Divider ── */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: isDark ? "#64748b" : "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Or Continue As Guest
            </span>
            <div style={{ flex: 1, height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
          </div>

          {/* ── Option: Explore Services as a Guest ── */}
          <button
            type="button"
            onClick={handleExploreGuest}
            style={{
              width: "100%",
              minHeight: "48px",
              background: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
              border: `1.5px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}`,
              borderRadius: "14px",
              color: isDark ? "#FFFFFF" : "#0F172A",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 1.15rem",
              boxSizing: "border-box",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <Compass size={18} color="#F5B942" />
              <span>Explore Atelier Services as Guest</span>
            </div>
            <ArrowRight size={16} color={isDark ? "#94a3b8" : "#64748b"} />
          </button>

          {/* Quick Footer Links Strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "0.5rem 1.15rem",
              paddingTop: "0.85rem",
              borderTop: `1px solid ${isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)"}`,
              width: "100%",
            }}
          >
            {[
              { label: "Services", path: "/services" },
              { label: "Specialists", path: "/experts" },
              { label: "Lookbook", path: "/gallery" },
              { label: "Store", path: "/store" },
              { label: "AI Stylist Finder", path: "/ai-matcher" },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                style={{
                  background: "none",
                  border: "none",
                  color: isDark ? "#94a3b8" : "#64748b",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "color 0.15s ease",
                  padding: "0.2rem",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F5B942")}
                onMouseLeave={(e) => (e.currentTarget.style.color = isDark ? "#94a3b8" : "#64748b")}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
export default Home;






