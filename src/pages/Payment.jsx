import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';

export const Payment = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      showToast('Payment verified successfully!', 'success');
      setSubmitting(false);
      navigate('/customer-dashboard');
    }, 1000);
  };

  return (
    <PageContainer title="Secure Payment">
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <form onSubmit={handlePay} className="app-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(212,175,55,0.15)',
                color: '#d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717' }}>
                Encrypted Checkout
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>256-bit SSL secured transaction</p>
            </div>
          </div>

          <div className="app-input-group">
            <label className="app-label">Cardholder Name</label>
            <input
              type="text"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              placeholder="Alex Morgan"
              className="app-input"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Card Number</label>
            <input
              type="text"
              maxLength={19}
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="4532 •••• •••• 8910"
              className="app-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="app-input-group">
              <label className="app-label">Expiry (MM/YY)</label>
              <input
                type="text"
                maxLength={5}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="12/28"
                className="app-input"
                required
              />
            </div>

            <div className="app-input-group">
              <label className="app-label">CVV</label>
              <input
                type="password"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                className="app-input"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="app-btn app-btn-accent" style={{ marginTop: '0.5rem' }}>
            <ShieldCheck size={18} />
            <span>{submitting ? 'Processing Payment...' : 'Confirm Payment'}</span>
          </button>
        </form>
      </div>
    </PageContainer>
  );
};
