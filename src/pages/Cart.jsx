import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Cart = () => {
  const navigate = useNavigate();
  const {
    cart = [],
    removeFromCart = () => {},
    updateQuantity = () => {},
    clearCart = () => {},
    subtotal = 0,
    addToCart = () => {},
  } = useCart() || {};
  const { user, isAuthenticated, updateProfile, showToast } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Delivery defaults to Free like in Screen 7
  const deliveryFee = 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    if (promoCode.trim().toUpperCase() === 'SC10' || promoCode.trim().toUpperCase() === 'GLOW') {
      const disc = Math.round(subtotal * 0.1);
      setDiscount(disc);
      showToast(`Promo applied! ₦${disc.toLocaleString()} saved.`, 'success');
    } else {
      showToast('Invalid promo code. Try "SC10" or "GLOW"', 'error');
    }
  };

  const handleProceedToCheckout = async (e) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please sign in to proceed to checkout.', 'error');
      navigate('/login?redirect=cart');
      return;
    }

    if (cart.length === 0) {
      showToast('Your cart is empty.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const itemsList = cart.map((item) => `${item.title} (x${item.quantity})`).join(', ');
      const orderPayload = {
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Customer',
        email: user.email,
        phone: user.phone || 'N/A',
        item: discount > 0 ? `${itemsList} [Promo Discount -₦${discount}]` : itemsList,
        price: total,
        totalPrice: total,
        discountApplied: discount,
        address: `${user.houseNumber || ''} ${user.street || ''}, ${user.lga || 'Ikeja'}, ${user.state || 'Lagos'} State`,
        state: user.state || 'Lagos',
        lga: user.lga || 'Ikeja',
        status: 'processing',
        trackingStatus: 'Order Placed',
      };

      const createdOrder = await api.createOrder(orderPayload);
      clearCart();
      showToast('Order created! Proceeding to Payment...', 'success');
      navigate('/payment', {
        state: {
          orderId: createdOrder?._id,
          title: `Order #${String(createdOrder?._id || '').slice(-6).toUpperCase()}`,
          amount: total,
          description: itemsList,
        },
      });
    } catch (err) {
      showToast(err.message || 'Failed to process order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer showBack={true}>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Screen 7: Header with Trash Icon on Right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Your Cart
          </h1>

          {cart.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Clear all items from your cart?')) {
                  clearCart();
                  showToast('Cart cleared', 'info');
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '6px',
              }}
              aria-label="Clear Cart"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Cart Item Cards */}
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#151822',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#f5b942',
              }}
            >
              <ShoppingBag size={26} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
              Your cart is empty
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Explore our boutique and add your favorite grooming essentials.
            </p>
            <button
              onClick={() => navigate('/store')}
              className="app-btn app-btn-accent"
              style={{ maxWidth: '200px', margin: '0 auto' }}
            >
              Shop Store
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#151822',
                  borderRadius: '16px',
                  padding: '0.85rem 1rem 0.85rem 0.85rem',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      backgroundColor: '#1c202d',
                      flexShrink: 0,
                    }}
                  >
                    <OptimizedImage
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  {/* Title & Price & Quantity Stepper */}
                  <div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.2rem' }}>
                      {item.title}
                    </h3>
                    <span style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 800, display: 'block', marginBottom: '0.4rem' }}>
                      ₦{Number(item.price).toLocaleString()}
                    </span>

                    {/* Quantity Stepper [- 1 +] */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button
                        onClick={() => {
                          if (item.quantity > 1) updateQuantity(item.id, item.quantity - 1);
                          else removeFromCart(item.id);
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: '#1d212f',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>

                      <span style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: '#1d212f',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <ChevronRight size={18} color="#64748b" />
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <>
            {/* Price Breakdown */}
            <div
              style={{
                background: '#151822',
                borderRadius: '18px',
                padding: '1.15rem',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Subtotal</span>
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem' }}>
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Delivery</span>
                <span style={{ color: '#10b981', fontWeight: 800, fontSize: '0.85rem' }}>
                  Free
                </span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Discount</span>
                  <span style={{ color: '#f5b942', fontWeight: 800, fontSize: '0.85rem' }}>
                    -₦{discount.toLocaleString()}
                  </span>
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>Total</span>
                <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1.15rem' }}>
                  ₦{total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Promo Code Input Box with Integrated "Apply" Button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#151822',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0.35rem 0.45rem 0.35rem 1rem',
                marginBottom: '1.5rem',
              }}
            >
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  fontFamily: 'Outfit',
                  fontSize: '0.88rem',
                  flex: 1,
                }}
              />
              <button
                onClick={handleApplyPromo}
                style={{
                  background: '#232736',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1.15rem',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>

            {/* Main Sticky Action: Proceed to Checkout -> */}
            <button
              onClick={handleProceedToCheckout}
              disabled={submitting}
              className="app-btn app-btn-accent"
              style={{
                borderRadius: '16px',
                padding: '1rem',
                fontSize: '0.94rem',
                boxShadow: '0 8px 24px rgba(245, 185, 66, 0.35)',
              }}
            >
              <span>{submitting ? 'Processing...' : 'Proceed to Checkout'}</span>
              <ArrowRight size={18} />
            </button>
          </>
        )}

      </div>
    </PageContainer>
  );
};
