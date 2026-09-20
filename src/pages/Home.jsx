import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { PageContainer } from "../components/common/PageContainer";
import { preloadRoute } from "../App";

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    preloadRoute("/signup");
    preloadRoute("/login");
    preloadRoute("/services");
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(role === "staff" ? "/expert-dashboard" : "/customer-dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate(role === "staff" ? "/expert-dashboard" : "/customer-dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <PageContainer hideHeader={true} hideNav={true} noPadding={true}>
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#07080B",
          position: "relative",
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
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.8)",
            position: "relative",
          }}
        >
          {/* HERO IMAGE
              clamp(260px, 56vh, 520px)
              260px floor: iPhone SE 1st gen (568px tall) hero = 260px, 308px left for CTA
              56vh middle: iPhone 14 (844px) hero ~ 472px
              520px ceiling: large phones / phablets
          */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "clamp(260px, 56vh, 520px)",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            <img
              src="/images/stylecorner-salon-top.jpg"
              alt="Style Corner Luxury Atelier"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "90px",
                background:
                  "linear-gradient(180deg, rgba(13,14,18,0) 0%, rgba(13,14,18,0.88) 65%, #0D0E12 100%)",
                pointerEvents: "none",
              }}
            />

            {/* Theme toggle: 44x44 tap target, always inside safe-area */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              style={{
                position: "absolute",
                right: "1.25rem",
                top: "calc(env(safe-area-inset-top, 0px) + 1rem)",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(13,14,18,0.55)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {isDark
                ? <Sun size={18} color="#F5B942" strokeWidth={2} />
                : <Moon size={18} color="#F5B942" strokeWidth={2} />}
            </button>
          </div>

          {/* CTA SECTION */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "1.5rem clamp(1.25rem, 5vw, 1.75rem) calc(env(safe-area-inset-bottom, 0px) + 2rem)",
              textAlign: "center",
              background: "#0D0E12",
            }}
          >
            <div style={{ width: "100%", maxWidth: "360px", margin: "0 auto" }}>
              <h1
                style={{
                  fontFamily: "Outfit, -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: "clamp(1.8rem, 6.5vw, 2.35rem)",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  margin: "0 0 0.75rem",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.15,
                }}
              >
                Start your <span style={{ color: "#F5B942" }}>journey</span>
              </h1>

              <p
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "clamp(0.875rem, 3.2vw, 0.98rem)",
                  color: "#9CA3AF",
                  margin: 0,
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}
              >
                {isAuthenticated
                  ? `Welcome back, ${user?.firstname || "Stylist"}! Access your bookings, digital wallet, and appointments.`
                  : "Discover premier barbers, hair stylists & grooming specialists. Book luxury appointments in seconds."}
              </p>
            </div>

            <div
              style={{
                marginTop: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              {/* Get Started */}
              <button
                type="button"
                onClick={handleGetStarted}
                onMouseEnter={() => preloadRoute("/signup")}
                onTouchStart={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
                onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
                style={{
                  width: "100%",
                  minHeight: "54px",
                  background: "#F5B942",
                  color: "#0D0E12",
                  borderRadius: "50px",
                  border: "none",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  boxShadow: "0 10px 25px -5px rgba(245,185,66,0.4)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                <span>{isAuthenticated ? "Go to Dashboard" : "Get Started"}</span>
                <ArrowRight size={20} strokeWidth={2.8} />
              </button>

              {/* Log In row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "0.15rem",
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "clamp(0.85rem, 3vw, 0.92rem)",
                  color: "#8E8E93",
                  fontWeight: 500,
                  minHeight: "44px",
                }}
              >
                {isAuthenticated ? (
                  <span>
                    Logged in as <strong style={{ color: "#F5B942" }}>{user?.email}</strong>
                  </span>
                ) : (
                  <>
                    <span>Already have an account?</span>
                    <button
                      type="button"
                      onClick={handleLogin}
                      onMouseEnter={() => preloadRoute("/login")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#F5B942",
                        fontWeight: 800,
                        cursor: "pointer",
                        minHeight: "44px",
                        padding: "0 0.5rem",
                        fontSize: "clamp(0.85rem, 3vw, 0.92rem)",
                        fontFamily: "Outfit, sans-serif",
                        display: "inline-flex",
                        alignItems: "center",
                        touchAction: "manipulation",
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      Log In
                    </button>
                  </>
                )}
              </div>

              {/* Guest explore link */}
              <button
                type="button"
                onClick={() => navigate("/services")}
                onMouseEnter={() => preloadRoute("/services")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  fontSize: "clamp(0.78rem, 2.8vw, 0.82rem)",
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 600,
                  cursor: "pointer",
                  minHeight: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 0.5rem",
                  letterSpacing: "0.02em",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                Or explore services as guest →
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
