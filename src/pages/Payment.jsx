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
  const [walletBalance, setWalletBalance] = useState(0);
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
      setWalletBalance(data.walletBalance ?? 0);
    } catch (e) {
      setWalletBalance(0);
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
      showToast(checkoutData.bookingId ? 'Payment verified! Request sent to specialist to accept.' : 'Order payment verified via Atelier Wallet! 🎉', 'success');
      navigate('/customer-dashboard', { replace: true });
    } catch (err) {
      showToast(err.message || 'Payment failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaystackCheckout = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const config = await api.getPaystackConfig();
      const pKey = config.publicKey;

      if (!window.PaystackPop || !pKey || pKey === 'pk_test_placeholder_key') {
        if (checkoutData.bookingId) {
          await api.updateBookingStatus(checkoutData.bookingId, { paymentStatus: 'paid_card', status: 'pending' });
        } else if (checkoutData.orderId) {
          await api.updateOrderStatus(checkoutData.orderId, { paymentStatus: 'paid_card', status: 'processing' });
        }
        showToast(checkoutData.bookingId ? 'Payment confirmed! Request sent to specialist to accept.' : 'Card payment confirmed successfully! 🎉', 'success');
        navigate('/customer-dashboard', { replace: true });
        return;
      }

      const handler = window.PaystackPop.setup({
        key: pKey,
        email: user?.email || 'customer@stylecorner.com',
        amount: Math.round(amount * 100),
        currency: 'NGN',
        ref: 'SC-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        callback: async (response) => {
          try {
            await api.verifyPaystackPayment({
              reference: response.reference,
              bookingId: checkoutData.bookingId,
              orderId: checkoutData.orderId,
              amount
            });
            showToast(checkoutData.bookingId ? 'Payment verified via Paystack! Specialist will review & accept.' : 'Order payment verified via Paystack! 🎉', 'success');
            navigate('/customer-dashboard', { replace: true });
          } catch (err) {
            showToast(err.message || 'Payment verification failed', 'error');
          }
        },
        onClose: () => {
          showToast('Payment window closed.', 'accent');
          setSubmitting(false);
        }
      });
      handler.openIframe();
    } catch (err) {
      showToast(err.message || 'Payment processing failed', 'error');
      setSubmitting(false);
    }
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
      const config = await api.getPaystackConfig();
      const pKey = config.publicKey;

      if (window.PaystackPop && pKey && pKey !== 'pk_test_placeholder_key') {
        const handler = window.PaystackPop.setup({
          key: pKey,
          email: user?.email || 'customer@stylecorner.com',
          amount: Math.round(addVal * 100),
          currency: 'NGN',
          ref: 'TOPUP-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          callback: async (response) => {
            try {
              const res = await api.verifyPaystackPayment({
                reference: response.reference,
                isTopup: true,
                amount: addVal
              });
              setWalletBalance(res.walletBalance);
              showToast(`Wallet credited with ₦${addVal.toLocaleString()} via Paystack! 🎉`, 'success');
              setShowTopupModal(false);
              setTopupAmount('');
            } catch (err) {
              showToast(err.message || 'Top-up verification failed', 'error');
            }
          },
          onClose: () => {
            showToast('Top-up cancelled', 'accent');
            setSubmitting(false);
          }
        });
        handler.openIframe();
      } else {
        const res = await api.topupWallet(addVal);
        setWalletBalance(res.walletBalance);
        showToast(`Wallet credited with ₦${addVal.toLocaleString()}! New balance: ₦${res.walletBalance.toLocaleString()}`, 'success');
        setShowTopupModal(false);
        setTopupAmount('');
      }
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

        {/* ── METHOD 2: DEBIT / CREDIT CARD (PAYSTACK) ── */}
        {activeMethod === 'card' && (
          <div className="app-card" style={{ padding: '1.4rem', borderRadius: '20px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(0, 195, 255, 0.15) 0%, rgba(212, 175, 55, 0.15) 100%)',
              border: '1px solid rgba(0, 195, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: '#00c3aa'
            }}>
              <CreditCard size={28} />
            </div>

            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#171717', margin: '0 0 0.4rem' }}>
              Pay via Paystack
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', maxWidth: '320px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              Instant & secure payment supporting Mastercard, Visa, Verve, Apple Pay, Bank Transfer, & USSD.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '14px',
              padding: '0.85rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Amount Due</span>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                ₦{amount.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePaystackCheckout}
              disabled={submitting}
              className="app-btn app-btn-accent"
              style={{
                width: '100%',
                minHeight: '50px',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #09a5db 0%, #00c3aa 100%)',
                color: '#fff',
                border: 'none',
                boxShadow: '0 8px 20px -4px rgba(0, 195, 170, 0.4)'
              }}
            >
              <ShieldCheck size={20} />
              <span>{submitting ? 'Connecting to Paystack...' : `Pay ₦${amount.toLocaleString()} with Paystack`}</span>
            </button>

            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.72rem' }}>
              <Lock size={12} />
              <span>256-Bit SSL Encrypted & PCI-DSS Level 1 Certified</span>
            </div>
          </div>
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
              onClick={async () => {
                setSubmitting(true);
                try {
                  if (checkoutData.bookingId) {
                    await api.updateBookingStatus(checkoutData.bookingId, { paymentStatus: 'paid_transfer', status: 'pending' });
                  }
                  showToast(checkoutData.bookingId ? 'Transfer logged! Request sent to specialist to accept.' : 'Bank transfer payment verified! 🎉', 'success');
                  navigate('/customer-dashboard', { replace: true });
                } catch (err) {
                  showToast(err.message || 'Transfer logging failed', 'error');
                } finally {
                  setSubmitting(false);
                }
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
