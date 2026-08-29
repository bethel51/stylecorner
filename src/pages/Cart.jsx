import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowLeft,
  Tag,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LocationSelector } from '../components/store/LocationSelector';

export const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
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

  useEffect(() => {
    if (user) {
      setLocation({
        state: user.state || 'Lagos',
        lga: user.lga || 'Ikeja',
        street: user.street || '',
        houseNumber: user.houseNumber || '',
      });
    }
  }, [user]);

  const discountAmount = appliedVoucher ? 25000 : 0;
  const finalAmount = Math.max(0, subtotal - discountAmount);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in before placing an order.', 'error');
      navigate('/login?redirect=%2Fcart');
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

      // Save delivery location back to user profile
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
    <PageContainer title={`Grooming Cart (${cart.length})`} showBack={true}>
      <div style={{ maxWidth: '680px', margin: '0 auto 5rem' }}>
        
        {/* Navigation & Title Header Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button
            onClick={() => navigate('/store')}
            style={{
              background: 'none', border: 'none', color: '#d4af37',
              fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            <ArrowLeft size={16} /> Continue Shopping
          </button>

          {cart.length > 0 && (
            <button
              onClick={() => {
                clearCart();
                showToast('Cart cleared', 'accent');
              }}
              style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '8px', color: '#ef4444', fontFamily: 'Outfit',
                fontWeight: 700, fontSize: '0.78rem', padding: '0.35rem 0.75rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}
            >
              <Trash2 size={13} /> Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State Card */
          <div
            className="app-card"
            style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              background: '#ffffff',
              borderRadius: '24px',
              border: '1.5px dashed rgba(212,175,55,0.4)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'rgba(212,175,55,0.12)',
                border: '1.5px solid rgba(212,175,55,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#d4af37',
                boxShadow: '0 8px 20px rgba(212,175,55,0.2)',
              }}
            >
              <ShoppingBag size={34} />
            </div>

            <h3
              style={{
                fontFamily: 'Outfit',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: '#171717',
                margin: '0 0 0.5rem',
              }}
            >
              Your Grooming Cart is Empty
            </h3>

            <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
              Explore our artisan grooming pomades, beard elixirs, organic oils & luxury hair wraps.
            </p>

            <button
              onClick={() => navigate('/store')}
              className="app-btn app-btn-primary"
              style={{ width: 'auto', padding: '0.75rem 2rem', margin: '0 auto', fontSize: '0.9rem' }}
            >
              <Sparkles size={18} />
              <span>Explore Grooming Store</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckout}>
            
            {/* Section 1: Cart Items List */}
            <div className="app-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderRadius: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShoppingBag size={18} color="#d4af37" /> Selected Items ({cart.length})
                </h3>
                <span style={{ fontSize: '0.82rem', color: '#6b7280', fontFamily: 'Outfit' }}>
                  Total: <strong style={{ color: '#d4af37' }}>₦{Number(subtotal).toLocaleString()}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {cart.map((item) => (
                  <div
                    key={item.id || item.title}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.85rem',
                      padding: '0.85rem',
                      background: '#faf9f6',
                      borderRadius: '16px',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Item Thumbnail & Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                      {item.image ? (
                        <OptimizedImage
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            border: '1px solid rgba(0,0,0,0.08)'
                          }}
                        />
                      ) : (
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#171717', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <ShoppingBag size={22} />
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{
                          fontFamily: 'Outfit',
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          color: '#171717',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          lineHeight: 1.3
                        }}>
                          {item.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.88rem', color: '#d4af37', fontWeight: 900 }}>
                            ₦{Number(item.price).toLocaleString()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                            (₦{Number(item.price * item.quantity).toLocaleString()})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Touch Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid rgba(0,0,0,0.12)',
                          padding: '3px 6px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => updateQuantity(item.id || item.title, item.quantity - 1)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#4b5563'
                          }}
                        >
                          <Minus size={14} />
                        </button>

                        <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '0.9rem', padding: '0 6px', color: '#171717', minWidth: '18px', textAlign: 'center' }}>
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => updateQuantity(item.id || item.title, item.quantity + 1)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#4b5563'
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeFromCart(item.id || item.title)}
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: '12px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '9px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Delivery Location */}
            <div className="app-card" style={{ padding: '1.25rem', marginBottom: '1.25rem', borderRadius: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={18} color="#d4af37" /> Delivery Location Details
              </h3>
              <LocationSelector location={location} onChange={setLocation} />
            </div>

            {/* Section 3: Loyalty Voucher & Promo Code */}
            <div
              className="app-card"
              style={{
                padding: '1.25rem',
                marginBottom: '1.25rem',
                borderRadius: '20px',
                background: '#faf9f5',
                border: '1px dashed rgba(212,175,55,0.4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#b5952f', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Tag size={18} color="#d4af37" /> Loyalty Voucher & Promo Code
                </h3>
                {appliedVoucher && (
                  <button
                    type="button"
                    onClick={() => setAppliedVoucher(false)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {appliedVoucher ? (
                <div style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '12px', padding: '0.75rem 1rem', color: '#856404', fontSize: '0.85rem', fontFamily: 'Outfit', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>✓ ₦25,000 Loyalty Voucher Applied!</span>
                  <span style={{ color: '#10b981', fontWeight: 900 }}>-₦25,000</span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter voucher code (e.g. LOYALTY25K)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{ flex: 1, padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.85rem', fontFamily: 'Outfit', outline: 'none' }}
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
                    style={{ background: '#171717', color: '#d4af37', border: 'none', borderRadius: '12px', padding: '0.65rem 1.2rem', fontSize: '0.85rem', fontFamily: 'Outfit', fontWeight: 900, cursor: 'pointer' }}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Section 4: Cost Breakdown Card */}
            <div className="app-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderRadius: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', marginBottom: '0.85rem' }}>
                Payment Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: '#6b7280' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>₦{Number(subtotal).toLocaleString()}</span>
                </div>

                {appliedVoucher && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 800 }}>
                    <span>Loyalty Voucher Discount</span>
                    <span>-₦25,000</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Standard Doorstep Delivery</span>
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>Included</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    marginTop: '0.5rem',
                    borderTop: '1.5px dashed rgba(0,0,0,0.1)',
                  }}
                >
                  <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#171717', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Final Total
                  </span>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.5rem', color: '#171717' }}>
                    ₦{Number(finalAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop / In-flow Checkout CTA */}
            <button
              type="submit"
              disabled={submitting}
              className="app-btn app-btn-accent"
              style={{
                width: '100%',
                minHeight: '52px',
                borderRadius: '16px',
                fontSize: '0.98rem',
                fontWeight: 900,
                boxShadow: '0 10px 25px rgba(212,175,55,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              {submitting ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Place Order (₦{Number(finalAmount).toLocaleString()})</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </PageContainer>
  );
};
