import React, { useState } from 'react';
import { 
  X, QrCode, Search, CheckCircle2, AlertCircle, 
  User, Calendar, Clock, Sparkles, ShieldCheck 
} from 'lucide-react';
import api from '../../services/api';

export const CheckInScannerModal = ({ isOpen, onClose, onCheckInComplete }) => {
  const [passCode, setPassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verifiedBooking, setVerifiedBooking] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = passCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a valid 6-character pass code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setVerifiedBooking(null);

    try {
      // Normalize code (auto-prepend SC- if user only entered the 4 letters/digits)
      const formattedCode = cleanCode.startsWith('SC-') ? cleanCode : `SC-${cleanCode}`;
      const res = await api.verifyCheckIn({ code: formattedCode });
      
      if (res && res.booking) {
        setVerifiedBooking(res.booking);
        setSuccessMsg(res.message || 'Client check-in verified successfully!');
        if (onCheckInComplete) onCheckInComplete(res.booking);
      } else {
        setErrorMsg('Booking not found with this code.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify check-in code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPassCode('');
    setVerifiedBooking(null);
    setErrorMsg('');
    setSuccessMsg('');
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
        className="keep-white"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'linear-gradient(180deg, #181c28 0%, #10121a 100%)',
          borderRadius: '24px',
          border: '1.5px solid rgba(245, 185, 66, 0.3)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem',
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
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(245, 185, 66, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f5b942',
              }}
            >
              <QrCode size={20} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '0.98rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  color: '#ffffff',
                }}
              >
                Atelier Check-In Desk
              </h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8' }}>
                Verify client pass & confirm salon arrival
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
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem' }}>
          {!verifiedBooking ? (
            <form onSubmit={handleVerify}>
              <label
                style={{
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                Enter Client 6-Character Pass Code:
              </label>

              <div style={{ display: 'flex', gap: '0.55rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="e.g. SC-7492 or 7492"
                  value={passCode}
                  onChange={(e) => setPassCode(e.target.value.toUpperCase())}
                  className="app-input"
                  style={{
                    flex: 1,
                    textTransform: 'uppercase',
                    fontSize: '1rem',
                    letterSpacing: '1px',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !passCode.trim()}
                  className="app-btn app-btn-accent"
                  style={{
                    borderRadius: '14px',
                    padding: '0 1.25rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                  }}
                >
                  {loading ? 'Checking...' : 'Verify'}
                </button>
              </div>

              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.78rem',
                    marginBottom: '1rem',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px dashed rgba(255, 255, 255, 0.1)',
                  borderRadius: '14px',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <p style={{ margin: '0 0 0.3rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                  Ask the client to open their <strong>Style Corner Pass</strong> on their phone.
                </p>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b' }}>
                  Codes start with <strong>SC-</strong> followed by 4 characters.
                </p>
              </div>
            </form>
          ) : (
            <div>
              {/* Success Confirmation Card */}
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '16px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <CheckCircle2 size={24} color="#10b981" style={{ flexShrink: 0 }} />
                <div>
                  <h4
                    style={{
                      margin: 0,
                      color: '#10b981',
                      fontSize: '0.92rem',
                      fontFamily: 'Outfit',
                      fontWeight: 800,
                    }}
                  >
                    Arrival Verified!
                  </h4>
                  <p style={{ margin: 0, color: '#a7f3d0', fontSize: '0.76rem' }}>
                    {successMsg}
                  </p>
                </div>
              </div>

              {/* Verified Client Booking Details */}
              <div
                style={{
                  background: '#12141c',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Client</span>
                  <strong style={{ fontSize: '0.88rem', color: '#ffffff', fontFamily: 'Outfit' }}>
                    {verifiedBooking.clientName}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Service</span>
                  <strong style={{ fontSize: '0.88rem', color: '#f5b942', fontFamily: 'Outfit' }}>
                    {verifiedBooking.service}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Assigned Stylist</span>
                  <span style={{ fontSize: '0.84rem', color: '#ffffff' }}>
                    {verifiedBooking.stylist}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Time Slot</span>
                  <span style={{ fontSize: '0.84rem', color: '#ffffff' }}>
                    {verifiedBooking.date} at {verifiedBooking.time}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Payment Status</span>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      color: verifiedBooking.paymentStatus === 'paid' ? '#10b981' : '#f5b942',
                    }}
                  >
                    {verifiedBooking.paymentStatus === 'paid' ? '✓ PAID' : 'PENDING PAYMENT'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  className="app-btn app-btn-outline"
                  style={{ flex: 1, borderRadius: '14px', fontSize: '0.82rem' }}
                >
                  Verify Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="app-btn app-btn-accent"
                  style={{ flex: 1, borderRadius: '14px', fontSize: '0.82rem' }}
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckInScannerModal;
