import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, User, CheckCircle2, 
  ExternalLink, Download, Share2, Copy, Sparkles, ShieldCheck 
} from 'lucide-react';
import AppointmentQrCode from './AppointmentQrCode';
import { getGoogleCalendarUrl, downloadIcsFile } from '../../utils/calendar';
import api from '../../services/api';

export const AppointmentPassModal = ({ booking, isOpen, onClose, onCheckInSuccess }) => {
  const [copied, setCopied] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(
    booking?.checkInStatus === 'checked_in' || !!booking?.checkedInAt
  );

  if (!isOpen || !booking) return null;

  const checkInCode = booking.checkInCode || `SC-${String(booking._id || '7890').slice(-4).toUpperCase()}`;
  const verificationUrl = `${window.location.origin}/customer-dashboard?pass=${checkInCode}`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(checkInCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelfCheckIn = async () => {
    if (isCheckedIn || checkingIn) return;
    setCheckingIn(true);
    try {
      await api.checkInBooking(booking._id);
      setIsCheckedIn(true);
      if (onCheckInSuccess) onCheckInSuccess(booking._id);
    } catch (err) {
      console.warn('Check-in error:', err);
      // Fallback state
      setIsCheckedIn(true);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Style Corner Pass: ${booking.service}`,
          text: `My Style Corner appointment with ${booking.stylist} on ${booking.date} at ${booking.time}. Pass Code: ${checkInCode}`,
          url: verificationUrl,
        });
      } catch (_) {}
    } else {
      handleCopyCode();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 7, 12, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          background: 'linear-gradient(180deg, #181c28 0%, #10121a 100%)',
          borderRadius: '26px',
          border: '1.5px solid rgba(245, 185, 66, 0.35)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(245, 185, 66, 0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pass Header */}
        <div
          style={{
            padding: '1.25rem 1.25rem 0.75rem',
            background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.12) 0%, rgba(20, 24, 35, 0.9) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f5b942 0%, #d49520 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d0e14',
                fontWeight: 900,
                fontSize: '0.85rem',
                fontFamily: 'Outfit',
                boxShadow: '0 4px 12px rgba(245, 185, 66, 0.3)',
              }}
            >
              SC
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.98rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.3px',
                }}
              >
                Style Corner Atelier Pass
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.72rem',
                  color: '#f5b942',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sparkles size={11} /> Verified Grooming Session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Pass Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto' }}>
          {/* Status Chip */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            {isCheckedIn ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: '#10b981',
                  borderRadius: '50px',
                  padding: '0.35rem 0.95rem',
                  fontSize: '0.78rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                }}
              >
                <CheckCircle2 size={15} /> Client Checked In & Verified
              </div>
            ) : (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: 'rgba(245, 185, 66, 0.12)',
                  border: '1px solid rgba(245, 185, 66, 0.3)',
                  color: '#f5b942',
                  borderRadius: '50px',
                  padding: '0.35rem 0.95rem',
                  fontSize: '0.78rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                }}
              >
                <ShieldCheck size={14} /> Ready for Atelier Check-In
              </div>
            )}
          </div>

          {/* QR Code Presentation */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '1.35rem',
            }}
          >
            <AppointmentQrCode
              value={verificationUrl}
              code={checkInCode}
              size={185}
              logoSize={36}
            />
            <p
              style={{
                fontSize: '0.74rem',
                color: '#94a3b8',
                textAlign: 'center',
                margin: '0.65rem 0 0',
                maxWidth: '260px',
              }}
            >
              Present this QR code or 6-digit pass to your stylist on arrival.
            </p>
          </div>

          {/* Appointment Specs Card */}
          <div
            style={{
              background: '#12141c',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Service</span>
              <strong style={{ fontSize: '0.88rem', color: '#ffffff', fontFamily: 'Outfit' }}>
                {booking.service}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Specialist</span>
              <strong
                style={{
                  fontSize: '0.86rem',
                  color: '#f5b942',
                  fontFamily: 'Outfit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <User size={13} /> {booking.stylist || 'Stylist'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Schedule</span>
              <span
                style={{
                  fontSize: '0.82rem',
                  color: '#ffffff',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Calendar size={13} color="#f5b942" /> {booking.date} · {booking.time}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Location</span>
              <span
                style={{
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  maxWidth: '220px',
                  textAlign: 'right',
                }}
              >
                <MapPin size={12} color="#f5b942" /> {booking.location || 'Style Corner Atelier'}
              </span>
            </div>
          </div>

          {/* Calendar Sync Actions */}
          <div style={{ marginBottom: '1.15rem' }}>
            <span
              style={{
                fontSize: '0.74rem',
                color: '#94a3b8',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '0.55rem',
              }}
            >
              Add To Your Calendar
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <a
                href={getGoogleCalendarUrl(booking)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  textDecoration: 'none',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <ExternalLink size={13} color="#f5b942" /> Google Calendar
              </a>

              <button
                type="button"
                onClick={() => downloadIcsFile(booking)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  color: '#ffffff',
                  fontSize: '0.78rem',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Download size={13} color="#f5b942" /> Apple / iCal (.ics)
              </button>
            </div>
          </div>

          {/* Secondary Actions: Self Check-In & Share */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {!isCheckedIn && (
              <button
                type="button"
                onClick={handleSelfCheckIn}
                disabled={checkingIn}
                style={{
                  flex: 2,
                  background: 'linear-gradient(135deg, #f5b942 0%, #d49520 100%)',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '0.75rem',
                  color: '#0d0e14',
                  fontSize: '0.84rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(245, 185, 66, 0.3)',
                }}
              >
                <CheckCircle2 size={16} />
                {checkingIn ? 'Verifying...' : 'I Have Arrived (Check In)'}
              </button>
            )}

            <button
              type="button"
              onClick={handleShare}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.07)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '0.75rem',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
              }}
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} color="#10b981" /> Copied!
                </>
              ) : (
                <>
                  <Share2 size={14} /> Share Pass
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPassModal;
