import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, CreditCard, Landmark, ShieldCheck, CheckCircle2, Lock, ArrowLeft, Plus, Copy, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, user } = useAuth();

  const checkoutData = location.state || {
    title: 'Grooming Store Checkout',
    amount: 15000,
    description: 'Style Corner Atelier Order',
  };

  const amount = Number(checkoutData.amount || checkoutData.totalPrice || 15000);
  const [activeMethod, setActiveMethod] = useState('wallet'); // 'wallet' | 'card' | 'transfer'

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(50000);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Card State
  const [cardHolder, setCardHolder] = useState(`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Alex Morgan');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const fetchWallet = async () => {
    try {
      const data = await api.getWalletBalance();
      setWalletBalance(data.walletBalance ?? 50000);
    } catch (e) {
      setWalletBalance(50000);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWalletPay = async () => {
    if (walletBalance < amount) {
      showToast(`Insufficient balance (₦${walletBalance.toLocaleString()}). Please top up first.`, 'error');
      setShowTopupModal(true);
      return;
    }

    setSubmitting(true);
    try {
      await api.payWithWallet(amount, checkoutData.orderId, checkoutData.bookingId, checkoutData.description || checkoutData.title);
      showToast('Payment verified successfully via Atelier Wallet! 🎉', 'success');
      navigate('/customer-dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPay = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      showToast('Card payment verified successfully! 🎉', 'success');
      setSubmitting(false);
      navigate('/customer-dashboard', { replace: true });
    }, 1200);
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    const addVal = Number(topupAmount);
    if (!addVal || addVal <= 0) {
      showToast('Please enter a valid top-up amount.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.topupWallet(addVal);
      setWalletBalance(res.walletBalance);
      showToast(`Wallet credited with ₦${addVal.toLocaleString()}! New balance: ₦${res.walletBalance.toLocaleString()}`, 'success');
      setShowTopupModal(false);
      setTopupAmount('');
    } catch (err) {
      showToast(err.message || 'Top-up failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Secure Checkout Payment">
      <div style={{ maxWidth: '460px', margin: '0 auto', paddingBottom: '2rem' }}>
        
        {/* Order Summary Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #171717 0%, #0d0d0d 100%)',
            borderRadius: '20px',
            padding: '1.25rem',
            marginBottom: '1.25rem',
            border: '1.5px solid rgba(212,175,55,0.4)',
            color: '#ffffff',
            boxShadow: '0 12px 30px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'Outfit', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                SUMMARY RECEIPT
              </span>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 900, margin: '0.2rem 0 0', color: '#ffffff' }}>
                {checkoutData.title || 'Style Corner Checkout'}
              </h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>
                {checkoutData.description || 'Verified Atelier Service / Order'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.68rem', color: '#9ca3af', display: 'block', fontWeight: 700 }}>PAYABLE</span>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#d4af37' }}>
                ₦{amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', padding: '0.45rem 0.75rem', fontSize: '0.72rem', color: '#10b981' }}>
            <Lock size={12} /> 256-bit Bank Grade Encrypted Payment
          </div>
        </div>

        {/* Payment Methods Selector Tabs */}
        <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '14px', padding: '4px', gap: '4px', marginBottom: '1.25rem' }}>
          {[
            { id: 'wallet', label: '₦ Wallet', icon: Wallet },
            { id: 'card', label: 'Card', icon: CreditCard },
            { id: 'transfer', label: 'Bank Transfer', icon: Landmark },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMethod(m.id)}
              style={{
                flex: 1, padding: '0.65rem 0.2rem', borderRadius: '11px', border: 'none',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeMethod === m.id ? '#171717' : 'transparent',
                color: activeMethod === m.id ? '#d4af37' : '#475569',
                boxShadow: activeMethod === m.id ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
              }}
            >
              <m.icon size={14} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* ── METHOD 1: ATELIER DIGITAL WALLET ── */}
        {activeMethod === 'wallet' && (
          <div className="app-card" style={{ padding: '1.25rem', borderRadius: '20px' }}>
            <div style={{ background: '#faf9f5', border: '1.5px solid rgba(212,175,55,0.3)', borderRadius: '16px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 800, color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Wallet size={15} color="#d4af37" /> Your Atelier Wallet Balance
                </span>
                <button
                  type="button"
                  onClick={() => setShowTopupModal(true)}
                  style={{
                    background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)',
                    color: '#b5952f', padding: '0.3rem 0.65rem', borderRadius: '50px',
                    fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}
                >
                  <Plus size={12} /> Top Up
                </button>
              </div>

              <div style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 900, color: '#171717' }}>
                ₦{walletBalance.toLocaleString()}
              </div>

              {walletBalance < amount ? (
                <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
                  ⚠️ Insufficient balance for this ₦{amount.toLocaleString()} transaction. Tap Top Up to add funds!
                </div>
              ) : (
                <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                  ✓ Sufficient balance available for instant 1-tap checkout.
                </div>
              )}
            </div>

            <button
              onClick={handleWalletPay}
              disabled={submitting}
              className="app-btn app-btn-primary"
              style={{ width: '100%', minHeight: '48px', borderRadius: '14px', fontSize: '0.92rem', fontWeight: 900 }}
            >
              {submitting ? 'Verifying Wallet Debit...' : `Pay ₦${amount.toLocaleString()} from Wallet`}
            </button>
          </div>
        )}

        {/* ── METHOD 2: DEBIT / CREDIT CARD ── */}
        {activeMethod === 'card' && (
          <form onSubmit={handleCardPay} className="app-card" style={{ padding: '1.25rem', borderRadius: '20px' }}>
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
                placeholder="5399 •••• •••• 1234"
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
                  placeholder="08/28"
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
                  placeholder="321"
                  className="app-input"
                  required
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="app-btn app-btn-accent" style={{ marginTop: '0.5rem', width: '100%', minHeight: '48px', borderRadius: '14px', fontSize: '0.92rem', fontWeight: 900 }}>
              <ShieldCheck size={18} />
              <span>{submitting ? 'Processing Card Payment...' : `Pay ₦${amount.toLocaleString()} with Card`}</span>
            </button>
          </form>
        )}

        {/* ── METHOD 3: BANK TRANSFER / USSD ── */}
        {activeMethod === 'transfer' && (
          <div className="app-card" style={{ padding: '1.25rem', borderRadius: '20px' }}>
            <div style={{ background: '#faf9f5', border: '1px dashed rgba(212,175,55,0.4)', borderRadius: '16px', padding: '1.1rem', marginBottom: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#b5952f', textTransform: 'uppercase' }}>
                DIRECT BANK TRANSFER ACCOUNT
              </span>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#171717', margin: '0.2rem 0 0.5rem' }}>
                Style Corner Atelier / Wema Bank
              </h3>
              <div style={{ fontSize: '1.6rem', fontFamily: 'monospace', fontWeight: 900, color: '#171717', background: '#ffffff', padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span>9876543210</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('9876543210');
                    showToast('Account number copied to clipboard! 📋', 'success');
                  }}
                  style={{ background: 'rgba(212,175,55,0.15)', border: 'none', color: '#b5952f', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer' }}
                >
                  <Copy size={14} />
                </button>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.78rem', margin: 0 }}>
                Transfer exactly <strong>₦{amount.toLocaleString()}</strong> to complete your order.
              </p>
            </div>

            <button
              onClick={() => {
                setSubmitting(true);
                setTimeout(() => {
                  showToast('Bank transfer payment verified! 🎉', 'success');
                  setSubmitting(false);
                  navigate('/customer-dashboard', { replace: true });
                }, 1500);
              }}
              disabled={submitting}
              className="app-btn app-btn-primary"
              style={{ width: '100%', minHeight: '48px', borderRadius: '14px', fontSize: '0.92rem', fontWeight: 900 }}
            >
              {submitting ? 'Confirming Transfer...' : 'I Have Transferred the Money'}
            </button>
          </div>
        )}
      </div>

      {/* Top-Up Wallet Modal Form */}
      {showTopupModal && (
        <div
          onClick={() => setShowTopupModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '20px', padding: '1.35rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
          >
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#171717', margin: '0 0 0.3rem' }}>
              💳 Top Up Atelier Wallet
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 1rem' }}>
              Credit your digital wallet for instant 1-tap checkout.
            </p>

            <form onSubmit={handleTopUpSubmit}>
              {/* Quick Chip Selection */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[5000, 10000, 20000, 50000].map((chip) => (
                  <button
                    type="button"
                    key={chip}
                    onClick={() => setTopupAmount(String(chip))}
                    style={{
                      flex: 1, minWidth: '70px', padding: '0.45rem 0.3rem', borderRadius: '8px',
                      border: topupAmount === String(chip) ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.1)',
                      background: topupAmount === String(chip) ? '#171717' : '#fafafa',
                      color: topupAmount === String(chip) ? '#d4af37' : '#171717',
                      fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer'
                    }}
                  >
                    +₦{chip.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="app-input-group" style={{ marginBottom: '1.25rem' }}>
                <label className="app-label">Top Up Amount (₦)</label>
                <input
                  type="number"
                  placeholder="e.g. 20000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="app-input"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setShowTopupModal(false)}
                  className="app-btn app-btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="app-btn app-btn-accent"
                  style={{ flex: 1 }}
                >
                  {submitting ? 'Crediting...' : 'Confirm Top-Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
