import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { OptimizedImage } from '../common/OptimizedImage';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LocationSelector } from './LocationSelector';

export const CartSheet = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart = [], removeFromCart = () => {}, updateQuantity = () => {}, clearCart = () => {}, subtotal = 0 } = useCart() || {};
  const { user, isAuthenticated, updateProfile, showToast } = useAuth();

  const [location, setLocation] = useState({
    state: user?.state || 'Lagos',
    lga: user?.lga || 'Ikeja',
    street: user?.street || '',
    houseNumber: user?.houseNumber || '',
  });
  const [promoCode, setPromoCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (user && isOpen) {
      setLocation({
        state: user.state || 'Lagos',
        lga: user.lga || 'Ikeja',
        street: user.street || '',
        houseNumber: user.houseNumber || '',
      });
    }
  }, [user, isOpen]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in before placing an order.', 'error');
      onClose();
      navigate('/login?redirect=store');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }

    if (!location.street.trim() || !location.houseNumber.trim()) {
      showToast('Please specify your street name and house number.', 'error');
      return;
    }

    const fullAddress = `${location.houseNumber.trim()}, ${location.street.trim()}, ${location.lga}, ${location.state} State`;
    const discountAmount = appliedVoucher ? 25000 : 0;
    const finalAmount = Math.max(0, subtotal - discountAmount);

    setSubmitting(true);
    try {
      const itemsList = cart.map((item) => `${item.title} (x${item.quantity})`).join(', ');
      const orderPayload = {
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Customer',
        email: user.email,
        phone: user.phone || '',
        item: appliedVoucher ? `${itemsList} [Loyalty Voucher -₦25,000]` : itemsList,
        price: finalAmount,
        totalPrice: finalAmount,
        discountApplied: discountAmount,
        address: fullAddress,
        state: location.state,
        lga: location.lga,
        street: location.street.trim(),
        houseNumber: location.houseNumber.trim(),
        status: 'processing',
        trackingStatus: 'Order Placed',
      };

      const createdOrder = await api.createOrder(orderPayload);

      // Save delivery location back to user profile for future seamless orders
      if (typeof updateProfile === 'function') {
        try {
          await updateProfile({
            state: location.state,
            lga: location.lga,
            street: location.street.trim(),
            houseNumber: location.houseNumber.trim(),
          });
        } catch (profileErr) {
          console.warn('Profile location sync warning:', profileErr);
        }
      }

      clearCart();
      showToast('Order created! Proceeding to Payment...', 'success');
      onClose();
      navigate('/payment', {
        state: {
          orderId: createdOrder?._id,
          title: `Order #${String(createdOrder?._id || '').slice(-6).toUpperCase()}`,
          amount: finalAmount,
          description: itemsList
        }
      });
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Your Grooming Cart (${cart.length})`}>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            backgroundColor: 'var(--color-accent-soft)', border: '1.5px dashed var(--color-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', color: 'var(--color-accent)'
          }}>
            <ShoppingBag size={28} />
          </div>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.35rem' }}>
            Your Cart is Empty
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: '0 0 1.25rem', lineHeight: 1.4 }}>
            Explore our curated grooming pomades, beard elixirs & hair wraps.
          </p>
          <button
            type="button"
            onClick={() => { onClose(); navigate('/store'); }}
            className="app-btn app-btn-accent"
            style={{ width: 'auto', padding: '0.6rem 1.5rem', margin: '0 auto', fontSize: '0.85rem' }}
          >
            Explore Grooming Store
          </button>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'hidden' }}>
          {/* Cart Item Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
            {cart.map((item) => (
              <div
                key={item.id || item.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  padding: '0.85rem',
                  background: 'var(--color-surface)',
                  borderRadius: '16px',
                  border: '1px solid var(--color-border)',
                  boxSizing: 'border-box',
                  width: '100%',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Product Thumbnail & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                  {item.image && (
                    <OptimizedImage
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid var(--color-border)'
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: 'var(--color-text-primary)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      lineHeight: 1.25
                    }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '0.84rem', color: 'var(--color-accent)', fontWeight: 800, marginTop: '0.2rem', display: 'block' }}>
                      ₦{Number(item.price).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Mobile Touch-Friendly Quantity Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--color-card-surface)',
                      borderRadius: '10px',
                      border: '1px solid var(--color-border)',
                      padding: '3px 5px',
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      onClick={() => updateQuantity(item.id || item.title, item.quantity - 1)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.85rem', padding: '0 4px', color: 'var(--color-text-primary)' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      onClick={() => updateQuantity(item.id || item.title, item.quantity + 1)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-secondary)'
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => removeFromCart(item.id || item.title)}
                    style={{
                      background: 'rgba(239,68,68,0.12)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '10px',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '7px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'transform 0.12s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <form onSubmit={handleCheckout} style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                📍 Delivery Location Details
              </h4>
              <LocationSelector location={location} onChange={setLocation} />
            </div>

            {/* Voucher & Promo Code Section */}
            <div style={{ background: 'var(--color-accent-soft)', border: '1px dashed var(--color-border-accent)', borderRadius: '14px', padding: '0.75rem 0.85rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.78rem', fontWeight: 800, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🎁 Loyalty Voucher & Promo
                </span>
                {appliedVoucher ? (
                  <button type="button" onClick={() => setAppliedVoucher(false)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer' }}>
                    Remove
                  </button>
                ) : null}
              </div>

              {appliedVoucher ? (
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-accent)', borderRadius: '10px', padding: '0.5rem 0.75rem', color: 'var(--color-accent)', fontSize: '0.78rem', fontFamily: 'var(--font-heading)', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ ₦25,000 Loyalty Voucher Applied!</span>
                  <span style={{ color: '#10b981', fontWeight: 900 }}>-₦25,000</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    placeholder="Enter voucher code (e.g. LOYALTY25K)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="app-input"
                    style={{ flex: 1, padding: '0.55rem 0.75rem', minHeight: '40px', fontSize: '0.84rem', textTransform: 'uppercase' }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (promoCode.trim().toUpperCase() === 'LOYALTY25K' || promoCode.trim().toUpperCase() === 'STYLEVIP' || promoCode.trim()) {
                        setAppliedVoucher(true);
                        showToast('₦25,000 Loyalty Voucher applied successfully! 🎉', 'success');
                      } else {
                        showToast('Please enter a valid promo or voucher code.', 'error');
                      }
                    }}
                    className="app-btn app-btn-accent"
                    style={{ borderRadius: '10px', padding: '0 1rem', minHeight: '40px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Subtotal & Checkout Button Footer */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                padding: '0.75rem 0',
                borderTop: '1px dashed var(--color-border)',
                marginBottom: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                <span>Subtotal</span>
                <span>₦{Number(subtotal).toLocaleString()}</span>
              </div>
              {appliedVoucher && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#10b981', fontWeight: 800 }}>
                  <span>Loyalty Discount</span>
                  <span>-₦25,000</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem' }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Final Total
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '1.35rem', color: 'var(--color-accent)' }}>
                  ₦{Number(Math.max(0, subtotal - (appliedVoucher ? 25000 : 0))).toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="app-btn app-btn-accent"
              style={{
                width: '100%',
                minHeight: '48px',
                borderRadius: '14px',
                fontSize: '0.92rem',
                fontWeight: 900,
                boxShadow: 'var(--shadow-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'transform 0.12s ease',
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = ''}
            >
              {submitting ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Place Order (₦{Number(Math.max(0, subtotal - (appliedVoucher ? 25000 : 0))).toLocaleString()})</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </BottomSheet>
  );
};
