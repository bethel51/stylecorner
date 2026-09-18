import React, { useState, useEffect, useMemo } from 'react';
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
  MapPin,
  Info,
  CalendarDays,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { AISpecialistMatcherSheet } from '../components/booking/AISpecialistMatcherSheet';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { Avatar } from '../components/common/Avatar';

const SERVICES = [
  {
    id: 'hair_styling',
    title: 'Hair Styling',
    category: 'Hair',
    price: 5000,
    duration: '60 mins',
    desc: 'Wash, blow dry, straightening, hot oil treatments & silk press.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'barbering',
    title: 'Precision Barbing',
    category: 'Hair',
    price: 5000,
    duration: '45 mins',
    desc: 'Sharp fades, line-ups, beard trimming & hot towel royal grooming.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'braiding',
    title: 'Braids',
    category: 'Braids',
    price: 4000,
    duration: '90 mins',
    desc: 'Cornrows, box braids, knotless braids & protective twists.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'nail_care',
    title: 'Nail Care',
    category: 'Nails',
    price: 3000,
    duration: '45 mins',
    desc: 'Manicure, pedicure, acrylic extensions and 3D gel nail art.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'skincare',
    title: 'Skincare',
    category: 'Skincare',
    price: 6000,
    duration: '60 mins',
    desc: 'Deep pore facial, hydra exfoliation & skin brightening treatment.',
    image: 'https://images.unsplash.com/photo-1512290900672-1f5be50c76ba?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'makeup',
    title: 'Makeup',
    category: 'Makeup',
    price: 8000,
    duration: '60 mins',
    desc: 'Flawless glam beat, bridal makeover & brow sculpting.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80',
  },
];

const DEFAULT_SPECIALISTS = [
  {
    id: 'spec_zainab',
    name: 'Zainab Adeleke',
    role: 'Master Wig & Silk Press Artisan',
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'spec_julian',
    name: 'Julian Reed',
    role: 'Executive Barber & Groomer',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'spec_amara',
    name: 'Amara Okon',
    role: 'Luxe Nail & Lash Architect',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'spec_tunde',
    name: 'Tunde Bakare',
    role: 'Editorial Makeup & Glow Specialist',
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
];

// Helper to generate dynamic upcoming dates starting from today
const generateUpcomingDates = (count = 14) => {
  const dates = [];
  const today = new Date();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const full = `${yyyy}-${mm}-${dd}`;

    let dayLabel = daysOfWeek[d.getDay()];
    if (i === 0) dayLabel = 'Today';
    else if (i === 1) dayLabel = 'Tmrw';

    dates.push({
      day: dayLabel,
      date: String(d.getDate()),
      month: months[d.getMonth()],
      weekday: daysOfWeek[d.getDay()],
      full: full,
      isToday: i === 0,
    });
  }
  return dates;
};

// Comprehensive time slots grouped by session period
const TIME_SLOT_GROUPS = [
  {
    label: 'Morning',
    slots: ['9:00 AM', '10:00 AM', '11:00 AM'],
  },
  {
    label: 'Afternoon',
    slots: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
  },
  {
    label: 'Evening',
    slots: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
  },
];

// Helper to check if a timeslot on today's date is already past
const isSlotPastToday = (slotTimeStr, selectedDateStr) => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  if (selectedDateStr !== todayStr) return false;

  const match = slotTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return false;
  let [_, hours, minutes, ampm] = match;
  let h = parseInt(hours, 10);
  let m = parseInt(minutes, 10);
  if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
  if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;

  const slotTime = new Date();
  slotTime.setHours(h, m, 0, 0);

  return slotTime <= now;
};

