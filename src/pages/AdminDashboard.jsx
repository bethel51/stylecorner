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
  Search,
  Sparkles,
  Package,
  Home,
  BarChart3,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('orders');
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      showToast(`Order marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update order', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      showToast(`Booking marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update booking', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;

  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (o.customerInfo?.name || '').toLowerCase().includes(q) ||
      (o.customerInfo?.email || '').toLowerCase().includes(q) ||
      (o._id || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (b.clientName || b.user?.firstname || '').toLowerCase().includes(q) ||
      (b.serviceName || '').toLowerCase().includes(q) ||
      (b.stylist || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const kpiCards = [
    { label: 'Store Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: '#d4af37', bg: 'rgba(212,175,55,0.1)' },
    { label: 'Total Orders', value: orders.length, sub: `${pendingOrdersCount} pending`, icon: ShoppingBag, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Bookings Queue', value: bookings.length, sub: `${pendingBookingsCount} pending`, icon: Calendar, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  ];

  const navItems = [
    { id: 'orders', label: 'Store Orders', icon: ShoppingBag, count: orders.length },
    { id: 'bookings', label: 'Salon Bookings', icon: Calendar, count: bookings.length },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', fontFamily: 'Outfit, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '240px',
        flexShrink: 0,
        backgroundColor: '#111111',
        borderRight: '1px solid rgba(212,175,55,0.15)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}>
        {/* Brand */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #d4af37, #8a6d1c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} color="#000" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>Style Corner</div>
              <div style={{ fontSize: '0.65rem', color: '#d4af37', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Admin Identity */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: user?.avatarUrl ? `url(${user.avatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #d4af37, #8a6d1c)',
              border: '2px solid rgba(212,175,55,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {!user?.avatarUrl && <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#000' }}>{user?.firstname?.charAt(0) || 'A'}</span>}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstname || 'Admin'} {user?.lastname || ''}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#22c55e', fontWeight: 600 }}>● System Admin</div>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.7rem 0.85rem', borderRadius: '12px', width: '100%',
                border: activeTab === item.id ? '1px solid rgba(212,175,55,0.35)' : '1px solid transparent',
                backgroundColor: activeTab === item.id ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: activeTab === item.id ? '#d4af37' : '#9ca3af',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                fontFamily: 'Outfit', fontWeight: activeTab === item.id ? 700 : 500, fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <item.icon size={16} />
                {item.label}
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.45rem',
                borderRadius: '50px', backgroundColor: activeTab === item.id ? '#d4af37' : 'rgba(255,255,255,0.08)',
                color: activeTab === item.id ? '#000' : '#9ca3af',
              }}>
                {item.count}
              </span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            onClick={fetchAdminData}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.85rem', borderRadius: '10px', width: '100%',
              backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#9ca3af', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 500,
            }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.85rem', borderRadius: '10px', width: '100%',
              backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#9ca3af', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 500,
            }}
          >
            <Home size={14} /> Public Site
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.85rem', borderRadius: '10px', width: '100%',
              backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 600,
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main style={{ marginLeft: '240px', flex: 1, overflowY: 'auto', minHeight: '100vh' }}>

        {/* Top Bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 5,
          backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>
              {activeTab === 'orders' ? 'Store Orders' : 'Salon Bookings'}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0.15rem 0 0 0' }}>
              Manage and update {activeTab === 'orders' ? 'customer orders' : 'appointment bookings'} in real-time
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600 }}>Live</span>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>

          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {kpiCards.map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#111111', borderRadius: '16px', padding: '1.25rem',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={16} color={card.color} />
                  </div>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: card.color, fontFamily: 'Outfit', lineHeight: 1 }}>{card.value}</div>
                {card.sub && <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.25rem' }}>{card.sub}</div>}
              </div>
            ))}
          </div>

          {/* Search + Filter Row */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                placeholder={activeTab === 'orders' ? 'Search name, email, order ID...' : 'Search client, service, stylist...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.5rem', borderRadius: '10px',
                  backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#ffffff', fontSize: '0.83rem', outline: 'none', fontFamily: 'Outfit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {(activeTab === 'orders'
                ? ['all', 'pending', 'processing', 'shipped', 'completed']
                : ['all', 'pending', 'confirmed', 'completed', 'cancelled']
              ).map(status => {
                const active = activeTab === 'orders' ? orderStatusFilter === status : bookingStatusFilter === status;
                return (
                  <button
                    key={status}
                    onClick={() => activeTab === 'orders' ? setOrderStatusFilter(status) : setBookingStatusFilter(status)}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                      textTransform: 'capitalize', cursor: 'pointer',
                      backgroundColor: active ? '#d4af37' : 'rgba(255,255,255,0.05)',
                      color: active ? '#000' : '#9ca3af',
                      border: active ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'Outfit', transition: 'all 0.15s ease',
                    }}
                  >
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ backgroundColor: '#111111', borderRadius: '14px', height: '120px', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : activeTab === 'orders' ? (
            filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#111111', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <Package size={48} color="#374151" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', margin: '0 0 0.5rem' }}>No Orders Found</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{searchQuery || orderStatusFilter !== 'all' ? 'Try clearing your filters.' : 'Store orders will appear here once placed.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredOrders.map(order => (
                  <div key={order._id} style={{
                    backgroundColor: '#111111', borderRadius: '16px', padding: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.06)', transition: 'border-color 0.2s ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'monospace', marginBottom: '0.2rem' }}>
                          ORDER #{(order._id || '').slice(-6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Outfit' }}>
                          {order.customerInfo?.name || 'Store Customer'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                          {order.customerInfo?.email || ''} {order.customerInfo?.phone ? `· ${order.customerInfo.phone}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d4af37', fontFamily: 'Outfit' }}>
                          ${(order.totalPrice || 0).toFixed(2)}
                        </span>
                        <StatusBadge status={order.status || 'pending'} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '1rem' }}>
                      {(order.items || []).slice(0, 3).map((item, idx) => (
                        <span key={idx} style={{ marginRight: '0.75rem' }}>
                          • {item.name || item.title || 'Product'} ×{item.quantity || 1}
                        </span>
                      ))}
                      {(order.items || []).length > 3 && <span style={{ color: '#d4af37' }}>+{order.items.length - 3} more</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {order.status !== 'shipped' && order.status !== 'completed' && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#d4af37', color: '#000', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                        >
                          <Truck size={13} /> Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                        >
                          <CheckCircle size={13} /> Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#d1d5db', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#111111', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <Calendar size={48} color="#374151" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', margin: '0 0 0.5rem' }}>No Bookings Found</h3>
                <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>{searchQuery || bookingStatusFilter !== 'all' ? 'Try clearing your filters.' : 'Customer appointments will appear here.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredBookings.map(b => (
                  <div key={b._id} style={{
                    backgroundColor: '#111111', borderRadius: '16px', padding: '1.25rem',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Outfit' }}>
                          {b.serviceName || b.service || 'Grooming Service'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#d4af37', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Users size={12} /> {b.clientName || b.user?.firstname || 'Guest'} {b.phone ? `· ${b.phone}` : ''}
                        </div>
                      </div>
                      <StatusBadge status={b.status || 'pending'} />
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.78rem', color: '#6b7280', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{b.date || 'TBD'} at {b.time || 'TBD'}</span>
                      <span><Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Stylist: {b.stylist || 'Any'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'cancelled' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#d4af37', color: '#000', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Complete
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                          style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.35)', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', fontWeight: 800, margin: 0 }}>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'monospace', marginBottom: '1rem' }}>
              ORDER #{(selectedOrder._id || '').slice(-6).toUpperCase()}
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.83rem', color: '#d1d5db', marginBottom: '1.25rem' }}>
              <div><span style={{ color: '#9ca3af' }}>Customer: </span>{selectedOrder.customerInfo?.name || 'N/A'}</div>
              <div><span style={{ color: '#9ca3af' }}>Email: </span>{selectedOrder.customerInfo?.email || 'N/A'}</div>
              <div><span style={{ color: '#9ca3af' }}>Phone: </span>{selectedOrder.customerInfo?.phone || 'N/A'}</div>
              <div><span style={{ color: '#9ca3af' }}>Address: </span>{selectedOrder.customerInfo?.address || 'N/A'}</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Items Ordered</div>
              {(selectedOrder.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', fontSize: '0.83rem', color: '#d1d5db', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span>{item.name || item.title} × {item.quantity}</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#ffffff', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span>Total Paid</span>
              <span style={{ color: '#d4af37' }}>${(selectedOrder.totalPrice || 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              {selectedOrder.status !== 'shipped' && selectedOrder.status !== 'completed' && (
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'shipped')}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: '#d4af37', color: '#000', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Mark Shipped
                </button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'completed')}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '0.82rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '0.65rem 1rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#9ca3af', fontWeight: 600, fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
