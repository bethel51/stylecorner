import React, { useState, useEffect } from 'react';
import {
  Scissors,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  LogOut,
  RefreshCw,
  Sparkles,
  DollarSign,
  Star,
  Award,
  ToggleLeft,
  ToggleRight,
  Mail,
  Phone,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { PopupModal } from '../components/common/PopupModal';
import { Trash2, AlertTriangle } from 'lucide-react';

export const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, deleteAccount, showToast } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'accepted' | 'completed'

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount();
      setShowDeleteModal(false);
      navigate('/', { replace: true });
    } catch (err) {
      showToast(err.message || 'Failed to delete account', 'error');
    } finally {
      setDeletingAccount(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch client queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.updateBookingStatus(id, { status: newStatus });
      setBookings((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
      if (newStatus === 'accepted') {
        showToast('Booking request accepted!', 'success');
      } else if (newStatus === 'rejected') {
        showToast('Booking request rejected.', 'accent');
      } else if (newStatus === 'completed') {
        showToast('Your scheduled services have been rendered. Thanks for using Style Corner!', 'success');
      } else {
        showToast(`Status updated to ${newStatus}`, 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const totalRevenue = completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const filteredList = bookings.filter((b) => {
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  return (
    <PageContainer title="Expert Dashboard">
      <div>

        {/* ── Executive Stylist Header Card ── */}
        <div
          className="app-card"
          style={{
            background: 'linear-gradient(135deg, #1f1f1f 0%, #121212 100%)',
            color: '#ffffff',
            border: '1.5px solid rgba(212, 175, 55, 0.5)',
            padding: '1.5rem 1.25rem',
            borderRadius: '24px',
            position: 'relative',
            boxShadow: '0 16px 36px rgba(0,0,0,0.25)',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d4af37, #b5952f)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontFamily: 'Outfit',
                fontWeight: 900,
                boxShadow: '0 8px 20px rgba(212,175,55,0.3)',
                flexShrink: 0,
              }}
            >
              <Scissors size={32} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                  {user?.firstname} {user?.lastname}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#d4af37', fontSize: '0.8rem', fontWeight: 800 }}>
                  <Star size={13} fill="#d4af37" /> 4.9
                </div>
              </div>

              <p style={{ color: '#d4af37', fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 700, margin: '0.15rem 0 0.4rem' }}>
                MASTER STYLIST
              </p>

              {/* Shift Availability Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !isAvailable;
                  setIsAvailable(next);
                  showToast(next ? 'Status set to: Accepting Bookings' : 'Status set to: On Break / Away', 'accent');
                }}
                style={{
                  background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: isAvailable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  color: isAvailable ? '#10b981' : '#ef4444',
                  fontSize: '0.72rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }} />
                <span>{isAvailable ? 'AVAILABLE — TAKING BOOKINGS' : 'ON BREAK'}</span>
              </button>
            </div>
          </div>

          {/* Specialties Badges */}
          {user?.specialties && user.specialties.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {user.specialties.map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#e5e7eb',
                    fontSize: '0.72rem',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '50px',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}

            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={logout}
                style={{
                  width: '100%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  padding: '0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
        </div>

        {/* ── Metric Cards Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div className="app-card" style={{ textAlign: 'center', padding: '1.1rem 0.5rem', marginBottom: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 900, color: '#d97706' }}>
              {pendingBookings.length}
            </div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>
              Pending
            </span>
          </div>

          <div className="app-card" style={{ textAlign: 'center', padding: '1.1rem 0.5rem', marginBottom: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 900, color: '#10b981' }}>
              {acceptedBookings.length}
            </div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>
              Confirmed
            </span>
          </div>

          <div className="app-card" style={{ textAlign: 'center', padding: '1.1rem 0.5rem', marginBottom: 0 }}>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 900, color: '#d4af37' }}>
              ${totalRevenue}
            </div>
            <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>
              Earnings
            </span>
          </div>
        </div>

        {/* ── Status Filter Pills ── */}
        <div className="filter-pills-scroll" style={{ marginBottom: '1.25rem' }}>
          {[
            { id: 'all', label: `All (${bookings.length})` },
            { id: 'pending', label: `Pending (${pendingBookings.length})` },
            { id: 'accepted', label: `Confirmed (${acceptedBookings.length})` },
            { id: 'completed', label: `Completed (${completedBookings.length})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilterStatus(pill.id)}
              style={{
                background: filterStatus === pill.id ? '#171717' : '#ffffff',
                color: filterStatus === pill.id ? '#d4af37' : '#6b7280',
                border: filterStatus === pill.id ? 'none' : '1px solid rgba(0,0,0,0.08)',
                padding: '0.4rem 0.85rem',
                borderRadius: '50px',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: filterStatus === pill.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* ── Client Appointments Queue ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717' }}>
              All Bookings
            </h3>
            <button
              onClick={fetchBookings}
              style={{ background: 'none', border: 'none', color: '#d4af37', fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <RefreshCw size={14} /> Refresh Queue
            </button>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : filteredList.length === 0 ? (
            <div className="app-card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6b7280' }}>
              <Calendar size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717', marginBottom: '0.25rem' }}>
                No Bookings Found
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                New bookings will show up here as customers book.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredList.map((b) => (
                <div key={b._id} className="app-card" style={{ marginBottom: 0, padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#171717' }}>
                        {b.clientName || 'Client'}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: '#6b7280', marginTop: '0.2rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Mail size={12} /> {b.clientEmail}
                        </span>
                        {b.clientPhone && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={12} /> {b.clientPhone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ alignSelf: 'flex-start' }}>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>

                  {/* Service Detail Card */}
                  <div style={{ background: '#faf9f6', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(0,0,0,0.06)', margin: '0.5rem 0 0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#171717', fontFamily: 'Outfit' }}>
                        {b.service}
                      </span>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.15rem', color: '#d4af37' }}>
                        ${b.price}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#4b5563', marginTop: '0.4rem', fontWeight: 600 }}>
                      <Clock size={14} color="#d4af37" />
                      <span>{b.date} at {b.time}</span>
                    </div>
                  </div>

                  {/* Interactive Queue Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'accepted')}
                          disabled={updatingId === b._id}
                          className="app-btn app-btn-primary"
                          style={{ flex: 1, minHeight: '38px', padding: '0.5rem', fontSize: '0.82rem' }}
                        >
                          <CheckCircle size={15} /> Accept
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(b._id, 'rejected')}
                          disabled={updatingId === b._id}
                          className="app-btn app-btn-outline"
                          style={{ flex: 1, minHeight: '38px', padding: '0.5rem', fontSize: '0.82rem', borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          <XCircle size={15} /> Reject
                        </button>
                      </>
                    )}

                    {b.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'completed')}
                        disabled={updatingId === b._id}
                        className="app-btn app-btn-accent"
                        style={{ width: '100%', minHeight: '38px', padding: '0.5rem', fontSize: '0.85rem' }}
                      >
                        <CheckCircle size={15} /> Finish Request
                      </button>
                    )}

                    {b.status === 'completed' && (
                      <div style={{ width: '100%', textAlign: 'center', fontSize: '0.78rem', color: '#10b981', fontFamily: 'Outfit', fontWeight: 800, padding: '0.4rem', background: 'rgba(16,185,129,0.08)', borderRadius: '8px' }}>
                        ✓ Completed & Settled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Account Management ── */}
      <div className="app-card" style={{ margin: '1.5rem 1rem', background: '#ffffff', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#171717', marginBottom: '0.85rem' }}>
          Account Settings
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button
            onClick={logout}
            className="app-btn app-btn-outline"
            style={{ justifyContent: 'center', gap: '0.5rem', minHeight: '44px' }}
          >
            <LogOut size={16} /> Sign Out of Account
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="app-btn"
            style={{
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '44px',
            }}
          >
            <Trash2 size={16} /> Delete Account Permanently
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <PopupModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account?"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <AlertTriangle size={28} />
          </div>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717', marginBottom: '0.5rem' }}>
            Permanent Account Deletion
          </h4>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Are you sure? This will permanently delete your expert account and all your data. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={() => setShowDeleteModal(false)} className="app-btn app-btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
              className="app-btn"
              style={{ flex: 1, background: '#ef4444', color: '#ffffff', border: 'none' }}
            >
              {deletingAccount ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </div>
        </div>
      </PopupModal>

    </PageContainer>
  );
};
