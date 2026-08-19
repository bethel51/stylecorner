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
  Menu,
  X,
  Trash2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'bookings' | 'users'
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Mobile sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [bookingsData, ordersData, usersData] = await Promise.all([
        api.getBookings().catch(() => []),
        api.getOrders().catch(() => []),
        api.getAdminUsers().catch(() => []),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsersList(Array.isArray(usersData) ? usersData : []);
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

  const handleDeleteUserAccount = async (targetUser) => {
    if (!targetUser?._id) return;
    setUpdatingId(targetUser._id);
    try {
      await api.deleteAdminUser(targetUser._id);
      setUsersList(prev => prev.filter(u => u._id !== targetUser._id));
      setUserToDelete(null);
      showToast(`Account for ${targetUser.firstname || targetUser.email} deleted`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete user account', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'pending').length;
  const customerCount = usersList.filter(u => u.role !== 'staff').length;
  const expertCount = usersList.filter(u => u.role === 'staff').length;

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

  const filteredUsers = usersList.filter(u => {
    const matchesRole = userRoleFilter === 'all' ||
      (userRoleFilter === 'staff' ? u.role === 'staff' : u.role !== 'staff');
    const q = searchQuery.toLowerCase();
    const fullName = `${u.firstname || ''} ${u.lastname || ''}`.toLowerCase();
    const matchesSearch = !q ||
      fullName.includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const kpiCards = [
    { label: 'Store Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: '#d4af37', bg: 'rgba(212,175,55,0.1)' },
    { label: 'Total Orders', value: orders.length, sub: `${pendingOrdersCount} pending`, icon: ShoppingBag, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Bookings Queue', value: bookings.length, sub: `${pendingBookingsCount} pending`, icon: Calendar, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'User Accounts', value: usersList.length, sub: `${customerCount} clients · ${expertCount} experts`, icon: Users, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  ];

  const navItems = [
    { id: 'orders', label: 'Store Orders', icon: ShoppingBag, count: orders.length },
    { id: 'bookings', label: 'Salon Bookings', icon: Calendar, count: bookings.length },
    { id: 'users', label: 'User Accounts', icon: Users, count: usersList.length },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', fontFamily: 'Outfit, sans-serif', color: '#ffffff' }}>

      {/* Mobile Drawer Backdrop */}
      {isMobile && isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            zIndex: 40, transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* ── Sidebar (Desktop Fixed / Mobile Slide-Over Drawer) ── */}
      <aside style={{
        width: '260px',
        flexShrink: 0,
        backgroundColor: '#111111',
        borderRight: '1px solid rgba(212,175,55,0.15)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transform: isMobile && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isMobile && isMobileOpen ? '0 0 30px rgba(0,0,0,0.8)' : 'none',
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', padding: '0.25rem', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Admin User Card */}
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

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setIsMobileOpen(false);
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 0.85rem', borderRadius: '12px', width: '100%',
                border: activeTab === item.id ? '1px solid rgba(212,175,55,0.35)' : '1px solid transparent',
                backgroundColor: activeTab === item.id ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: activeTab === item.id ? '#d4af37' : '#9ca3af',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease',
                fontFamily: 'Outfit', fontWeight: activeTab === item.id ? 700 : 500, fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <item.icon size={17} />
                {item.label}
              </div>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700, padding: '0.1rem 0.5rem',
                borderRadius: '50px', backgroundColor: activeTab === item.id ? '#d4af37' : 'rgba(255,255,255,0.08)',
                color: activeTab === item.id ? '#000' : '#9ca3af',
              }}>
                {item.count}
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer Controls */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            onClick={() => { fetchAdminData(); if (isMobile) setIsMobileOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 0.85rem', borderRadius: '10px', width: '100%',
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
              padding: '0.65rem 0.85rem', borderRadius: '10px', width: '100%',
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
              padding: '0.65rem 0.85rem', borderRadius: '10px', width: '100%',
              backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#ef4444', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 600,
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content Container ── */}
      <main style={{
        marginLeft: isMobile ? 0 : '260px',
        flex: 1,
        overflowY: 'auto',
        minHeight: '100vh',
        width: '100%',
      }}>

        {/* Top Header Bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          backgroundColor: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: isMobile ? '0.85rem 1rem' : '1rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(true)}
                style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#d4af37', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: isMobile ? '1.1rem' : '1.3rem', color: '#ffffff', margin: 0 }}>
                {activeTab === 'orders' ? 'Store Orders' : activeTab === 'bookings' ? 'Salon Bookings' : 'User Accounts'}
              </h1>
              <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0.1rem 0 0 0', display: isMobile ? 'none' : 'block' }}>
                {activeTab === 'orders' ? 'Manage customer orders in real-time' : activeTab === 'bookings' ? 'Manage appointment bookings' : 'Manage registered client and expert accounts'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={fetchAdminData}
              title="Refresh"
              style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#ffffff', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <RefreshCw size={15} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(34,197,94,0.1)', padding: '0.3rem 0.6rem', borderRadius: '50px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700 }}>Live</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ padding: isMobile ? '1rem' : '2rem' }}>

          {/* KPI Metrics Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(auto-fit, minmax(130px, 1fr))' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: isMobile ? '0.65rem' : '1rem',
            marginBottom: '1.5rem',
          }}>
            {kpiCards.map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#111111', borderRadius: isMobile ? '14px' : '16px',
                padding: isMobile ? '0.85rem' : '1.25rem',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
                  <div style={{ width: isMobile ? '26px' : '32px', height: isMobile ? '26px' : '32px', borderRadius: '8px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={isMobile ? 14 : 16} color={card.color} />
                  </div>
                </div>
                <div style={{ fontSize: isMobile ? '1.25rem' : '1.6rem', fontWeight: 800, color: card.color, fontFamily: 'Outfit', lineHeight: 1 }}>{card.value}</div>
                {card.sub && <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '0.2rem' }}>{card.sub}</div>}
              </div>
            ))}
          </div>

          {/* Search Bar + Filter Chips Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                placeholder={
                  activeTab === 'orders'
                    ? 'Search name, email, order ID...'
                    : activeTab === 'bookings'
                    ? 'Search client, service, stylist...'
                    : 'Search name, email, phone...'
                }
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

            {/* Scrollable Filter Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem', WebkitOverflowScrolling: 'touch' }}>
              {(activeTab === 'orders'
                ? ['all', 'pending', 'processing', 'shipped', 'completed']
                : activeTab === 'bookings'
                ? ['all', 'pending', 'confirmed', 'completed', 'cancelled']
                : ['all', 'customer', 'staff']
              ).map(status => {
                const active =
                  activeTab === 'orders'
                    ? orderStatusFilter === status
                    : activeTab === 'bookings'
                    ? bookingStatusFilter === status
                    : userRoleFilter === status;
                const labelDisplay = status === 'staff' ? 'experts' : status;
                return (
                  <button
                    key={status}
                    onClick={() => {
                      if (activeTab === 'orders') setOrderStatusFilter(status);
                      else if (activeTab === 'bookings') setBookingStatusFilter(status);
                      else setUserRoleFilter(status);
                    }}
                    style={{
                      padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                      textTransform: 'capitalize', cursor: 'pointer', flexShrink: 0,
                      backgroundColor: active ? '#d4af37' : 'rgba(255,255,255,0.05)',
                      color: active ? '#000' : '#9ca3af',
                      border: active ? '1px solid #d4af37' : '1px solid rgba(255,255,255,0.08)',
                      fontFamily: 'Outfit', transition: 'all 0.15s ease',
                    }}
                  >
                    {labelDisplay}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Content List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ backgroundColor: '#111111', borderRadius: '14px', height: '110px', border: '1px solid rgba(255,255,255,0.05)' }} />
              ))}
            </div>
          ) : activeTab === 'orders' ? (
            filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#111111', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <Package size={40} color="#374151" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem' }}>No Orders Found</h3>
                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>{searchQuery || orderStatusFilter !== 'all' ? 'Try clearing your filters.' : 'Store orders will appear here once placed.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredOrders.map(order => (
                  <div key={order._id} style={{
                    backgroundColor: '#111111', borderRadius: '16px', padding: isMobile ? '1rem' : '1.25rem',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'monospace', marginBottom: '0.15rem' }}>
                          ORDER #{(order._id || '').slice(-6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Outfit' }}>
                          {order.customerInfo?.name || 'Store Customer'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.1rem' }}>
                          {order.customerInfo?.email || ''} {order.customerInfo?.phone ? `· ${order.customerInfo.phone}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d4af37', fontFamily: 'Outfit' }}>
                          ${(order.totalPrice || 0).toFixed(2)}
                        </span>
                        <StatusBadge status={order.status || 'pending'} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#6b7280', marginBottom: '0.85rem' }}>
                      {(order.items || []).slice(0, 3).map((item, idx) => (
                        <span key={idx} style={{ marginRight: '0.6rem', display: 'inline-block' }}>
                          • {item.name || item.title || 'Product'} ×{item.quantity || 1}
                        </span>
                      ))}
                      {(order.items || []).length > 3 && <span style={{ color: '#d4af37' }}>+{order.items.length - 3} more</span>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {order.status !== 'shipped' && order.status !== 'completed' && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={() => handleUpdateOrderStatus(order._id, 'shipped')}
                          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#d4af37', color: '#000', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                        >
                          <Truck size={13} /> Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                        >
                          <CheckCircle size={13} /> Mark Completed
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#d1d5db', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                      >
                        <Eye size={13} /> Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'bookings' ? (
            filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#111111', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <Calendar size={40} color="#374151" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem' }}>No Bookings Found</h3>
                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>{searchQuery || bookingStatusFilter !== 'all' ? 'Try clearing your filters.' : 'Customer appointments will appear here.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredBookings.map(b => (
                  <div key={b._id} style={{
                    backgroundColor: '#111111', borderRadius: '16px', padding: isMobile ? '1rem' : '1.25rem',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Outfit' }}>
                          {b.serviceName || b.service || 'Grooming Service'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#d4af37', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Users size={12} /> {b.clientName || b.user?.firstname || 'Guest'} {b.phone ? `· ${b.phone}` : ''}
                        </div>
                      </div>
                      <StatusBadge status={b.status || 'pending'} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.76rem', color: '#6b7280', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                      <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{b.date || 'TBD'} at {b.time || 'TBD'}</span>
                      <span><Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Stylist: {b.stylist || 'Any'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'cancelled' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={() => handleUpdateBookingStatus(b._id, 'confirmed')}
                          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#d4af37', color: '#000', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Complete
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                          style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* --- TAB 3: USER ACCOUNTS MANAGEMENT --- */
            filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#111111', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                <Users size={40} color="#374151" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem' }}>No Accounts Found</h3>
                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>{searchQuery || userRoleFilter !== 'all' ? 'Try clearing your search or role filter.' : 'Registered user accounts will appear here.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredUsers.map(u => {
                  const isStaff = u.role === 'staff';
                  const fullName = `${u.firstname || ''} ${u.lastname || ''}`.trim() || 'User Account';
                  return (
                    <div key={u._id} style={{
                      backgroundColor: '#111111', borderRadius: '16px', padding: isMobile ? '1rem' : '1.25rem',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
                            background: u.avatarUrl ? `url(${u.avatarUrl}) center/cover no-repeat` : (isStaff ? 'linear-gradient(135deg, #d4af37, #8a6d1c)' : 'linear-gradient(135deg, #374151, #1f2937)'),
                            border: isStaff ? '2px solid #d4af37' : '1px solid rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {!u.avatarUrl && <span style={{ fontSize: '1rem', fontWeight: 800, color: isStaff ? '#000' : '#fff' }}>{u.firstname?.charAt(0) || 'U'}</span>}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <h4 style={{ color: '#ffffff', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '0.98rem' }}>
                                {fullName}
                              </h4>
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '50px',
                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                backgroundColor: isStaff ? 'rgba(212,175,55,0.2)' : 'rgba(59,130,246,0.15)',
                                color: isStaff ? '#d4af37' : '#60a5fa',
                                border: isStaff ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(59,130,246,0.3)',
                              }}>
                                {isStaff ? 'Expert Stylist' : 'Customer'}
                              </span>
                              {u.isVerified && (
                                <span style={{ fontSize: '0.65rem', color: '#22c55e', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <UserCheck size={11} /> Verified
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                              {u.email || 'No email'} {u.phone ? `· ${u.phone}` : ''}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setUserToDelete(u)}
                          style={{
                            padding: '0.5rem 0.85rem', borderRadius: '10px',
                            backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
                            color: '#ef4444', fontWeight: 700, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                            fontFamily: 'Outfit', transition: 'all 0.15s ease',
                          }}
                        >
                          <Trash2 size={13} /> Delete Account
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid rgba(212,175,55,0.35)', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', padding: '1.25rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontFamily: 'monospace', marginBottom: '0.85rem' }}>
              ORDER #{(selectedOrder._id || '').slice(-6).toUpperCase()}
            </div>

            <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.82rem', color: '#d1d5db', marginBottom: '1rem' }}>
              <div><span style={{ color: '#9ca3af' }}>Customer: </span>{selectedOrder.customerInfo?.name || 'N/A'}</div>
              <div><span style={{ color: '#9ca3af' }}>Email: </span>{selectedOrder.customerInfo?.email || 'N/A'}</div>
              <div><span style={{ color: '#9ca3af' }}>Phone: </span>{selectedOrder.customerInfo?.phone || 'N/A'}</div>
              <div><span style={{ color: '#9ca3af' }}>Address: </span>{selectedOrder.customerInfo?.address || 'N/A'}</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Items Ordered</div>
              {(selectedOrder.items || []).map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.8rem', color: '#d1d5db', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span>{item.name || item.title} × {item.quantity}</span>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', paddingTop: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <span>Total Paid</span>
              <span style={{ color: '#d4af37' }}>${(selectedOrder.totalPrice || 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.1rem' }}>
              {selectedOrder.status !== 'shipped' && selectedOrder.status !== 'completed' && (
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'shipped')}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', backgroundColor: '#d4af37', color: '#000', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Mark Shipped
                </button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={() => handleUpdateOrderStatus(selectedOrder._id, 'completed')}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', backgroundColor: '#22c55e', color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#9ca3af', fontWeight: 600, fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Delete User Confirmation Modal */}
      {userToDelete && (
        <div
          onClick={() => setUserToDelete(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#111111', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.4)', width: '100%', maxWidth: '420px', padding: '1.5rem', textAlign: 'center' }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ color: '#ffffff', fontFamily: 'Outfit', fontWeight: 800, margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
              Delete User Account?
            </h3>

            <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to delete <strong style={{ color: '#ffffff' }}>{userToDelete.firstname} ({userToDelete.email})</strong>? All their profile data and bookings will be wiped.
            </p>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={() => setUserToDelete(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#ffffff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                Cancel
              </button>
              <button
                disabled={updatingId === userToDelete._id}
                onClick={() => handleDeleteUserAccount(userToDelete)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                {updatingId === userToDelete._id ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
