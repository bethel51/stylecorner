import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  Home,
  Send,
  MessageSquare,
  Package,
  ShieldCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TRACKING_STAGES = [
  { id: 'Order Placed', label: 'Order Placed', icon: Package },
  { id: 'Processing', label: 'Processing', icon: Clock },
  { id: 'In Transit', label: 'In Transit', icon: Truck },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 }
];

export const OrderTrackingSheet = ({ isOpen, onClose, order, onOrderUpdated, isAdmin = false }) => {
  const { user, showToast } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [updatingTracking, setUpdatingTracking] = useState(false);

  // Admin edit tracking fields
  const [adminTrackingStatus, setAdminTrackingStatus] = useState(order?.trackingStatus || order?.status || 'Order Placed');
  const [adminTrackingNumber, setAdminTrackingNumber] = useState(order?.trackingNumber || '');
  const [adminEstDelivery, setAdminEstDelivery] = useState(order?.estimatedDelivery || '');

  if (!order) return null;

  const currentStatus = order.trackingStatus || order.status || 'Order Placed';
  
  // Calculate active stage index
  let activeIndex = TRACKING_STAGES.findIndex(s => s.id.toLowerCase() === currentStatus.toLowerCase());
  if (activeIndex === -1) {
    if (currentStatus.toLowerCase() === 'pending' || currentStatus.toLowerCase() === 'order placed') activeIndex = 0;
    else if (currentStatus.toLowerCase() === 'processing') activeIndex = 1;
    else if (currentStatus.toLowerCase() === 'shipped') activeIndex = 2;
    else if (currentStatus.toLowerCase() === 'out_for_delivery') activeIndex = 3;
    else if (currentStatus.toLowerCase() === 'delivered' || currentStatus.toLowerCase() === 'completed') activeIndex = 4;
    else activeIndex = 0;
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSendingMsg(true);
    try {
      const updatedOrder = await api.addOrderMessage(order._id, messageText.trim());
      setMessageText('');
      showToast('Message sent to ' + (isAdmin ? 'customer' : 'admin') + '!', 'success');
      if (onOrderUpdated) onOrderUpdated(updatedOrder);
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    setUpdatingTracking(true);
    try {
      const updatedOrder = await api.updateOrderTracking(order._id, {
        trackingStatus: adminTrackingStatus,
        trackingNumber: adminTrackingNumber,
        estimatedDelivery: adminEstDelivery,
        status: adminTrackingStatus === 'Delivered' ? 'delivered' : 'processing'
      });
      showToast('Order tracking updated!', 'success');
      if (onOrderUpdated) onOrderUpdated(updatedOrder);
    } catch (err) {
      showToast(err.message || 'Failed to update tracking', 'error');
    } finally {
      setUpdatingTracking(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Order Tracking #${String(order._id).slice(-6).toUpperCase()}`}>
      <div style={{ paddingBottom: '1rem' }}>
        
        {/* Order Header Summary */}
        <div
          style={{
            background: 'linear-gradient(135deg, #171717, #0d0d0d)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '1.1rem 1rem',
            marginBottom: '1.25rem',
            border: '1px solid rgba(212,175,55,0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#d4af37', fontFamily: 'Outfit', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PAID ORDER
              </span>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {order.item || 'Grooming Products'}
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#d4af37' }}>
                ₦{Number(order.totalPrice || order.price || 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.78rem', color: '#a1a1aa', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.65rem' }}>
            <div>
              <span style={{ color: '#6b7280' }}>Tracking #: </span>
              <strong style={{ color: '#ffffff' }}>{order.trackingNumber || 'SC-' + String(order._id).slice(-8).toUpperCase()}</strong>
            </div>
            <div>
              <span style={{ color: '#6b7280' }}>Est. Delivery: </span>
              <strong style={{ color: '#d4af37' }}>{order.estimatedDelivery || '2-3 Business Days'}</strong>
            </div>
          </div>
        </div>

        {/* Visual Tracking Progress Bar */}
        <div className="app-card" style={{ marginBottom: '1.25rem', padding: '1.1rem' }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717', marginBottom: '1rem' }}>
            Delivery Progress
          </h4>

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '0.75rem' }}>
            {/* Background Line */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '20px',
                right: '20px',
                height: '3px',
                background: '#e5e7eb',
                zIndex: 1,
              }}
            />
            {/* Active Progress Line */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '20px',
                width: `${(activeIndex / (TRACKING_STAGES.length - 1)) * 90}%`,
                height: '3px',
                background: '#d4af37',
                zIndex: 2,
                transition: 'width 0.3s ease',
              }}
            />

            {TRACKING_STAGES.map((stage, idx) => {
              const IconComp = stage.icon;
              const isCompleted = idx <= activeIndex;
              const isCurrent = idx === activeIndex;

              return (
                <div
                  key={stage.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 3,
                    width: '60px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted ? '#171717' : '#ffffff',
                      border: isCurrent ? '2.5px solid #d4af37' : isCompleted ? '2px solid #171717' : '2px solid #d1d5db',
                      color: isCompleted ? '#d4af37' : '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 10px rgba(212,175,55,0.5)' : 'none',
                    }}
                  >
                    <IconComp size={15} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontFamily: 'Outfit',
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? '#171717' : isCompleted ? '#4b5563' : '#9ca3af',
                      marginTop: '0.35rem',
                      textAlign: 'center',
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Location Breakdown */}
        <div className="app-card" style={{ marginBottom: '1.25rem', padding: '1.1rem' }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="#d4af37" /> Delivery Location Details
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', background: '#faf9f5', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block' }}>State</span>
              <strong style={{ fontSize: '0.85rem', color: '#171717', fontFamily: 'Outfit' }}>
                {order.state || 'N/A'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block' }}>LGA / District</span>
              <strong style={{ fontSize: '0.85rem', color: '#171717', fontFamily: 'Outfit' }}>
                {order.lga || 'N/A'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block' }}>Street Name</span>
              <strong style={{ fontSize: '0.85rem', color: '#171717', fontFamily: 'Outfit' }}>
                {order.street || 'N/A'}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b7280', display: 'block' }}>House / Flat #</span>
              <strong style={{ fontSize: '0.85rem', color: '#171717', fontFamily: 'Outfit' }}>
                {order.houseNumber || 'N/A'}
              </strong>
            </div>
          </div>

          <p style={{ color: '#4b5563', fontSize: '0.78rem', marginTop: '0.65rem' }}>
            📍 <strong>Full Address:</strong> {order.address || `${order.houseNumber || ''}, ${order.street || ''}, ${order.lga || ''}, ${order.state || ''}`}
          </p>
          {order.phone && (
            <p style={{ color: '#4b5563', fontSize: '0.78rem', marginTop: '0.2rem' }}>
              📞 <strong>Recipient Contact:</strong> {order.phone} ({order.name || order.email})
            </p>
          )}
        </div>

        {/* Admin Tracking Controls (Visible to Admin only) */}
        {isAdmin && (
          <form onSubmit={handleUpdateTracking} className="app-card" style={{ marginBottom: '1.25rem', padding: '1.1rem', background: 'rgba(212,175,55,0.06)', border: '1.5px solid rgba(212,175,55,0.4)' }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717', marginBottom: '0.75rem' }}>
              🛠️ Admin Tracking Controls
            </h4>

            <div className="app-input-group">
              <label className="app-label">Tracking Stage</label>
              <select
                value={adminTrackingStatus}
                onChange={(e) => setAdminTrackingStatus(e.target.value)}
                className="app-input"
                style={{ appearance: 'auto', background: '#ffffff' }}
              >
                {TRACKING_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div className="app-input-group" style={{ marginBottom: 0 }}>
                <label className="app-label">Tracking Number</label>
                <input
                  type="text"
                  value={adminTrackingNumber}
                  onChange={(e) => setAdminTrackingNumber(e.target.value)}
                  placeholder="SC-TRK-98765"
                  className="app-input"
                />
              </div>

              <div className="app-input-group" style={{ marginBottom: 0 }}>
                <label className="app-label">Estimated Delivery</label>
                <input
                  type="text"
                  value={adminEstDelivery}
                  onChange={(e) => setAdminEstDelivery(e.target.value)}
                  placeholder="e.g. Aug 25, 2026"
                  className="app-input"
                />
              </div>
            </div>

            <button type="submit" disabled={updatingTracking} className="app-btn app-btn-primary" style={{ marginTop: '0.85rem' }}>
              {updatingTracking ? 'Saving Changes...' : 'Update Tracking Status'}
            </button>
          </form>
        )}

        {/* Live Admin <-> Customer Communication Thread */}
        <div className="app-card" style={{ marginBottom: 0, padding: '1.1rem' }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MessageSquare size={16} color="#d4af37" /> Order Communication & Support
          </h4>

          {/* Messages Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '0.85rem' }}>
            {(!order.messages || order.messages.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '1rem', color: '#9ca3af', fontSize: '0.8rem' }}>
                No messages yet. Send a note to {isAdmin ? 'the customer' : 'admin'} below.
              </div>
            ) : (
              order.messages.map((msg, idx) => {
                const isMe = (isAdmin && msg.senderRole === 'admin') || (!isAdmin && msg.senderRole !== 'admin');
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: isMe ? '#171717' : '#f3f4f6',
                      color: isMe ? '#ffffff' : '#171717',
                      padding: '0.65rem 0.85rem',
                      borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.7rem', color: isMe ? '#d4af37' : '#4b5563' }}>
                        {msg.sender} ({msg.senderRole?.toUpperCase() || 'USER'})
                      </span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ margin: 0, lineHeight: 1.35 }}>{msg.text}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Message Input Form */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Write a message to ${isAdmin ? 'customer' : 'admin'}...`}
              className="app-input"
              style={{ flex: 1, minHeight: '40px', fontSize: '0.82rem' }}
            />
            <button
              type="submit"
              disabled={sendingMsg || !messageText.trim()}
              className="app-btn app-btn-accent"
              style={{ width: 'auto', minHeight: '40px', padding: '0 1rem', borderRadius: '12px' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>

      </div>
    </BottomSheet>
  );
};
