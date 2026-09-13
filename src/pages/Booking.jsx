import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  Scissors,
  Sparkles,
  User,
  CheckCircle2,
  Check,
  Star,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { AISpecialistMatcherSheet } from '../components/booking/AISpecialistMatcherSheet';
import { OptimizedImage } from '../components/common/OptimizedImage';

const SERVICES = [
  {
    id: 's1',
    title: 'Hair Styling',
    price: 5000,
    duration: '60 mins',
    desc: 'Wash, blow dry, straightening, silk press & hair treatment.',
  },
  {
    id: 's2',
    title: 'Nail Tech',
    price: 3000,
    duration: '45 mins',
    desc: 'Manicure, pedicure, nail art, and cuticle restoration.',
  },
  {
    id: 's3',
    title: 'Braids',
    price: 4000,
    duration: '90 mins',
    desc: 'Cornrows, box braids, knotless braids & protective twists.',
  },
  {
    id: 's4',
    title: 'Skincare',
    price: 6000,
    duration: '60 mins',
    desc: 'Deep pore facial, hydra exfoliation & skin brightening treatment.',
  },
  {
    id: 's5',
    title: 'Makeup',
    price: 8000,
    duration: '60 mins',
    desc: 'Flawless glam beat, photoshoot makeup & brow sculpting.',
  },
];

const DATES = [
  { day: 'Fri', date: '22', full: '2026-08-22' },
  { day: 'Sat', date: '23', full: '2026-08-23' },
  { day: 'Sun', date: '24', full: '2026-08-24' },
  { day: 'Mon', date: '25', full: '2026-08-25' },
  { day: 'Tue', date: '26', full: '2026-08-26' },
  { day: 'Wed', date: '27', full: '2026-08-27' },
];

const TIMESLOTS = [
  '9:00 AM',
  '11:00 AM',
  '1:00 PM',
  '3:00 PM',
  '5:00 PM',
  '7:00 PM',
];

