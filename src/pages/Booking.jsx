import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Scissors, Sparkles, User, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { AISpecialistMatcherSheet } from '../components/booking/AISpecialistMatcherSheet';

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

  const servicesData = [
    { title: 'Precision Skin Fade & Cut', price: 15000 },
    { title: 'Beard Trim & Sculpting', price: 10000 },
    { title: 'Knotless Box Braids', price: 45000 },
    { title: 'Cornrows & Custom Pattern', price: 25000 },
    { title: 'Full Gel Nail Architecture', price: 18000 },
    { title: 'Luxury Pedicure Session', price: 15000 },
    { title: 'Full Atelier Grooming Combo', price: 35000 },
  ];

  const [stylistsList, setStylistsList] = useState([
    'Any Specialist',
    'Julian Reed',
    'Elena Thorne',
    'Marcus Grey',
  ]);

  const [service1, setService1] = useState(initialService || servicesData[0].title);
  const [service2, setService2] = useState('');
  const [stylist, setStylist] = useState(initialStylist);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [submitting, setSubmitting] = useState(false);
  const [showAiSheet, setShowAiSheet] = useState(false);

  useEffect(() => {
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const fetchedNames = data.map((s) => `${s.firstname || ''} ${s.lastname || ''}`.trim()).filter(Boolean);
          const combined = Array.from(new Set(['Any Specialist', ...fetchedNames, 'Julian Reed', 'Elena Thorne', 'Marcus Grey']));
          setStylistsList(combined);
        }
      })
      .catch((err) => console.warn('Could not load dynamic specialists list:', err.message));
  }, []);

  const getPrice = (title) => {
    const match = servicesData.find((s) => s.title === title);
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

    if (service1 && service1 === service2) {
      showToast('Please select two distinct services or leave slot 2 empty.', 'error');
      return;
    }

    const servicesJoined = [service1, service2].filter(Boolean).join(' + ');

    const bookingPayload = {
      clientName: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Client',
      clientEmail: user.email,
      clientPhone: user.phone || 'N/A',
      stylist: stylist,
      service: servicesJoined,
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
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        {/* AI Matcher Callout Banner */}
        <div
          className="app-card"
          onClick={() => setShowAiSheet(true)}
          style={{
            cursor: 'pointer',
            background: '#171717',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1.5px solid rgba(212,175,55,0.5)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(212,175,55,0.2)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800 }}>
                AI Specialist Matcher
              </h4>
              <p style={{ color: '#a1a1aa', fontSize: '0.78rem' }}>
                Tap to match best artisan for your style request
              </p>
            </div>
          </div>
          <span
            style={{
              background: '#d4af37',
              color: '#121212',
              fontSize: '0.7rem',
              fontFamily: 'Outfit',
              fontWeight: 800,
              padding: '0.3rem 0.6rem',
              borderRadius: '50px',
            }}
          >
            MATCH
          </span>
        </div>

        <form onSubmit={handleBookingSubmit} className="app-card" style={{ padding: '1.5rem' }}>
          {/* Service Slot 1 */}
          <div className="app-input-group">
            <label className="app-label">Primary Service *</label>
            <select
              value={service1}
              onChange={(e) => setService1(e.target.value)}
              className="app-select"
              required
            >
              {servicesData.map((s) => (
                <option key={s.title} value={s.title}>
                  {s.title} (₦{Number(s.price).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Service Slot 2 */}
          <div className="app-input-group">
            <label className="app-label">Secondary Combo Service (Optional)</label>
            <select
              value={service2}
              onChange={(e) => setService2(e.target.value)}
              className="app-select"
            >
              <option value="">-- None (Single Service) --</option>
              {servicesData.map((s) => (
                <option key={s.title} value={s.title}>
                  {s.title} (₦{Number(s.price).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Specialist */}
          <div className="app-input-group">
            <label className="app-label">Preferred Artisan / Specialist</label>
            <select
              value={stylist}
              onChange={(e) => setStylist(e.target.value)}
              className="app-select"
            >
              {stylistsList.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="app-input-group">
            <label className="app-label">Appointment Date</label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="app-input"
              required
            />
          </div>

          {/* Time Picker */}
          <div className="app-input-group">
            <label className="app-label">Select Time Slot</label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.4rem',
              }}
            >
              {timeslots.map((ts) => (
                <button
                  type="button"
                  key={ts}
                  onClick={() => setTime(ts)}
                  style={{
                    padding: '0.55rem 0.2rem',
                    borderRadius: '8px',
                    border: time === ts ? 'none' : '1px solid var(--color-border)',
                    background: time === ts ? '#171717' : '#ffffff',
                    color: time === ts ? '#d4af37' : '#171717',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {ts}
                </button>
              ))}
            </div>
          </div>

          {/* Summary Price Footer */}
          <div
            style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              paddingTop: '1rem',
              marginTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', color: '#6b7280', fontFamily: 'Outfit', fontWeight: 700 }}>
                ESTIMATED TOTAL
              </span>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 900, color: '#171717' }}>
                ₦{Number(totalPrice).toLocaleString()}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="app-btn app-btn-primary"
              style={{ width: 'auto', padding: '0.8rem 1.5rem' }}
            >
              {submitting ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <AISpecialistMatcherSheet
        isOpen={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onApplyMatch={(match) => {
          if (match?.firstname) setStylist(match.firstname);
          if (match?.primaryService) setService1(match.primaryService);
          if (match?.secondaryService) setService2(match.secondaryService);
          showToast(`Matched with ${match.name}! Form pre-filled.`, 'success');
        }}
      />
    </PageContainer>
  );
};