export const Booking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryService = searchParams.get('service') || '';
  const queryStylist = searchParams.get('stylist') || '';
  const queryLocation = searchParams.get('location') || '';
  const queryStylistId = searchParams.get('stylistId') || '';

  const { user, isAuthenticated, showToast, role } = useAuth();

  useEffect(() => {
    if (isAuthenticated && role === 'staff') {
      showToast('Experts cannot book services. Redirected to Expert Dashboard.', 'error');
      navigate('/expert-dashboard', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  // Generate dynamic date range
  const dynamicDates = useMemo(() => generateUpcomingDates(14), []);
  const todayISO = dynamicDates[0]?.full || new Date().toISOString().split('T')[0];

  // Steps: 1: Service, 2: Stylist, 3: Date & Time + Location, 4: Confirm
  const [activeStep, setActiveStep] = useState(queryStylist && queryService ? 3 : 1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedService, setSelectedService] = useState(SERVICES[0].title);
  const [selectedDate, setSelectedDate] = useState(todayISO);
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  const [stylist, setStylist] = useState(queryStylist || 'Zainab Adeleke');
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [specialistsList, setSpecialistsList] = useState(DEFAULT_SPECIALISTS);
  const [loadingSpecialists, setLoadingSpecialists] = useState(true);
  const [busySlots, setBusySlots] = useState([]);
  const [loadingBusySlots, setLoadingBusySlots] = useState(false);
  const [location, setLocation] = useState(queryLocation || 'Lagos State');
  const [appliedVoucher, setAppliedVoucher] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [isAiMatched, setIsAiMatched] = useState(Boolean(queryStylist && queryService));

  // Sync service from query
  useEffect(() => {
    if (queryService) {
      const match = SERVICES.find(
        (s) =>
          s.title.toLowerCase().includes(queryService.toLowerCase()) ||
          queryService.toLowerCase().includes(s.title.toLowerCase())
      );
      if (match) setSelectedService(match.title);
      else setSelectedService(queryService);
    }
  }, [queryService]);

  // Sync location from query
  useEffect(() => {
    if (queryLocation) {
      setLocation(queryLocation);
    }
  }, [queryLocation]);

  // Load specialists from database/API
  useEffect(() => {
    setLoadingSpecialists(true);
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const verifiedStaff = data.filter((s) => s.role === 'staff' || s.role === 'expert' || s.isVerified === true);
          const mapped = verifiedStaff.map((s) => ({
            id: s._id,
            name: `${s.firstname || ''} ${s.lastname || ''}`.trim() || 'Verified Specialist',
            role: s.title || s.roleTitle || 'Certified Stylist',
            rating: s.rating || 4.95,
            image: s.avatarUrl || s.profileImage || '',
          }));

          const combined = mapped.length > 0 ? mapped : DEFAULT_SPECIALISTS;
          setSpecialistsList(combined);

          const found = queryStylist
            ? combined.find((m) =>
                m.name.toLowerCase().includes(queryStylist.toLowerCase()) ||
                queryStylist.toLowerCase().includes(m.name.toLowerCase()) ||
                (queryStylistId && m.id === queryStylistId)
              )
            : null;

          const target = found || combined[0];
          setStylist(target.name);
          setSelectedSpecialist(target);
        } else {
          setSpecialistsList(DEFAULT_SPECIALISTS);
          const found = queryStylist
            ? DEFAULT_SPECIALISTS.find((m) => m.name.toLowerCase().includes(queryStylist.toLowerCase()))
            : null;
          const target = found || DEFAULT_SPECIALISTS[0];
          setStylist(target.name);
          setSelectedSpecialist(target);
        }
      })
      .catch(() => {
        setSpecialistsList(DEFAULT_SPECIALISTS);
        const target = DEFAULT_SPECIALISTS[0];
        setStylist(target.name);
        setSelectedSpecialist(target);
      })
      .finally(() => setLoadingSpecialists(false));
  }, [queryStylist, queryStylistId]);

  // Fetch busy slots whenever selected date or specialist changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingBusySlots(true);
    const specId = selectedSpecialist?.id || (selectedSpecialist?.id !== 'spec_zainab' ? selectedSpecialist?.id : undefined);
    api.getBusySlots(stylist, specId, selectedDate)
      .then((slots) => {
        setBusySlots(Array.isArray(slots) ? slots : []);
      })
      .catch(() => {
        setBusySlots([]);
      })
      .finally(() => setLoadingBusySlots(false));
  }, [selectedDate, stylist, selectedSpecialist]);

  // Adjust selectedTime if currently selected slot is past or booked
  useEffect(() => {
    const isPast = isSlotPastToday(selectedTime, selectedDate);
    const isBooked = busySlots.includes(selectedTime);

    if (isPast || isBooked) {
      // Find the next available slot
      const allSlots = TIME_SLOT_GROUPS.flatMap((g) => g.slots);
      const nextAvailable = allSlots.find(
        (slot) => !isSlotPastToday(slot, selectedDate) && !busySlots.includes(slot)
      );
      if (nextAvailable) {
        setSelectedTime(nextAvailable);
      }
    }
  }, [selectedDate, busySlots]);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(-1);
    }
  };

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;
    if (voucherCode.trim().toUpperCase() === 'STYLE2000' || voucherCode.trim().toUpperCase() === 'WELCOME20') {
      setAppliedVoucher(true);
      showToast('₦2,000 voucher discount applied!', 'success');
    } else {
      showToast('Invalid promo code. Try STYLE2000', 'error');
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

    const currentSpecialist =
      selectedSpecialist ||
      specialistsList.find((s) => s.name === stylist) || { name: stylist || 'Zainab Adeleke' };

    const bookingPayload = {
      clientName: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Client',
      clientEmail: user.email,
      clientPhone: user.phone || 'N/A',
      stylist: currentSpecialist.name,
      stylistId: currentSpecialist.id && !currentSpecialist.id.startsWith('spec_') ? currentSpecialist.id : undefined,
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
      showToast('Appointment scheduled! Proceeding to payment...', 'success');
      navigate('/payment', {
        state: {
          bookingId: createdBooking?._id,
          title: `Booking: ${selectedService}`,
          amount: totalPrice,
          description: `Specialist: ${currentSpecialist.name} · Date: ${selectedDate} at ${selectedTime}`,
        },
      });
    } catch (err) {
      showToast(err.message || 'Failed to submit booking', 'error');
      setSubmitting(false);
    }
  };

  // Human readable date format for summary
  const readableDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return selectedDate;
  }, [selectedDate]);

  return (
    <PageContainer showBack={true} onOpenAiMatcher={() => setShowAiSheet(true)}>
      <div style={{ maxWidth: '520px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Top Header */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.2rem' }}>
              Book Appointment
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>
              Tailored beauty & grooming sessions with verified specialists.
            </p>
          </div>

          {/* Header Quick AI Matcher Action */}
          <button
            onClick={() => setShowAiSheet(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.15), rgba(245, 185, 66, 0.05))',
              border: '1.5px solid rgba(245, 185, 66, 0.4)',
              borderRadius: '20px',
              padding: '0.45rem 0.75rem',
              color: '#f5b942',
              fontFamily: 'Outfit',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Sparkles size={14} />
            <span>AI Matcher</span>
          </button>
        </div>

        {/* AI Matched Active Badge Banner */}
        {isAiMatched && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.15) 0%, rgba(20, 24, 34, 0.95) 100%)',
              border: '1px solid rgba(245, 185, 66, 0.45)',
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(245, 185, 66, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f5b942',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} />
              </div>
              <div>
                <p style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.84rem', color: '#ffffff' }}>
                  AI Match Applied
                </p>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#f5b942' }}>
                  {stylist} for {selectedService}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowAiSheet(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.72rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'Outfit',
                fontWeight: 600,
              }}
            >
              Change
            </button>
          </div>
        )}

        {/* 4-Step Stepper Header */}
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
              left: '30px',
              right: '30px',
              height: '2px',
              background: '#232736',
              zIndex: 1,
            }}
          />

          {[
            { step: 1, label: 'Service' },
            { step: 2, label: 'Stylist' },
            { step: 3, label: 'Date & Time' },
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
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : s.step}
                </div>
                <span
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: isCurrent ? '#f5b942' : isCompleted ? '#ffffff' : '#94a3b8',
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── STEP 1: SELECT SERVICE ── */}
        {activeStep === 1 && (
          <div>
            {/* Header with AI trigger CTA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
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
                View Catalog &gt;
              </button>
            </div>

            {/* AI Assistant Callout Box */}
            <div
              onClick={() => setShowAiSheet(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.1) 0%, rgba(26, 31, 46, 0.7) 100%)',
                border: '1px solid rgba(245, 185, 66, 0.3)',
                borderRadius: '16px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Sparkles size={18} color="#f5b942" />
                <div>
                  <p style={{ margin: 0, fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', color: '#ffffff' }}>
                    Not sure what you need?
                  </p>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#94a3b8' }}>
                    Let our AI Matcher recommend the best service and artist.
                  </p>
                </div>
              </div>
              <ChevronRight size={16} color="#f5b942" />
            </div>

            {/* Category Pills */}
            <div
              style={{
                display: 'flex',
                gap: '0.45rem',
                overflowX: 'auto',
                paddingBottom: '0.75rem',
                marginBottom: '0.75rem',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {['All', 'Hair', 'Braids', 'Nails', 'Skincare', 'Makeup'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '20px',
                    fontFamily: 'Outfit',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: selectedCategory === cat ? '#f5b942' : '#151822',
                    color: selectedCategory === cat ? '#0c0e14' : '#94a3b8',
                    border: `1px solid ${selectedCategory === cat ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Service Selection Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {SERVICES.filter((s) => selectedCategory === 'All' || s.category === selectedCategory).map((s) => {
                const isSelected =
                  selectedService.toLowerCase().includes(s.title.toLowerCase()) ||
                  s.title.toLowerCase().includes(selectedService.toLowerCase());

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
                      gap: '0.85rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease, background 0.15s ease',
                    }}
                  >
                    <img
                      src={s.image}
                      alt={s.title}
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                          {s.title}
                        </h3>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'Outfit' }}>
                          {s.duration}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0.2rem 0 0.4rem', lineHeight: 1.35 }}>
                        {s.desc}
                      </p>
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#f5b942' }}>
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
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && <Check size={13} color="#0c0e14" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setActiveStep(2)}
              className="app-btn app-btn-accent"
              style={{
                width: '100%',
                borderRadius: '16px',
                padding: '0.95rem',
                fontSize: '0.92rem',
                boxShadow: '0 8px 24px rgba(245, 185, 66, 0.35)',
              }}
            >
              <span>Next: Select Specialist</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: SELECT STYLIST ── */}
        {activeStep === 2 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Select Specialist
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>
                  Choose your preferred artist for {selectedService}
                </p>
              </div>

              <button
                onClick={() => setShowAiSheet(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(245, 185, 66, 0.15)',
                  border: '1px solid rgba(245, 185, 66, 0.4)',
                  borderRadius: '12px',
                  padding: '0.4rem 0.7rem',
                  color: '#f5b942',
                  fontFamily: 'Outfit',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={13} />
                <span>AI Match</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {specialistsList.map((sp) => {
                const isSelected = stylist.toLowerCase().includes(sp.name.toLowerCase()) || sp.name.toLowerCase().includes(stylist.toLowerCase());
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
                      padding: '0.95rem 1rem',
                      border: `1.5px solid ${isSelected ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <Avatar
                        src={sp.image}
                        name={sp.name}
                        size={48}
                        borderRadius="50%"
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.96rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                            {sp.name}
                          </h4>
                          <ShieldCheck size={14} color="#f5b942" />
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{sp.role}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                          <Star size={11} fill="#f5b942" color="#f5b942" />
                          <span style={{ fontSize: '0.72rem', color: '#f5b942', fontWeight: 800 }}>
                            {sp.rating || 4.95}
                          </span>
                        </div>
                      </div>
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
                        flexShrink: 0,
                      }}
                    >
                      {isSelected && <Check size={13} color="#0c0e14" strokeWidth={3} />}
                    </div>
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
                <span>Next: Date & Time</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: SELECT DATE & TIME + LOCATION ── */}
        {activeStep === 3 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Select Date & Time
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>
                Pick an available slot for {stylist}
              </p>
            </div>

            {/* Date Header + Custom Date Picker Input */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 700, color: '#ffffff' }}>
                Upcoming Available Dates
              </span>

              {/* Native Date Picker trigger */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.74rem',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  color: '#f5b942',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <CalendarDays size={15} />
                <span>Choose Date</span>
                <input
                  type="date"
                  min={todayISO}
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDate(e.target.value);
                  }}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    width: '100%',
                    height: '100%',
                    left: 0,
                    top: 0,
                    cursor: 'pointer',
                  }}
                />
              </label>
            </div>

            {/* Dynamic Date Horizontal Scroll Carousel */}
            <div
              style={{
                display: 'flex',
                gap: '0.55rem',
                overflowX: 'auto',
                paddingBottom: '0.85rem',
                marginBottom: '1.25rem',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {dynamicDates.map((item) => {
                const isSelected = selectedDate === item.full;
                return (
                  <button
                    key={item.full}
                    onClick={() => setSelectedDate(item.full)}
                    style={{
                      flex: '0 0 60px',
                      height: '76px',
                      borderRadius: '16px',
                      background: isSelected ? '#f5b942' : '#151822',
                      border: `1.5px solid ${isSelected ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                      color: isSelected ? '#0c0e14' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.15rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 14px rgba(245, 185, 66, 0.3)' : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontFamily: 'Outfit',
                        fontWeight: 700,
                        color: isSelected ? '#0c0e14' : '#94a3b8',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.day}
                    </span>
                    <span
                      style={{
                        fontSize: '1.15rem',
                        fontFamily: 'Outfit',
                        fontWeight: 900,
                        lineHeight: 1.1,
                      }}
                    >
                      {item.date}
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontFamily: 'Outfit',
                        fontWeight: 600,
                        color: isSelected ? '#0c0e14' : '#64748b',
                      }}
                    >
                      {item.month}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Date Indicator */}
            <div
              style={{
                background: 'rgba(245, 185, 66, 0.06)',
                border: '1px solid rgba(245, 185, 66, 0.2)',
                borderRadius: '12px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#f5b942' }}>
                <CalendarIcon size={14} />
                <span style={{ fontSize: '0.8rem', fontFamily: 'Outfit', fontWeight: 800 }}>
                  {readableDate}
                </span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#cbd5e1', fontFamily: 'Outfit' }}>
                Time: <strong style={{ color: '#ffffff' }}>{selectedTime}</strong>
              </span>
            </div>

            {/* Time Slot Selection by Periods */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 700, color: '#ffffff' }}>
                  Available Time Slots
                </span>
                {loadingBusySlots && (
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Checking live schedule...</span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {TIME_SLOT_GROUPS.map((group) => (
                  <div key={group.label}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '0.4rem',
                      }}
                    >
                      {group.label}
                    </span>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.5rem',
                      }}
                    >
                      {group.slots.map((slot) => {
                        const isSelected = selectedTime === slot;
                        const isPast = isSlotPastToday(slot, selectedDate);
                        const isBooked = busySlots.includes(slot);
                        const isDisabled = isPast || isBooked;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => setSelectedTime(slot)}
                            style={{
                              padding: '0.7rem 0.35rem',
                              borderRadius: '12px',
                              background: isSelected ? '#f5b942' : isDisabled ? 'rgba(21, 24, 34, 0.4)' : '#151822',
                              border: `1.5px solid ${
                                isSelected
                                  ? '#f5b942'
                                  : isDisabled
                                  ? 'rgba(255, 255, 255, 0.04)'
                                  : 'rgba(255, 255, 255, 0.08)'
                              }`,
                              color: isSelected ? '#0c0e14' : isDisabled ? '#475569' : '#ffffff',
                              fontFamily: 'Outfit',
                              fontSize: '0.8rem',
                              fontWeight: 800,
                              cursor: isDisabled ? 'not-allowed' : 'pointer',
                              transition: 'all 0.15s ease',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.1rem',
                            }}
                          >
                            <span>{slot}</span>
                            {isBooked ? (
                              <span style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 700 }}>
                                Booked
                              </span>
                            ) : isPast ? (
                              <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>
                                Past
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Location Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="app-label">Preferred Region / State</label>
              <select
                className="app-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="Lagos State">Lagos State (Mainland & Island)</option>
                <option value="FCT – Abuja">FCT – Abuja</option>
                <option value="Rivers State (Port Harcourt)">Rivers State (Port Harcourt)</option>
                <option value="Oyo State (Ibadan)">Oyo State (Ibadan)</option>
                <option value="At-Home VIP Service">At-Home VIP Service</option>
              </select>
            </div>

            {/* Navigation Buttons */}
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
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.85rem' }}>
              Appointment Summary
            </h2>

            <div
              style={{
                background: '#151822',
                borderRadius: '18px',
                padding: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Service:</span>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.88rem' }}>{selectedService}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Specialist:</span>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {stylist}
                  <ShieldCheck size={14} color="#f5b942" />
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Date:</span>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.88rem' }}>{readableDate}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Time Slot:</span>
                <span style={{ color: '#f5b942', fontWeight: 800, fontSize: '0.88rem' }}>{selectedTime}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Location:</span>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '0.88rem' }}>{location}</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Subtotal:</span>
                  <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem' }}>₦{rawTotalPrice.toLocaleString()}</span>
                </div>

                {appliedVoucher && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: '#10b981' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Voucher Discount:</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800 }}>-₦2,000</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.65rem' }}>
                  <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>Total Fee:</span>
                  <span style={{ color: '#f5b942', fontWeight: 900, fontSize: '1.25rem' }}>
                    ₦{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyVoucher} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Promo Code (e.g. STYLE2000)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="app-input"
                style={{ flex: 1, textTransform: 'uppercase' }}
              />
              <button
                type="submit"
                className="app-btn app-btn-outline"
                style={{ borderRadius: '14px', padding: '0 1rem' }}
              >
                Apply
              </button>
            </form>

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
                {submitting ? 'Scheduling Session...' : 'Proceed to Payment'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* AI Specialist Matcher Modal Sheet */}
      <AISpecialistMatcherSheet
        isOpen={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onApplyMatch={(match) => {
          setShowAiSheet(false);
          if (match.stylist) setStylist(match.stylist);
          if (match.service) setSelectedService(match.service);
          if (match.location) setLocation(match.location);

          const found = specialistsList.find(
            (s) =>
              (match.stylistId && s.id === match.stylistId) ||
              s.name.toLowerCase().includes(match.stylist.toLowerCase()) ||
              match.stylist.toLowerCase().includes(s.name.toLowerCase())
          );
          if (found) setSelectedSpecialist(found);

          setIsAiMatched(true);
          showToast(`AI Matched with ${match.stylist}!`, 'success');
          setActiveStep(3); // Flow straight into date and time selection
        }}
      />
    </PageContainer>
  );
};
