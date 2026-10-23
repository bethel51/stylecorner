import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Scissors,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Sun,
  Moon,
  Compass,
  ChevronRight,
  Layers,
  Store,
} from "lucide-react";
import { SEOHead } from "../components/common/SEOHead";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { PageContainer } from "../components/common/PageContainer";
import { preloadRoute } from "../App";

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Phase: 'loading' (splash icon animation) -> 'onboarding' (instruction & role selection)
  const [phase, setPhase] = useState("loading");
  const [selectedRole, setSelectedRole] = useState("customer"); // 'customer' or 'staff'
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Preload critical next routes in background
    preloadRoute("/signup");
    preloadRoute("/login");
    preloadRoute("/services");
    preloadRoute("/experts");
    preloadRoute("/ai-matcher");

    // Smooth loading progress simulation
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 280);

    // Auto-advance to onboarding after splash sequence completes
    const timer = setTimeout(() => {
      setPhase("onboarding");
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleSkipIntro = () => {
    setPhase("onboarding");
  };

  const handleProceedRegistration = () => {
    navigate(`/signup?role=${selectedRole}`);
  };

  const handleExploreGuest = () => {
    navigate("/services");
  };

  return (
    <PageContainer hideHeader={true} hideNav={true} noPadding={true}>
      <SEOHead
        title="Book Barbers, Hairstylists, Nail Techs & Lash Artists"
        description="Book top-rated beauty professionals on Style Corner. Connect with verified barbers, hairstylists, wig installers, nail technicians, and lash artists for bespoke salon and grooming appointments."
        canonicalPath="/"
        keywords="beauty professionals, nail technicians, lash artists, hairstylists, barbers, wig installers, salon booking, haircut appointment, braiders"
      />

      {/* ── Embedded Premium Styling & Keyframe Animations ── */}
      <style>{`
        @keyframes iconIntroPulse {
          0% {
            transform: scale(0.92);
            box-shadow: 0 0 0 0 rgba(245, 185, 66, 0.45);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 0 35px 10px rgba(245, 185, 66, 0.35);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 25px 4px rgba(245, 185, 66, 0.25);
          }
        }

        @keyframes ambientFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }

        @keyframes cardFadeInUp {
          from {
            opacity: 0;
            transform: translateY(22px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmerLine {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .role-card-interactive {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.22s ease,
                      box-shadow 0.22s ease,
                      background 0.22s ease;
        }
        .role-card-interactive:hover {
          transform: translateY(-3px);
        }
        .role-card-interactive:active {
          transform: scale(0.985);
        }

        .gold-glow-btn {
          background: linear-gradient(135deg, #F5B942 0%, #E8912D 100%);
          box-shadow: 0 8px 24px -4px rgba(245, 185, 66, 0.45);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .gold-glow-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -4px rgba(245, 185, 66, 0.6);
        }
        .gold-glow-btn:active {
          transform: scale(0.98);
        }

        .guest-link-hover {
          transition: all 0.18s ease;
        }
        .guest-link-hover:hover {
          background: rgba(245, 185, 66, 0.1) !important;
          border-color: rgba(245, 185, 66, 0.4) !important;
          color: #F5B942 !important;
        }
      `}</style>

      {/* ── Main Background Container ── */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          background: isDark
            ? "radial-gradient(circle at 50% 15%, #151922 0%, #08090C 85%)"
            : "radial-gradient(circle at 50% 15%, #fdfbf7 0%, #f4efe6 85%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(1rem, 4vw, 2.5rem) 1.25rem",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Ambient Glow Circles */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "clamp(300px, 60vw, 650px)",
            height: "clamp(300px, 60vw, 650px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 185, 66, 0.16) 0%, transparent 70%)",
            filter: "blur(75px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-10%",
            width: "clamp(240px, 45vw, 500px)",
            height: "clamp(240px, 45vw, 500px)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        {/* Top Minimal Bar (Theme & Auth status) */}
        <div
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 0px) + 1.2rem)",
            right: "1.25rem",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            style={{
              background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
              borderRadius: "50%",
              width: "38px",
              height: "38px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#F5B942",
              backdropFilter: "blur(10px)",
              transition: "transform 0.15s ease",
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            PHASE 1: ICON LOADING SCREEN (Smooth Motion)
           ══════════════════════════════════════════════════════════════════════ */}
        {phase === "loading" && (
          <div
            onClick={handleSkipIntro}
            style={{
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              maxWidth: "420px",
              cursor: "pointer",
              animation: "cardFadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Pulsing Style Corner Square Icon */}
            <div
              style={{
                position: "relative",
                width: "100px",
                height: "100px",
                marginBottom: "1.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "-8px",
                  borderRadius: "28px",
                  border: "2px solid rgba(245, 185, 66, 0.35)",
                  animation: "ambientFloat 4s ease-in-out infinite",
                }}
              />
              <img
                src="/pwa-icon-192.png"
                alt="Style Corner Logo"
                style={{
                  width: "92px",
                  height: "92px",
                  borderRadius: "24px",
                  objectFit: "cover",
                  boxShadow: "0 12px 36px rgba(245, 185, 66, 0.4)",
                  animation: "iconIntroPulse 2s ease-in-out infinite",
                }}
              />
            </div>

            {/* Brand Title & Subtitle */}
            <h1
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "clamp(1.6rem, 5vw, 2.1rem)",
                fontWeight: 900,
                color: isDark ? "#FFFFFF" : "#111827",
                margin: "0 0 0.4rem",
                letterSpacing: "-0.02em",
              }}
            >
              Style Corner
            </h1>

            <p
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: "0.86rem",
                color: "#94a3b8",
                margin: "0 0 1.75rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Atelier Grooming &amp; Styling
            </p>

            {/* Sleek Progress Indicator */}
            <div
              style={{
                width: "180px",
                height: "4px",
                background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                borderRadius: "50px",
                overflow: "hidden",
                position: "relative",
                marginBottom: "1.25rem",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${loadingProgress}%`,
                  background: "linear-gradient(90deg, #F5B942, #E8912D)",
                  borderRadius: "50px",
                  transition: "width 0.28s ease",
                }}
              />
            </div>

            <span
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                fontFamily: "Outfit, sans-serif",
              }}
            >
              Tap anywhere to continue
            </span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            PHASE 2: ROLE SELECTION & REGISTRATION INSTRUCTIONS (Clean, Neat UX)
           ══════════════════════════════════════════════════════════════════════ */}
        {phase === "onboarding" && (
          <div
            style={{
              zIndex: 2,
              width: "100%",
              maxWidth: "480px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "cardFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Top Brand Logo Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: "1.75rem",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(245, 185, 66, 0.35)",
                  marginBottom: "1rem",
                  border: "1.5px solid rgba(245, 185, 66, 0.5)",
                }}
              >
                <img
                  src="/pwa-icon-192.png"
                  alt="Style Corner"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Eyebrow Instruction */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(245, 185, 66, 0.12)",
                  border: "1px solid rgba(245, 185, 66, 0.3)",
                  borderRadius: "50px",
                  padding: "0.3rem 0.85rem",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#F5B942",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: "0.6rem",
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                <Sparkles size={12} />
                Get Started
              </div>

              <h2
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "clamp(1.5rem, 5vw, 1.85rem)",
                  fontWeight: 900,
                  color: isDark ? "#FFFFFF" : "#111827",
                  margin: "0 0 0.45rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Select Your Role
              </h2>

              <p
                style={{
                  fontFamily: "Plus Jakarta Sans, sans-serif",
                  fontSize: "0.88rem",
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.5,
                  maxWidth: "380px",
                }}
              >
                Choose how you will experience Style Corner to set up your account.
              </p>
            </div>

            {/* Authenticated Fast Route Banner (If already logged in) */}
            {isAuthenticated && (
              <div
                onClick={() =>
                  navigate(role === "staff" ? "/expert-dashboard" : "/customer-dashboard")
                }
                style={{
                  width: "100%",
                  background: "rgba(245, 185, 66, 0.12)",
                  border: "1px solid rgba(245, 185, 66, 0.4)",
                  borderRadius: "16px",
                  padding: "0.85rem 1.1rem",
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 800, color: isDark ? "#FFF" : "#111" }}>
                      Signed in as {user?.firstname || "Member"}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      Tap to open your {role === "staff" ? "Expert" : "Customer"} Dashboard
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} color="#F5B942" />
              </div>
            )}

            {/* ── Role Selection Cards (Clean, Spaced, Unclustered) ── */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
                width: "100%",
                marginBottom: "1.5rem",
              }}
            >
              {/* Option 1: Client / Customer */}
              <div
                onClick={() => setSelectedRole("customer")}
                className="role-card-interactive"
                style={{
                  cursor: "pointer",
                  padding: "1.2rem 1.25rem",
                  borderRadius: "18px",
                  background:
                    selectedRole === "customer"
                      ? isDark
                        ? "linear-gradient(145deg, rgba(245, 185, 66, 0.12), rgba(21, 24, 34, 0.95))"
                        : "linear-gradient(145deg, rgba(245, 185, 66, 0.18), #ffffff)"
                      : isDark
                      ? "#151822"
                      : "#ffffff",
                  border: `2px solid ${
                    selectedRole === "customer"
                      ? "#F5B942"
                      : isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.08)"
                  }`,
                  boxShadow:
                    selectedRole === "customer"
                      ? "0 10px 25px -4px rgba(245, 185, 66, 0.25)"
                      : "0 4px 14px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background:
                        selectedRole === "customer"
                          ? "rgba(245, 185, 66, 0.22)"
                          : isDark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0, 0, 0, 0.04)",
                      color: selectedRole === "customer" ? "#F5B942" : "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <User size={24} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Outfit, sans-serif",
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          color: isDark ? "#FFFFFF" : "#111827",
                        }}
                      >
                        Client / Customer
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "50px",
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#10b981",
                        }}
                      >
                        Book Sessions
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: "#94a3b8",
                        lineHeight: 1.4,
                      }}
                    >
                      Book verified barbers, lash techs, nail artists, braiders &amp; wig stylists.
                    </p>
                  </div>
                </div>

                {/* Radio selection circle */}
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: `2px solid ${selectedRole === "customer" ? "#F5B942" : "#4b5563"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: selectedRole === "customer" ? "#F5B942" : "transparent",
                  }}
                >
                  {selectedRole === "customer" && (
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0c0e14" }} />
                  )}
                </div>
              </div>

              {/* Option 2: Specialist / Expert */}
              <div
                onClick={() => setSelectedRole("staff")}
                className="role-card-interactive"
                style={{
                  cursor: "pointer",
                  padding: "1.2rem 1.25rem",
                  borderRadius: "18px",
                  background:
                    selectedRole === "staff"
                      ? isDark
                        ? "linear-gradient(145deg, rgba(245, 185, 66, 0.12), rgba(21, 24, 34, 0.95))"
                        : "linear-gradient(145deg, rgba(245, 185, 66, 0.18), #ffffff)"
                      : isDark
                      ? "#151822"
                      : "#ffffff",
                  border: `2px solid ${
                    selectedRole === "staff"
                      ? "#F5B942"
                      : isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "rgba(0, 0, 0, 0.08)"
                  }`,
                  boxShadow:
                    selectedRole === "staff"
                      ? "0 10px 25px -4px rgba(245, 185, 66, 0.25)"
                      : "0 4px 14px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      background:
                        selectedRole === "staff"
                          ? "rgba(245, 185, 66, 0.22)"
                          : isDark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(0, 0, 0, 0.04)",
                      color: selectedRole === "staff" ? "#F5B942" : "#94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Scissors size={24} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        marginBottom: "0.2rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Outfit, sans-serif",
                          fontSize: "1.05rem",
                          fontWeight: 800,
                          color: isDark ? "#FFFFFF" : "#111827",
                        }}
                      >
                        Specialist / Expert
                      </span>
                      <span
                        style={{
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "50px",
                          background: "rgba(245, 185, 66, 0.15)",
                          color: "#F5B942",
                        }}
                      >
                        Earn &amp; Grow
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.8rem",
                        color: "#94a3b8",
                        lineHeight: 1.4,
                      }}
                    >
                      Showcase your portfolio, receive client bookings &amp; get paid to your wallet.
                    </p>
                  </div>
                </div>

                {/* Radio selection circle */}
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: `2px solid ${selectedRole === "staff" ? "#F5B942" : "#4b5563"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    background: selectedRole === "staff" ? "#F5B942" : "transparent",
                  }}
                >
                  {selectedRole === "staff" && (
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0c0e14" }} />
                  )}
                </div>
              </div>
            </div>

            {/* ── Primary Registration CTA Button ── */}
            <button
              type="button"
              onClick={handleProceedRegistration}
              className="gold-glow-btn"
              style={{
                width: "100%",
                minHeight: "52px",
                border: "none",
                borderRadius: "14px",
                color: "#08090C",
                fontFamily: "Outfit, sans-serif",
                fontSize: "0.98rem",
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.55rem",
                marginBottom: "0.9rem",
              }}
            >
              <span>Continue to Registration</span>
              <ArrowRight size={18} strokeWidth={2.6} />
            </button>

            {/* Sign in fallback link */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.35rem",
                fontSize: "0.84rem",
                color: "#94a3b8",
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
                }}
              >
                Sign In
              </button>
            </div>

            {/* ── Elegant Divider ── */}
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }} />
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#64748b",
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
              className="guest-link-hover"
              style={{
                width: "100%",
                minHeight: "50px",
                background: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)",
                border: `1.5px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}`,
                borderRadius: "14px",
                color: isDark ? "#FFFFFF" : "#111827",
                fontFamily: "Outfit, sans-serif",
                fontSize: "0.92rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                boxSizing: "border-box",
                marginBottom: "1.5rem",
              }}
            >
              <Compass size={17} color="#F5B942" />
              <span>Explore Services as a Guest</span>
              <ChevronRight size={16} color="#94a3b8" />
            </button>

            {/* Quick Guest Navigation Strip (Clean & uncluttered) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "0.5rem 1.1rem",
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
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "Plus Jakarta Sans, sans-serif",
                    transition: "color 0.15s ease",
                    padding: "0.2rem",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F5B942")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
