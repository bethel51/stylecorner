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
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { user, isAuthenticated, showToast } = useAuth();

  const [location, setLocation] = useState({
    state: user?.state || 'Lagos',
    lga: user?.lga || 'Ikeja',
    street: user?.street || '',
    houseNumber: user?.houseNumber || '',
  });
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

    setSubmitting(true);
    try {
      const itemsList = cart.map((item) => `${item.title} (x${item.quantity})`).join(', ');
      const orderPayload = {
        name: `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Customer',
        email: user.email,
        phone: user.phone || '',
        item: itemsList,
        price: subtotal,
        totalPrice: subtotal,
        address: fullAddress,
        state: location.state,
        lga: location.lga,
        street: location.street.trim(),
        houseNumber: location.houseNumber.trim(),
        status: 'processing',
        trackingStatus: 'Order Placed',
      };

      await api.createOrder(orderPayload);

      // Save delivery location back to user profile for future seamless orders
      updateProfile({
        state: location.state,
        lga: location.lga,
        street: location.street.trim(),
        houseNumber: location.houseNumber.trim(),
      }).catch(() => {});

      clearCart();
      showToast('Order placed successfully!', 'success');
      onClose();
      navigate('/customer-dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Your Grooming Cart (${cart.length})`}>
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#6b7280' }}>
          <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p style={{ fontSize: '0.9rem' }}>Your shopping cart is currently empty.</p>
        </div>
      ) : (
        <div style={{ width: '100%', overflowX: 'hidden' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {cart.map((item) => (
              <div
                key={item.id || item.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: '#faf9f6',
                  borderRadius: '12px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                  {item.image && (
                    <OptimizedImage
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        flexShrink: 0
                      }}
                    />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '0.82rem', color: '#d4af37', fontWeight: 900 }}>
                      ₦{Number(item.price).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid rgba(0,0,0,0.08)',
                      padding: '2px 4px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id || item.title, item.quantity - 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.82rem', padding: '0 5px' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id || item.title, item.quantity + 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id || item.title)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCheckout} style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '1rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 800, color: '#171717', marginBottom: '0.65rem' }}>
                Delivery Location Details
              </h4>
              <LocationSelector location={location} onChange={setLocation} />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: '1rem 0',
              }}
            >
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.9rem', color: '#6b7280' }}>
                SUBTOTAL:
              </span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.4rem', color: '#171717' }}>
                ₦{Number(subtotal).toLocaleString()}
              </span>
            </div>

            <button type="submit" disabled={submitting} className="app-btn app-btn-accent">
              {submitting ? (
                <span>Placing Order...</span>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Place Order (₦{Number(subtotal).toLocaleString()})</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </BottomSheet>
  );
};
