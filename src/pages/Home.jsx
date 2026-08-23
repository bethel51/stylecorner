import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Scissors,
  Sparkles,
  Calendar,
  ShoppingBag,
  Star,
  ChevronRight,
  Award,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { AISpecialistMatcherSheet } from '../components/booking/AISpecialistMatcherSheet';

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showAiSheet, setShowAiSheet] = useState(false);

  const signatureServices = [
    {
      title: 'Premium Cuts',
      subtitle: 'Barbering & Sculpting',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      path: '/services',
      serviceName: 'Hair Cut Services',
    },
    {
      title: 'Expert Braiding',
      subtitle: 'Box Braids & Knotless',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
      path: '/services',
      serviceName: 'Hair Braiding Services',
    },
    {
      title: 'Lash & Nails',
      subtitle: 'Gel Sets & Lash Artistry',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=70&fm=webp',
      path: '/services',
      serviceName: 'Lash & Nails Combo',
    },
  ];

  const [specialists, setSpecialists] = useState([]);

  React.useEffect(() => {
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const verifiedStaff = data.filter((s) => s.role === 'staff' || s.isVerified === true);
          const mapped = verifiedStaff.map((s) => ({
            name: `${s.firstname || ''} ${s.lastname || ''}`.trim() || 'Verified Specialist',
            role: s.title || s.roleTitle || 'Certified Specialist',
            rating: s.rating || 5.0,
            specialty: Array.isArray(s.services) ? s.services[0] : (s.services || 'Professional Hair & Grooming'),
            image: s.avatarUrl || s.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          }));
          setSpecialists(mapped.slice(0, 3));
        } else {
          setSpecialists([]);
        }
      })
      .catch((err) => console.warn('Home specialists fetch:', err.message));
  }, []);

  return (
    <PageContainer onOpenAiMatcher={() => setShowAiSheet(true)}>

      {/* ── Editorial Luxury Hero Section ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundImage: `url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80&fm=webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '2.75rem 1.5rem 2.25rem',
          color: '#ffffff',
          boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
          marginBottom: '1.25rem',
        }}
      >
        {/* Dark Editorial Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 100%)',
            zIndex: 1,
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(212, 175, 55, 0.2)',
              color: '#d4af37',
              fontFamily: 'Outfit',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '0.35rem 0.85rem',
              borderRadius: '50px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '1.25rem',
              border: '1px solid rgba(212,175,55,0.4)',
            }}
          >
            <Sparkles size={13} /> Style Corner
          </span>

          <h1
            style={{
              fontFamily: 'Outfit',
              fontSize: '2.35rem',
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              marginBottom: '1rem',
            }}
          >
            Look Good,<br />
            <span style={{ color: '#d4af37', fontStyle: 'italic', fontWeight: 700 }}>Feel Great.</span>
          </h1>

          <p
            style={{
              color: '#e5e7eb',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: '1.75rem',
              maxWidth: '340px',
              fontWeight: 400,
            }}
          >
            Hair cuts, braids, nails, and grooming — all in one place. Book fast, get styled.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <button
              onClick={() => {
  if (isAuthenticated) {
    navigate('/booking');
  } else {
    navigate(`/login?redirect=${encodeURIComponent('/booking')}`);
  }
}}
              className="app-btn app-btn-accent"
              style={{
                padding: '0.9rem 1.5rem',
                fontSize: '0.88rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontFamily: 'Outfit',
                fontWeight: 800,
              }}
            >
              <Calendar size={18} />
              <span>Book a Session</span>
            </button>

            <button
              onClick={() => setShowAiSheet(true)}
              className="app-btn"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Sparkles size={18} color="#d4af37" />
              <span>AI Stylist Finder</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Glassmorphism Statistics Bar ── */}
      <div
        className="app-card"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: '20px',
          padding: '1.25rem 1rem',
          boxShadow: '0 12px 30px rgba(0,0,0,0.05)',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: '#6b7280', fontFamily: 'Outfit', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.2rem' }}>
              Happy Clients
            </span>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#171717' }}>
              1.2k+
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(0,0,0,0.08)', borderRight: '1px solid rgba(0,0,0,0.08)' }}>
            <span style={{ fontSize: '0.68rem', color: '#6b7280', fontFamily: 'Outfit', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.2rem' }}>
              Service Rating
            </span>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#d4af37' }}>
              A+ Quality
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.68rem', color: '#6b7280', fontFamily: 'Outfit', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.2rem' }}>
              Master Stylists
            </span>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#171717' }}>
              20+
            </div>
          </div>
        </div>
      </div>

      {/* ── Signature Specialities Cards (Original Editorial Cards) ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <span style={{ color: '#d4af37', fontSize: '0.75rem', fontFamily: 'Outfit', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.25rem' }}>
            OUR SPECIALITIES
          </span>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 900, color: '#171717' }}>
            Our Services
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {signatureServices.map((item, idx) => (
            <div
              key={idx}
              className="app-card"
              onClick={() => navigate(`/booking?service=${encodeURIComponent(item.serviceName)}`)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                height: '140px',
                borderRadius: '18px',
                overflow: 'hidden',
                padding: 0,
                marginBottom: 0,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              {/* Background Image */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                }}
              />

              {/* Card Content */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  zIndex: 2,
                }}
              >
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.15rem' }}>
                    {item.title}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>{item.subtitle}</span>
                </div>

                <span
                  style={{
                    color: '#d4af37',
                    fontSize: '0.75rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  Discover <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Specialist Matcher Promo Banner ── */}
      <div
        className="app-card"
        onClick={() => setShowAiSheet(true)}
        style={{
          cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(18,18,18,0.04))',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1.15rem',
        }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#171717', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717' }}>
            Not sure which stylist to pick?
          </h4>
          <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.15rem' }}>
            Tell us your style and our AI will match you with the right expert — instantly.
          </p>
        </div>
        <ChevronRight size={18} color="#d4af37" />
      </div>

      {/* ── Curated Grooming Essentials Collection CTA ── */}
      <div
        className="app-card"
        onClick={() => navigate('/store')}
        style={{
          cursor: 'pointer',
          background: '#F4F1E9',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: '20px',
          padding: '1.5rem 1.25rem',
          marginBottom: '1.5rem',
        }}
      >
        <span style={{ color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
          Grooming Products
        </span>
        <h3 style={{ fontSize: '1.35rem', fontFamily: 'Outfit', fontWeight: 900, color: '#171717', marginBottom: '0.5rem', lineHeight: 1.2 }}>
          Products for Home Use
        </h3>
        <p style={{ color: '#4A4A4A', fontSize: '0.85rem', lineHeight: 1.55, marginBottom: '1.15rem' }}>
          Shop the same products our stylists use. Hair oils, beard kits, wax, and more — delivered to your door.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            className="app-btn"
            style={{
              background: '#1A1A1A',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              fontSize: '0.82rem',
              width: 'auto',
            }}
          >
            <ShoppingBag size={15} /> Explore Store
          </button>
          <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 800, color: '#d4af37' }}>
            From $15 →
          </span>
        </div>
      </div>

      {/* ── Master Stylists Showcase ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#171717' }}>
            Our Stylists
          </h3>
          <button
            onClick={() => navigate('/experts')}
            style={{ background: 'none', border: 'none', color: '#d4af37', fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            View Team <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {specialists.length > 0 ? (
            specialists.map((sp, i) => (
              <div
                key={i}
                className="app-card"
                onClick={() => navigate(`/booking?stylist=${encodeURIComponent(sp.name.split(' ')[0])}`)}
                style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <img
                    src={sp.image}
                    alt={sp.name}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid rgba(212,175,55,0.4)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <div>
                    <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 700, color: '#171717' }}>{sp.name}</h4>
                    <p style={{ color: '#d4af37', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'Outfit' }}>{sp.specialty}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d4af37', fontWeight: 800, fontSize: '0.85rem' }}>
                    <Star size={13} fill="#d4af37" /><span>{sp.rating}</span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Book Now</span>
                </div>
              </div>
            ))
          ) : (
            <div className="app-card" style={{ textAlign: 'center', padding: '1.25rem', marginBottom: 0 }}>
              <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
                All experts are verified dynamically upon registration.
              </p>
              <button
                onClick={() => navigate('/experts')}
                className="app-btn app-btn-outline"
                style={{ minHeight: '38px', fontSize: '0.78rem', width: 'auto', margin: '0 auto' }}
              >
                Explore Experts Page
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Ready for a Change CTA Footer Card ── */}
      <div
        className="app-card"
        style={{
          background: '#1A1A1A',
          color: '#ffffff',
          textAlign: 'center',
          padding: '1.75rem 1.25rem',
          borderRadius: '20px',
          border: '1.5px solid rgba(212,175,55,0.4)',
        }}
      >
        <h3 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
          Ready to book?
        </h3>
        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Pick a stylist, choose a service, and get it done.
        </p>
        <button
          onClick={() => navigate('/booking')}
          className="app-btn app-btn-accent"
          style={{ maxWidth: '240px', margin: '0 auto' }}
        >
          <Calendar size={16} /> Book Now
        </button>
      </div>

      <AISpecialistMatcherSheet
        isOpen={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onApplyMatch={(match) => {
          setShowAiSheet(false);
          navigate(`/booking?stylist=${encodeURIComponent(match.firstname)}`);
        }}
      />
    </PageContainer>
  );
};