export const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || '';
  const queryStylist = searchParams.get('stylist') || '';

  const { user, isAuthenticated, showToast, role } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role === 'staff') {
      showToast('Experts cannot book services. Redirected to Expert Dashboard.', 'error');
      navigate('/expert-dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const [activeStep, setActiveStep] = useState(1); // 1: Service/Date, 2: Stylist, 3: Location, 4: Confirm
  const [selectedService, setSelectedService] = useState(initialService || SERVICES[0].title);
  const [selectedDate, setSelectedDate] = useState(DATES[1].full);
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [stylist, setStylist] = useState(queryStylist || 'Zainab A.');
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [specialistsList, setSpecialistsList] = useState([]);
  const [loadingSpecialists, setLoadingSpecialists] = useState(true);
  const [location, setLocation] = useState('Lagos State');
  const [promoCode, setPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);

  useEffect(() => {
    if (initialService) {
      const match = SERVICES.find((s) =>
        s.title.toLowerCase().includes(initialService.toLowerCase())
      );
      if (match) setSelectedService(match.title);
      else setSelectedService(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    setLoadingSpecialists(true);
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const verifiedStaff = data.filter((s) => s.role === 'staff' || s.isVerified === true);
          const mapped = verifiedStaff.map((s) => ({
            id: s._id,
            name: `${s.firstname || ''} ${s.lastname || ''}`.trim() || 'Verified Specialist',
            role: s.title || 'Certified Stylist',
            rating: s.rating || 4.9,
            image: s.avatarUrl || s.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          }));
          setSpecialistsList(mapped);

          if (mapped.length > 0) {
            const found = queryStylist
              ? mapped.find((m) => m.name.toLowerCase().includes(queryStylist.toLowerCase()))
              : null;
            const target = found || mapped[0];
            setStylist(target.name);
            setSelectedSpecialist(target);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSpecialists(false));
  }, [queryStylist]);

  const getPrice = (title) => {
    const match = SERVICES.find((s) => s.title.toLowerCase() === title.toLowerCase());
    return match ? match.price : 5000;
  };

  const rawTotalPrice = getPrice(selectedService);
  const discountAmount = appliedVoucher ? 2000 : 0;
  const totalPrice = Math.max(0, rawTotalPrice - discountAmount);

  const handleNextStep = () => {
    if (activeStep < 4) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleBookingSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please sign in to complete your booking session.', 'error');
      navigate('/login?redirect=booking');
      return;
    }

    if (role === 'staff') {
      showToast('Experts cannot book services.', 'error');
      navigate('/expert-dashboard');
      return;
    }

    const currentSpecialist = selectedSpecialist || specialistsList.find((s) => s.name === stylist) || { name: stylist || 'Zainab A.' };

    const bookingPayload = {
      clientName: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Client',
      clientEmail: user.email,
      clientPhone: user.phone || 'N/A',
      stylist: currentSpecialist.name,
      stylistId: currentSpecialist.id || undefined,
      service: appliedVoucher ? `${selectedService} [Voucher Applied]` : selectedService,
      location: location,
      price: totalPrice,
      discountApplied: discountAmount,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
    };

    setSubmitting(true);
    try {
      const createdBooking = await api.createBooking(bookingPayload);
      showToast('Appointment scheduled! Proceeding to Payment...', 'success');
      navigate('/payment', {
        state: {
          bookingId: createdBooking?._id,
          title: `Booking: ${selectedService}`,
          amount: totalPrice,
          description: `Stylist: ${currentSpecialist.name} · Date: ${selectedDate} at ${selectedTime}`,
        },
      });
    } catch (err) {
      showToast(err.message || 'Failed to submit booking', 'error');
      setSubmitting(false);
    }
  };

  return (
    <PageContainer showBack={true}>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Screen 6: Top Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
            Book Appointment
          </h1>
        </div>

        {/* 4-Step Stepper Header matching Screen 6 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            marginBottom: '1.75rem',
            padding: '0 0.5rem',
          }}
        >
          {/* Background Connecting Line */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '25px',
              right: '25px',
              height: '2px',
              background: '#232736',
              zIndex: 1,
            }}
          />

          {[
            { step: 1, label: 'Service' },
            { step: 2, label: 'Stylist' },
            { step: 3, label: 'Date' },
            { step: 4, label: 'Confirm' },
          ].map((s) => {
            const isCurrent = activeStep === s.step;
            const isCompleted = activeStep > s.step;
            return (
              <div
                key={s.step}
                onClick={() => setActiveStep(s.step)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  zIndex: 2,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isCurrent ? '#f5b942' : isCompleted ? '#272b3a' : '#151822',
                    border: `1.5px solid ${isCurrent ? '#f5b942' : isCompleted ? '#f5b942' : '#2a2f40'}`,
                    color: isCurrent ? '#0c0e14' : isCompleted ? '#f5b942' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.78rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                  }}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : s.step}
                </div>
                <span
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isCurrent ? '#f5b942' : '#94a3b8',
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: SELECT SERVICE & DATE/TIME (SCREEN 6 DESIGN) ── */}
        {activeStep === 1 && (
          <div>
            {/* Select Service Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Select Service
              </h2>
              <button
                onClick={() => navigate('/services')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f5b942',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                View all &gt;
              </button>
            </div>

            {/* Service Radio Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {SERVICES.slice(0, 3).map((s) => {
                const isSelected = selectedService.toLowerCase().includes(s.title.toLowerCase()) || s.title.toLowerCase().includes(selectedService.toLowerCase());
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedService(s.title)}
                    style={{
                      background: '#151822',
                      borderRadius: '16px',
                      padding: '1rem',
                      border: `1.5px solid ${isSelected ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          {s.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0 0 0.4rem', lineHeight: 1.35 }}>
                        {s.desc}
                      </p>
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#f5b942' }}>
                        ₦{Number(s.price).toLocaleString()}
                      </span>
                    </div>

                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: `1.5px solid ${isSelected ? '#f5b942' : '#394056'}`,
                        background: isSelected ? '#f5b942' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '0.75rem',
                      }}
                    >
                      {isSelected && <Check size={13} color="#0c0e14" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Select Date & Time Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.85rem' }}>
                Select Date & Time
              </h2>

              {/* Day Pills Scroll */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.55rem',
                  overflowX: 'auto',
                  paddingBottom: '0.85rem',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {DATES.map((item) => {
                  const isSelected = selectedDate === item.full;
                  return (
                    <button
                      key={item.full}
                      onClick={() => setSelectedDate(item.full)}
                      style={{
                        flex: '0 0 54px',
                        height: '70px',
                        borderRadius: '14px',
                        background: isSelected ? '#f5b942' : '#151822',
                        border: `1px solid ${isSelected ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: isSelected ? '#0c0e14' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.2rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 600, color: isSelected ? '#0c0e14' : '#94a3b8' }}>
                        {item.day}
                      </span>
                      <span style={{ fontSize: '1.05rem', fontFamily: 'Outfit', fontWeight: 800 }}>
                        {item.date}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Timeslot Chips */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.55rem',
                }}
              >
                {TIMESLOTS.map((slot) => {
                  const isSelected = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      style={{
                        padding: '0.65rem 0.35rem',
                        borderRadius: '12px',
                        background: '#151822',
                        border: `1.5px solid ${isSelected ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                        color: isSelected ? '#f5b942' : '#ffffff',
                        fontFamily: 'Outfit',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sticky "Continue ->" Gold Button */}
            <button
              onClick={() => setActiveStep(2)}
              className="app-btn app-btn-accent"
              style={{
                borderRadius: '16px',
                padding: '0.95rem',
                fontSize: '0.92rem',
                boxShadow: '0 8px 24px rgba(245, 185, 66, 0.35)',
              }}
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: SELECT STYLIST ── */}
        {activeStep === 2 && (
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.85rem' }}>
              Select Stylist
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {specialistsList.map((sp) => {
                const isSelected = stylist === sp.name;
                return (
                  <div
                    key={sp.id}
                    onClick={() => {
                      setStylist(sp.name);
                      setSelectedSpecialist(sp);
                    }}
                    style={{
                      background: '#151822',
                      borderRadius: '16px',
                      padding: '0.85rem 1rem',
                      border: `1.5px solid ${isSelected ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <OptimizedImage
                        src={sp.image}
                        alt={sp.name}
                        style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          {sp.name}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{sp.role}</span>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} color="#f5b942" />}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={handlePrevStep}
                className="app-btn app-btn-outline"
                style={{ flex: 1, borderRadius: '14px' }}
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="app-btn app-btn-accent"
                style={{ flex: 2, borderRadius: '14px' }}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: LOCATION & SCHEDULE ── */}
        {activeStep === 3 && (
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.85rem' }}>
              Service Location
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="app-label">State / Region</label>
              <select
                className="app-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="Lagos State">Lagos State</option>
                <option value="FCT – Abuja">FCT – Abuja</option>
                <option value="Rivers State">Rivers State (Port Harcourt)</option>
                <option value="Oyo State">Oyo State (Ibadan)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={handlePrevStep}
                className="app-btn app-btn-outline"
                style={{ flex: 1, borderRadius: '14px' }}
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="app-btn app-btn-accent"
                style={{ flex: 2, borderRadius: '14px' }}
              >
                <span>Review & Confirm</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: REVIEW & CONFIRM BOOKING ── */}
        {activeStep === 4 && (
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.85rem' }}>
              Appointment Summary
            </h2>

            <div
              style={{
                background: '#151822',
                borderRadius: '18px',
                padding: '1.15rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Service:</span>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>{selectedService}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Stylist:</span>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>{stylist}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Date & Time:</span>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>{selectedDate} at {selectedTime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Location:</span>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.85rem' }}>{location}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#ffffff', fontWeight: 800 }}>Total Fee:</span>
                <span style={{ color: '#f5b942', fontWeight: 800, fontSize: '1.1rem' }}>₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={handlePrevStep}
                className="app-btn app-btn-outline"
                style={{ flex: 1, borderRadius: '14px' }}
              >
                Back
              </button>
              <button
                onClick={handleBookingSubmit}
                disabled={submitting}
                className="app-btn app-btn-accent"
                style={{ flex: 2, borderRadius: '14px' }}
              >
                {submitting ? 'Confirming...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}

      </div>

      <AISpecialistMatcherSheet
        isOpen={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onApplyMatch={(match) => {
          setShowAiSheet(false);
          if (match.stylist) setStylist(match.stylist);
          if (match.service) setSelectedService(match.service);
        }}
      />
    </PageContainer>
  );
};
