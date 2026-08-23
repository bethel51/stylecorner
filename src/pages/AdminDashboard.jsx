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
  Tag,
  Plus,
  Edit3,
  Star,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { StatusBadge } from '../components/common/StatusBadge';
import { OrderTrackingSheet } from '../components/store/OrderTrackingSheet';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'bookings' | 'users' | 'products'
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Modals
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Product Modals State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [productForm, setProductForm] = useState({
    title: '',
    price: '',
    rating: 4.8,
    desc: '',
    badge: '',
    image: '',
  });

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
      const [bookingsData, ordersData, usersData, productsData] = await Promise.all([
        api.getBookings().catch(() => []),
        api.getOrders().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getProducts().catch(() => []),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsersList(Array.isArray(usersData) ? usersData : []);
      setProductsList(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus, e) => {
    if (e) e.stopPropagation();
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      showToast(`Order marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update order', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus, e) => {
    if (e) e.stopPropagation();
    setUpdatingId(bookingId);
    try {
      await api.updateBookingStatus(bookingId, { status: newStatus });
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      if (selectedBooking?._id === bookingId) setSelectedBooking(prev => ({ ...prev, status: newStatus }));
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

  // Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      price: '',
      rating: 4.8,
      desc: '',
      badge: '',
      image: '',
      secondaryImage: '',
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title || '',
      price: prod.price !== undefined ? prod.price : '',
      rating: prod.rating || 4.8,
      desc: prod.desc || '',
      badge: prod.badge || '',
      image: prod.image || '',
      secondaryImage: prod.secondaryImage || '',
    });
    setShowProductModal(true);
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingProductImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setProductForm(prev => ({ ...prev, image: url }));
      showToast('Main product photo uploaded!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingProductImage(false);
    }
  };

  const handleSecondaryProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSecondaryImage(true);
    try {
      const url = await uploadToCloudinary(file);
      setProductForm(prev => ({ ...prev, secondaryImage: url }));
      showToast('Secondary product photo uploaded!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload photo', 'error');
    } finally {
      setUploadingSecondaryImage(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.title || productForm.price === '' || !productForm.image) {
      showToast('Title, price, and primary product image are required.', 'error');
      return;
    }

    setUpdatingId('product_submit');
    try {
      const payload = {
        title: productForm.title.trim(),
        price: Number(productForm.price),
        rating: Number(productForm.rating || 4.8),
        desc: productForm.desc.trim(),
        badge: productForm.badge.trim(),
        image: productForm.image.trim(),
        secondaryImage: productForm.secondaryImage.trim(),
      };

      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct._id, payload);
        setProductsList(prev => prev.map(p => p._id === editingProduct._id ? updated : p));
        showToast(`Product "${updated.title}" updated!`, 'success');
      } else {
        const created = await api.createProduct(payload);
        setProductsList(prev => [created, ...prev]);
        showToast(`Product "${created.title}" added to store!`, 'success');
      }
      setShowProductModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!product?._id) return;
    setUpdatingId(product._id);
    try {
      await api.deleteProduct(product._id);
      setProductsList(prev => prev.filter(p => p._id !== product._id));
      setProductToDelete(null);
      showToast(`Product "${product.title}" removed from store`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || o.price || 0), 0);
  const pendingOrdersCount = orders.filter(o => {
    const st = (o.status || 'pending').toLowerCase();
    return st === 'pending' || st === 'processing';
  }).length;
  const pendingBookingsCount = bookings.filter(b => (b.status || 'pending').toLowerCase() === 'pending').length;
  const customerCount = usersList.filter(u => u.role !== 'staff').length;
  const expertCount = usersList.filter(u => u.role === 'staff').length;

  const filteredOrders = orders.filter(o => {
    const orderStatus = (o.status || 'pending').toLowerCase();
    const matchesStatus = orderStatusFilter === 'all' || orderStatus === orderStatusFilter.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const nameStr = (o.name || o.customerInfo?.name || '').toLowerCase();
    const emailStr = (o.email || o.customerInfo?.email || '').toLowerCase();
    const itemStr = (o.item || (Array.isArray(o.items) ? o.items.map(i => i.name || i.title).join(' ') : '')).toLowerCase();
    const phoneStr = (o.phone || o.customerInfo?.phone || '').toLowerCase();
    const idStr = (o._id || '').toLowerCase();

    const matchesSearch = !q ||
      nameStr.includes(q) ||
      emailStr.includes(q) ||
      itemStr.includes(q) ||
      phoneStr.includes(q) ||
      idStr.includes(q);

    return matchesStatus && matchesSearch;
  });

  const filteredBookings = bookings.filter(b => {
    const bookingStatus = (b.status || 'pending').toLowerCase();
    let matchesStatus = bookingStatusFilter === 'all';
    if (!matchesStatus) {
      if (bookingStatusFilter === 'confirmed') {
        matchesStatus = bookingStatus === 'confirmed' || bookingStatus === 'accepted';
      } else if (bookingStatusFilter === 'cancelled') {
        matchesStatus = bookingStatus === 'cancelled' || bookingStatus === 'rejected';
      } else {
        matchesStatus = bookingStatus === bookingStatusFilter.toLowerCase();
      }
    }
    const q = searchQuery.trim().toLowerCase();
    const nameStr = (b.clientName || b.user?.firstname || '').toLowerCase();
    const emailStr = (b.clientEmail || b.email || '').toLowerCase();
    const serviceStr = (b.serviceName || b.service || '').toLowerCase();
    const stylistStr = (b.stylist || '').toLowerCase();
    const phoneStr = (b.phone || b.clientPhone || '').toLowerCase();
    const idStr = (b._id || '').toLowerCase();

    const matchesSearch = !q ||
      nameStr.includes(q) ||
      emailStr.includes(q) ||
      serviceStr.includes(q) ||
      stylistStr.includes(q) ||
      phoneStr.includes(q) ||
      idStr.includes(q);

    return matchesStatus && matchesSearch;
  });

  const filteredUsers = usersList.filter(u => {
    const matchesRole = userRoleFilter === 'all' ||
      (userRoleFilter === 'staff' ? u.role === 'staff' : u.role !== 'staff');
    const q = searchQuery.trim().toLowerCase();
    const fullName = `${u.firstname || ''} ${u.lastname || ''}`.toLowerCase();
    const matchesSearch = !q ||
      fullName.includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

  const filteredProducts = productsList.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    return !q ||
      (p.title || '').toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q) ||
      (p.badge || '').toLowerCase().includes(q);
  });

  const kpiCards = [
    { label: 'Store Revenue', value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: '#d4af37', bg: 'rgba(212,175,55,0.1)' },
    { label: 'Total Orders', value: orders.length, sub: `${pendingOrdersCount} pending`, icon: ShoppingBag, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Bookings Queue', value: bookings.length, sub: `${pendingBookingsCount} pending`, icon: Calendar, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Store Products', value: productsList.length, sub: 'Active in store', icon: Tag, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  ];

  const navItems = [
    { id: 'orders', label: 'Store Orders', icon: ShoppingBag, count: orders.length },
    { id: 'bookings', label: 'Salon Bookings', icon: Calendar, count: bookings.length },
    { id: 'users', label: 'User Accounts', icon: Users, count: usersList.length },
    { id: 'products', label: 'Manage Products', icon: Tag, count: productsList.length },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', fontFamily: 'Outfit, sans-serif', color: '#0f172a' }}>

      {/* Mobile Drawer Backdrop */}
      {isMobile && isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            zIndex: 40, transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {/* ── Sidebar (Desktop Fixed / Mobile Slide-Over Drawer) ── */}
      <aside style={{
        width: '260px',
        flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transform: isMobile && !isMobileOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isMobile && isMobileOpen ? '0 0 30px rgba(0,0,0,0.15)' : 'none',
      }}>
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #d4af37, #b5952f)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>Style Corner</div>
              <div style={{ fontSize: '0.65rem', color: '#b5952f', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Admin Portal</div>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileOpen(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', padding: '0.25rem', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Admin User Card */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
              background: user?.avatarUrl ? `url(${user.avatarUrl}) center/cover no-repeat` : 'linear-gradient(135deg, #d4af37, #b5952f)',
              border: '2px solid rgba(212,175,55,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {!user?.avatarUrl && <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{user?.firstname?.charAt(0) || 'A'}</span>}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstname || 'Admin'} {user?.lastname || ''}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>● System Admin</div>
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
                backgroundColor: activeTab === item.id ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: activeTab === item.id ? '#b5952f' : '#64748b',
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
                borderRadius: '50px', backgroundColor: activeTab === item.id ? '#d4af37' : 'rgba(0,0,0,0.06)',
                color: activeTab === item.id ? '#fff' : '#64748b',
              }}>
                {item.count}
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar Footer Controls */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <button
            onClick={() => { fetchAdminData(); if (isMobile) setIsMobileOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 0.85rem', borderRadius: '10px', width: '100%',
              backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)',
              color: '#64748b', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 500,
            }}
          >
            <RefreshCw size={14} /> Refresh Data
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.65rem 0.85rem', borderRadius: '10px', width: '100%',
              backgroundColor: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)',
              color: '#64748b', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 500,
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
          backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: isMobile ? '0.85rem 1rem' : '1rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(true)}
                style={{
                  background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                  color: '#b5952f', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: isMobile ? '1.1rem' : '1.3rem', color: '#0f172a', margin: 0 }}>
                {activeTab === 'orders' ? 'Store Orders' : activeTab === 'bookings' ? 'Salon Bookings' : activeTab === 'users' ? 'User Accounts' : 'Manage Store Products'}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.1rem 0 0 0', display: isMobile ? 'none' : 'block' }}>
                {activeTab === 'orders' ? 'Manage customer orders in real-time' : activeTab === 'bookings' ? 'Manage appointment bookings' : activeTab === 'users' ? 'Manage registered client and expert accounts' : 'Upload and manage products displayed on the public store page'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAddProduct}
                style={{
                  backgroundColor: '#d4af37', border: 'none', color: '#ffffff',
                  padding: '0.45rem 0.85rem', borderRadius: '10px', fontWeight: 800,
                  fontSize: '0.8rem', fontFamily: 'Outfit', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  boxShadow: '0 4px 12px rgba(212,175,55,0.3)'
                }}
              >
                <Plus size={15} /> Add Product
              </button>
            )}
            <button
              onClick={fetchAdminData}
              title="Refresh"
              style={{
                background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                color: '#0f172a', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <RefreshCw size={15} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'rgba(34,197,94,0.1)', padding: '0.3rem 0.6rem', borderRadius: '50px', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>Live</span>
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
                backgroundColor: '#ffffff', borderRadius: isMobile ? '14px' : '16px',
                padding: isMobile ? '0.85rem' : '1.25rem',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</span>
                  <div style={{ width: isMobile ? '26px' : '32px', height: isMobile ? '26px' : '32px', borderRadius: '8px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <card.icon size={isMobile ? 14 : 16} color={card.color} />
                  </div>
                </div>
                <div style={{ fontSize: isMobile ? '1.25rem' : '1.6rem', fontWeight: 800, color: card.color === '#d4af37' ? '#b5952f' : card.color, fontFamily: 'Outfit', lineHeight: 1 }}>{card.value}</div>
                {card.sub && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>{card.sub}</div>}
              </div>
            ))}
          </div>

          {/* Search Bar + Filter Chips Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={
                  activeTab === 'orders'
                    ? 'Search name, email, order ID...'
                    : activeTab === 'bookings'
                    ? 'Search client, service, stylist...'
                    : activeTab === 'users'
                    ? 'Search name, email, phone...'
                    : 'Search product title, badge, desc...'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.5rem', borderRadius: '10px',
                  backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.12)',
                  color: '#0f172a', fontSize: '0.83rem', outline: 'none', fontFamily: 'Outfit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Scrollable Filter Chips */}
            {activeTab !== 'products' && (
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
                        backgroundColor: active ? '#171717' : '#ffffff',
                        color: active ? '#ffffff' : '#64748b',
                        border: active ? '1px solid #171717' : '1px solid rgba(0,0,0,0.1)',
                        fontFamily: 'Outfit', transition: 'all 0.15s ease',
                      }}
                    >
                      {labelDisplay}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Content List */}
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '14px', height: '110px', border: '1px solid rgba(0,0,0,0.06)' }} />
              ))}
            </div>
          ) : activeTab === 'orders' ? (
            filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '18px', border: '1px dashed rgba(0,0,0,0.12)' }}>
                <Package size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem' }}>No Orders Found</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{searchQuery || orderStatusFilter !== 'all' ? 'Try clearing your filters.' : 'Store orders will appear here once placed.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredOrders.map(order => (
                  <div
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    style={{
                      backgroundColor: '#ffffff', borderRadius: '16px', padding: isMobile ? '1rem' : '1.25rem',
                      border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      transition: 'border-color 0.2s ease, transform 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.15rem' }}>
                          ORDER #{(order._id || '').slice(-6).toUpperCase()}
                        </div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>
                          {order.name || order.customerInfo?.name || 'Store Customer'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                          {order.email || order.customerInfo?.email || ''} {(order.phone || order.customerInfo?.phone) ? `· ${order.phone || order.customerInfo?.phone}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#b5952f', fontFamily: 'Outfit' }}>
                          ${(order.totalPrice || order.price || 0).toFixed(2)}
                        </span>
                        <StatusBadge status={order.status || 'pending'} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '0.85rem' }}>
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        <>
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} style={{ marginRight: '0.6rem', display: 'inline-block' }}>
                              • {item.name || item.title || 'Product'} ×{item.quantity || 1}
                            </span>
                          ))}
                          {order.items.length > 3 && <span style={{ color: '#b5952f' }}>+{order.items.length - 3} more</span>}
                        </>
                      ) : (
                        <span>• {order.item || 'Store Item'}</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {order.status !== 'shipped' && order.status !== 'completed' && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={(e) => handleUpdateOrderStatus(order._id, 'shipped', e)}
                          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#d4af37', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                        >
                          <Truck size={13} /> Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={(e) => handleUpdateOrderStatus(order._id, 'completed', e)}
                          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                        >
                          <CheckCircle size={13} /> Mark Completed
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrderForTracking(order); }}
                        style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(212,175,55,0.15)', color: '#b5952f', fontWeight: 800, fontSize: '0.78rem', border: '1px solid rgba(212,175,55,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                      >
                        <Truck size={13} /> Track & Manage Delivery
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.04)', color: '#334155', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
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
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '18px', border: '1px dashed rgba(0,0,0,0.12)' }}>
                <Calendar size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem' }}>No Bookings Found</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{searchQuery || bookingStatusFilter !== 'all' ? 'Try clearing your filters.' : 'Customer appointments will appear here.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredBookings.map(b => (
                  <div
                    key={b._id}
                    onClick={() => setSelectedBooking(b)}
                    style={{
                      backgroundColor: '#ffffff', borderRadius: '16px', padding: isMobile ? '1rem' : '1.25rem',
                      border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                      transition: 'border-color 0.2s ease, transform 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a', fontFamily: 'Outfit' }}>
                          {b.serviceName || b.service || 'Grooming Service'}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#b5952f', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Users size={12} /> {b.clientName || b.user?.firstname || 'Guest'} {b.phone || b.clientPhone ? `· ${b.phone || b.clientPhone}` : ''}
                        </div>
                      </div>
                      <StatusBadge status={b.status || 'pending'} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.76rem', color: '#64748b', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                      <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{b.date || 'TBD'} at {b.time || 'TBD'}</span>
                      <span><Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Stylist: {b.stylist || 'Any'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'cancelled' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={(e) => handleUpdateBookingStatus(b._id, 'confirmed', e)}
                          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#d4af37', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={(e) => handleUpdateBookingStatus(b._id, 'completed', e)}
                          style={{ flex: 1, padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Complete
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={(e) => handleUpdateBookingStatus(b._id, 'cancelled', e)}
                          style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontFamily: 'Outfit' }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                        style={{ padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.04)', color: '#334155', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'users' ? (
            /* --- TAB 3: USER ACCOUNTS MANAGEMENT --- */
            filteredUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '18px', border: '1px dashed rgba(0,0,0,0.12)' }}>
                <Users size={40} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem' }}>No Accounts Found</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{searchQuery || userRoleFilter !== 'all' ? 'Try clearing your search or role filter.' : 'Registered user accounts will appear here.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {filteredUsers.map(u => {
                  const isStaff = u.role === 'staff';
                  const fullName = `${u.firstname || ''} ${u.lastname || ''}`.trim() || 'User Account';
                  return (
                    <div key={u._id} style={{
                      backgroundColor: '#ffffff', borderRadius: '16px', padding: isMobile ? '1rem' : '1.25rem',
                      border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div style={{
                            width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
                            background: u.avatarUrl ? `url(${u.avatarUrl}) center/cover no-repeat` : (isStaff ? 'linear-gradient(135deg, #d4af37, #b5952f)' : 'linear-gradient(135deg, #cbd5e1, #94a3b8)'),
                            border: isStaff ? '2px solid #d4af37' : '1px solid rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {!u.avatarUrl && <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{u.firstname?.charAt(0) || 'U'}</span>}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                              <h4 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '0.98rem' }}>
                                {fullName}
                              </h4>
                              <span style={{
                                fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '50px',
                                textTransform: 'uppercase', letterSpacing: '0.5px',
                                backgroundColor: isStaff ? 'rgba(212,175,55,0.18)' : 'rgba(59,130,246,0.12)',
                                color: isStaff ? '#b5952f' : '#2563eb',
                                border: isStaff ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(59,130,246,0.3)',
                              }}>
                                {isStaff ? 'Expert Stylist' : 'Customer'}
                              </span>
                              {u.isVerified && (
                                <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                  <UserCheck size={11} /> Verified
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                              {u.email || 'No email'} {u.phone ? `· ${u.phone}` : ''}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setUserToDelete(u)}
                          style={{
                            padding: '0.5rem 0.85rem', borderRadius: '10px',
                            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
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
          ) : (
            /* --- TAB 4: STORE PRODUCTS MANAGEMENT --- */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>
                    Manage Store Products ({filteredProducts.length})
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                    Products added here are live on the public store page.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  style={{
                    backgroundColor: '#d4af37', border: 'none', color: '#ffffff',
                    padding: '0.6rem 1.1rem', borderRadius: '10px', fontWeight: 800,
                    fontSize: '0.82rem', fontFamily: 'Outfit', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    boxShadow: '0 4px 14px rgba(212,175,55,0.35)'
                  }}
                >
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '18px', border: '1px dashed rgba(0,0,0,0.12)' }}>
                  <Tag size={42} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800 }}>No Products Found</h3>
                  <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.25rem' }}>{searchQuery ? 'Try clearing your search term.' : 'Click below to upload products to your public store page.'}</p>
                  <button
                    onClick={handleOpenAddProduct}
                    style={{ backgroundColor: '#d4af37', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.85rem', fontFamily: 'Outfit', cursor: 'pointer' }}
                  >
                    + Add Product Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {filteredProducts.map(p => (
                    <div
                      key={p._id || p.id}
                      style={{
                        backgroundColor: '#ffffff', borderRadius: '16px', padding: '1rem',
                        border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        {/* Product Image preview */}
                        <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem', backgroundColor: '#f1f5f9' }}>
                          <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {p.badge && (
                            <span style={{
                              position: 'absolute', top: '8px', left: '8px',
                              backgroundColor: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)',
                              color: '#d4af37', fontSize: '0.65rem', fontWeight: 800,
                              padding: '0.15rem 0.55rem', borderRadius: '50px',
                              border: '1px solid rgba(212,175,55,0.3)', fontFamily: 'Outfit'
                            }}>
                              {p.badge}
                            </span>
                          )}
                          <span style={{
                            position: 'absolute', bottom: '8px', right: '8px',
                            backgroundColor: '#ffffff', color: '#0f172a', fontWeight: 900,
                            fontSize: '0.95rem', padding: '0.2rem 0.6rem', borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontFamily: 'Outfit'
                          }}>
                            ${p.price}
                          </span>
                        </div>

                        <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#0f172a', fontSize: '0.98rem', margin: '0 0 0.25rem' }}>
                          {p.title}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                          <Star size={12} fill="#d4af37" />
                          <span>{p.rating || 4.8}</span>
                        </div>

                        <p style={{ color: '#64748b', fontSize: '0.78rem', margin: '0 0 0.85rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.desc || 'No description provided.'}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          style={{
                            flex: 1, padding: '0.5rem', borderRadius: '8px',
                            backgroundColor: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                            color: '#b5952f', fontWeight: 700, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                            fontFamily: 'Outfit'
                          }}
                        >
                          <Edit3 size={13} /> Edit Details
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          style={{
                            padding: '0.5rem 0.75rem', borderRadius: '8px',
                            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', fontWeight: 700, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
                            fontFamily: 'Outfit'
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', padding: '1.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.85rem' }}>
              ORDER #{(selectedOrder._id || '').slice(-6).toUpperCase()}
            </div>

            <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.82rem', color: '#334155', marginBottom: '1rem' }}>
              <div><span style={{ color: '#64748b' }}>Customer: </span>{selectedOrder.customerInfo?.name || selectedOrder.name || 'N/A'}</div>
              <div><span style={{ color: '#64748b' }}>Email: </span>{selectedOrder.customerInfo?.email || selectedOrder.email || 'N/A'}</div>
              <div><span style={{ color: '#64748b' }}>Phone: </span>{selectedOrder.customerInfo?.phone || selectedOrder.phone || 'N/A'}</div>
              <div><span style={{ color: '#64748b' }}>Address: </span>{selectedOrder.customerInfo?.address || selectedOrder.address || 'N/A'}</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b5952f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Items Ordered</div>
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.8rem', color: '#334155', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <span>{item.name || item.title} × {item.quantity || 1}</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '0.35rem 0', fontSize: '0.82rem', color: '#0f172a' }}>
                  {selectedOrder.item || 'Grooming Products'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <span>Total Paid</span>
              <span style={{ color: '#b5952f' }}>${(selectedOrder.totalPrice || selectedOrder.price || 0).toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.1rem' }}>
              {selectedOrder.status !== 'shipped' && selectedOrder.status !== 'completed' && (
                <button
                  onClick={(e) => handleUpdateOrderStatus(selectedOrder._id, 'shipped', e)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', backgroundColor: '#d4af37', color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Mark Shipped
                </button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={(e) => handleUpdateOrderStatus(selectedOrder._id, 'completed', e)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.04)', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          onClick={() => setSelectedBooking(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px', maxHeight: '85vh', overflowY: 'auto', padding: '1.25rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.85rem' }}>
              BOOKING #{(selectedBooking._id || '').slice(-6).toUpperCase()}
            </div>

            <div style={{ display: 'grid', gap: '0.45rem', fontSize: '0.83rem', color: '#334155', marginBottom: '1rem' }}>
              <div><span style={{ color: '#64748b' }}>Service: </span><strong style={{ color: '#0f172a' }}>{selectedBooking.serviceName || selectedBooking.service}</strong></div>
              <div><span style={{ color: '#64748b' }}>Client Name: </span>{selectedBooking.clientName || selectedBooking.user?.firstname || 'Guest'}</div>
              <div><span style={{ color: '#64748b' }}>Client Email: </span>{selectedBooking.clientEmail || selectedBooking.email || 'N/A'}</div>
              <div><span style={{ color: '#64748b' }}>Phone: </span>{selectedBooking.phone || selectedBooking.clientPhone || 'N/A'}</div>
              <div><span style={{ color: '#64748b' }}>Assigned Stylist: </span><span style={{ color: '#b5952f', fontWeight: 600 }}>{selectedBooking.stylist || 'Any Specialist'}</span></div>
              <div><span style={{ color: '#64748b' }}>Date & Time: </span>{selectedBooking.date || 'TBD'} at {selectedBooking.time || 'TBD'}</div>
              <div><span style={{ color: '#64748b' }}>Status: </span><StatusBadge status={selectedBooking.status || 'pending'} /></div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              {selectedBooking.status !== 'confirmed' && selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={(e) => handleUpdateBookingStatus(selectedBooking._id, 'confirmed', e)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', backgroundColor: '#d4af37', color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Confirm Booking
                </button>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={(e) => handleUpdateBookingStatus(selectedBooking._id, 'completed', e)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '10px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Complete Service
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ padding: '0.6rem 0.85rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.04)', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontFamily: 'Outfit' }}
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
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.3)', width: '100%', maxWidth: '420px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
              Delete User Account?
            </h3>

            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to delete <strong style={{ color: '#0f172a' }}>{userToDelete.firstname} ({userToDelete.email})</strong>? All their profile data and bookings will be wiped.
            </p>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={() => setUserToDelete(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit' }}
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

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div
          onClick={() => setShowProductModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '1.15rem' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}>✕</button>
            </div>

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              {/* Dual Product Photos Section */}
              <div style={{ background: '#faf9f5', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#171717', marginBottom: '0.65rem', fontFamily: 'Outfit' }}>
                  📸 Product Photos (Up to 2 Photos)
                </div>

                {/* Photo 1: Primary Image */}
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem', fontFamily: 'Outfit' }}>
                    Photo 1: Primary Main Image *
                  </label>

                  {productForm.image && (
                    <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.4rem', border: '1px solid rgba(0,0,0,0.1)' }}>
                      <img src={productForm.image} alt="Main Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="url"
                      placeholder="Primary image URL..."
                      value={productForm.image}
                      onChange={e => setProductForm({ ...productForm, image: e.target.value })}
                      style={{ flex: 1, padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.78rem', fontFamily: 'Outfit', outline: 'none' }}
                    />
                    <label
                      htmlFor="product-image-upload-1"
                      style={{
                        cursor: uploadingProductImage ? 'not-allowed' : 'pointer',
                        backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)',
                        color: '#b5952f', padding: '0.5rem 0.65rem', borderRadius: '8px',
                        fontSize: '0.75rem', fontWeight: 800, fontFamily: 'Outfit',
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0
                      }}
                    >
                      <Upload size={12} />
                      {uploadingProductImage ? 'Uploading...' : 'Upload 1'}
                    </label>
                    <input
                      id="product-image-upload-1"
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageUpload}
                      disabled={uploadingProductImage}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>

                {/* Photo 2: Secondary Image */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem', fontFamily: 'Outfit' }}>
                    Photo 2: Secondary Angle / Detail Image (Optional)
                  </label>

                  {productForm.secondaryImage && (
                    <div style={{ position: 'relative', width: '100%', height: '110px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.4rem', border: '1px solid rgba(0,0,0,0.1)' }}>
                      <img src={productForm.secondaryImage} alt="Secondary Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <input
                      type="url"
                      placeholder="Secondary image URL..."
                      value={productForm.secondaryImage}
                      onChange={e => setProductForm({ ...productForm, secondaryImage: e.target.value })}
                      style={{ flex: 1, padding: '0.5rem 0.65rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.78rem', fontFamily: 'Outfit', outline: 'none' }}
                    />
                    <label
                      htmlFor="product-image-upload-2"
                      style={{
                        cursor: uploadingSecondaryImage ? 'not-allowed' : 'pointer',
                        backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                        color: '#3b82f6', padding: '0.5rem 0.65rem', borderRadius: '8px',
                        fontSize: '0.75rem', fontWeight: 800, fontFamily: 'Outfit',
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0
                      }}
                    >
                      <Upload size={12} />
                      {uploadingSecondaryImage ? 'Uploading...' : 'Upload 2'}
                    </label>
                    <input
                      id="product-image-upload-2"
                      type="file"
                      accept="image/*"
                      onChange={handleSecondaryProductImageUpload}
                      disabled={uploadingSecondaryImage}
                      style={{ display: 'none' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', fontFamily: 'Outfit' }}>Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Atelier Gold Pomade"
                  value={productForm.title}
                  onChange={e => setProductForm({ ...productForm, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.82rem', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', fontFamily: 'Outfit' }}>Price (₦) *</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="12000"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.82rem', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', fontFamily: 'Outfit' }}>Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bestseller / New"
                    value={productForm.badge}
                    onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.82rem', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', fontFamily: 'Outfit' }}>Rating (1.0 - 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={productForm.rating}
                  onChange={e => setProductForm({ ...productForm, rating: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.82rem', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', fontFamily: 'Outfit' }}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Short product description..."
                  value={productForm.desc}
                  onChange={e => setProductForm({ ...productForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '0.82rem', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === 'product_submit'}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: '#d4af37', border: 'none', color: '#ffffff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  {updatingId === 'product_submit' ? 'Saving...' : editingProduct ? 'Save Changes' : 'Upload Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {productToDelete && (
        <div
          onClick={() => setProductToDelete(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid rgba(239,68,68,0.3)', width: '100%', maxWidth: '420px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
          >
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={26} />
            </div>

            <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: '0 0 0.5rem', fontSize: '1.1rem' }}>
              Delete Product?
            </h3>

            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to remove <strong style={{ color: '#0f172a' }}>"{productToDelete.title}"</strong> from the public store page?
            </p>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={() => setProductToDelete(null)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                Cancel
              </button>
              <button
                disabled={updatingId === productToDelete._id}
                onClick={() => handleDeleteProduct(productToDelete)}
                style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', backgroundColor: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                {updatingId === productToDelete._id ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Tracking & Communication Sheet (Admin Mode) */}
      <OrderTrackingSheet
        isOpen={!!selectedOrderForTracking}
        onClose={() => setSelectedOrderForTracking(null)}
        order={selectedOrderForTracking}
        isAdmin={true}
        onOrderUpdated={(updated) => {
          setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
          setSelectedOrderForTracking(updated);
        }}
      />
    </div>
  );
};
