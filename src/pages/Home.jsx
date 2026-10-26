import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Scissors,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sun,
  Moon,
  Compass,
  ChevronRight,
  Check,
  ShieldCheck,
  QrCode,
  Wallet,
  Star,
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

  // Phase transitions: 'loading' -> 'onboarding' with silky cross-fade (no DOM unmount pop)
  const [phase, setPhase] = useState("loading");
  const [selectedRole, setSelectedRole] = useState("customer"); // 'customer' or 'staff'
  const [loadingProgress, setLoadingProgress] = useState(15);

  useEffect(() => {
    preloadRoute("/signup");
    preloadRoute("/login");
    preloadRoute("/services");
    preloadRoute("/experts");
    preloadRoute("/ai-matcher");

    // Smooth deterministic progress increment
    const pTimer1 = setTimeout(() => setLoadingProgress(55), 250);
    const pTimer2 = setTimeout(() => setLoadingProgress(95), 650);
    const pTimer3 = setTimeout(() => setLoadingProgress(100), 1050);

    // Cross-fade to onboarding
    const transitionTimer = setTimeout(() => {
      setPhase("onboarding");
    }, 1350);

    return () => {
      clearTimeout(pTimer1);
      clearTimeout(pTimer2);
      clearTimeout(pTimer3);
      clearTimeout(transitionTimer);
    };
  }, []);

  const handleSkipIntro = () => {
    setLoadingProgress(100);
    setPhase("onboarding");
  };

  const handleProceedRegistration = () => {
    navigate(`/signup?role=${selectedRole}`);
  };

  const handleExploreGuest = () => {
    navigate("/services");
  };

  const isCustomer = selectedRole === "customer";
  const isSpecialist = selectedRole === "staff";

  return (
    <PageContainer hideHeader={true} hideNav={true} noPadding={true}>
      <SEOHead
        title="Book Barbers, Hairstylists, Nail Techs & Lash Artists"
        description="Book top-rated beauty professionals on Style Corner. Connect with verified barbers, hairstylists, wig installers, nail technicians, and lash artists for bespoke salon and grooming appointments."
        canonicalPath="/"
        keywords="beauty professionals, nail technicians, lash artists, hairstylists, barbers, wig installers, salon booking, haircut appointment, braiders"
      />

      {/* ── Hardware-Accelerated 60/120fps CSS Motion & Keyframes ── */}
      <style>{`
        /* GPU Compositor Promotion */
        .gpu-layer {
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
          will-change: transform, opacity;
        }

        @keyframes iconPulseGlow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 16px rgba(245, 185, 66, 0.35));
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 32px rgba(245, 185, 66, 0.65));
          }
        }

        @keyframes ringFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(4deg); }
        }

        @keyframes softShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Interactive Role Card Styles */
        .role-card-btn {
          cursor: pointer;
          position: relative;
          border-radius: 20px;
          box-sizing: border-box;
          transform: translate3d(0, 0, 0);
          transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.24s ease,
                      box-shadow 0.24s ease,
                      background 0.24s ease;
          overflow: hidden;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }

        .role-card-btn:hover {
          transform: translate3d(0, -3px, 0);
        }

        .role-card-btn:active {
          transform: translate3d(0, 0, 0) scale(0.99);
        }

        /* Gold Gradient CTA Button */
        .cta-gold-btn {
          position: relative;
          background: linear-gradient(135deg, #F5B942 0%, #E8912D 100%);
          box-shadow: 0 8px 26px -4px rgba(245, 185, 66, 0.45);
          transform: translate3d(0, 0, 0);
          transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.18s ease,
                      filter 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .cta-gold-btn:hover {
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 14px 34px -4px rgba(245, 185, 66, 0.65);
          filter: brightness(1.03);
        }

        .cta-gold-btn:active {
          transform: translate3d(0, 1px, 0) scale(0.985);
        }

        /* Guest Card Hover */
        .guest-cta-btn {
          transform: translate3d(0, 0, 0);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.2s ease,
                      border-color 0.2s ease,
                      color 0.2s ease,
                      box-shadow 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .guest-cta-btn:hover {
          transform: translate3d(0, -2px, 0);
          border-color: rgba(245, 185, 66, 0.5) !important;
          background: rgba(245, 185, 66, 0.08) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .guest-cta-btn:active {
          transform: scale(0.985);
        }

        /* Micro Feature Pill Chips */
        .micro-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.22rem 0.6rem;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          letter-spacing: 0.01em;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
      `}</style>

      {/* ── Main Viewport Container ── */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: isDark
            ? "radial-gradient(circle at 50% 10%, #151926 0%, #07080B 85%)"
            : "radial-gradient(circle at 50% 10%, #FFFFFF 0%, #F8F5EE 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "0 1.25rem calc(env(safe-area-inset-bottom, 0px) + 2.5rem)",
          boxSizing: "border-box",
          position: "relative",
          overflowX: "hidden",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* Ambient Top Gold Glow */}
        <div
          style={{
            position: "absolute",
            top: "-12%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "clamp(300px, 70vw, 750px)",
            height: "clamp(300px, 70vw, 750px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 185, 66, 0.16) 0%, transparent 68%)",
            filter: "blur(80px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Ambient Bottom Purple Accent Glow */}
        <div
          style={{
            position: "absolute",
            bottom: "-10%",
            right: "-6%",
            width: "clamp(240px, 45vw, 550px)",
            height: "clamp(240px, 45vw, 550px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147, 51, 234, 0.10) 0%, transparent 70%)",
            filter: "blur(85px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* ── Dedicated Top Bar (Never Overlaps with Content) ── */}
        <header
          style={{
            width: "100%",
            maxWidth: "480px",
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
            onClick={() => navigate("/")}
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
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "0.96rem",
                  fontWeight: 900,
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
                color: "#F5B942",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                transition: "all 0.18s ease",
              }}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 1: ICON LOADING SCREEN (Pulsing square icon & progress)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          onClick={handleSkipIntro}
          className="gpu-layer"
          style={{
            position: phase === "loading" ? "relative" : "absolute",
            inset: phase === "loading" ? "auto" : 0,
            zIndex: phase === "loading" ? 10 : 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            maxWidth: "420px",
            width: "100%",
            margin: phase === "loading" ? "auto 0" : "0 auto",
            opacity: phase === "loading" ? 1 : 0,
            transform: phase === "loading" ? "scale(1)" : "scale(0.92)",
            pointerEvents: phase === "loading" ? "auto" : "none",
            transition: "opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            padding: "2rem 0",
          }}
        >
          {/* Animated Square Icon Container */}
          <div
            style={{
              position: "relative",
              width: "110px",
              height: "110px",
              marginBottom: "1.75rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Ambient Animated Ring */}
            <div
              style={{
                position: "absolute",
                inset: "-10px",
                borderRadius: "32px",
                border: "2px solid rgba(245, 185, 66, 0.35)",
                animation: "ringFloat 4.5s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />

            {/* Official Style Corner Square Icon */}
            <img
              src="/pwa-icon-192.png"
              alt="Style Corner"
              style={{
                width: "98px",
                height: "98px",
                borderRadius: "26px",
                objectFit: "cover",
                boxShadow: "0 14px 40px rgba(245, 185, 66, 0.45)",
                animation: "iconPulseGlow 2.4s ease-in-out infinite",
                border: "1.5px solid rgba(245, 185, 66, 0.6)",
              }}
            />
          </div>

          {/* Luxury Typography */}
          <h1
            style={{
              fontFamily: "Outfit, sans-serif",
              fontSize: "clamp(1.75rem, 5.5vw, 2.25rem)",
              fontWeight: 900,
              color: isDark ? "#FFFFFF" : "#0F172A",
              margin: "0 0 0.4rem",
              letterSpacing: "-0.025em",
            }}
          >
            Style Corner
          </h1>

          <p
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: "0.85rem",
              color: "#94a3b8",
              margin: "0 0 1.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Atelier Grooming &amp; Styling
          </p>

          {/* Smooth Progress Indicator */}
          <div
            style={{
              width: "180px",
              height: "4px",
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              borderRadius: "50px",
              overflow: "hidden",
              marginBottom: "1.25rem",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${loadingProgress}%`,
                background: "linear-gradient(90deg, #F5B942, #E8912D)",
                borderRadius: "50px",
                transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>

          <span
            style={{
              fontSize: "0.78rem",
              color: "#64748b",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
            }}
          >
            Tap anywhere to enter →
          </span>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 2: ONBOARDING & ROLE SELECTION (Ultra-Smooth, Clean UX)
           ══════════════════════════════════════════════════════════════════ */}
        <div
          className="gpu-layer"
          style={{
            position: phase === "onboarding" ? "relative" : "absolute",
            zIndex: phase === "onboarding" ? 10 : 0,
            width: "100%",
            maxWidth: "480px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: phase === "onboarding" ? 1 : 0,
            transform: phase === "onboarding" ? "translate3d(0, 0, 0) scale(1)" : "translate3d(0, 24px, 0) scale(0.97)",
            pointerEvents: phase === "onboarding" ? "auto" : "none",
            transition: "opacity 0.42s cubic-bezier(0.16, 1, 0.3, 1), transform 0.42s cubic-bezier(0.16, 1, 0.3, 1)",
            margin: "0 auto",
          }}
        >
          {/* Header Mark */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1.35rem",
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
                boxShadow: "0 10px 28px rgba(245, 185, 66, 0.32)",
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
                padding: "0.32rem 0.95rem",
                fontSize: "0.74rem",
                fontWeight: 800,
                color: isDark ? "#F5B942" : "#B47806",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "0.6rem",
                fontFamily: "Outfit, sans-serif",
                boxShadow: "0 2px 10px rgba(245, 185, 66, 0.12)",
              }}
            >
              <Sparkles size={13} color="#F5B942" />
              Welcome to Style Corner
            </div>

            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "clamp(1.75rem, 5.5vw, 2.15rem)",
                fontWeight: 900,
                color: isDark ? "#FFFFFF" : "#0F172A",
                margin: "0 0 0.35rem",
                letterSpacing: "-0.025em",
              }}
            >
              Select Your Role
            </h2>

            <p
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "0.9rem",
                color: isDark ? "#94a3b8" : "#64748b",
                margin: 0,
                lineHeight: 1.5,
                maxWidth: "380px",
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
              className="role-card-btn"
              style={{
                width: "100%",
                background: isDark
                  ? "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(245, 185, 66, 0.08) 100%)"
                  : "linear-gradient(135deg, rgba(16, 185, 129, 0.10) 0%, rgba(245, 185, 66, 0.12) 100%)",
                border: isDark
                  ? "1.5px solid rgba(16, 185, 129, 0.35)"
                  : "1.5px solid rgba(16, 185, 129, 0.45)",
                borderRadius: "18px",
                padding: "0.95rem 1.15rem",
                marginBottom: "1.35rem",
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
                      fontWeight: 800,
                      color: isDark ? "#FFF" : "#0F172A",
                      fontFamily: "Outfit, sans-serif",
                    }}
                  >
                    Signed in as <span style={{ color: "#F5B942" }}>{user?.firstname || user?.fullName || "Member"}</span>
                  </div>
                  <div style={{ fontSize: "0.74rem", color: isDark ? "#94a3b8" : "#64748b", marginTop: "2px" }}>
                    Tap to open your {role === "staff" ? "Expert" : "Customer"} Dashboard
                  </div>
                </div>
              </div>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: isDark ? "rgba(245, 185, 66, 0.18)" : "rgba(245, 185, 66, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isDark ? "#F5B942" : "#B47806",
                  flexShrink: 0,
                }}
              >
                <ArrowRight size={15} strokeWidth={2.5} />
              </div>
            </div>
          )}

          {/* ── Role Cards (Clean, Tactile, Luxury) ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              width: "100%",
              marginBottom: "1.35rem",
            }}
          >
            {/* Card 1: Client / Customer */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRole("customer")}
              onKeyDown={(e) => e.key === "Enter" && setSelectedRole("customer")}
              className="role-card-btn"
              style={{
                padding: "1.25rem 1.35rem",
                background: isCustomer
                  ? isDark
                    ? "linear-gradient(145deg, rgba(245, 185, 66, 0.14) 0%, rgba(20, 24, 34, 0.98) 100%)"
                    : "linear-gradient(145deg, rgba(245, 185, 66, 0.18) 0%, #FFFFFF 100%)"
                  : isDark
                  ? "#11141E"
                  : "#FFFFFF",
                border: `2px solid ${
                  isCustomer
                    ? "#F5B942"
                    : isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.08)"
                }`,
                boxShadow: isCustomer
                  ? "0 14px 34px -4px rgba(245, 185, 66, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                  : isDark
                  ? "0 4px 18px rgba(0, 0, 0, 0.25)"
                  : "0 4px 18px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1 }}>
                  {/* Icon Circle */}
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "16px",
                      background: isCustomer
                        ? "linear-gradient(135deg, rgba(245, 185, 66, 0.3) 0%, rgba(232, 145, 45, 0.18) 100%)"
                        : isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)",
                      border: isCustomer
                        ? "1.5px solid rgba(245, 185, 66, 0.6)"
                        : "1px solid transparent",
                      color: isCustomer ? "#F5B942" : isDark ? "#94a3b8" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <User size={25} />
                  </div>

                  {/* Text Details */}
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: "Outfit, sans-serif",
                          fontSize: "1.12rem",
                          fontWeight: 800,
                          color: isDark ? "#FFFFFF" : "#0F172A",
                        }}
                      >
                        Client / Customer
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          padding: "0.18rem 0.6rem",
                          borderRadius: "50px",
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      >
                        Book Sessions
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "0 0 0.65rem",
                        fontSize: "0.84rem",
                        color: isDark ? "#94a3b8" : "#64748b",
                        lineHeight: 1.45,
                      }}
                    >
                      Book verified barbers, lash techs, nail artists, braiders &amp; wig stylists.
                    </p>

                    {/* Feature micro-pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.2rem" }}>
                      <span
                        className="micro-pill"
                        style={{
                          background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
                          color: isDark ? "#cbd5e1" : "#475569",
                        }}
                      >
                        <ShieldCheck size={13} color="#10b981" />
                        Escrow Protected
                      </span>
                      <span
                        className="micro-pill"
                        style={{
                          background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
                          color: isDark ? "#cbd5e1" : "#475569",
                        }}
                      >
                        <QrCode size={13} color="#F5B942" />
                        Digital Pass Check-In
                      </span>
                    </div>
                  </div>
                </div>

                {/* Radio selection check circle */}
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    border: `2px solid ${isCustomer ? "#F5B942" : isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.2)"}`,
                    background: isCustomer ? "#F5B942" : "transparent",
                    boxShadow: isCustomer ? "0 0 0 3px rgba(245, 185, 66, 0.25)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "4px",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {isCustomer && <Check size={15} color="#08090C" strokeWidth={3.2} />}
                </div>
              </div>
            </div>

            {/* Card 2: Specialist / Expert */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedRole("staff")}
              onKeyDown={(e) => e.key === "Enter" && setSelectedRole("staff")}
              className="role-card-btn"
              style={{
                padding: "1.25rem 1.35rem",
                background: isSpecialist
                  ? isDark
                    ? "linear-gradient(145deg, rgba(245, 185, 66, 0.14) 0%, rgba(20, 24, 34, 0.98) 100%)"
                    : "linear-gradient(145deg, rgba(245, 185, 66, 0.18) 0%, #FFFFFF 100%)"
                  : isDark
                  ? "#11141E"
                  : "#FFFFFF",
                border: `2px solid ${
                  isSpecialist
                    ? "#F5B942"
                    : isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.08)"
                }`,
                boxShadow: isSpecialist
                  ? "0 14px 34px -4px rgba(245, 185, 66, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                  : isDark
                  ? "0 4px 18px rgba(0, 0, 0, 0.25)"
                  : "0 4px 18px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", flex: 1 }}>
                  {/* Icon Circle */}
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "16px",
                      background: isSpecialist
                        ? "linear-gradient(135deg, rgba(245, 185, 66, 0.3) 0%, rgba(232, 145, 45, 0.18) 100%)"
                        : isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(0, 0, 0, 0.04)",
                      border: isSpecialist
                        ? "1.5px solid rgba(245, 185, 66, 0.6)"
                        : "1px solid transparent",
                      color: isSpecialist ? "#F5B942" : isDark ? "#94a3b8" : "#64748b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Scissors size={25} />
                  </div>

                  {/* Text Details */}
                  <div style={{ textAlign: "left", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: "Outfit, sans-serif",
                          fontSize: "1.12rem",
                          fontWeight: 800,
                          color: isDark ? "#FFFFFF" : "#0F172A",
                        }}
                      >
                        Specialist / Expert
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          padding: "0.18rem 0.6rem",
                          borderRadius: "50px",
                          background: "rgba(245, 185, 66, 0.15)",
                          color: "#F5B942",
                          border: "1px solid rgba(245, 185, 66, 0.35)",
                        }}
                      >
                        Earn &amp; Grow
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "0 0 0.65rem",
                        fontSize: "0.84rem",
                        color: isDark ? "#94a3b8" : "#64748b",
                        lineHeight: 1.45,
                      }}
                    >
                      Showcase your portfolio, receive client bookings &amp; get paid directly to your wallet.
                    </p>

                    {/* Feature micro-pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.45rem", marginTop: "0.2rem" }}>
                      <span
                        className="micro-pill"
                        style={{
                          background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
                          color: isDark ? "#cbd5e1" : "#475569",
                        }}
                      >
                        <Layers size={13} color="#a855f7" />
                        Lookbook Showcase
                      </span>
                      <span
                        className="micro-pill"
                        style={{
                          background: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)",
                          border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
                          color: isDark ? "#cbd5e1" : "#475569",
                        }}
                      >
                        <Wallet size={13} color="#10b981" />
                        Direct Wallet Payout
                      </span>
                    </div>
                  </div>
                </div>

                {/* Radio selection check circle */}
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    border: `2px solid ${isSpecialist ? "#F5B942" : isDark ? "rgba(255, 255, 255, 0.25)" : "rgba(0, 0, 0, 0.2)"}`,
                    background: isSpecialist ? "#F5B942" : "transparent",
                    boxShadow: isSpecialist ? "0 0 0 3px rgba(245, 185, 66, 0.25)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "4px",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {isSpecialist && <Check size={15} color="#08090C" strokeWidth={3.2} />}
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
              minHeight: "54px",
              border: "none",
              borderRadius: "16px",
              color: "#08090C",
              fontFamily: "Outfit, sans-serif",
              fontSize: "1rem",
              fontWeight: 900,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.55rem",
              marginBottom: "0.95rem",
            }}
          >
            <span>{isCustomer ? "Continue as Client" : "Continue as Specialist"}</span>
            <ArrowRight size={19} strokeWidth={2.8} />
          </button>

          {/* Sign In Secondary Link */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              fontSize: "0.88rem",
              color: isDark ? "#94a3b8" : "#64748b",
              marginBottom: "1.75rem",
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
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "Outfit, sans-serif",
                padding: "0.2rem 0.35rem",
                fontSize: "0.88rem",
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
              gap: "1rem",
              marginBottom: "1.35rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 800,
                color: isDark ? "#64748b" : "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
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
            className="guest-cta-btn"
            style={{
              width: "100%",
              minHeight: "52px",
              background: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
              border: `1.5px solid ${isDark ? "rgba(255, 255, 255, 0.10)" : "rgba(0, 0, 0, 0.08)"}`,
              borderRadius: "16px",
              color: isDark ? "#FFFFFF" : "#0F172A",
              fontFamily: "Outfit, sans-serif",
              fontSize: "0.94rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 1.25rem",
              boxSizing: "border-box",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <Compass size={19} color="#F5B942" />
              <span>Explore Atelier Services as Guest</span>
            </div>
            <ChevronRight size={17} color={isDark ? "#94a3b8" : "#64748b"} />
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
                  fontFamily: "Plus Jakarta Sans, sans-serif",
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
