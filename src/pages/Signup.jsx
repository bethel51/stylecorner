import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Scissors, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

// Custom SVG Icons for the 6 services
const LashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="20" height="20">
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <rect x="7" y="3" width="10" height="15" rx="3" />
    <path d="M7 11 H17" />
    <rect x="9.5" y="4" width="5" height="4" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <path d="M6 21 H18" />
  </svg>
);

const BraiderIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="6" r="3" />
    <path d="M9 9 C9 13 8 17 9 21" />
    <path d="M15 9 C15 13 16 17 15 21" />
    <path d="M10 12 L14 15" />
    <path d="M14 12 L10 15" />
    <path d="M10 17 L14 20" />
  </svg>
);

const BarberIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M6 3 L10 12 L6 21" />
    <path d="M18 3 L14 12 L18 21" />
    <line x1="8.5" y1="12" x2="15.5" y2="12" />
    <rect x="5" y="19" width="14" height="2" rx="1" />
  </svg>
);

const MakeupIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M8 21 L16 21" />
    <path d="M9 13 L15 13" />
    <path d="M10 13 L10 7 C10 4.8 11 3 12 3 C13 3 14 4.8 14 7 L14 13" fill="currentColor" fillOpacity="0.3" />
    <rect x="8" y="13" width="8" height="8" rx="2" />
  </svg>
);

const WigIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M5 14 C4 8 8 4 12 4 C16 4 20 8 19 14" />
    <path d="M5 14 C4 18 6 21 8 21" />
    <path d="M19 14 C20 18 18 21 16 21" />
    <path d="M8 8 C10 6 14 6 16 8" />
  </svg>
);

const EXPERT_SERVICES = [
  { id: 'lash_tech', label: 'Lash Tech', icon: LashIcon, color: '#F5B942', desc: 'Classic, hybrid & volume silk lash extensions' },
  { id: 'nail_tech', label: 'Nail Tech', icon: NailIcon, color: '#e879f9', desc: 'Gel extensions, nail architecture & 3D art' },
  { id: 'hair_braider', label: 'Hair Braider & Stylist', icon: BraiderIcon, color: '#34d399', desc: 'Knotless box braids, goddess braids & twists' },
  { id: 'barber', label: 'Barber', icon: BarberIcon, color: '#60a5fa', desc: 'Precision fades, line-ups & beard sculpting' },
  { id: 'makeup_artist', label: 'Makeup Artist', icon: MakeupIcon, color: '#f87171', desc: 'Bridal glam, soft natural beat & sculpted brows' },
  { id: 'wig_installer', label: 'Wig Installer & Revamper', icon: WigIcon, color: '#a78bfa', desc: 'Lace melting, custom frontal install & revamp' },
];

const MAX_SERVICES = 2;

export const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'customer';
  const { register, showToast } = useAuth();

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleService = (label) => {
    setSelectedServices((prev) => {
      if (prev.includes(label)) {
        return prev.filter((s) => s !== label);
      }
      if (prev.length >= MAX_SERVICES) {
        showToast(`Strictly maximum 2 services allowed. Deselect one to choose another.`, 'error');
        return prev;
      }
      return [...prev, label];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstname || !form.email || !form.password) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (role === 'staff') {
      if (selectedServices.length === 0) {
        showToast('Please select up to 2 services you offer.', 'error');
        return;
      }
      if (selectedServices.length > MAX_SERVICES) {
        showToast(`Strictly select not more than ${MAX_SERVICES} services.`, 'error');
        return;
      }
    }

    setSubmitting(true);
    try {
      await register({
        ...form,
        role: role === 'staff' ? 'staff' : 'customer',
        services: role === 'staff' ? selectedServices : [],
      });
      showToast('Registration successful! Check your email for OTP code.', 'success');
      navigate(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title={`Register as ${role === 'staff' ? 'Expert' : 'Client'}`}>
      <div style={{ maxWidth: '460px', margin: '0.5rem auto 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#151822',
              color: '#F5B942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1.5px solid rgba(245,185,66,0.3)',
            }}
          >
            {role === 'staff' ? <Scissors size={26} /> : <Sparkles size={26} />}
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
            Create Your Account
          </h2>
          <p style={{ color: '#9AA2B3', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            {role === 'staff'
              ? 'Join our artisan squad of elite grooming experts'
              : 'Unlock seamless mobile booking and grooming rewards'}
          </p>
        </div>

        <div style={{ background: '#151822', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>First Name *</label>
                <input
                  type="text"
                  name="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  placeholder="Alex"
                  required
                  style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  placeholder="Morgan"
                  style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                required
                style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+234 800 000 0000"
                style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Password *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Service Selection for Experts */}
            {role === 'staff' && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1.15rem',
                  borderRadius: '18px',
                  background: 'rgba(245,185,66,0.05)',
                  border: '1px solid rgba(245,185,66,0.25)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ margin: 0, color: '#FFFFFF', fontWeight: 800, fontSize: '0.86rem', fontFamily: 'Outfit' }}>
                    Select Your Services *
                  </label>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 900,
                      color: selectedServices.length === MAX_SERVICES ? '#10b981' : '#F5B942',
                      fontFamily: 'Outfit',
                      background: selectedServices.length === MAX_SERVICES ? 'rgba(16,185,129,0.15)' : 'rgba(245,185,66,0.15)',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '50px',
                      border: selectedServices.length === MAX_SERVICES ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(245,185,66,0.35)',
                    }}
                  >
                    {selectedServices.length}/{MAX_SERVICES} Selected {selectedServices.length === MAX_SERVICES && '✓'}
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: '#9AA2B3', margin: '0 0 0.85rem', lineHeight: 1.4 }}>
                  Choose up to <strong style={{ color: '#F5B942' }}>2 specialties</strong> from our official list:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.55rem' }}>
                  {EXPERT_SERVICES.map((service) => {
                    const isSelected = selectedServices.includes(service.label);
                    const isDisabled = !isSelected && selectedServices.length >= MAX_SERVICES;
                    const IconComp = service.icon;

                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleService(service.label)}
                        disabled={isDisabled}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          padding: '0.75rem 0.9rem',
                          borderRadius: '14px',
                          border: isSelected ? `1.5px solid ${service.color}` : '1px solid rgba(255,255,255,0.08)',
                          backgroundColor: isSelected ? 'rgba(245,185,66,0.1)' : isDisabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.18s ease',
                          opacity: isDisabled ? 0.4 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              background: isSelected ? service.color + '25' : 'rgba(255,255,255,0.05)',
                              color: isSelected ? service.color : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <IconComp />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <span
                              style={{
                                display: 'block',
                                fontSize: '0.84rem',
                                fontWeight: isSelected ? 800 : 600,
                                color: isSelected ? service.color : '#FFFFFF',
                                fontFamily: 'Outfit',
                              }}
                            >
                              {service.label}
                            </span>
                            <span style={{ display: 'block', fontSize: '0.7rem', color: '#9AA2B3' }}>
                              {service.desc}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            border: isSelected ? `2px solid ${service.color}` : '1.5px solid rgba(255,255,255,0.2)',
                            background: isSelected ? service.color : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isSelected && <Check size={13} color="#0c0e14" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="app-btn app-btn-accent"
              style={{
                width: '100%',
                marginTop: '1.25rem',
                minHeight: '48px',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 800,
              }}
            >
              {submitting ? 'Creating Account...' : 'Continue'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#9AA2B3', fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#F5B942', fontWeight: 700, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Signup;
