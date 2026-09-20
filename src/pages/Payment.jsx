import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Wallet, CreditCard, Landmark, ShieldCheck, CheckCircle2, Lock, ArrowLeft, Plus, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, user } = useAuth();

  const checkoutData = location.state || {
    title: 'Grooming Store Checkout',
    amount: 0,
    description: 'Style Corner Atelier Order',
  };

  const isTopup = Boolean(checkoutData.isTopup || checkoutData.title === 'Wallet Funding');
  const amount = Number(checkoutData.amount || checkoutData.totalPrice || 0);
  const [activeMethod, setActiveMethod] = useState(isTopup ? 'card' : 'wallet'); // 'wallet' | 'card' | 'transfer'

  // Wallet State
  const [walletBalance, setWalletBalance] = useState(0);
  const [topupAmount, setTopupAmount] = useState('');
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Card State
  const [cardHolder, setCardHolder] = useState(`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Cardholder Name');
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

      if (!window.PaystackPop || !pKey) {
        showToast('Paystack payment gateway is not loaded. Please refresh or check your internet connection.', 'error');
        setSubmitting(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: pKey,
        email: user?.email || 'customer@stylecorner.com',
        amount: Math.round(amount * 100),
        currency: 'NGN',
        ref: 'SC-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        callback: function(response) {
          (async () => {
            try {
              await api.verifyPaystackPayment({
                reference: response.reference,
                bookingId: checkoutData.bookingId,
                orderId: checkoutData.orderId,
                isTopup,
                amount
              });
              if (isTopup) {
                showToast(`Wallet credited with ₦${amount.toLocaleString()} via Paystack! 🎉`, 'success');
                navigate('/wallet', { replace: true });
              } else {
                showToast(checkoutData.bookingId ? 'Payment verified via Paystack! Specialist will review & accept.' : 'Order payment verified via Paystack! 🎉', 'success');
                navigate('/customer-dashboard', { replace: true });
              }
            } catch (err) {
              showToast(err.message || 'Payment verification failed', 'error');
              setSubmitting(false);
            }
          })();
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

      if (!window.PaystackPop || !pKey) {
        showToast('Paystack gateway is currently unavailable. Please try again shortly.', 'error');
        setSubmitting(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: pKey,
        email: user?.email || 'customer@stylecorner.com',
        amount: Math.round(addVal * 100),
        currency: 'NGN',
        ref: 'TOPUP-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        callback: function(response) {
          (async () => {
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
            } finally {
              setSubmitting(false);
            }
          })();
        },
        onClose: () => {
          showToast('Top-up cancelled', 'accent');
          setSubmitting(false);
        }
      });
      handler.openIframe();
    } catch (err) {
      showToast(err.message || 'Top-up failed', 'error');
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Secure Checkout Payment">
      <div style={{ maxWidth: '460px', margin: '0 auto', paddingBottom: '2rem' }}>
        
        {/* Order Summary Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, #151822 0%, #0C0E14 100%)',
            borderRadius: '24px',
            padding: '1.35rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(245,185,66,0.25)',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.65rem', fontFamily: 'Outfit', fontWeight: 800, color: '#F5B942', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                SUMMARY RECEIPT
              </span>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, margin: '0.25rem 0 0', color: '#FFFFFF' }}>
                {checkoutData.title || 'Style Corner Checkout'}
              </h3>
              <p style={{ color: '#9AA2B3', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>
                {checkoutData.description || 'Verified Atelier Service / Order'}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.65rem', color: '#9AA2B3', display: 'block', fontWeight: 700 }}>PAYABLE</span>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 900, color: '#F5B942' }}>
                ₦{amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', padding: '0.45rem 0.85rem', fontSize: '0.72rem', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            <Lock size={12} /> 256-bit Bank Grade Encrypted Payment
          </div>
        </div>

        {/* Payment Methods Selector Tabs */}
        <div style={{ display: 'flex', background: '#151822', borderRadius: '16px', padding: '4px', gap: '4px', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            ...(!isTopup ? [{ id: 'wallet', label: '₦ Wallet', icon: Wallet }] : []),
            { id: 'card', label: 'Card / Paystack', icon: CreditCard },
            { id: 'transfer', label: 'Bank Transfer', icon: Landmark },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMethod(m.id)}
              style={{
                flex: 1, padding: '0.65rem 0.2rem', borderRadius: '12px', border: 'none',
                fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: activeMethod === m.id ? '#F5B942' : 'transparent',
                color: activeMethod === m.id ? '#0C0E14' : '#9AA2B3',
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
          <div style={{ background: '#151822', borderRadius: '24px', padding: '1.35rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(245,185,66,0.2)', borderRadius: '18px', padding: '1.15rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 700, color: '#9AA2B3', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Wallet size={15} color="#F5B942" /> Atelier Wallet Balance
                </span>
                <button
                  type="button"
                  onClick={() => setShowTopupModal(true)}
                  style={{
                    background: 'rgba(245,185,66,0.12)', border: '1px solid rgba(245,185,66,0.3)',
                    color: '#F5B942', padding: '0.3rem 0.75rem', borderRadius: '50px',
                    fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}
                >
                  <Plus size={12} /> Top Up
                </button>
              </div>

              <div style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#F5B942' }}>
                ₦{walletBalance.toLocaleString()}
              </div>

              {walletBalance < amount ? (
                <div style={{ marginTop: '0.5rem', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700 }}>
                  ⚠️ Insufficient balance. Tap Top Up to add funds!
                </div>
              ) : (
                <div style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.75rem', fontWeight: 700 }}>
                  ✓ Sufficient balance — instant 1-tap checkout ready.
                </div>
              )}
            </div>

            <button
              onClick={handleWalletPay}
              disabled={submitting}
              style={{ width: '100%', padding: '1rem', borderRadius: '16px', background: '#F5B942', color: '#0C0E14', fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}
            >
              {submitting ? 'Verifying...' : `Pay ₦${amount.toLocaleString()} from Wallet`}
            </button>
          </div>
        )}

        {/* ── METHOD 2: DEBIT / CREDIT CARD (PAYSTACK) ── */}
        {activeMethod === 'card' && (
          <div style={{ background: '#151822', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(9,165,219,0.12)',
              border: '1px solid rgba(9,165,219,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', color: '#09a5db'
            }}>
              <CreditCard size={28} />
            </div>

            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.4rem' }}>
              Pay via Paystack
            </h3>
            <p style={{ color: '#9AA2B3', fontSize: '0.82rem', maxWidth: '300px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              Secure payment — Mastercard, Visa, Verve, Apple Pay, Bank Transfer & USSD.
            </p>

            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px', padding: '0.85rem 1rem', marginBottom: '1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#9AA2B3', fontWeight: 600 }}>Amount Due</span>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>
                ₦{amount.toLocaleString()}
              </span>
            </div>

            <button
              type="button" onClick={handlePaystackCheckout} disabled={submitting}
              style={{
                width: '100%', padding: '1rem', borderRadius: '16px', fontSize: '0.95rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #09a5db 0%, #00c3aa 100%)',
                color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              <ShieldCheck size={20} />
              <span>{submitting ? 'Connecting...' : `Pay ₦${amount.toLocaleString()} with Paystack`}</span>
            </button>

            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.72rem' }}>
              <Lock size={12} />
              <span>256-Bit SSL Encrypted & PCI-DSS Certified</span>
            </div>
          </div>
        )}

        {/* ── METHOD 3: BANK TRANSFER / USSD ── */}
        {activeMethod === 'transfer' && (
          <div style={{ background: '#151822', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(245,185,66,0.1)',
              border: '1px solid rgba(245,185,66,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
            }}>
              <Landmark size={28} color="#F5B942" />
            </div>

            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem' }}>
              Bank Transfer & USSD
            </h3>
            <p style={{ color: '#9AA2B3', fontSize: '0.82rem', maxWidth: '300px', margin: '0 auto 1.25rem', lineHeight: 1.5 }}>
              Pay via bank transfer, USSD, or mobile banking — powered by Paystack.
            </p>

            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#9AA2B3', fontWeight: 600 }}>Amount Due</span>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>
                ₦{amount.toLocaleString()}
              </span>
            </div>

            <button
              type="button" onClick={handlePaystackCheckout} disabled={submitting}
              style={{
                width: '100%', padding: '1rem', borderRadius: '16px', fontSize: '0.95rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #F5B942 0%, #d4941a 100%)',
                color: '#0C0E14', border: 'none', cursor: 'pointer',
              }}
            >
              <Landmark size={20} />
              <span>{submitting ? 'Opening Paystack...' : `Pay ₦${amount.toLocaleString()} via Paystack`}</span>
            </button>

            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.72rem' }}>
              <Lock size={12} />
              <span>GTBank, UBA, Zenith, Access & all major banks supported</span>
            </div>
          </div>
        )}
      </div>

      {/* Top-Up Wallet Modal Form */}
      {showTopupModal && (
        <div
          onClick={() => setShowTopupModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#151822', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '1.5rem', width: '100%', maxWidth: '400px' }}
          >
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.3rem' }}>
              💳 Top Up Atelier Wallet
            </h3>
            <p style={{ color: '#9AA2B3', fontSize: '0.8rem', margin: '0 0 1.1rem' }}>
              Credit your digital wallet for instant 1-tap checkout.
            </p>

            <form onSubmit={handleTopUpSubmit}>
              {/* Quick Chip Selection */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {[5000, 10000, 20000, 50000].map((chip) => (
                  <button
                    type="button" key={chip}
                    onClick={() => setTopupAmount(String(chip))}
                    style={{
                      flex: 1, minWidth: '70px', padding: '0.5rem 0.3rem', borderRadius: '10px',
                      border: topupAmount === String(chip) ? '1.5px solid #F5B942' : '1px solid rgba(255,255,255,0.1)',
                      background: topupAmount === String(chip) ? '#F5B942' : 'rgba(255,255,255,0.04)',
                      color: topupAmount === String(chip) ? '#0C0E14' : '#FFFFFF',
                      fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer'
                    }}
                  >
                    +₦{chip.toLocaleString()}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Top Up Amount (₦)</label>
                <input
                  type="number" placeholder="e.g. 20000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                    background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '0.95rem', outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button" onClick={() => setShowTopupModal(false)}
                  style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: '#FFFFFF', fontFamily: 'Outfit', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  style={{ flex: 1, padding: '0.85rem', borderRadius: '14px', background: '#F5B942', color: '#0C0E14', fontFamily: 'Outfit', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
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
