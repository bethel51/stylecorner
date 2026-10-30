import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Home,
  Send,
  MessageSquare,
  Package,
  Download,
  ArrowLeft,
  Phone,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { printOrderInvoice } from '../utils/orderInvoiceExport';

const TRACKING_STAGES = [
  { id: 'Order Placed', label: 'Order Placed', icon: Package },
  { id: 'Processing', label: 'Processing', icon: Clock },
  { id: 'In Transit', label: 'In Transit', icon: Truck },
  { id: 'Out for Delivery', label: 'Out for\nDelivery', icon: MapPin },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Admin controls
  const isAdmin = user?.role === 'admin';
  const [adminTrackingStatus, setAdminTrackingStatus] = useState('Order Placed');
  const [adminTrackingNumber, setAdminTrackingNumber] = useState('');
  const [adminEstDelivery, setAdminEstDelivery] = useState('');
  const [updatingTracking, setUpdatingTracking] = useState(false);

  const fetchOrder = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      const data = await api.getOrders();
      const orders = Array.isArray(data) ? data : data?.orders || [];
      const found = orders.find((o) => o._id === orderId);

      if (found) {
        setOrder(found);
        setAdminTrackingStatus(found.trackingStatus || found.status || 'Order Placed');
        setAdminTrackingNumber(found.trackingNumber || '');
        setAdminEstDelivery(found.estimatedDelivery || '');
      }
      if (showRefreshToast) showToast('Order refreshed', 'success');
    } catch (err) {
      console.warn('Failed to fetch order:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchOrder();
  }, [orderId]);

  const currentStatus = order?.trackingStatus || order?.status || 'Order Placed';

  let activeIndex = TRACKING_STAGES.findIndex(
    (s) => s.id.toLowerCase() === currentStatus.toLowerCase()
  );
  if (activeIndex === -1) {
    const status = currentStatus.toLowerCase();
    if (status === 'pending' || status === 'order placed') activeIndex = 0;
    else if (status === 'processing') activeIndex = 1;
    else if (status === 'shipped') activeIndex = 2;
    else if (status === 'out_for_delivery') activeIndex = 3;
    else if (status === 'delivered' || status === 'completed') activeIndex = 4;
    else activeIndex = 0;
  }

  const trackingNumber =
    order?.trackingNumber || 'SC-' + String(order?._id || '').slice(-8).toUpperCase();

  const handleCopyTracking = () => {
    navigator.clipboard.writeText(trackingNumber).then(() => {
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSendingMsg(true);
    try {
      const updated = await api.addOrderMessage(order._id, messageText.trim());
      setMessageText('');
      showToast('Message sent!', 'success');
      if (updated) setOrder(updated);
    } catch (err) {
      showToast(err.message || 'Failed to send', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleUpdateTracking = async (e) => {
    e.preventDefault();
    setUpdatingTracking(true);
    try {
      const updated = await api.updateOrderTracking(order._id, {
        trackingStatus: adminTrackingStatus,
        trackingNumber: adminTrackingNumber,
        estimatedDelivery: adminEstDelivery,
        status: adminTrackingStatus === 'Delivered' ? 'delivered' : 'processing',
      });
      showToast('Tracking updated!', 'success');
      if (updated) setOrder(updated);
    } catch (err) {
      showToast(err.message || 'Failed to update', 'error');
    } finally {
      setUpdatingTracking(false);
    }
  };

  /* ─── STYLES ────────────────────────────────────── */
  const surface = 'var(--color-surface, #151822)';
  const border = 'var(--color-border, rgba(255,255,255,0.08))';
  const accent = 'var(--color-accent, #d4af37)';
  const accentSoft = 'var(--color-accent-soft, rgba(212,175,55,0.12))';
  const textPrimary = 'var(--color-text-primary, #ffffff)';
  const textSecondary = 'var(--color-text-secondary, #94a3b8)';
  const textMuted = 'var(--color-text-muted, #64748b)';

  /* ─── LOADING ───────────────────────────────────── */
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg, #0c0e14)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Package
            size={36}
            style={{ color: accent, marginBottom: '1rem', animation: 'pulse 1.5s ease infinite' }}
          />
          <p style={{ color: textSecondary, fontSize: '0.85rem' }}>Loading order details…</p>
        </div>
      </div>
    );
  }

  /* ─── NOT FOUND ─────────────────────────────────── */
  if (!order) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg, #0c0e14)',
          padding: '2rem',
        }}
      >
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%',
          }}
        >
          <AlertCircle size={40} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <h2
            style={{
              color: textPrimary,
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '1.25rem',
              marginBottom: '0.5rem',
            }}
          >
            Order Not Found
          </h2>
          <p style={{ color: textSecondary, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            We couldn't locate this order. It may have been deleted or the link is invalid.
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: accent,
              color: '#0c0e14',
              border: 'none',
              borderRadius: '14px',
              padding: '0.75rem 2rem',
              fontWeight: 800,
              fontFamily: 'Outfit',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  /* ─── MAIN RENDER ───────────────────────────────── */
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg, #0c0e14)',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      {/* ─── Top Navigation Bar ─── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(12,14,20,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: `1px solid ${border}`,
          padding: '0.85rem 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '620px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: surface,
              border: `1px solid ${border}`,
              color: textPrimary,
              borderRadius: '12px',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <h1
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: textPrimary,
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Order #{String(order._id).slice(-6).toUpperCase()}
          </h1>

          <button
            onClick={() => fetchOrder(true)}
            disabled={refreshing}
            style={{
              background: accentSoft,
              border: `1px solid rgba(212,175,55,0.25)`,
              color: accent,
              borderRadius: '12px',
              padding: '0.45rem 0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
            {refreshing ? '…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '1.25rem 1rem 5rem' }}>
        {/* ══════════════ ORDER SUMMARY CARD ══════════════ */}
        <div
          style={{
            background: `linear-gradient(135deg, ${surface}, rgba(20,23,36,0.95))`,
            borderRadius: '22px',
            padding: '1.35rem 1.25rem',
            marginBottom: '1rem',
            border: `1px solid rgba(212,175,55,0.3)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glow accent */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(212,175,55,0.15), transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
            <div>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: accent,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {currentStatus === 'Delivered' ? '✅ DELIVERED' : '📦 PAID ORDER'}
              </span>
              <h2
                className="keep-white"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: textPrimary,
                  margin: '0.3rem 0 0',
                  lineHeight: 1.3,
                  maxWidth: '220px',
                }}
              >
                {order.item || 'Atelier Product'}
              </h2>
            </div>
            <span
              className="keep-white"
              style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                color: accent,
                letterSpacing: '-0.02em',
              }}
            >
              ₦{Number(order.totalPrice || order.price || 0).toLocaleString()}
            </span>
          </div>

          {/* Tracking # + Download */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '0.85rem',
              borderTop: `1px solid rgba(255,255,255,0.06)`,
              flexWrap: 'wrap',
              gap: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: textMuted, fontSize: '0.75rem' }}>Tracking #:</span>
              <strong className="keep-white" style={{ color: textPrimary, fontSize: '0.82rem' }}>
                {trackingNumber}
              </strong>
              <button
                onClick={handleCopyTracking}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copiedTracking ? '#10b981' : textMuted,
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Copy tracking number"
              >
                {copiedTracking ? <Check size={13} /> : <Copy size={13} />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => printOrderInvoice(order)}
              style={{
                background: accentSoft,
                border: `1px solid rgba(212,175,55,0.35)`,
                color: accent,
                padding: '0.4rem 0.85rem',
                borderRadius: '50px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Download size={13} /> PDF / Receipt
            </button>
          </div>

          {/* Order date */}
          {order.createdAt && (
            <p
              style={{
                color: textMuted,
                fontSize: '0.72rem',
                marginTop: '0.65rem',
                marginBottom: 0,
              }}
            >
              Ordered on {formatDate(order.createdAt)}
              {order.estimatedDelivery && ` · Est. delivery: ${order.estimatedDelivery}`}
            </p>
          )}
        </div>

        {/* ══════════════ TRACKING PROGRESS ══════════════ */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: '22px',
            padding: '1.35rem 1.15rem',
            marginBottom: '1rem',
          }}
        >
          <h3
            className="keep-white"
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: textPrimary,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Truck size={17} style={{ color: accent }} /> Delivery Progress
          </h3>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              position: 'relative',
              marginBottom: '0.5rem',
            }}
          >
            {/* Background line */}
            <div
              style={{
                position: 'absolute',
                top: '17px',
                left: '22px',
                right: '22px',
                height: '3px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '4px',
                zIndex: 1,
              }}
            />
            {/* Active progress line */}
            <div
              style={{
                position: 'absolute',
                top: '17px',
                left: '22px',
                width: `${(activeIndex / (TRACKING_STAGES.length - 1)) * (100 - 12)}%`,
                height: '3px',
                background: `linear-gradient(90deg, ${accent}, #f5d280)`,
                borderRadius: '4px',
                zIndex: 2,
                transition: 'width 0.5s ease',
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
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: isCompleted
                        ? 'linear-gradient(135deg, #1a1d2e, #0f1118)'
                        : surface,
                      border: isCurrent
                        ? `2.5px solid ${accent}`
                        : isCompleted
                        ? '2px solid rgba(212,175,55,0.5)'
                        : `2px solid rgba(255,255,255,0.1)`,
                      color: isCompleted ? accent : textMuted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 12px rgba(212,175,55,0.4)' : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <IconComp size={15} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? accent : isCompleted ? textSecondary : textMuted,
                      marginTop: '0.4rem',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Status badge */}
          <div
            style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                background:
                  currentStatus === 'Delivered'
                    ? 'rgba(16,185,129,0.12)'
                    : accentSoft,
                color:
                  currentStatus === 'Delivered' ? '#10b981' : accent,
                border: `1px solid ${
                  currentStatus === 'Delivered'
                    ? 'rgba(16,185,129,0.3)'
                    : 'rgba(212,175,55,0.3)'
                }`,
                borderRadius: '999px',
                padding: '0.35rem 1rem',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {currentStatus === 'Delivered' ? '✅ ' : '📦 '}
              {currentStatus}
            </span>
          </div>
        </div>

        {/* ══════════════ DELIVERY LOCATION ══════════════ */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: '22px',
            padding: '1.35rem 1.15rem',
            marginBottom: '1rem',
          }}
        >
          <h3
            className="keep-white"
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <MapPin size={17} style={{ color: accent }} /> Delivery Location
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: '16px',
              border: `1px solid ${border}`,
            }}
          >
            {[
              { label: 'State', value: order.state },
              { label: 'LGA / District', value: order.lga },
              { label: 'Street Name', value: order.street },
              { label: 'House / Flat #', value: order.houseNumber },
            ].map((field) => (
              <div key={field.label}>
                <span style={{ fontSize: '0.7rem', color: textMuted, display: 'block', marginBottom: '0.15rem' }}>
                  {field.label}
                </span>
                <strong className="keep-white" style={{ fontSize: '0.85rem', color: textPrimary }}>
                  {field.value || 'N/A'}
                </strong>
              </div>
            ))}
          </div>

          <p
            style={{
              color: textSecondary,
              fontSize: '0.78rem',
              marginTop: '0.85rem',
              marginBottom: 0,
              lineHeight: 1.45,
            }}
          >
            📍 <strong style={{ color: textPrimary }}>Full Address:</strong>{' '}
            {order.address ||
              `${order.houseNumber || ''}, ${order.street || ''}, ${order.lga || ''}, ${order.state || ''}`}
          </p>

          {/* Recipient phone + WhatsApp */}
          {order.phone && (
            <div
              style={{
                marginTop: '0.85rem',
                paddingTop: '0.85rem',
                borderTop: `1px solid ${border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <span style={{ color: textSecondary, fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={13} style={{ color: accent }} />
                <strong className="keep-white" style={{ color: textPrimary }}>
                  {order.phone}
                </strong>
                <span style={{ color: textMuted }}>({order.name || order.email})</span>
              </span>

              <a
                href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello ${order.name || 'Customer'}, regarding your Style Corner order #${String(
                    order._id
                  )
                    .slice(-6)
                    .toUpperCase()} (${currentStatus}).`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  color: '#16a34a',
                  borderRadius: '12px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                💬 WhatsApp
              </a>
            </div>
          )}
        </div>

        {/* ══════════════ ADMIN TRACKING CONTROLS ══════════════ */}
        {isAdmin && (
          <form
            onSubmit={handleUpdateTracking}
            style={{
              background: surface,
              border: `1.5px solid rgba(212,175,55,0.35)`,
              borderRadius: '22px',
              padding: '1.35rem 1.15rem',
              marginBottom: '1rem',
            }}
          >
            <h3
              className="keep-white"
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                color: textPrimary,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ShieldCheck size={17} style={{ color: accent }} /> Admin Controls
            </h3>

            <div style={{ marginBottom: '0.85rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.72rem',
                  color: textMuted,
                  fontWeight: 700,
                  marginBottom: '0.3rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Tracking Stage
              </label>
              <select
                value={adminTrackingStatus}
                onChange={(e) => setAdminTrackingStatus(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${border}`,
                  borderRadius: '12px',
                  padding: '0.65rem 0.85rem',
                  color: textPrimary,
                  fontFamily: 'Outfit',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  appearance: 'auto',
                }}
              >
                {TRACKING_STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label.replace('\n', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    color: textMuted,
                    fontWeight: 700,
                    marginBottom: '0.3rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={adminTrackingNumber}
                  onChange={(e) => setAdminTrackingNumber(e.target.value)}
                  placeholder="SC-TRK-98765"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${border}`,
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    color: textPrimary,
                    fontFamily: 'Outfit',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.72rem',
                    color: textMuted,
                    fontWeight: 700,
                    marginBottom: '0.3rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Est. Delivery
                </label>
                <input
                  type="text"
                  value={adminEstDelivery}
                  onChange={(e) => setAdminEstDelivery(e.target.value)}
                  placeholder="e.g. Nov 5, 2026"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${border}`,
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    color: textPrimary,
                    fontFamily: 'Outfit',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingTracking}
              style={{
                width: '100%',
                background: accent,
                color: '#0c0e14',
                border: 'none',
                borderRadius: '14px',
                padding: '0.75rem',
                fontWeight: 800,
                fontFamily: 'Outfit',
                fontSize: '0.85rem',
                cursor: updatingTracking ? 'not-allowed' : 'pointer',
                opacity: updatingTracking ? 0.7 : 1,
              }}
            >
              {updatingTracking ? 'Saving…' : 'Update Tracking Status'}
            </button>
          </form>
        )}

        {/* ══════════════ COMMUNICATION THREAD ══════════════ */}
        <div
          style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: '22px',
            padding: '1.35rem 1.15rem',
          }}
        >
          <h3
            className="keep-white"
            style={{
              fontSize: '0.95rem',
              fontWeight: 800,
              color: textPrimary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <MessageSquare size={17} style={{ color: accent }} /> Order Communication
          </h3>

          {/* Messages Feed */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              maxHeight: '280px',
              overflowY: 'auto',
              paddingRight: '4px',
              marginBottom: '1rem',
            }}
          >
            {!order.messages || order.messages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.5rem 1rem',
                  color: textMuted,
                  fontSize: '0.82rem',
                }}
              >
                <MessageSquare size={24} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                <p style={{ margin: 0 }}>
                  No messages yet. Send a note to {isAdmin ? 'the customer' : 'admin'} below.
                </p>
              </div>
            ) : (
              order.messages.map((msg, idx) => {
                const isMe =
                  (isAdmin && msg.senderRole === 'admin') ||
                  (!isAdmin && msg.senderRole !== 'admin');
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      background: isMe
                        ? 'linear-gradient(135deg, #1a1d2e, #151822)'
                        : 'rgba(255,255,255,0.04)',
                      color: textPrimary,
                      padding: '0.7rem 0.9rem',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      border: isMe
                        ? '1px solid rgba(212,175,55,0.2)'
                        : `1px solid ${border}`,
                      fontSize: '0.82rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.2rem',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.68rem',
                          color: isMe ? accent : textSecondary,
                        }}
                      >
                        {msg.sender} ({msg.senderRole?.toUpperCase() || 'USER'})
                      </span>
                      <span style={{ fontSize: '0.62rem', color: textMuted }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="keep-white" style={{ margin: 0, lineHeight: 1.4 }}>
                      {msg.text}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Send Message Input */}
          <form
            onSubmit={handleSendMessage}
            style={{
              display: 'flex',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Message ${isAdmin ? 'customer' : 'admin'}…`}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${border}`,
                borderRadius: '14px',
                padding: '0.65rem 0.85rem',
                color: textPrimary,
                fontFamily: 'Outfit',
                fontSize: '0.82rem',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              disabled={sendingMsg || !messageText.trim()}
              style={{
                background: accent,
                color: '#0c0e14',
                border: 'none',
                borderRadius: '14px',
                padding: '0 1rem',
                cursor: sendingMsg || !messageText.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '44px',
                opacity: sendingMsg || !messageText.trim() ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OrderTrackingPage;

