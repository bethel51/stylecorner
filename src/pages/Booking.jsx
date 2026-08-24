import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  Sparkles,
  User,
  CheckCircle2,
  MapPin,
  Check,
  Star,
  ShieldCheck,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { AISpecialistMatcherSheet } from '../components/booking/AISpecialistMatcherSheet';
import { OptimizedImage } from '../components/common/OptimizedImage';

const NIGERIAN_STATES = [
  'Lagos State',
  'FCT – Abuja',
  'Rivers State (Port Harcourt)',
  'Oyo State (Ibadan)',
  'Ogun State',
  'Anambra State',
  'Delta State',
  'Enugu State',
  'Edo State',
  'Kano State',
  'Kaduna State',
  'Akwa Ibom State',
  'Cross River State',
  'Abia State',
  'Osun State',
  'Ondo State',
];

const SERVICES = [
  { id: 's1', title: 'Wig Installer', price: 25000, duration: '90 mins', category: 'Hair', icon: '✂️', desc: 'Flawless frontal & closure installation, lace melting & knots bleaching.' },
  { id: 's2', title: 'Wig Revamper', price: 15000, duration: '60 mins', category: 'Hair', icon: '✨', desc: 'Deep wig washing, lace restoration & custom hot-comb restyling.' },
  { id: 's3', title: 'Hair Stylist (Braider)', price: 35000, duration: '120 mins', category: 'Hair', icon: '🪮', desc: 'Knotless box braids, goddess braids & loc maintenance.' },
  { id: 's4', title: 'Lash Tech', price: 20000, duration: '60 mins', category: 'Lashes', icon: '👁️', desc: 'Classic, hybrid & volume silk lash extensions.' },
  { id: 's5', title: 'Nail Tech', price: 18000, duration: '60 mins', category: 'Nails', icon: '💅', desc: 'Acrylic extensions, gel art architecture & nail prep.' },
  { id: 's6', title: 'Makeup Artist', price: 30000, duration: '60 mins', category: 'Makeup', icon: '💄', desc: 'Full glam executive, event & bridal skin prep.' },
  { id: 's7', title: 'Manicure', price: 12000, duration: '40 mins', category: 'Nails', icon: '🧼', desc: 'Nail shaping, cuticle trimming & gel polish finish.' },
  { id: 's8', title: 'Pedicure', price: 15000, duration: '50 mins', category: 'Nails', icon: '🦶', desc: 'Spa foot soak, callus removal & massage polish.' },
];

