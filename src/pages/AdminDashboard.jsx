import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShoppingBag,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RefreshCw,
  LogOut,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Mail,
  Phone,
  Sparkles,
  Award,
  Package,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { ImagePreviewModal } from '../components/common/ImagePreviewModal';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'overview' | 'orders' | 'bookings'
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Search
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item modal details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEnlargedAvatar, setShowEnlargedAvatar] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [bookingsData, ordersData] = await Promise.all([
        api.getBookings().catch(() => []),
        api.getOrders().catch(() => []),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (err) {
      showToast('Failed to load admin management data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}!`, 'success');
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      showToast(`Booking marked as ${newStatus}!`, 'success');
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      showToast(err.message || 'Failed to update booking', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Computations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch =
      !searchQuery ||
      (o.customerInfo?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerInfo?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o._id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const matchesSearch =
      !searchQuery ||
      (b.clientName || b.user?.firstname || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.stylist || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <PageContainer title="Admin Workspace">
      {/* Admin Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1f1d16 0%, #121212 100%)',
          borderRadius: '24px',
          padding: '1.5rem',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
          marginBottom: '1.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              onClick={() => user?.avatarUrl && setShowEnlargedAvatar(true)}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: user?.avatarUrl
                  ? `url(${user.avatarUrl}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #d4af37, #8a6d1c)',
                border: '2px solid #d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: user?.avatarUrl ? 'pointer' : 'default',
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
              }}
            >
              {!user?.avatarUrl && <Shield size={28} color="#121212" />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    backgroundColor: '#d4af37',
                    color: '#000',
                    fontSize: '0.65rem',
                    fontWeight: 900,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '50px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                >
                  System Admin
                </span>
                <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>● Live</span>
              </div>
              <h2
                style={{
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  color: '#ffffff',
                  margin: '0.2rem 0 0 0',
                }}
              >
                {user?.firstname ? `${user.firstname}'s Command Center` : 'Management Dashboard'}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={fetchAdminData}
              className="app-header-btn"
              title="Refresh Data"
              style={{ width: '38px', height: '38px' }}
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="app-header-btn"
              title="Logout"
              style={{ width: '38px', height: '38px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Store Revenue</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d4af37', fontFamily: 'Outfit' }}>
              ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
              {orders.length} <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>({pendingOrdersCount} pending)</span>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bookings Queue</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Outfit' }}>
              {bookings.length} <span style={{ fontSize: '0.75rem', color: '#3b82f6' }}>({pendingBookingsCount} pending)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', pb: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: activeTab === 'orders' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
            backgroundColor: activeTab === 'orders' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(20,20,20,0.6)',
            color: activeTab === 'orders' ? '#d4af37' : '#9ca3af',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <ShoppingBag size={16} /> Store Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '14px',
            fontWeight: 700,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: activeTab === 'bookings' ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
            backgroundColor: activeTab === 'bookings' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(20,20,20,0.6)',
            color: activeTab === 'bookings' ? '#d4af37' : '#9ca3af',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <Calendar size={16} /> Salon Bookings ({bookings.length})
        </button>
      </div>

      {/* Global Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
        />
        <input
          type="text"
          placeholder={activeTab === 'orders' ? 'Search by customer name, email or order ID...' : 'Search by client, service or stylist...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.75rem',
            borderRadius: '14px',
            backgroundColor: '#18181b',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
            fontSize: '0.85rem',
            outline: 'none',
          }}
        />
      </div>

      {/* --- TAB 1: STORE ORDERS MANAGEMENT --- */}
      {activeTab === 'orders' && (
        <div>
          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', overflowX: 'auto' }}>
            {['all', 'pending', 'processing', 'shipped', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setOrderStatusFilter(status)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '50px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  border: orderStatusFilter === status ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: orderStatusFilter === status ? '#d4af37' : 'rgba(255,255,255,0.04)',
                  color: orderStatusFilter === status ? '#000000' : '#d1d5db',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#18181b', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Package size={40} color="#6b7280" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', margin: 0 }}>No Store Orders Found</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {searchQuery || orderStatusFilter !== 'all'
                  ? 'Try clearing your search or status filter.'
                  : 'Orders placed on the store page will appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  style={{
                    backgroundColor: '#18181b',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontFamily: 'monospace' }}>
                        ORDER #{order._id ? order._id.slice(-6).toUpperCase() : 'N/A'}
                      </span>
                      <h4 style={{ color: '#ffffff', fontFamily: 'Outfit', fontWeight: 700, margin: '0.2rem 0 0 0', fontSize: '1.05rem' }}>
                        {order.customerInfo?.name || 'Store Customer'}
                      </h4>
                    </div>
                    <StatusBadge status={order.status || 'pending'} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#d1d5db', margin: '0.75rem 0', padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Items:</span> {order.items?.length || 0} item(s)
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Phone:</span> {order.customerInfo?.phone || 'N/A'}
                    </div>
                    <div>
                      <span style={{ color: '#9ca3af' }}>Total:</span>{' '}
                      <strong style={{ color: '#d4af37' }}>${(order.totalPrice || 0).toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Purchased Items List */}
                  <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginBottom: '0.85rem' }}>
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.2rem 0' }}>
                        <span>• {item.name || item.title || 'Product'} × {item.quantity || 1}</span>
                        <span style={{ color: '#ffffff' }}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <span style={{ color: '#d4af37', fontStyle: 'italic' }}>+ {order.items.length - 2} more item(s)</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {order.status !== 'shipped' && order.status !== 'completed' && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.85rem',
                          borderRadius: '10px',
                          backgroundColor: '#d4af37',
                          color: '#000000',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <Truck size={14} /> Mark Shipped
                      </button>
                    )}

                    {order.status === 'shipped' && (
                      <button
                        disabled={updatingId === order._id}
                        onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.85rem',
                          borderRadius: '10px',
                          backgroundColor: '#22c55e',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                        }}
                      >
                        <CheckCircle size={14} /> Mark Completed
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrder(order)}
                      style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: SALON BOOKINGS MANAGEMENT --- */}
      {activeTab === 'bookings' && (
        <div>
          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', overflowX: 'auto' }}>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setBookingStatusFilter(status)}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '50px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  border: bookingStatusFilter === status ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                  backgroundColor: bookingStatusFilter === status ? '#d4af37' : 'rgba(255,255,255,0.04)',
                  color: bookingStatusFilter === status ? '#000000' : '#d1d5db',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {status}
              </button>
            ))}
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#18181b', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Calendar size={40} color="#6b7280" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', margin: 0 }}>No Salon Appointments Found</h3>
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {searchQuery || bookingStatusFilter !== 'all'
                  ? 'Try clearing your search or status filter.'
                  : 'Appointments booked by customers will appear here.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredBookings.map((b) => (
                <div
                  key={b._id}
                  style={{
                    backgroundColor: '#18181b',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ color: '#ffffff', fontFamily: 'Outfit', fontWeight: 700, margin: 0, fontSize: '1.05rem' }}>
                        {b.serviceName || b.service || 'Grooming Service'}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: '#d4af37', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Users size={13} /> Client: {b.clientName || b.user?.firstname || 'Guest'} {b.phone ? `(${b.phone})` : ''}
                      </div>
                    </div>
                    <StatusBadge status={b.status || 'pending'} />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', fontSize: '0.78rem', color: '#9ca3af', backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.65rem 0.85rem', borderRadius: '12px', marginBottom: '0.85rem' }}>
                    <div><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Date: {b.date || 'TBD'}</div>
                    <div><Clock size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Time: {b.time || 'TBD'}</div>
                    <div><Sparkles size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Stylist: {b.stylist || 'Any Specialist'}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {b.status !== 'confirmed' && b.status !== 'completed' && (
                      <button
                        disabled={updatingId === b._id}
                        onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.85rem',
                          borderRadius: '10px',
                          backgroundColor: '#d4af37',
                          color: '#000000',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Confirm Booking
                      </button>
                    )}

                    {b.status === 'confirmed' && (
                      <button
                        disabled={updatingId === b._id}
                        onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.85rem',
                          borderRadius: '10px',
                          backgroundColor: '#22c55e',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Complete Appointment
                      </button>
                    )}

                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <button
                        disabled={updatingId === b._id}
                        onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                        style={{
                          padding: '0.6rem 0.85rem',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(239,68,68,0.15)',
                          color: '#ef4444',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          border: '1px solid rgba(239,68,68,0.3)',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Details Popup Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#18181b',
              borderRadius: '24px',
              border: '1px solid rgba(212,175,55,0.4)',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '1.5rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', margin: 0 }}>Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#d1d5db', spaceY: '0.75rem' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <strong>Customer:</strong> {selectedOrder.customerInfo?.name || 'N/A'}<br />
                <strong>Email:</strong> {selectedOrder.customerInfo?.email || 'N/A'}<br />
                <strong>Phone:</strong> {selectedOrder.customerInfo?.phone || 'N/A'}<br />
                <strong>Address:</strong> {selectedOrder.customerInfo?.address || 'N/A'}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
                <strong style={{ color: '#d4af37' }}>Items Ordered:</strong>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0' }}>
                    <span>{item.name || item.title} × {item.quantity}</span>
                    <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                <span>Total Paid:</span>
                <span style={{ color: '#d4af37' }}>${(selectedOrder.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Profile Picture Enlarged Modal */}
      <ImagePreviewModal
        isOpen={showEnlargedAvatar}
        onClose={() => setShowEnlargedAvatar(false)}
        imageUrl={user?.avatarUrl}
        title={`${user?.firstname || 'Admin'}'s Profile Picture`}
      />
    </PageContainer>
  );
};
