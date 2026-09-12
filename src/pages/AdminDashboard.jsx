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
  MessageSquare,
  Send,
  Bell,
  Download,
  Phone,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { StatusBadge } from '../components/common/StatusBadge';
import { OrderTrackingSheet } from '../components/store/OrderTrackingSheet';
import { NotificationSheet } from '../components/common/NotificationSheet';
import { exportOrdersToCSV, exportBookingsToCSV } from '../utils/exportUtils';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, showToast } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'messages' | 'bookings' | 'users' | 'products' | 'payouts'
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Modals
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [payoutStatusFilter, setPayoutStatusFilter] = useState('all');
  const [datePeriodFilter, setDatePeriodFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [rejectionModalWithdrawal, setRejectionModalWithdrawal] = useState(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [copiedWithdrawalId, setCopiedWithdrawalId] = useState(null);

  // Product Modals State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [uploadingSecondaryImage, setUploadingSecondaryImage] = useState(false);
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

  // Notification Sheet & Inquiries Reply State
  const [showNotificationSheet, setShowNotificationSheet] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [replyInputMap, setReplyInputMap] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState(null);

  const fetchUnreadNotifs = async () => {
    try {
      const data = await api.getNotifications();
      setUnreadNotifCount(data.unreadCount || 0);
    } catch (e) {}
  };

  useEffect(() => {
    fetchUnreadNotifs();
    const timer = setInterval(fetchUnreadNotifs, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleSendAdminReply = async (orderId) => {
    const text = (replyInputMap[orderId] || '').trim();
    if (!text) return;
    setSendingReplyId(orderId);
    try {
      const updatedOrder = await api.addOrderMessage(orderId, text);
      setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
      setReplyInputMap(prev => ({ ...prev, [orderId]: '' }));
      showToast('Reply sent and customer notified in real-time!', 'success');
      fetchUnreadNotifs();
    } catch (err) {
      showToast(err.message || 'Failed to send reply', 'error');
    } finally {
      setSendingReplyId(null);
    }
  };

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
      const [bookingsData, ordersData, usersData, productsData, withdrawalsData] = await Promise.all([
        api.getBookings().catch(() => []),
        api.getOrders().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getProducts().catch(() => []),
        api.getAdminWithdrawals().catch(() => []),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setUsersList(Array.isArray(usersData) ? usersData : []);
      setProductsList(Array.isArray(productsData) ? productsData : []);
      setWithdrawalsList(Array.isArray(withdrawalsData) ? withdrawalsData : []);
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

  // Payout / Withdrawal Actions
  const handleSettlePayout = async (withdrawalId) => {
    setUpdatingId(withdrawalId);
    try {
      await api.updateWithdrawalStatus(withdrawalId, { status: 'completed' });
      setWithdrawalsList(prev => prev.map(w => w._id === withdrawalId ? { ...w, status: 'completed', settledAt: new Date() } : w));
      showToast('Payout marked as settled & transferred!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to settle payout', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmRejectPayout = async () => {
    if (!rejectionModalWithdrawal) return;
    const withdrawalId = rejectionModalWithdrawal._id;
    setUpdatingId(withdrawalId);
    try {
      await api.updateWithdrawalStatus(withdrawalId, {
        status: 'rejected',
        rejectionReason: rejectionReasonInput.trim() || 'Declined by administrator'
      });
      setWithdrawalsList(prev => prev.map(w => w._id === withdrawalId ? {
        ...w,
        status: 'rejected',
        rejectionReason: rejectionReasonInput.trim() || 'Declined by administrator'
      } : w));
      setRejectionModalWithdrawal(null);
      setRejectionReasonInput('');
      showToast('Payout request declined and funds refunded to expert wallet.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to decline payout', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCopyBankDetails = (w) => {
    const text = `Bank: ${w.bankName}\nAccount Number: ${w.accountNumber}\nAccount Name: ${w.accountName}\nAmount: ₦${Number(w.amount).toLocaleString()}\nReference: ${w.reference}`;
    navigator.clipboard.writeText(text);
    setCopiedWithdrawalId(w._id);
    showToast('Bank details copied to clipboard!', 'success');
    setTimeout(() => setCopiedWithdrawalId(null), 2500);
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
        const targetId = editingProduct._id || editingProduct.id;
        const updated = await api.updateProduct(targetId, payload);
        setProductsList(prev => prev.map(p => (p._id === targetId || p.id === targetId) ? updated : p));
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

  const filterByDatePeriod = (dateVal) => {
    if (datePeriodFilter === 'all' || !dateVal) return true;
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return true;
    const now = new Date();
    if (datePeriodFilter === 'today') {
      return d.toDateString() === now.toDateString();
    }
    if (datePeriodFilter === 'week') {
      const pastWeek = new Date();
      pastWeek.setDate(now.getDate() - 7);
      return d >= pastWeek;
    }
    if (datePeriodFilter === 'month') {
      const pastMonth = new Date();
      pastMonth.setDate(now.getDate() - 30);
      return d >= pastMonth;
    }
    return true;
  };

  const getCleanPhone = (phone) => (phone || '').replace(/[^0-9+]/g, '');
  const openWhatsApp = (phone, name = 'Customer') => {
    const clean = getCleanPhone(phone);
    if (!clean) {
      showToast('No valid phone number for WhatsApp', 'error');
      return;
    }
    const intl = clean.startsWith('+') ? clean.slice(1) : clean.startsWith('0') ? '234' + clean.slice(1) : clean;
    const msg = encodeURIComponent(`Hello ${name}, this is Style Corner Salon & Atelier regarding your order/booking.`);
    window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
  };

  const handleToggleProductStock = async (product, e) => {
    e.stopPropagation();
    const isOut = product.badge === 'Out of Stock';
    const newBadge = isOut ? '' : 'Out of Stock';
    setUpdatingId(product._id || product.id);
    try {
      const updated = await api.updateProduct(product._id || product.id, {
        ...product,
        badge: newBadge,
      });
      setProductsList(prev => prev.map(p => (p._id === product._id || p.id === product._id) ? updated : p));
      showToast(`"${product.title}" marked as ${newBadge ? 'Out of Stock' : 'In Stock'}`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update stock status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const periodOrders = orders.filter(o => filterByDatePeriod(o.createdAt));
  const totalRevenue = periodOrders.reduce((sum, o) => sum + (o.totalPrice || o.price || 0), 0);
  const pendingOrdersCount = periodOrders.filter(o => {
    const st = (o.status || 'pending').toLowerCase();
    return st === 'pending' || st === 'processing';
  }).length;
  const periodBookings = bookings.filter(b => filterByDatePeriod(b.date || b.createdAt));
  const pendingBookingsCount = periodBookings.filter(b => (b.status || 'pending').toLowerCase() === 'pending').length;

  const orderCounts = {
    all: periodOrders.length,
    pending: periodOrders.filter(o => (o.status || 'pending').toLowerCase() === 'pending').length,
    processing: periodOrders.filter(o => (o.status || '').toLowerCase() === 'processing').length,
    shipped: periodOrders.filter(o => (o.status || '').toLowerCase() === 'shipped').length,
    completed: periodOrders.filter(o => (o.status || '').toLowerCase() === 'completed').length,
  };

  const bookingCounts = {
    all: periodBookings.length,
    pending: periodBookings.filter(b => (b.status || 'pending').toLowerCase() === 'pending').length,
    confirmed: periodBookings.filter(b => ['confirmed', 'accepted'].includes((b.status || '').toLowerCase())).length,
    completed: periodBookings.filter(b => (b.status || '').toLowerCase() === 'completed').length,
    cancelled: periodBookings.filter(b => ['cancelled', 'rejected'].includes((b.status || '').toLowerCase())).length,
  };

  const userCounts = {
    all: usersList.length,
    customer: usersList.filter(u => u.role !== 'staff').length,
    staff: usersList.filter(u => u.role === 'staff').length,
  };

  const filteredOrders = periodOrders.filter(o => {
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

  const filteredBookings = periodBookings.filter(b => {
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

  const pendingPayoutsCount = withdrawalsList.filter(w => (w.status || 'processing') === 'processing').length;
  const completedPayoutsCount = withdrawalsList.filter(w => w.status === 'completed').length;
  const rejectedPayoutsCount = withdrawalsList.filter(w => w.status === 'rejected').length;

  const totalPayoutsVolume = withdrawalsList
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);
  const pendingPayoutsVolume = withdrawalsList
    .filter(w => (w.status || 'processing') === 'processing')
    .reduce((sum, w) => sum + (Number(w.amount) || 0), 0);

  const filteredWithdrawals = withdrawalsList.filter(w => {
    const status = (w.status || 'processing').toLowerCase();
    const matchesStatus = payoutStatusFilter === 'all' || status === payoutStatusFilter.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const expertStr = (w.expertName || '').toLowerCase();
    const emailStr = (w.userEmail || '').toLowerCase();
    const bankStr = (w.bankName || '').toLowerCase();
    const accStr = (w.accountNumber || '').toLowerCase();
    const accNameStr = (w.accountName || '').toLowerCase();
    const refStr = (w.reference || '').toLowerCase();

    const matchesSearch = !q ||
      expertStr.includes(q) ||
      emailStr.includes(q) ||
      bankStr.includes(q) ||
      accStr.includes(q) ||
      accNameStr.includes(q) ||
      refStr.includes(q);

    return matchesStatus && matchesSearch;
  });

  const kpiCards = [
    { label: datePeriodFilter === 'all' ? 'Store Revenue' : `Revenue (${datePeriodFilter})`, value: `₦${Number(totalRevenue).toLocaleString()}`, icon: DollarSign, color: '#d4af37', bg: 'rgba(212,175,55,0.1)' },
    { label: 'Total Orders', value: periodOrders.length, sub: `${pendingOrdersCount} pending`, icon: ShoppingBag, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Bookings Queue', value: periodBookings.length, sub: `${pendingBookingsCount} pending`, icon: Calendar, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Store Products', value: productsList.length, sub: 'Active in store', icon: Tag, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
  ];

  const ordersWithMessages = orders.filter(o => Array.isArray(o.messages) && o.messages.length > 0);

  const navItems = [
    { id: 'orders', label: 'Store Orders', icon: ShoppingBag, count: orders.length },
    { id: 'messages', label: 'Order Inquiries', icon: MessageSquare, count: ordersWithMessages.length },
    { id: 'bookings', label: 'Salon Bookings', icon: Calendar, count: bookings.length },
    { id: 'users', label: 'User Accounts', icon: Users, count: usersList.length },
    { id: 'products', label: 'Manage Products', icon: Tag, count: productsList.length },
    { id: 'payouts', label: 'Expert Payouts', icon: DollarSign, count: pendingPayoutsCount },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      fontFamily: 'Outfit, sans-serif',
      color: '#0f172a',
      boxSizing: 'border-box',
    }}>

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
        minWidth: 0,
        maxWidth: '100%',
        width: isMobile ? '100%' : 'calc(100% - 260px)',
        overflowX: 'hidden',
        overflowY: 'auto',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}>

        {/* Top Header Bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: isMobile ? '0.75rem 0.85rem' : '1rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '0.5rem',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flex: 1 }}>
            {isMobile && (
              <button
                onClick={() => setIsMobileOpen(true)}
                style={{
                  background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                  color: '#b5952f', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <Menu size={20} />
              </button>
            )}
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: isMobile ? '1rem' : '1.3rem', color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeTab === 'orders' ? 'Store Orders' : activeTab === 'messages' ? 'Order Inquiries' : activeTab === 'bookings' ? 'Salon Bookings' : activeTab === 'users' ? 'User Accounts' : 'Store Products'}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0.1rem 0 0 0', display: isMobile ? 'none' : 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeTab === 'orders' ? 'Manage customer orders in real-time' : activeTab === 'messages' ? 'Reply to customer inquiries and send instant real-time notifications' : activeTab === 'bookings' ? 'Manage appointment bookings' : activeTab === 'users' ? 'Manage registered client and expert accounts' : 'Upload and manage products displayed on the public store page'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            {activeTab === 'products' && (
              <button
                onClick={handleOpenAddProduct}
                style={{
                  backgroundColor: '#d4af37', border: 'none', color: '#ffffff',
                  padding: isMobile ? '0.45rem 0.65rem' : '0.45rem 0.85rem', borderRadius: '10px', fontWeight: 800,
                  fontSize: isMobile ? '0.75rem' : '0.8rem', fontFamily: 'Outfit', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  boxShadow: '0 4px 12px rgba(212,175,55,0.3)', flexShrink: 0,
                }}
              >
                <Plus size={15} /> {isMobile ? 'Add' : 'Add Product'}
              </button>
            )}
            <button
              onClick={() => setShowNotificationSheet(true)}
              title="Notifications"
              style={{
                background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                color: unreadNotifCount > 0 ? '#b5952f' : '#0f172a', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0,
              }}
            >
              <Bell size={15} />
              {unreadNotifCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-3px', right: '-3px',
                  backgroundColor: '#ef4444', color: '#fff', fontSize: '0.58rem',
                  fontWeight: 900, borderRadius: '50%', width: '15px', height: '15px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 6px rgba(239,68,68,0.4)'
                }}>
                  {unreadNotifCount}
                </span>
              )}
            </button>
            <button
              onClick={fetchAdminData}
              title="Refresh"
              style={{
                background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                color: '#0f172a', padding: '0.45rem', borderRadius: '10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <RefreshCw size={15} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(34,197,94,0.1)', padding: '0.3rem 0.5rem', borderRadius: '50px', border: '1px solid rgba(34,197,94,0.2)', flexShrink: 0 }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700 }}>Live</span>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div style={{ padding: isMobile ? '0.85rem 0.85rem calc(5.5rem + env(safe-area-inset-bottom, 0px))' : '2rem', boxSizing: 'border-box' }}>

          {/* KPI Metrics Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: isMobile ? '0.65rem' : '1rem',
            marginBottom: '1.25rem',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {kpiCards.map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff', borderRadius: isMobile ? '14px' : '16px',
                padding: isMobile ? '0.85rem 0.75rem' : '1.25rem',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: isMobile ? '0.66rem' : '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.label}</span>
                  <div style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', borderRadius: '8px', backgroundColor: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <card.icon size={isMobile ? 14 : 16} color={card.color} />
                  </div>
                </div>
                <div style={{ fontSize: isMobile ? '1.2rem' : '1.6rem', fontWeight: 800, color: card.color === '#d4af37' ? '#b5952f' : card.color, fontFamily: 'Outfit', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.value}</div>
                {card.sub && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.sub}</div>}
              </div>
            ))}
          </div>

          {/* Mobile Fast Navigation Scroller */}
          {isMobile && (
            <div
              style={{
                display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem',
                marginBottom: '0.85rem', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
              }}
            >
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.5rem 0.85rem', borderRadius: '50px', flexShrink: 0,
                    border: activeTab === item.id ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.1)',
                    backgroundColor: activeTab === item.id ? '#171717' : '#ffffff',
                    color: activeTab === item.id ? '#d4af37' : '#64748b',
                    fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.78rem',
                    cursor: 'pointer', boxShadow: activeTab === item.id ? '0 4px 12px rgba(0,0,0,0.12)' : 'none',
                    minHeight: '38px',
                  }}
                >
                  <item.icon size={13} />
                  <span>{item.label}</span>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 900, padding: '0.05rem 0.4rem',
                    borderRadius: '50px', backgroundColor: activeTab === item.id ? '#d4af37' : 'rgba(0,0,0,0.06)',
                    color: activeTab === item.id ? '#171717' : '#64748b',
                  }}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Search Bar + Filter Chips Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={
                  activeTab === 'orders'
                    ? 'Search name, email, order ID...'
                    : activeTab === 'bookings'
                    ? 'Search client, service, stylist...'
                    : activeTab === 'users'
                    ? 'Search name, email, phone...'
                    : activeTab === 'products'
                    ? 'Search product title, badge, desc...'
                    : 'Search expert, email, bank, account number, ref...'
                }
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.5rem', borderRadius: '10px',
                  backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.12)',
                  color: '#0f172a', fontSize: isMobile ? '16px' : '0.83rem', outline: 'none', fontFamily: 'Outfit',
                  boxSizing: 'border-box', minHeight: '44px',
                }}
              />
            </div>

            {/* Period Selector & CSV Export Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '2px' }}>
                {[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week' },
                  { id: 'month', label: 'This Month' },
                ].map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setDatePeriodFilter(period.id)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '50px',
                      fontSize: '0.72rem',
                      fontWeight: datePeriodFilter === period.id ? 800 : 600,
                      backgroundColor: datePeriodFilter === period.id ? '#d4af37' : '#ffffff',
                      color: datePeriodFilter === period.id ? '#ffffff' : '#64748b',
                      border: datePeriodFilter === period.id ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      fontFamily: 'Outfit',
                      flexShrink: 0,
                    }}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {(activeTab === 'orders' || activeTab === 'bookings') && (
                <button
                  onClick={() => {
                    if (activeTab === 'orders') {
                      exportOrdersToCSV(filteredOrders);
                      showToast(`Exported ${filteredOrders.length} orders to CSV`, 'success');
                    } else {
                      exportBookingsToCSV(filteredBookings);
                      showToast(`Exported ${filteredBookings.length} bookings to CSV`, 'success');
                    }
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.38rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(212,175,55,0.3)',
                    color: '#b5952f',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    flexShrink: 0,
                  }}
                >
                  <Download size={13} /> Export CSV
                </button>
              )}
            </div>

            {/* Scrollable Filter Chips with Live Counts */}
            {activeTab !== 'products' && activeTab !== 'messages' && (
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.2rem', WebkitOverflowScrolling: 'touch' }}>
                {(activeTab === 'orders'
                  ? ['all', 'pending', 'processing', 'shipped', 'completed']
                  : activeTab === 'bookings'
                  ? ['all', 'pending', 'confirmed', 'completed', 'cancelled']
                  : activeTab === 'users'
                  ? ['all', 'customer', 'staff']
                  : ['all', 'processing', 'completed', 'rejected']
                ).map(status => {
                  const active =
                    activeTab === 'orders'
                      ? orderStatusFilter === status
                      : activeTab === 'bookings'
                      ? bookingStatusFilter === status
                      : activeTab === 'users'
                      ? userRoleFilter === status
                      : payoutStatusFilter === status;

                  const labelDisplay =
                    activeTab === 'payouts'
                      ? (status === 'processing' ? 'Pending Transfer' : status === 'completed' ? 'Settled' : status === 'rejected' ? 'Declined' : 'All Requests')
                      : status === 'staff' ? 'experts' : status;

                  const countVal =
                    activeTab === 'orders'
                      ? (orderCounts[status] || 0)
                      : activeTab === 'bookings'
                      ? (bookingCounts[status] || 0)
                      : activeTab === 'users'
                      ? (userCounts[status] || 0)
                      : status === 'all'
                      ? withdrawalsList.length
                      : status === 'processing'
                      ? pendingPayoutsCount
                      : status === 'completed'
                      ? completedPayoutsCount
                      : rejectedPayoutsCount;

                  return (
                    <button
                      key={status}
                      onClick={() => {
                        if (activeTab === 'orders') setOrderStatusFilter(status);
                        else if (activeTab === 'bookings') setBookingStatusFilter(status);
                        else if (activeTab === 'users') setUserRoleFilter(status);
                        else setPayoutStatusFilter(status);
                      }}
                      style={{
                        padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600,
                        textTransform: 'capitalize', cursor: 'pointer', flexShrink: 0,
                        backgroundColor: active ? '#171717' : '#ffffff',
                        color: active ? '#ffffff' : '#64748b',
                        border: active ? '1px solid #171717' : '1px solid rgba(0,0,0,0.1)',
                        fontFamily: 'Outfit', transition: 'all 0.15s ease',
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                      }}
                    >
                      <span>{labelDisplay}</span>
                      <span style={{
                        fontSize: '0.66rem', fontWeight: 800, padding: '0.05rem 0.4rem', borderRadius: '50px',
                        backgroundColor: active ? '#d4af37' : 'rgba(0,0,0,0.06)',
                        color: active ? '#ffffff' : '#64748b',
                      }}>
                        {countVal}
                      </span>
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
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <span>{order.email || order.customerInfo?.email || ''} {(order.phone || order.customerInfo?.phone) ? `· ${order.phone || order.customerInfo?.phone}` : ''}</span>
                          {(order.phone || order.customerInfo?.phone) && (
                            <span style={{ display: 'inline-flex', gap: '0.3rem' }}>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openWhatsApp(order.phone || order.customerInfo?.phone, order.name || order.customerInfo?.name); }}
                                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={10} /> WhatsApp
                              </button>
                              <a
                                href={`tel:${order.phone || order.customerInfo?.phone}`}
                                onClick={e => e.stopPropagation()}
                                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#2563eb', padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                                title="Call customer"
                              >
                                <Phone size={10} /> Call
                              </a>
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#b5952f', fontFamily: 'Outfit' }}>
                          ₦{Number(order.totalPrice || order.price || 0).toLocaleString()}
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

                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {order.status !== 'shipped' && order.status !== 'completed' && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={(e) => handleUpdateOrderStatus(order._id, 'shipped', e)}
                          style={{ flex: isMobile ? '1 1 calc(50% - 0.45rem)' : '1 1 120px', minHeight: '44px', padding: '0.55rem 0.85rem', borderRadius: '10px', backgroundColor: '#d4af37', color: '#fff', fontWeight: 800, fontSize: '0.78rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                        >
                          <Truck size={13} /> Mark Shipped
                        </button>
                      )}
                      {order.status === 'shipped' && (
                        <button
                          disabled={updatingId === order._id}
                          onClick={(e) => handleUpdateOrderStatus(order._id, 'completed', e)}
                          style={{ flex: isMobile ? '1 1 calc(50% - 0.45rem)' : '1 1 120px', minHeight: '44px', padding: '0.55rem 0.85rem', borderRadius: '10px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 800, fontSize: '0.78rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                        >
                          <CheckCircle size={13} /> Mark Completed
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrderForTracking(order); }}
                        style={{ flex: isMobile ? '1 1 calc(50% - 0.45rem)' : '1 1 140px', minHeight: '44px', padding: '0.55rem 0.85rem', borderRadius: '10px', backgroundColor: 'rgba(212,175,55,0.15)', color: '#b5952f', fontWeight: 800, fontSize: '0.78rem', border: '1px solid rgba(212,175,55,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                      >
                        <Truck size={13} /> Track & Manage
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                        style={{ flex: isMobile ? '1 1 100%' : '0 0 auto', minHeight: '44px', padding: '0.55rem 0.85rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.04)', color: '#334155', fontWeight: 700, fontSize: '0.78rem', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
                      >
                        <Eye size={13} /> Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === 'messages' ? (
            /* --- TAB 2: CUSTOMER ORDER MESSAGES & INQUIRIES --- */
            ordersWithMessages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '18px', border: '1px dashed rgba(0,0,0,0.12)' }}>
                <MessageSquare size={42} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800 }}>No Order Messages Yet</h3>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>When customers message about their store orders, their conversations and inquiries will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ordersWithMessages.map(order => {
                  const msgs = order.messages || [];
                  const replyText = replyInputMap[order._id] || '';

                  return (
                    <div
                      key={order._id}
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '18px',
                        padding: isMobile ? '1rem' : '1.35rem',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Customer & Order Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.15rem' }}>
                            ORDER #{(order._id || '').slice(-6).toUpperCase()}
                          </div>
                          <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: '#0f172a', margin: 0 }}>
                            {order.name || order.customerInfo?.name || 'Store Customer'}
                          </h4>
                          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.1rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <span>{order.email} {order.phone ? `· ${order.phone}` : ''}</span>
                            {order.phone && (
                              <span style={{ display: 'inline-flex', gap: '0.3rem' }}>
                                <button
                                  type="button"
                                  onClick={() => openWhatsApp(order.phone, order.name || order.customerInfo?.name)}
                                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                  title="Chat on WhatsApp"
                                >
                                  <MessageSquare size={10} /> WhatsApp
                                </button>
                                <a
                                  href={`tel:${order.phone}`}
                                  style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#2563eb', padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                                  title="Call customer"
                                >
                                  <Phone size={10} /> Call
                                </a>
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#b5952f', fontFamily: 'Outfit' }}>
                            ₦{Number(order.totalPrice || order.price || 0).toLocaleString()}
                          </span>
                          <StatusBadge status={order.status || 'pending'} />
                        </div>
                      </div>

                      {/* Items Purchased Summary */}
                      <div style={{ fontSize: '0.76rem', color: '#475569', backgroundColor: '#faf9f6', padding: '0.5rem 0.75rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(212,175,55,0.2)' }}>
                        <strong style={{ color: '#0f172a' }}>Purchased Items: </strong>
                        {Array.isArray(order.items) && order.items.length > 0 ? (
                          order.items.map(i => `${i.name || i.title} (x${i.quantity || 1})`).join(', ')
                        ) : (
                          order.item || 'Grooming Products'
                        )}
                      </div>

                      {/* Conversation Message Thread */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '4px' }}>
                        {msgs.map((m, idx) => {
                          const isAdminSender = m.senderRole === 'admin' || m.senderRole === 'staff';
                          return (
                            <div
                              key={idx}
                              style={{
                                alignSelf: isAdminSender ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                padding: '0.6rem 0.85rem',
                                borderRadius: isAdminSender ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                                backgroundColor: isAdminSender ? '#171717' : '#f1f5f9',
                                color: isAdminSender ? '#ffffff' : '#0f172a',
                                border: isAdminSender ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.06)'
                              }}
                            >
                              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: isAdminSender ? '#d4af37' : '#64748b', marginBottom: '0.15rem' }}>
                                {isAdminSender ? '👑 Admin Support' : `👤 ${m.sender || 'Customer'}`}
                              </div>
                              <div style={{ fontSize: '0.82rem', lineHeight: 1.35 }}>{m.text}</div>
                              <div style={{ fontSize: '0.62rem', color: isAdminSender ? '#a1a1aa' : '#94a3b8', marginTop: '0.2rem', textAlign: 'right' }}>
                                {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Admin Quick Reply Input */}
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleSendAdminReply(order._id); }}
                        style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}
                      >
                        <input
                          type="text"
                          placeholder={`Reply to ${order.name || 'customer'}...`}
                          value={replyText}
                          onChange={(e) => setReplyInputMap({ ...replyInputMap, [order._id]: e.target.value })}
                          style={{
                            flex: isMobile ? '1 1 100%' : 1, padding: '0.65rem 0.85rem', borderRadius: '10px',
                            border: '1px solid rgba(0,0,0,0.12)', fontSize: isMobile ? '16px' : '0.82rem',
                            outline: 'none', fontFamily: 'Outfit', minHeight: '44px', boxSizing: 'border-box'
                          }}
                        />
                        <button
                          type="submit"
                          disabled={sendingReplyId === order._id || !replyText.trim()}
                          style={{
                            backgroundColor: '#d4af37', color: '#ffffff', border: 'none',
                            padding: '0.65rem 1rem', borderRadius: '10px', fontWeight: 800,
                            fontSize: '0.82rem', fontFamily: 'Outfit', cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                            flex: isMobile ? 1 : '0 0 auto', minHeight: '44px'
                          }}
                        >
                          <Send size={14} /> Reply & Notify
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedOrderForTracking(order)}
                          style={{
                            backgroundColor: 'rgba(0,0,0,0.04)', color: '#334155', border: '1px solid rgba(0,0,0,0.08)',
                            padding: '0.65rem 0.85rem', borderRadius: '10px', fontWeight: 600,
                            fontSize: '0.82rem', fontFamily: 'Outfit', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                            flex: isMobile ? '0 0 auto' : '0 0 auto', minHeight: '44px'
                          }}
                        >
                          <Truck size={14} /> Track
                        </button>
                      </form>
                    </div>
                  );
                })}
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
                        <div style={{ fontSize: '0.76rem', color: '#b5952f', marginTop: '0.15rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Users size={12} /> {b.clientName || b.user?.firstname || 'Guest'} {b.phone || b.clientPhone ? `· ${b.phone || b.clientPhone}` : ''}
                          </span>
                          {(b.phone || b.clientPhone) && (
                            <span style={{ display: 'inline-flex', gap: '0.3rem' }}>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); openWhatsApp(b.phone || b.clientPhone, b.clientName || b.user?.firstname); }}
                                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare size={10} /> WhatsApp
                              </button>
                              <a
                                href={`tel:${b.phone || b.clientPhone}`}
                                onClick={e => e.stopPropagation()}
                                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#2563eb', padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                                title="Call client"
                              >
                                <Phone size={10} /> Call
                              </a>
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={b.status || 'pending'} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.76rem', color: '#64748b', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                      <span><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />{b.date || 'TBD'} at {b.time || 'TBD'}</span>
                      <span><Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Stylist: {b.stylist || 'Any'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {b.status !== 'confirmed' && b.status !== 'completed' && b.status !== 'cancelled' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={(e) => handleUpdateBookingStatus(b._id, 'confirmed', e)}
                          style={{ flex: 1, minHeight: '44px', padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#d4af37', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          Confirm
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={(e) => handleUpdateBookingStatus(b._id, 'completed', e)}
                          style={{ flex: 1, minHeight: '44px', padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          Complete
                        </button>
                      )}
                      {b.status !== 'cancelled' && b.status !== 'completed' && (
                        <button
                          disabled={updatingId === b._id}
                          onClick={(e) => handleUpdateBookingStatus(b._id, 'cancelled', e)}
                          style={{ minHeight: '44px', padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(b); }}
                        style={{ minHeight: '44px', padding: '0.55rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.04)', color: '#334155', fontWeight: 600, fontSize: '0.78rem', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontFamily: 'Outfit' }}
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
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                              <span>{u.email || 'No email'} {u.phone ? `· ${u.phone}` : ''}</span>
                              {u.phone && (
                                <span style={{ display: 'inline-flex', gap: '0.3rem' }}>
                                  <button
                                    type="button"
                                    onClick={() => openWhatsApp(u.phone, fullName)}
                                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                                    title="Chat on WhatsApp"
                                  >
                                    <MessageSquare size={10} /> WhatsApp
                                  </button>
                                  <a
                                    href={`tel:${u.phone}`}
                                    style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#2563eb', padding: '0.15rem 0.45rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                                    title="Call user"
                                  >
                                    <Phone size={10} /> Call
                                  </a>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setUserToDelete(u)}
                          style={{
                            padding: '0.55rem 0.85rem', borderRadius: '10px', minHeight: '44px',
                            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', fontWeight: 700, fontSize: '0.78rem',
                            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                            fontFamily: 'Outfit', transition: 'all 0.15s ease', flexShrink: 0,
                          }}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'products' ? (
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
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? '0.65rem' : '1rem' }}>
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
                            ₦{Number(p.price).toLocaleString()}
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
                      <div style={{ display: 'flex', gap: '0.35rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleProductStock(p, e)}
                          disabled={updatingId === (p._id || p.id)}
                          style={{
                            flex: 1, padding: '0.45rem 0.4rem', borderRadius: '8px', minHeight: '44px',
                            backgroundColor: p.badge === 'Out of Stock' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                            border: p.badge === 'Out of Stock' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(34,197,94,0.3)',
                            color: p.badge === 'Out of Stock' ? '#ef4444' : '#16a34a',
                            fontWeight: 800, fontSize: '0.72rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Outfit', whiteSpace: 'nowrap'
                          }}
                          title="Toggle Stock Availability"
                        >
                          {p.badge === 'Out of Stock' ? 'Out of Stock' : 'In Stock'}
                        </button>
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          style={{
                            padding: '0.5rem 0.75rem', borderRadius: '8px', minHeight: '44px',
                            backgroundColor: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                            color: '#b5952f', fontWeight: 700, fontSize: '0.75rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                            fontFamily: 'Outfit'
                          }}
                          title="Edit Product"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setProductToDelete(p)}
                          style={{
                            padding: '0.5rem 0.65rem', borderRadius: '8px', minHeight: '44px',
                            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                            color: '#ef4444', fontWeight: 700, fontSize: '0.75rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
                            fontFamily: 'Outfit'
                          }}
                          title="Delete Product"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* --- TAB 6: EXPERT PAYOUTS & WITHDRAWALS --- */
            <div>
              {/* Header & Metrics Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>
                    Expert Payouts & Withdrawals ({filteredWithdrawals.length})
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0' }}>
                    Review, transfer, and settle earnings requested by customers and specialists to their verified bank accounts.
                  </p>
                  <div style={{
                    marginTop: '0.35rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.72rem',
                    color: '#d4af37',
                    fontWeight: 700,
                    backgroundColor: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.25)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '50px'
                  }}>
                    🗓️ Standard Payout Window: Every 3rd Saturday of the Month (Admin instant settlement active)
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <div style={{
                    backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
                    padding: '0.45rem 0.85rem', borderRadius: '12px', display: 'flex', flexDirection: 'column'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: '#b5952f', fontWeight: 700, textTransform: 'uppercase' }}>Awaiting Transfer</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit' }}>
                      ₦{pendingPayoutsVolume.toLocaleString()} ({pendingPayoutsCount})
                    </span>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
                    padding: '0.45rem 0.85rem', borderRadius: '12px', display: 'flex', flexDirection: 'column'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' }}>Settled Volume</span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit' }}>
                      ₦{totalPayoutsVolume.toLocaleString()} ({completedPayoutsCount})
                    </span>
                  </div>
                </div>
              </div>

              {filteredWithdrawals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff', borderRadius: '18px', border: '1px dashed rgba(0,0,0,0.12)' }}>
                  <DollarSign size={42} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
                  <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', margin: '0 0 0.25rem', fontSize: '1.05rem', fontWeight: 800 }}>No Payout Requests Found</h3>
                  <p style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {searchQuery || payoutStatusFilter !== 'all' ? 'Try changing your search or status filter.' : 'When specialists withdraw their earnings, payout requests will appear here.'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {filteredWithdrawals.map(w => {
                    const isProcessing = (w.status || 'processing') === 'processing';
                    const isCompleted = w.status === 'completed';
                    const isRejected = w.status === 'rejected';
                    const isCopied = copiedWithdrawalId === w._id;

                    return (
                      <div
                        key={w._id}
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '16px',
                          padding: isMobile ? '1rem' : '1.35rem',
                          border: isProcessing ? '1px solid rgba(212,175,55,0.35)' : '1px solid rgba(0,0,0,0.08)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
                          position: 'relative',
                        }}
                      >
                        {/* Top Header Row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                              background: 'linear-gradient(135deg, #d4af37, #b5952f)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#fff', fontWeight: 800, fontSize: '0.9rem'
                            }}>
                              {w.expertName?.charAt(0) || 'E'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.98rem', color: '#0f172a', margin: 0 }}>
                                  {w.expertName || 'Specialist'}
                                </h4>
                                <span style={{
                                  fontSize: '0.62rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '50px',
                                  textTransform: 'uppercase', letterSpacing: '0.5px',
                                  backgroundColor: 'rgba(212,175,55,0.15)', color: '#b5952f'
                                }}>
                                  Specialist Payout
                                </span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem' }}>
                                {w.userEmail} · Ref: <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{w.reference || w._id.slice(-6).toUpperCase()}</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', fontFamily: 'Outfit' }}>
                              ₦{Number(w.amount).toLocaleString()}
                            </div>
                            <div style={{ marginTop: '0.2rem' }}>
                              {isProcessing && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '50px', backgroundColor: 'rgba(234,179,8,0.12)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.3)' }}>
                                  <Clock size={11} /> Pending Transfer
                                </span>
                              )}
                              {isCompleted && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '50px', backgroundColor: 'rgba(34,197,94,0.12)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }}>
                                  <CheckCircle size={11} /> Settled & Transferred
                                </span>
                              )}
                              {isRejected && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.68rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '50px', backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                                  <XCircle size={11} /> Declined & Refunded
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Bank Account Details Card */}
                        <div style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid rgba(0,0,0,0.06)',
                          borderRadius: '12px',
                          padding: '0.85rem 1rem',
                          marginBottom: '0.85rem',
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                          gap: '0.75rem',
                          fontSize: '0.8rem'
                        }}>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Bank Name</span>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{w.bankName || 'N/A'}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>NUBAN Account Number</span>
                            <div style={{ fontWeight: 800, color: '#0f172a', marginTop: '0.15rem', fontFamily: 'monospace', letterSpacing: '1px' }}>{w.accountNumber}</div>
                          </div>
                          <div>
                            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Account Holder Name</span>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '0.15rem' }}>{w.accountName}</div>
                          </div>
                        </div>

                        {/* Settlement / Decline Notes */}
                        {w.rejectionReason && (
                          <div style={{ fontSize: '0.76rem', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.06)', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.18)', marginBottom: '0.85rem' }}>
                            <strong>Decline Reason:</strong> {w.rejectionReason} (₦{Number(w.amount).toLocaleString()} refunded to expert wallet)
                          </div>
                        )}
                        {w.settledAt && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.85rem' }}>
                            Settled on {new Date(w.settledAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}

                        {/* Action Buttons Bar */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleCopyBankDetails(w)}
                            style={{
                              padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                              backgroundColor: isCopied ? 'rgba(34,197,94,0.12)' : 'rgba(0,0,0,0.04)',
                              color: isCopied ? '#16a34a' : '#334155',
                              border: isCopied ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(0,0,0,0.08)',
                              cursor: 'pointer', fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                            }}
                          >
                            {isCopied ? <Check size={13} /> : <Copy size={13} />}
                            {isCopied ? 'Bank Details Copied!' : 'Copy Bank Details'}
                          </button>

                          {isProcessing && (
                            <>
                              <button
                                type="button"
                                disabled={updatingId === w._id}
                                onClick={() => {
                                  setRejectionModalWithdrawal(w);
                                  setRejectionReasonInput('');
                                }}
                                style={{
                                  padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                  backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                  border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer', fontFamily: 'Outfit',
                                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem'
                                }}
                              >
                                <XCircle size={13} /> Decline & Refund
                              </button>

                              <button
                                type="button"
                                disabled={updatingId === w._id}
                                onClick={() => handleSettlePayout(w._id)}
                                style={{
                                  padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800,
                                  backgroundColor: '#16a34a', color: '#ffffff',
                                  border: 'none', cursor: 'pointer', fontFamily: 'Outfit',
                                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                  boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
                                }}
                              >
                                <CheckCircle size={13} /> {updatingId === w._id ? 'Updating...' : 'Mark Settled & Transferred'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
        {/* iOS safe area bottom spacer */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)', minHeight: isMobile ? '1rem' : 0 }} />
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          onClick={() => setSelectedOrder(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: isMobile ? '0' : '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '20px 20px 0 0' : '20px',
              border: '1px solid rgba(0,0,0,0.1)',
              width: '100%', maxWidth: isMobile ? '100%' : '480px',
              maxHeight: isMobile ? '92vh' : '85vh',
              overflowY: 'auto',
              padding: isMobile ? '1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom, 0px))' : '1.5rem',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            }}
          >
            {/* Drag handle on mobile */}
            {isMobile && <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.15)', margin: '0 auto 1rem' }} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: 'rgba(0,0,0,0.06)', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
              >✕</button>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.85rem' }}>
              ORDER #{(selectedOrder._id || '').slice(-6).toUpperCase()}
            </div>

            <div style={{ display: 'grid', gap: '0.45rem', fontSize: '0.83rem', color: '#334155', marginBottom: '1rem', backgroundColor: '#fafafa', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Customer</span><br />{selectedOrder.customerInfo?.name || selectedOrder.name || 'N/A'}</div>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Email</span><br />{selectedOrder.customerInfo?.email || selectedOrder.email || 'N/A'}</div>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Phone</span><br />{selectedOrder.customerInfo?.phone || selectedOrder.phone || 'N/A'}</div>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Address</span><br />{selectedOrder.customerInfo?.address || selectedOrder.address || 'N/A'}</div>
            </div>

            <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b5952f', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Items Ordered</div>
              {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', fontSize: '0.82rem', color: '#334155', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <span>{item.name || item.title} × {item.quantity || 1}</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>₦{Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '0.45rem 0', fontSize: '0.82rem', color: '#0f172a' }}>
                  {selectedOrder.item || 'Grooming Products'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#0f172a', paddingTop: '0.65rem', borderTop: '1px solid rgba(0,0,0,0.08)', marginBottom: '1rem' }}>
              <span>Total Paid</span>
              <span style={{ color: '#b5952f' }}>₦{Number(selectedOrder.totalPrice || selectedOrder.price || 0).toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedOrder.status !== 'shipped' && selectedOrder.status !== 'completed' && (
                <button
                  onClick={(e) => handleUpdateOrderStatus(selectedOrder._id, 'shipped', e)}
                  style={{ flex: 1, minHeight: '48px', borderRadius: '12px', backgroundColor: '#d4af37', color: '#fff', fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Mark Shipped
                </button>
              )}
              {selectedOrder.status === 'shipped' && (
                <button
                  onClick={(e) => handleUpdateOrderStatus(selectedOrder._id, 'completed', e)}
                  style={{ flex: 1, minHeight: '48px', borderRadius: '12px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ minHeight: '48px', padding: '0.6rem 1rem', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.04)', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontFamily: 'Outfit' }}
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
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: isMobile ? '0' : '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '20px 20px 0 0' : '20px',
              border: '1px solid rgba(0,0,0,0.1)',
              width: '100%', maxWidth: isMobile ? '100%' : '480px',
              maxHeight: isMobile ? '92vh' : '85vh',
              overflowY: 'auto',
              padding: isMobile ? '1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom, 0px))' : '1.5rem',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            }}
          >
            {isMobile && <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.15)', margin: '0 auto 1rem' }} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ background: 'rgba(0,0,0,0.06)', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
              >✕</button>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace', marginBottom: '0.85rem' }}>
              BOOKING #{(selectedBooking._id || '').slice(-6).toUpperCase()}
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.83rem', color: '#334155', marginBottom: '1rem', backgroundColor: '#fafafa', padding: '0.85rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Service</span><br /><strong style={{ color: '#0f172a' }}>{selectedBooking.serviceName || selectedBooking.service}</strong></div>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Client</span><br />{selectedBooking.clientName || selectedBooking.user?.firstname || 'Guest'}</div>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Email</span><br />{selectedBooking.clientEmail || selectedBooking.email || 'N/A'}</div>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Phone</span><br />{selectedBooking.phone || selectedBooking.clientPhone || 'N/A'}</div>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Stylist</span><br /><span style={{ color: '#b5952f', fontWeight: 600 }}>{selectedBooking.stylist || 'Verified Specialist'}</span></div>
              <div><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Date & Time</span><br />{selectedBooking.date || 'TBD'} at {selectedBooking.time || 'TBD'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>Status: </span><StatusBadge status={selectedBooking.status || 'pending'} /></div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem' }}>
              {selectedBooking.status !== 'confirmed' && selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
                <button
                  onClick={(e) => handleUpdateBookingStatus(selectedBooking._id, 'confirmed', e)}
                  style={{ flex: 1, minHeight: '48px', borderRadius: '12px', backgroundColor: '#d4af37', color: '#fff', fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Confirm Booking
                </button>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={(e) => handleUpdateBookingStatus(selectedBooking._id, 'completed', e)}
                  style={{ flex: 1, minHeight: '48px', borderRadius: '12px', backgroundColor: '#16a34a', color: '#fff', fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Complete Service
                </button>
              )}
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ minHeight: '48px', padding: '0.6rem 1rem', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.04)', color: '#64748b', fontWeight: 600, fontSize: '0.85rem', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', fontFamily: 'Outfit' }}
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
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '20px 20px 0 0' : '20px',
              border: '1px solid rgba(239,68,68,0.3)',
              width: '100%', maxWidth: isMobile ? '100%' : '420px',
              padding: isMobile ? '1.5rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px))' : '1.5rem',
              textAlign: 'center', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            }}
          >
            {isMobile && <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.15)', margin: '0 auto 1.25rem' }} />}

            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
              Delete User Account?
            </h3>

            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Are you sure you want to delete <strong style={{ color: '#0f172a' }}>{userToDelete.firstname} ({userToDelete.email})</strong>? All their profile data and bookings will be wiped.
            </p>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={() => setUserToDelete(null)}
                style={{ flex: 1, minHeight: '50px', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                Cancel
              </button>
              <button
                disabled={updatingId === userToDelete._id}
                onClick={() => handleDeleteUserAccount(userToDelete)}
                style={{ flex: 1, minHeight: '50px', borderRadius: '12px', backgroundColor: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Outfit' }}
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
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '20px 20px 0 0' : '20px',
              border: '1px solid rgba(0,0,0,0.1)',
              width: '100%', maxWidth: isMobile ? '100%' : '480px',
              maxHeight: isMobile ? '95vh' : '90vh',
              overflowY: 'auto',
              padding: isMobile ? '1.25rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom, 0px))' : '1.5rem',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            }}
          >
            {isMobile && <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.15)', margin: '0 auto 1rem' }} />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '1.15rem' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                style={{ background: 'rgba(0,0,0,0.06)', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
              >✕</button>
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
                      style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '16px', fontFamily: 'Outfit', outline: 'none', minHeight: '44px', boxSizing: 'border-box' }}
                    />
                    <label
                      htmlFor="product-image-upload-1"
                      style={{
                        cursor: uploadingProductImage ? 'not-allowed' : 'pointer',
                        backgroundColor: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)',
                        color: '#b5952f', padding: '0.6rem 0.75rem', borderRadius: '8px', minHeight: '44px',
                        fontSize: '0.75rem', fontWeight: 800, fontFamily: 'Outfit',
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0, boxSizing: 'border-box'
                      }}
                    >
                      <Upload size={13} />
                      {uploadingProductImage ? 'Uploading...' : 'Upload'}
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
                    Photo 2: Secondary / Detail Image (Optional)
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
                      style={{ flex: 1, padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '16px', fontFamily: 'Outfit', outline: 'none', minHeight: '44px', boxSizing: 'border-box' }}
                    />
                    <label
                      htmlFor="product-image-upload-2"
                      style={{
                        cursor: uploadingSecondaryImage ? 'not-allowed' : 'pointer',
                        backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                        color: '#3b82f6', padding: '0.6rem 0.75rem', borderRadius: '8px', minHeight: '44px',
                        fontSize: '0.75rem', fontWeight: 800, fontFamily: 'Outfit',
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0, boxSizing: 'border-box'
                      }}
                    >
                      <Upload size={13} />
                      {uploadingSecondaryImage ? 'Uploading...' : 'Upload'}
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
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '16px', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box', minHeight: '48px' }}
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
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '16px', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box', minHeight: '48px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', fontFamily: 'Outfit' }}>Badge</label>
                  <input
                    type="text"
                    placeholder="Bestseller / New"
                    value={productForm.badge}
                    onChange={e => setProductForm({ ...productForm, badge: e.target.value })}
                    style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '16px', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box', minHeight: '48px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', fontFamily: 'Outfit' }}>Rating (1.0 – 5.0)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={productForm.rating}
                  onChange={e => setProductForm({ ...productForm, rating: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '16px', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box', minHeight: '48px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem', fontFamily: 'Outfit' }}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Short product description..."
                  value={productForm.desc}
                  onChange={e => setProductForm({ ...productForm, desc: e.target.value })}
                  style={{ width: '100%', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.12)', fontSize: '16px', fontFamily: 'Outfit', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  style={{ flex: 1, minHeight: '50px', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Outfit' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === 'product_submit'}
                  style={{ flex: 1, minHeight: '50px', borderRadius: '12px', backgroundColor: '#d4af37', border: 'none', color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Outfit' }}
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
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? '0' : '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: isMobile ? '20px 20px 0 0' : '20px',
              border: '1px solid rgba(239,68,68,0.3)',
              width: '100%', maxWidth: isMobile ? '100%' : '420px',
              padding: isMobile ? '1.5rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom, 0px))' : '1.5rem',
              textAlign: 'center', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
            }}
          >
            {isMobile && <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0.15)', margin: '0 auto 1.25rem' }} />}

            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={28} />
            </div>

            <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: '0 0 0.5rem', fontSize: '1.15rem' }}>
              Delete Product?
            </h3>

            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Are you sure you want to remove <strong style={{ color: '#0f172a' }}>"{productToDelete.title}"</strong> from the public store page?
            </p>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button
                onClick={() => setProductToDelete(null)}
                style={{ flex: 1, minHeight: '50px', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', color: '#64748b', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                Cancel
              </button>
              <button
                disabled={updatingId === productToDelete._id}
                onClick={() => handleDeleteProduct(productToDelete)}
                style={{ flex: 1, minHeight: '50px', borderRadius: '12px', backgroundColor: '#ef4444', border: 'none', color: '#ffffff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'Outfit' }}
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

      <NotificationSheet
        isOpen={showNotificationSheet}
        onClose={() => { setShowNotificationSheet(false); fetchUnreadNotifs(); }}
        onSelectNotification={(notif) => {
          if (notif.orderId) {
            const foundOrder = orders.find(o => o._id === notif.orderId);
            if (foundOrder) setSelectedOrderForTracking(foundOrder);
          }
        }}
      />

      {/* Decline Payout Modal with Auto-Refund Notice */}
      {rejectionModalWithdrawal && (
        <div
          onClick={() => setRejectionModalWithdrawal(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)',
              width: '100%', maxWidth: '460px', padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle size={18} color="#ef4444" />
                </div>
                <h3 style={{ color: '#0f172a', fontFamily: 'Outfit', fontWeight: 800, margin: 0, fontSize: '1.1rem' }}>Decline Payout Request</h3>
              </div>
              <button
                onClick={() => setRejectionModalWithdrawal(null)}
                style={{ background: 'rgba(0,0,0,0.06)', border: 'none', color: '#64748b', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem' }}>
              You are declining the payout of <strong style={{ color: '#0f172a' }}>₦{Number(rejectionModalWithdrawal.amount).toLocaleString()}</strong> for <strong style={{ color: '#0f172a' }}>{rejectionModalWithdrawal.expertName}</strong>.
            </p>

            <div style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '0.75rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.78rem', color: '#15803d' }}>
              💡 <strong>Automatic Wallet Refund:</strong> ₦{Number(rejectionModalWithdrawal.amount).toLocaleString()} will be automatically credited back into their Atelier Wallet balance immediately.
            </div>

            <label className="app-label" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
              Reason for Declining (Sent to Expert)
            </label>
            <textarea
              rows={3}
              value={rejectionReasonInput}
              onChange={e => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Account name mismatch with NUBAN, incorrect bank, or specialist cancelled request..."
              style={{
                width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px',
                border: '1px solid rgba(0,0,0,0.15)', fontSize: '0.82rem', fontFamily: 'Outfit',
                outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: '1.25rem'
              }}
            />

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRejectionModalWithdrawal(null)}
                style={{
                  padding: '0.6rem 1.1rem', borderRadius: '10px', backgroundColor: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.08)', color: '#475569', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updatingId === rejectionModalWithdrawal._id}
                onClick={handleConfirmRejectPayout}
                style={{
                  padding: '0.6rem 1.1rem', borderRadius: '10px', backgroundColor: '#ef4444',
                  border: 'none', color: '#ffffff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'Outfit',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                }}
              >
                {updatingId === rejectionModalWithdrawal._id ? 'Declining...' : 'Confirm Decline & Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Fixed Bottom Nav Bar ── */}
      {isMobile && (
        <nav
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 45,
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            padding: '0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.05)',
          }}
        >
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  padding: '0.35rem 0.25rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  position: 'relative',
                  flex: 1,
                  color: isActive ? '#b5952f' : '#64748b',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <item.icon size={18} color={isActive ? '#b5952f' : '#64748b'} />
                  {item.count > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-8px',
                        backgroundColor: isActive ? '#d4af37' : 'rgba(0,0,0,0.15)',
                        color: isActive ? '#fff' : '#0f172a',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        padding: '0.05rem 0.3rem',
                        borderRadius: '50px',
                        lineHeight: 1,
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: isActive ? 800 : 500,
                    fontFamily: 'Outfit',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.id === 'orders' ? 'Orders' : item.id === 'messages' ? 'Inquiries' : item.id === 'bookings' ? 'Bookings' : item.id === 'users' ? 'Users' : item.id === 'products' ? 'Products' : 'Payouts'}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => setIsMobileOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.35rem 0.25rem',
              borderRadius: '10px',
              cursor: 'pointer',
              color: '#64748b',
              flex: 1,
            }}
          >
            <Menu size={18} color="#64748b" />
            <span style={{ fontSize: '0.62rem', fontWeight: 500, fontFamily: 'Outfit', whiteSpace: 'nowrap' }}>
              Menu
            </span>
          </button>
        </nav>
      )}
    </div>
  );
};