export const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || '';
  const initialStylist = searchParams.get('stylist') || 'Any Specialist';

  const { user, isAuthenticated, showToast, role } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role === 'staff') {
      showToast('Experts cannot book services. Redirected to Expert Dashboard.', 'error');
      navigate('/expert-dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const [activeStep, setActiveStep] = useState(1);
  const [service1, setService1] = useState(initialService || SERVICES[0].title);
  const [service2, setService2] = useState('');
  const [stylist, setStylist] = useState(initialStylist);
  const [location, setLocation] = useState('Lagos State');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [submitting, setSubmitting] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);

  const [specialistsList, setSpecialistsList] = useState([
    { name: 'Any Specialist', role: 'First Available Expert', rating: 5.0, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  ]);

  useEffect(() => {
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((s) => ({
            name: `${s.firstname || ''} ${s.lastname || ''}`.trim() || 'Verified Specialist',
            role: s.title || s.roleTitle || 'Certified Specialist',
            rating: s.rating || 5.0,
            image: s.avatarUrl || s.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          }));
          setSpecialistsList([{ name: 'Any Specialist', role: 'First Available Expert', rating: 5.0, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }, ...mapped]);
        }
      })
      .catch((err) => console.warn('Could not load dynamic specialists list:', err.message));
  }, []);

  const getPrice = (title) => {
    const match = SERVICES.find((s) => s.title === title);
    return match ? match.price : 0;
  };

  const totalPrice = getPrice(service1) + getPrice(service2);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please sign in before booking a session.', 'error');
      navigate('/login?redirect=booking');
      return;
    }

    if (role === 'staff') {
      showToast('Experts cannot book services.', 'error');
      navigate('/expert-dashboard');
      return;
    }

    if (!service1 && !service2) {
      showToast('Please select at least one service.', 'error');
      return;
    }

    const servicesJoined = [service1, service2].filter(s => s && s !== 'None').join(' + ');

    const bookingPayload = {
      clientName: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Client',
      clientEmail: user.email,
      clientPhone: user.phone || 'N/A',
      stylist: stylist,
      service: servicesJoined,
      location: location,
      price: totalPrice,
      date: date,
      time: time,
      status: 'pending',
    };

    setSubmitting(true);
    try {
      await api.createBooking(bookingPayload);
      showToast('Booking submitted successfully!', 'success');
      setTimeout(() => {
        navigate('/customer-dashboard');
      }, 1200);
    } catch (err) {
      showToast(err.message || 'Failed to submit booking', 'error');
      setSubmitting(false);
    }
  };

  const timeslots = [
    '09:00 AM',
    '10:00 AM',
    '11:30 AM',
    '01:00 PM',
    '02:30 PM',
    '04:00 PM',
    '05:30 PM',
  ];

  return (
    <PageContainer title="Book a Session" onOpenAiMatcher={() => setShowAiSheet(true)}>
      <div style={{ maxWidth: '520px', margin: '0 auto', paddingBottom: '2rem' }}>

        {/* ── AI SPECIALIST MATCHER CALLOUT BANNER ── */}
        <div
          className="app-card"
          onClick={() => setShowAiSheet(true)}
          style={{
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #171717 0%, #0a0a0a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1.5px solid rgba(212,175,55,0.5)',
            borderRadius: '20px',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.25rem',
            boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'rgba(212,175,55,0.2)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                AI Specialist Matcher
              </h4>
              <p style={{ color: '#a1a1aa', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>
                Match best artisan based on your style request
              </p>
            </div>
          </div>
          <span
            style={{
              background: '#d4af37',
              color: '#121212',
              fontSize: '0.72rem',
              fontFamily: 'Outfit',
              fontWeight: 900,
              padding: '0.35rem 0.75rem',
              borderRadius: '50px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            MATCH
          </span>
        </div>

        {/* ── STEP PROGRESS BAR HEADER ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.5rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}
        >
          {[
            { num: 1, label: 'Select Service' },
            { num: 2, label: 'Artisan & Place' },
            { num: 3, label: 'Date & Time' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              style={{
                padding: '0.65rem 0.35rem',
                borderRadius: '14px',
                background: activeStep === s.num ? '#171717' : '#ffffff',
                border: activeStep === s.num ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
                color: activeStep === s.num ? '#d4af37' : '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontFamily: 'Outfit', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.1rem' }}>
                Step 0{s.num}
              </span>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 800 }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleBookingSubmit}>

          {/* ── STEP 1: SERVICE SELECTION ── */}
          {activeStep === 1 && (
            <div className="app-card" style={{ padding: '1.25rem', borderRadius: '22px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#d4af37', fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 1 OF 3
                </span>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#171717', margin: '0.1rem 0' }}>
                  Choose Your Service
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
                  Tap a primary service, or add a secondary combo service.
                </p>
              </div>

              {/* Primary Service Selection Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {SERVICES.map((s) => {
                  const isSelected = service1 === s.title;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setService1(s.title)}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '16px',
                        background: isSelected ? 'rgba(212,175,55,0.12)' : '#f8fafc',
                        border: isSelected ? '2px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#b5952f' }}>
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                      <span style={{ fontSize: '1.25rem', display: 'block', marginBottom: '0.35rem' }}>{s.icon}</span>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 800, color: '#171717', margin: '0 0 0.15rem' }}>
                        {s.title}
                      </h4>
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 900, color: '#b5952f', display: 'block' }}>
                        ₦{Number(s.price).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.2rem', display: 'block' }}>
                        ⏱ {s.duration}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Secondary Combo Service Selector */}
              <div style={{ background: '#faf9f5', borderRadius: '16px', padding: '1rem', border: '1px dashed rgba(212,175,55,0.4)', marginBottom: '1.25rem' }}>
                <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  <Plus size={14} color="#d4af37" /> Add Combo Service (Optional)
                </label>
                <select
                  value={service2}
                  onChange={(e) => setService2(e.target.value)}
                  className="app-select"
                  style={{ background: '#ffffff' }}
                >
                  <option value="">None (Single Service Only)</option>
                  {SERVICES.filter(s => s.title !== service1).map((s) => (
                    <option key={s.title} value={s.title}>
                      {s.title} (+₦{Number(s.price).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="app-btn app-btn-accent"
                style={{ width: '100%', borderRadius: '14px' }}
              >
                <span>Continue to Artisan & Location</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* ── STEP 2: ARTISAN & LOCATION ── */}
          {activeStep === 2 && (
            <div className="app-card" style={{ padding: '1.25rem', borderRadius: '22px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#d4af37', fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 2 OF 3
                </span>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#171717', margin: '0.1rem 0' }}>
                  Artisan & Location
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
                  Select your preferred specialist and service state.
                </p>
              </div>

              {/* Visual Artisan Selector Cards */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="app-label" style={{ marginBottom: '0.65rem', display: 'block' }}>
                  Select Preferred Artisan
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {specialistsList.slice(0, 4).map((sp, idx) => {
                    const isSelected = stylist === sp.name;
                    return (
                      <div
                        key={idx}
                        onClick={() => setStylist(sp.name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 0.9rem',
                          borderRadius: '14px',
                          background: isSelected ? 'rgba(212,175,55,0.12)' : '#f8fafc',
                          border: isSelected ? '2px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <OptimizedImage
                            src={sp.image}
                            alt={sp.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: isSelected ? '2px solid #d4af37' : '1px solid rgba(0,0,0,0.1)'
                            }}
                          />
                          <div>
                            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 800, color: '#171717', margin: 0 }}>
                              {sp.name}
                            </h4>
                            <span style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'Outfit' }}>
                              {sp.role}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800 }}>
                            <Star size={12} fill="#f59e0b" /> {sp.rating}
                          </span>
                          {isSelected && <CheckCircle2 size={18} color="#b5952f" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Location Picker */}
              <div className="app-input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="#d4af37" /> Service State / Location
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="app-select"
                >
                  {NIGERIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="app-btn app-btn-outline"
                  style={{ flex: 1, borderRadius: '14px' }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="app-btn app-btn-accent"
                  style={{ flex: 2, borderRadius: '14px' }}
                >
                  <span>Continue to Time Slot</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: DATE & TIME ── */}
          {activeStep === 3 && (
            <div className="app-card" style={{ padding: '1.25rem', borderRadius: '22px' }}>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ color: '#d4af37', fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  STEP 3 OF 3
                </span>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#171717', margin: '0.1rem 0' }}>
                  Appointment Schedule
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
                  Pick your preferred date & time slot.
                </p>
              </div>

              {/* Date Input */}
              <div className="app-input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CalendarIcon size={14} color="#d4af37" /> Select Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                  className="app-input"
                  required
                />
              </div>

              {/* Time Slots Grid */}
              <div className="app-input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="app-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Clock size={14} color="#d4af37" /> Select Time Slot
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' }}>
                  {timeslots.map((ts) => (
                    <button
                      type="button"
                      key={ts}
                      onClick={() => setTime(ts)}
                      style={{
                        padding: '0.65rem 0.2rem',
                        borderRadius: '10px',
                        border: time === ts ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
                        background: time === ts ? '#171717' : '#ffffff',
                        color: time === ts ? '#d4af37' : '#171717',
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {ts}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Receipt Box */}
              <div
                style={{
                  background: '#171717',
                  color: '#ffffff',
                  borderRadius: '18px',
                  padding: '1.1rem 1.25rem',
                  border: '1.5px solid rgba(212,175,55,0.4)',
                  marginBottom: '1.25rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 900, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  BOOKING SUMMARY RECEIPT
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 900, margin: '0 0 0.4rem', color: '#ffffff' }}>
                  {[service1, service2].filter(Boolean).join(' + ')}
                </h3>
                <div style={{ fontSize: '0.78rem', color: '#a1a1aa', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginBottom: '0.85rem' }}>
                  <span>• Specialist: <strong style={{ color: '#ffffff' }}>{stylist}</strong></span>
                  <span>• Location: <strong style={{ color: '#ffffff' }}>{location}</strong></span>
                  <span>• Schedule: <strong style={{ color: '#ffffff' }}>{date} at {time}</strong></span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.65rem' }}>
                  <span style={{ fontSize: '0.78rem', color: '#a1a1aa', fontFamily: 'Outfit', fontWeight: 700 }}>
                    TOTAL PRICE:
                  </span>
                  <span style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 900, color: '#d4af37' }}>
                    ₦{Number(totalPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="app-btn app-btn-outline"
                  style={{ flex: 1, borderRadius: '14px' }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn app-btn-primary"
                  style={{ flex: 2, borderRadius: '14px' }}
                >
                  {submitting ? (
                    <span>Confirming...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Confirm Session</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>

      <AISpecialistMatcherSheet
        isOpen={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onApplyMatch={(match) => {
          if (match?.firstname) setStylist(match.name || match.firstname);
          if (match?.primaryService) setService1(match.primaryService);
          if (match?.secondaryService) setService2(match.secondaryService);
          showToast(`Matched with ${match.name}! Form pre-filled.`, 'success');
        }}
      />
    </PageContainer>
  );
};
