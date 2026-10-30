import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scissors,
  CheckCircle,
  Clock,
  Calendar,
  LogOut,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Star,
  Check,
  Edit,
  MapPin,
  Trash2,
  History,
  Activity,
  MessageSquare,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  Camera,
  X,
  Plus,
  BookOpen,
  Eye,
  FileText,
  QrCode,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { Avatar } from '../components/common/Avatar';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { PopupModal } from '../components/common/PopupModal';
import { BottomSheet } from '../components/common/BottomSheet';
import { WithdrawFundsModal } from '../components/common/WithdrawFundsModal';
import { BookingChatSheet } from '../components/booking/BookingChatSheet';
import { LocationSelector } from '../components/store/LocationSelector';
import { CheckInScannerModal } from '../components/booking/CheckInScannerModal';

// ─── Main Expert Dashboard Component ─────────────────────────────────────────
export const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, updateUser, deleteAccount, showToast } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewsSheet, setShowReviewsSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'accepted' | 'completed' | 'today'
  const [chatBooking, setChatBooking] = useState(null); // booking opened in chat sheet
  const [showCheckInDesk, setShowCheckInDesk] = useState(false);

  // Wallet & Payout States
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupSubmitting, setTopupSubmitting] = useState(false);
  const [showWalletHistorySheet, setShowWalletHistorySheet] = useState(false);

  // Account Activation States
  const [activating, setActivating] = useState(false);
  const [localActivated, setLocalActivated] = useState(false);
  const isActivated = (user?.isActivated === true) || localActivated;

  // Profile Photos & Modals
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [showProfileEditSheet, setShowProfileEditSheet] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Expert profile edit form state
  const [expertProfileForm, setExpertProfileForm] = useState({
    firstname: user?.firstname || '',
    lastname: user?.lastname || '',
    phone: user?.phone || '',
    title: user?.title || '',
    businessAddress: user?.businessAddress || '',
  });
  const [expertLocation, setExpertLocation] = useState({
    state: user?.state || 'Lagos',
    lga: user?.lga || 'Ikeja',
    street: user?.businessAddress || '',
    houseNumber: '',
  });

  const handleOpenProfileEdit = () => {
    setExpertProfileForm({
      firstname: user?.firstname || '',
      lastname: user?.lastname || '',
      phone: user?.phone || '',
      title: user?.title || '',
      businessAddress: user?.businessAddress || '',
    });
    setExpertLocation({
      state: user?.state || 'Lagos',
      lga: user?.lga || 'Ikeja',
      street: user?.businessAddress || '',
      houseNumber: '',
    });
    setShowProfileEditSheet(true);
  };

  const handleExpertProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        ...expertProfileForm,
        state: expertLocation.state,
        lga: expertLocation.lga,
        businessAddress: expertProfileForm.businessAddress.trim() || expertLocation.street.trim(),
      });
      showToast('Profile & location updated!', 'success');
      setShowProfileEditSheet(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Portfolio / Lookbook & Work Logbook State
  const [portfolio, setPortfolio] = useState([]);
  const [portfolioServices, setPortfolioServices] = useState(['All']);
  const [activePortfolioService, setActivePortfolioService] = useState('All');
  const [portfolioView, setPortfolioView] = useState('lookbook'); // 'lookbook' | 'logbook'
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [deletingPortfolioId, setDeletingPortfolioId] = useState(null);
  const [workForm, setWorkForm] = useState({
    title: '',
    service: '',
    duration: '',
    price: '',
    clientNote: '',
    imageFile: null,
    imagePreview: '',
  });
  const portfolioUploadRef = useRef(null);

  const fetchWalletData = async () => {
    try {
      const [balRes, txRes] = await Promise.allSettled([
        api.getWalletBalance(),
        api.getWalletTransactions(),
      ]);
      if (balRes.status === 'fulfilled') {
        setWalletBalance(balRes.value?.walletBalance ?? 0);
      }
      if (txRes.status === 'fulfilled') {
        setTransactions(Array.isArray(txRes.value) ? txRes.value : []);
      }
    } catch (e) {
      console.warn('Wallet fetch notice:', e);
    }
  };

  const fetchPortfolio = useCallback(async () => {
    const OFFICIAL_SERVICES = [
      'Lash Tech',
      'Nail Tech',
      'Hair Braider & Stylist',
      'Barber',
      'Makeup Artist',
      'Wig Installer & Revamper',
    ];
    try {
      const data = await api.getPortfolio();
      const loadedPortfolio = data.portfolio || [];
      setPortfolio(loadedPortfolio);
      const svcList = (data.services || []).map(s => s.name || s).filter(Boolean);
      const fallback = data.specialties || [];
      const userList = [...svcList, ...fallback];
      const merged = Array.from(new Set([...OFFICIAL_SERVICES, ...userList]));
      setPortfolioServices(['All', ...merged]);
    } catch (err) {
      console.warn('Portfolio fetch notice:', err.message);
      if (user?.portfolio) {
        setPortfolio(user.portfolio);
      }
      const userServices = (user?.services || []).map(s => s.name || s).filter(Boolean);
      const merged = Array.from(new Set([...OFFICIAL_SERVICES, ...userServices]));
      setPortfolioServices(['All', ...merged]);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const fullName = `${user?.firstname || ''} ${user?.lastname || ''}`.trim() || user?.firstname || '';
      const [bookingsData, reviewsData] = await Promise.all([
        api.getBookings().catch(() => []),
        fullName ? api.getSpecialistReviews(fullName).catch(() => []) : Promise.resolve([]),
        fetchWalletData(),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch (err) {
      showToast(err.message || 'Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
    fetchPortfolio();
  }, []);

  // Photo uploads via Cloudinary
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    setUploadingPhoto(true);
    try {
      const url = await uploadToCloudinary(file);
      await updateProfile({ avatarUrl: url });
      showToast('Profile photo updated successfully!', 'success');
      setShowAvatarSheet(false);
    } catch (err) {
      showToast(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    setUploadingCover(true);
    try {
      const url = await uploadToCloudinary(file);
      await updateProfile({ coverImage: url });
      showToast('Cover banner updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload cover.', 'error');
    } finally {
      setUploadingCover(false);
    }
  };

  // Portfolio & Work Logbook Handlers
  const handleOpenAddWorkModal = (preselectedService = null) => {
    const defaultSvc = preselectedService && preselectedService !== 'All'
      ? preselectedService
      : (portfolioServices.find(s => s !== 'All') || 'General');
    setWorkForm({
      title: '',
      service: defaultSvc,
      duration: '',
      price: '',
      clientNote: '',
      imageFile: null,
      imagePreview: '',
    });
    setShowAddWorkModal(true);
  };

  const handleWorkImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    const preview = URL.createObjectURL(file);
    setWorkForm(prev => ({ ...prev, imageFile: file, imagePreview: preview }));
  };

  const handleSaveWorkLog = async (e) => {
    if (e) e.preventDefault();
    if (!workForm.imageFile && !workForm.imagePreview) {
      showToast('Please select a photo for this work entry.', 'error');
      return;
    }
    if (!workForm.title.trim()) {
      showToast('Please enter a title / style name for this work.', 'error');
      return;
    }

    setUploadingPortfolio(true);
    try {
      let imageUrl = workForm.imagePreview;
      if (workForm.imageFile) {
        imageUrl = await uploadToCloudinary(workForm.imageFile);
      }

      const updatedUser = await api.addPortfolioSample({
        imageUrl,
        service: workForm.service || 'General',
        title: workForm.title.trim(),
        description: workForm.clientNote.trim(),
        duration: workForm.duration.trim(),
        price: workForm.price.trim(),
        clientNote: workForm.clientNote.trim()
      });

      setPortfolio(updatedUser.portfolio || []);
      if (updateUser) updateUser(updatedUser);
      setShowAddWorkModal(false);
      showToast('Work entry successfully logged to lookbook & portfolio!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save work log.', 'error');
    } finally {
      setUploadingPortfolio(false);
    }
  };

  const handlePortfolioDelete = async (sampleId) => {
    setDeletingPortfolioId(sampleId);
    try {
      const updatedUser = await api.deletePortfolioSample(sampleId);
      setPortfolio(updatedUser.portfolio || []);
      if (updateUser) updateUser(updatedUser);
      if (selectedLogDetail?._id === sampleId) {
        setSelectedLogDetail(null);
      }
      showToast('Portfolio entry removed.', 'accent');
    } catch (err) {
      showToast(err.message || 'Failed to delete sample.', 'error');
    } finally {
      setDeletingPortfolioId(null);
    }
  };

  // Status Transitions
  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.updateBookingStatus(id, { status: newStatus });
      setBookings((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
      );
      if (newStatus === 'accepted') {
        showToast('Appointment request accepted!', 'success');
      } else if (newStatus === 'rejected') {
        showToast('Appointment request declined.', 'accent');
      } else if (newStatus === 'completed') {
        showToast('Service marked as completed! Earnings credited to wallet.', 'success');
        fetchWalletData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update booking status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Top Up Submission (Paystack)
  const handleTopupSubmit = async (e) => {
    if (e) e.preventDefault();
    const amt = Number(topupAmount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }
    setTopupSubmitting(true);
    try {
      const config = await api.getPaystackConfig();
      const pKey = config.publicKey;
      if (!window.PaystackPop || !pKey) {
        showToast('Payment gateway temporarily unavailable.', 'error');
        setTopupSubmitting(false);
        return;
      }
      const handler = window.PaystackPop.setup({
        key: pKey,
        email: user?.email || 'expert@stylecorner.com',
        amount: Math.round(amt * 100),
        currency: 'NGN',
        ref: 'TOPUP-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        callback: function (response) {
          (async () => {
            try {
              const res = await api.verifyPaystackPayment({
                reference: response.reference,
                isTopup: true,
                amount: amt,
              });
              setWalletBalance(res.walletBalance);
              showToast(`Wallet credited with ₦${amt.toLocaleString()}!`, 'success');
              setShowTopupModal(false);
              setTopupAmount('');
              fetchWalletData();
            } catch (err) {
              showToast(err.message || 'Payment verification failed', 'error');
            } finally {
              setTopupSubmitting(false);
            }
          })();
        },
        onClose: function () {
          showToast('Transaction cancelled', 'accent');
          setTopupSubmitting(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      showToast(err.message || 'Top-up failed', 'error');
      setTopupSubmitting(false);
    }
  };

  const isToday = (dateVal) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
  };

  // Metrics (100% Real Values)
  const pendingBookings = useMemo(() => bookings.filter((b) => b.status === 'pending'), [bookings]);
  const acceptedBookings = useMemo(() => bookings.filter((b) => b.status === 'accepted'), [bookings]);
  const completedBookings = useMemo(() => bookings.filter((b) => b.status === 'completed'), [bookings]);
  const totalRevenue = useMemo(
    () => completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0),
    [completedBookings]
  );
  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return user?.rating ? Number(user.rating).toFixed(1) : null;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, user]);


  const filteredBookings = useMemo(() => {
    if (filterTab === 'today') return bookings.filter((b) => isToday(b.date || b.createdAt));
    if (filterTab === 'pending') return pendingBookings;
    if (filterTab === 'accepted') return acceptedBookings;
    if (filterTab === 'completed') return completedBookings;
    return bookings;
  }, [bookings, filterTab, pendingBookings, acceptedBookings, completedBookings]);

  const openClientWhatsApp = (phone, name = 'Client') => {
    const clean = (phone || '').replace(/[^0-9+]/g, '');
    if (!clean) {
      showToast('No phone number registered for WhatsApp', 'error');
      return;
    }
    const intl = clean.startsWith('+') ? clean.slice(1) : clean.startsWith('0') ? '234' + clean.slice(1) : clean;
    const msg = encodeURIComponent(`Hello ${name}, this is ${user?.firstname || 'your Stylist'} from Style Corner regarding your booking.`);
    window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
  };

  // ── Account Activation Handler (₦3,000 one-time via Paystack) ──────────────
  const handleActivateAccount = async () => {
    setActivating(true);
    try {
      const config = await api.getPaystackConfig();
      const pKey = config.publicKey;
      if (!window.PaystackPop || !pKey) {
        showToast('Payment gateway unavailable. Please refresh and try again.', 'error');
        setActivating(false);
        return;
      }
      const ACTIVATION_FEE = 3000;
      const handler = window.PaystackPop.setup({
        key: pKey,
        email: user?.email || 'expert@stylecorner.com',
        amount: ACTIVATION_FEE * 100,
        currency: 'NGN',
        ref: 'ACTIVATE-' + Date.now() + '-' + Math.floor(Math.random() * 9999),
        callback: function (response) {
          (async () => {
            try {
              const res = await api.activateExpertAccount({
                reference: response.reference,
                amount: ACTIVATION_FEE,
              });
              setLocalActivated(true);
              if (updateUser) updateUser(res.user);
              showToast('🎉 Account activated! You are now live and visible to customers!', 'success');
            } catch (err) {
              showToast(err.message || 'Activation verification failed. Please contact support.', 'error');
            } finally {
              setActivating(false);
            }
          })();
        },
        onClose: function () {
          showToast('Activation payment cancelled.', 'accent');
          setActivating(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      showToast(err.message || 'Could not start activation.', 'error');
      setActivating(false);
    }
  };

  // ── Activation Lock Screen (shown to unactivated experts) ──────────────────
  if (!isActivated) {
    return (
      <PageContainer title="Activate Your Expert Account">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '1.5rem 1rem', textAlign: 'center' }}>
          <div style={{ width: '88px', height: '88px', borderRadius: '26px', background: 'linear-gradient(135deg, rgba(245,185,66,0.18) 0%, rgba(245,185,66,0.06) 100%)', border: '2px solid rgba(245,185,66,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 40px rgba(245,185,66,0.15)' }}>
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#f5b942" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,185,66,0.12)', border: '1px solid rgba(245,185,66,0.3)', borderRadius: '50px', padding: '0.3rem 1rem', marginBottom: '1rem' }}>
            <ShieldCheck size={13} color="#f5b942" />
            <span style={{ fontFamily: 'Outfit', fontSize: '0.75rem', fontWeight: 700, color: '#f5b942' }}>One-Time Activation Required</span>
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.55rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.7rem', lineHeight: 1.25 }}>Unlock Your Expert Dashboard</h2>
          <p style={{ fontSize: '0.88rem', color: '#9ca3af', maxWidth: '340px', lineHeight: 1.65, marginBottom: '2rem' }}>
            Activate with a one-time fee of <span style={{ color: '#f5b942', fontWeight: 800 }}>₦3,000</span> to go live, receive bookings, and start earning from customers near you.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.1rem 1.25rem', width: '100%', maxWidth: '360px', marginBottom: '1.75rem', textAlign: 'left' }}>
            {[
              { icon: '✅', text: 'Appear in customer search & explore' },
              { icon: '🤖', text: 'Get matched by the AI Specialist Matcher' },
              { icon: '📅', text: 'Start receiving booking requests' },
              { icon: '💰', text: 'Earn directly to your Atelier Wallet' },
              { icon: '⭐', text: 'Build reviews & grow your reputation' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                <span style={{ fontFamily: 'Outfit', fontSize: '0.84rem', color: '#d1d5db', fontWeight: 600 }}>{item.text}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(245,185,66,0.14) 0%, rgba(245,185,66,0.05) 100%)', border: '1.5px solid rgba(245,185,66,0.4)', borderRadius: '18px', padding: '1.1rem 1.25rem', width: '100%', maxWidth: '360px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.78rem', color: '#9ca3af', fontWeight: 600, marginBottom: '0.2rem' }}>Account Activation Fee</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 900, color: '#f5b942', lineHeight: 1 }}>₦3,000</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', color: '#6b7280', marginTop: '0.3rem' }}>Secured by Paystack · Pay once, earn forever</div>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '0.4rem 0.75rem' }}>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.72rem', fontWeight: 800, color: '#10b981' }}>One-Time</span>
            </div>
          </div>
          <button id="expert-activate-btn" onClick={handleActivateAccount} disabled={activating} style={{ width: '100%', maxWidth: '360px', background: activating ? 'rgba(245,185,66,0.35)' : 'linear-gradient(135deg, #f5b942 0%, #e8a520 100%)', color: '#0c0e14', border: 'none', borderRadius: '16px', padding: '1rem 1.5rem', fontFamily: 'Outfit', fontWeight: 900, fontSize: '1rem', cursor: activating ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', minHeight: '54px', boxShadow: activating ? 'none' : '0 8px 28px rgba(245,185,66,0.4)', touchAction: 'manipulation' }}>
            {activating
              ? <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Connecting to Paystack...</>
              : <><ShieldCheck size={18} /> Activate My Account — ₦3,000</>
            }
          </button>
          <p style={{ fontFamily: 'Outfit', fontSize: '0.74rem', color: '#4b5563', marginTop: '1.2rem' }}>
            Signed in as <strong style={{ color: '#6b7280' }}>{user?.firstname} {user?.lastname}</strong>
          </p>
          <button onClick={logout} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontFamily: 'Outfit', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', minHeight: '44px', touchAction: 'manipulation' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Expert Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>

        {/* ── 1. Hero Atelier Specialist Profile Banner ── */}

        <div
          style={{
            background: user?.coverImage
              ? `linear-gradient(180deg, rgba(8, 10, 15, 0.45) 0%, rgba(13, 16, 24, 0.96) 100%), url(${user.coverImage}) center/cover no-repeat`
              : 'radial-gradient(circle at 85% 15%, rgba(245, 185, 66, 0.12) 0%, transparent 60%), linear-gradient(135deg, #141724 0%, #0d0f17 100%)',
            borderRadius: '26px',
            padding: '1.4rem',
            border: '1.5px solid rgba(245, 185, 66, 0.25)',
            boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(245, 185, 66, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top banner action row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span
                style={{
                  background: 'rgba(245, 185, 66, 0.15)',
                  color: '#f5b942',
                  border: '1px solid rgba(245, 185, 66, 0.35)',
                  borderRadius: '50px',
                  padding: '0.25rem 0.75rem',
                  fontSize: '0.7rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ShieldCheck size={12} /> Verified Specialist
              </span>

              {/* Status Switcher Toggle Pill */}
              <button
                type="button"
                onClick={() => {
                  const next = !isAvailable;
                  setIsAvailable(next);
                  showToast(next ? 'Status set to: Accepting Bookings' : 'Status set to: On Break', 'accent');
                }}
                style={{
                  background: isAvailable ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.16)',
                  border: isAvailable ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                  color: isAvailable ? '#10b981' : '#f87171',
                  fontSize: '0.7rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }} />
                <span>{isAvailable ? 'ACCEPTING BOOKINGS' : 'ON BREAK'}</span>
              </button>
            </div>

            <label
              style={{
                background: 'rgba(0,0,0,0.65)',
                color: '#f5b942',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                borderRadius: '50px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.72rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Camera size={12} />
              <span>{uploadingCover ? 'Saving...' : 'Cover Image'}</span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Avatar + Specialist Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.15rem', marginBottom: '1.25rem' }}>
            <label
              style={{ position: 'relative', flexShrink: 0, cursor: 'pointer', display: 'block' }}
              title="Tap to update profile avatar"
            >
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              <Avatar
                src={user?.avatarUrl || ''}
                name={`${user?.firstname || 'S'} ${user?.lastname || ''}`}
                size={74}
                borderRadius="50%"
                style={{
                  border: '2.5px solid #f5b942',
                  boxShadow: '0 6px 20px rgba(245, 185, 66, 0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#f5b942',
                  color: '#0c0e14',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #141724',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                }}
              >
                <Edit size={11} />
              </div>
            </label>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                  {user?.firstname || 'Specialist'} {user?.lastname || ''}
                </h2>
              </div>
              <p style={{ color: '#f5b942', fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 800, margin: '0.2rem 0 0.45rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {user?.title ? user.title : 'SALON & BEAUTY SPECIALIST'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                {/* Real Rating & Review Count Badge */}
                <button
                  type="button"
                  onClick={() => navigate('/expert/reviews')}
                  style={{
                    background: 'rgba(245, 185, 66, 0.12)',
                    border: '1px solid rgba(245, 185, 66, 0.3)',
                    color: '#f5b942',
                    fontSize: '0.72rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  title="View client reviews page"
                >
                  <Star size={11} fill="#f5b942" />
                  <span>{averageRating ? `${averageRating} (${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})` : `${reviews.length} reviews`}</span>
                </button>

                {(user?.businessAddress || user?.lga) && (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.04)', padding: '0.2rem 0.55rem', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <MapPin size={11} color="#f5b942" />
                    <span>{user?.lga || user?.businessAddress}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Profile Controls Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.65rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1rem',
              marginTop: '0.25rem',
            }}
          >
            <button
              onClick={() => navigate(`/expert-profile?name=${encodeURIComponent(`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Specialist')}`)}
              style={{
                background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.16) 0%, rgba(245, 185, 66, 0.08) 100%)',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                color: '#f5b942',
                padding: '0.65rem 0.85rem',
                borderRadius: '14px',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(245, 185, 66, 0.08)',
              }}
            >
              <Sparkles size={14} color="#f5b942" /> View Public Page
            </button>

            <button
              onClick={() => navigate('/expert/profile-edit')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                padding: '0.65rem 0.85rem',
                borderRadius: '14px',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Edit size={14} color="#94a3b8" /> Edit Profile
            </button>

            <button
              onClick={() => navigate('/expert/reviews')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                padding: '0.65rem 0.85rem',
                borderRadius: '14px',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <Star size={14} color="#f5b942" /> Reviews ({reviews.length})
            </button>

            <button
              onClick={() => navigate('/expert/chat')}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                padding: '0.65rem 0.85rem',
                borderRadius: '14px',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <MessageSquare size={14} color="#a78bfa" /> Client Messages
            </button>

            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '0.65rem 0.85rem',
                borderRadius: '14px',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
              title="Sign Out"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>


        {/* ── 2. Atelier Wallet & Payout Card ── */}
        <div
          style={{
            background: 'radial-gradient(circle at 90% 15%, rgba(245, 185, 66, 0.16) 0%, transparent 60%), linear-gradient(135deg, #141724 0%, #0d1017 100%)',
            borderRadius: '24px',
            padding: '1.4rem',
            border: '1.5px solid rgba(245, 185, 66, 0.28)',
            boxShadow: '0 16px 36px -10px rgba(0, 0, 0, 0.7), 0 0 24px rgba(245, 185, 66, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(245, 185, 66, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
                <Wallet size={16} />
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.74rem', fontFamily: 'Outfit', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Available Balance
                </span>
                <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={11} /> Bank Payout Ready
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/expert/transactions')}
              style={{
                background: 'rgba(245, 185, 66, 0.1)',
                border: '1px solid rgba(245, 185, 66, 0.25)',
                color: '#f5b942',
                fontFamily: 'Outfit',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '50px',
                transition: 'all 0.15s ease',
              }}
            >
              <History size={12} /> Statements <ChevronRight size={12} />
            </button>
          </div>

          <div style={{ fontFamily: 'Outfit', fontSize: '2.2rem', fontWeight: 900, color: '#f5b942', margin: '0.4rem 0 1.15rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span>₦{Number(walletBalance || 0).toLocaleString()}</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>NGN</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <button
              onClick={() => setShowWithdrawModal(true)}
              style={{
                background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
                color: '#0c0e14',
                border: 'none',
                borderRadius: '14px',
                height: '46px',
                fontFamily: 'Outfit',
                fontWeight: 900,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                boxShadow: '0 6px 18px rgba(245, 185, 66, 0.28)',
                transition: 'transform 0.12s ease',
              }}
            >
              <Building2 size={16} /> Request Payout
            </button>

            <button
              onClick={() => navigate('/payment', { state: { title: 'Wallet Funding', amount: 5000, description: 'Direct Deposit to Atelier Wallet', isTopup: true } })}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                height: '46px',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowUpRight size={16} color="#f5b942" /> Top Up Wallet
            </button>
          </div>
        </div>

        {/* ── 3. Performance Metrics Grid (100% Real Data) ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <Activity size={15} color="#f5b942" />
            <span style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Performance Overview
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            {/* Pending */}
            <div
              onClick={() => setFilterTab('pending')}
              style={{
                background: filterTab === 'pending'
                  ? 'radial-gradient(circle at 85% 15%, rgba(245, 185, 66, 0.18) 0%, transparent 60%), linear-gradient(145deg, #1a1e2d 0%, #121520 100%)'
                  : 'linear-gradient(145deg, #151824 0%, #0f121a 100%)',
                borderRadius: '20px',
                padding: '1.15rem',
                cursor: 'pointer',
                border: filterTab === 'pending' ? '1.5px solid #f5b942' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: filterTab === 'pending' ? '0 8px 24px rgba(245, 185, 66, 0.2)' : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pending
                </span>
                <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(245, 185, 66, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
                  <Clock size={15} />
                </div>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.95rem', fontWeight: 900, color: '#f5b942', lineHeight: 1 }}>
                {pendingBookings.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
                {pendingBookings.length === 1 ? '1 client waiting' : `${pendingBookings.length} clients waiting`}
              </div>
            </div>

            {/* Confirmed */}
            <div
              onClick={() => setFilterTab('accepted')}
              style={{
                background: filterTab === 'accepted'
                  ? 'radial-gradient(circle at 85% 15%, rgba(16, 185, 129, 0.18) 0%, transparent 60%), linear-gradient(145deg, #13241b 0%, #0d1a13 100%)'
                  : 'linear-gradient(145deg, #151824 0%, #0f121a 100%)',
                borderRadius: '20px',
                padding: '1.15rem',
                cursor: 'pointer',
                border: filterTab === 'accepted' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: filterTab === 'accepted' ? '0 8px 24px rgba(16, 185, 129, 0.2)' : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Confirmed
                </span>
                <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <CheckCircle size={15} />
                </div>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.95rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                {acceptedBookings.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
                Active scheduled sessions
              </div>
            </div>

            {/* Completed */}
            <div
              onClick={() => setFilterTab('completed')}
              style={{
                background: filterTab === 'completed'
                  ? 'radial-gradient(circle at 85% 15%, rgba(96, 165, 250, 0.18) 0%, transparent 60%), linear-gradient(145deg, #131d2b 0%, #0d141f 100%)'
                  : 'linear-gradient(145deg, #151824 0%, #0f121a 100%)',
                borderRadius: '20px',
                padding: '1.15rem',
                cursor: 'pointer',
                border: filterTab === 'completed' ? '1.5px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: filterTab === 'completed' ? '0 8px 24px rgba(96, 165, 250, 0.2)' : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Completed
                </span>
                <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(96, 165, 250, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Sparkles size={15} />
                </div>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.95rem', fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>
                {completedBookings.length}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
                Successful sessions
              </div>
            </div>

            {/* Revenue */}
            <div
              onClick={() => navigate('/expert/transactions')}
              style={{
                background: 'linear-gradient(145deg, #151824 0%, #0f121a 100%)',
                borderRadius: '20px',
                padding: '1.15rem',
                cursor: 'pointer',
                border: '1px solid rgba(245, 185, 66, 0.22)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Total Revenue
                </span>
                <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(245, 185, 66, 0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
                  <TrendingUp size={15} />
                </div>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.45rem', fontWeight: 900, color: '#f5b942', lineHeight: 1.1 }}>
                ₦{Number(totalRevenue).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
                Lifetime completed earnings
              </div>
            </div>
          </div>
        </div>


        {/* ── 4. Client Appointments & Requests Hub (Executive Overview) ── */}
        <div
          style={{
            background: 'linear-gradient(145deg, #151824 0%, #10121c 100%)',
            border: '1px solid rgba(245, 185, 66, 0.25)',
            borderRadius: '24px',
            padding: '1.4rem',
            boxShadow: '0 12px 36px -10px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.2), rgba(212, 175, 55, 0.1))',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f5b942',
              }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <h3 className="keep-white" style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Appointments & Schedule
                  </h3>
                  {pendingBookings.length > 0 && (
                    <span style={{
                      background: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '50px',
                      padding: '0.1rem 0.5rem',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      fontFamily: 'Outfit',
                      animation: 'pulse 1.8s infinite',
                    }}>
                      {pendingBookings.length} Action Needed
                    </span>
                  )}
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0.15rem 0 0' }}>
                  {bookings.length} total client bookings · {completedBookings.length} completed
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowCheckInDesk(true)}
                style={{
                  background: 'rgba(245, 185, 66, 0.12)',
                  border: '1px solid rgba(245, 185, 66, 0.35)',
                  color: '#f5b942',
                  borderRadius: '12px',
                  padding: '0.5rem 0.85rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.78rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                }}
              >
                <QrCode size={14} /> Check-In Desk
              </button>

              <button
                type="button"
                onClick={() => navigate('/expert/appointments')}
                style={{
                  background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
                  border: 'none',
                  color: '#0c0e14',
                  borderRadius: '12px',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  boxShadow: '0 4px 14px rgba(245, 185, 66, 0.3)',
                }}
              >
                <span>Manage All Hub</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Quick Counter Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1.15rem' }}>
            <div
              onClick={() => navigate('/expert/appointments?status=today')}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'Outfit' }}>TODAY</span>
                <Clock size={13} color="#f5b942" />
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900, color: '#f5b942' }}>
                {bookings.filter((b) => isToday(b.date || b.createdAt)).length}
              </div>
            </div>

            <div
              onClick={() => navigate('/expert/appointments?status=pending')}
              style={{
                background: pendingBookings.length > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${pendingBookings.length > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '16px',
                padding: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: pendingBookings.length > 0 ? '#f87171' : '#94a3b8', fontWeight: 700, fontFamily: 'Outfit' }}>PENDING</span>
                <AlertCircle size={13} color={pendingBookings.length > 0 ? '#ef4444' : '#94a3b8'} />
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900, color: pendingBookings.length > 0 ? '#ef4444' : '#ffffff' }}>
                {pendingBookings.length}
              </div>
            </div>

            <div
              onClick={() => navigate('/expert/appointments?status=accepted')}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'Outfit' }}>CONFIRMED</span>
                <CheckCircle size={13} color="#10b981" />
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>
                {acceptedBookings.length}
              </div>
            </div>

            <div
              onClick={() => navigate('/expert/appointments?status=completed')}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '0.85rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'Outfit' }}>COMPLETED</span>
                <Sparkles size={13} color="#60a5fa" />
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900, color: '#60a5fa' }}>
                {completedBookings.length}
              </div>
            </div>
          </div>

          {/* Pending Action Highlight (if any incoming booking needs confirmation) */}
          {pendingBookings.length > 0 ? (
            <div
              style={{
                background: 'radial-gradient(circle at 90% 10%, rgba(245, 185, 66, 0.12) 0%, transparent 60%), rgba(245, 185, 66, 0.05)',
                border: '1.5px solid rgba(245, 185, 66, 0.4)',
                borderRadius: '18px',
                padding: '1rem 1.15rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span style={{
                    background: '#f5b942',
                    color: '#0c0e14',
                    borderRadius: '50px',
                    padding: '0.15rem 0.55rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit',
                  }}>
                    Action Required
                  </span>
                  <span className="keep-white" style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                    {pendingBookings[0].clientName || 'New Client Booking'}
                  </span>
                </div>
                <span style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 900, color: '#f5b942' }}>
                  ₦{Number(pendingBookings[0].price || 0).toLocaleString()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', fontSize: '0.76rem', color: '#cbd5e1', marginBottom: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Scissors size={12} color="#f5b942" /> {pendingBookings[0].service || 'Specialist Session'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={12} color="#f5b942" /> {pendingBookings[0].date} at {pendingBookings[0].time}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  type="button"
                  disabled={updatingId === pendingBookings[0]._id}
                  onClick={() => handleUpdateStatus(pendingBookings[0]._id, 'accepted')}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '10px',
                    padding: '0.55rem',
                    fontFamily: 'Outfit',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  {updatingId === pendingBookings[0]._id ? 'Updating…' : '✓ Accept Booking'}
                </button>
                <button
                  type="button"
                  disabled={updatingId === pendingBookings[0]._id}
                  onClick={() => handleUpdateStatus(pendingBookings[0]._id, 'rejected')}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#f87171',
                    borderRadius: '10px',
                    padding: '0.55rem 0.95rem',
                    fontFamily: 'Outfit',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          ) : acceptedBookings.length > 0 ? (
            /* Upcoming Confirmed Preview */
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1rem 1.15rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Outfit' }}>
                  Next Upcoming Client
                </span>
                <h4 className="keep-white" style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0.2rem 0 0.25rem' }}>
                  {acceptedBookings[0].clientName || 'Confirmed Client'}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.76rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                  <span>{acceptedBookings[0].service}</span>
                  <span>•</span>
                  <span>{acceptedBookings[0].date} at {acceptedBookings[0].time}</span>
                  {acceptedBookings[0].checkInCode && (
                    <span style={{ color: '#f5b942', fontWeight: 800, fontFamily: 'monospace' }}>Pass: {acceptedBookings[0].checkInCode}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {acceptedBookings[0].paymentStatus === 'paid' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/expert/chat?bookingId=${acceptedBookings[0]._id}`)}
                    style={{
                      background: 'rgba(167, 139, 250, 0.15)',
                      border: '1px solid rgba(167, 139, 250, 0.35)',
                      color: '#c4b5fd',
                      borderRadius: '10px',
                      padding: '0.45rem 0.8rem',
                      fontSize: '0.76rem',
                      fontFamily: 'Outfit',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <MessageSquare size={13} /> Chat
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/expert/appointments')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#e2e8f0',
                    borderRadius: '10px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.76rem',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '1.25rem',
                textAlign: 'center',
                marginBottom: '1rem',
              }}
            >
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 0.5rem' }}>
                All caught up! No active pending bookings.
              </p>
              <button
                type="button"
                onClick={() => navigate('/expert/appointments')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f5b942',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Browse Past History & Reports ({completedBookings.length} completed) →
              </button>
            </div>
          )}

          {/* Bottom Bar: Direct button to Dedicated Standalone Page */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', flexWrap: 'wrap', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
              Full appointment calendar, check-in scanner desk, and client communication.
            </span>
            <button
              type="button"
              onClick={() => navigate('/expert/appointments')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f5b942',
                fontSize: '0.78rem',
                fontWeight: 800,
                fontFamily: 'Outfit',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>Go to Dedicated Appointments Page</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ── 6. Portfolio Work & Lookbook ── */}
        <div id="portfolio">
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(245, 185, 66, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
          <BookOpen size={16} />
        </div>
        <div>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Portfolio Work & Logbook
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Document client styles, techniques & lookbook showcase
          </span>
        </div>
      </div>

      <button
        onClick={() => navigate('/expert/portfolio')}
        style={{
          background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
          color: '#0c0e14',
          border: 'none',
          borderRadius: '50px',
          padding: '0.45rem 0.95rem',
          fontSize: '0.78rem',
          fontFamily: 'Outfit',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          boxShadow: '0 4px 14px rgba(245, 185, 66, 0.25)',
          transition: 'all 0.15s ease',
        }}
      >
        <Plus size={15} /> Log Work Entry
      </button>
    </div>

    {/* Controls Bar: Dual View Toggle + Service Filter Pills */}
    <div
      style={{
        background: 'linear-gradient(135deg, #141724 0%, #0f121b 100%)',
        borderRadius: '20px',
        padding: '0.85rem 1rem',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 24px -8px rgba(0, 0, 0, 0.4)',
        marginBottom: '1.15rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {/* View Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="button"
            onClick={() => setPortfolioView('lookbook')}
            style={{
              background: portfolioView === 'lookbook' ? 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)' : 'transparent',
              color: portfolioView === 'lookbook' ? '#0c0e14' : '#94a3b8',
              border: 'none',
              borderRadius: '9px',
              padding: '0.35rem 0.85rem',
              fontFamily: 'Outfit',
              fontSize: '0.76rem',
              fontWeight: portfolioView === 'lookbook' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
            }}
          >
            <Camera size={13} /> Visual Lookbook
          </button>
          <button
            type="button"
            onClick={() => setPortfolioView('logbook')}
            style={{
              background: portfolioView === 'logbook' ? 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)' : 'transparent',
              color: portfolioView === 'logbook' ? '#0c0e14' : '#94a3b8',
              border: 'none',
              borderRadius: '9px',
              padding: '0.35rem 0.85rem',
              fontFamily: 'Outfit',
              fontSize: '0.76rem',
              fontWeight: portfolioView === 'logbook' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease',
            }}
          >
            <FileText size={13} /> Work Logbook ({portfolio.length})
          </button>
        </div>

        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
          {portfolio.length} total logged work {portfolio.length === 1 ? 'sample' : 'samples'}
        </span>
      </div>

      {/* Service Category Pills */}
      {portfolioServices.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.2rem',
            scrollbarWidth: 'none',
          }}
        >
          {portfolioServices.map((svc) => {
            const isActive = activePortfolioService === svc;
            const count = svc === 'All'
              ? portfolio.length
              : portfolio.filter((p) => (p.service || 'General') === svc).length;

            return (
              <button
                key={svc}
                type="button"
                onClick={() => setActivePortfolioService(svc)}
                style={{
                  background: isActive ? 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#0c0e14' : '#94a3b8',
                  border: `1px solid ${isActive ? '#f5b942' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '50px',
                  padding: '0.3rem 0.85rem',
                  fontFamily: 'Outfit',
                  fontSize: '0.74rem',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <span>{svc}</span>
                <span
                  style={{
                    background: isActive ? 'rgba(12,14,20,0.25)' : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#0c0e14' : '#f5b942',
                    padding: '0.08rem 0.4rem',
                    borderRadius: '50px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>

    {/* Content Rendering: Lookbook or Logbook */}
    {(() => {
      const displayedItems = activePortfolioService === 'All'
        ? portfolio
        : portfolio.filter((p) => (p.service || 'General') === activePortfolioService);

      if (displayedItems.length === 0) {
        return (
          <div
            style={{
              background: 'radial-gradient(circle at 50% 20%, rgba(245, 185, 66, 0.08) 0%, transparent 65%), #141722',
              borderRadius: '24px',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              border: '1.5px dashed rgba(245, 185, 66, 0.25)',
            }}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 185, 66, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942', marginBottom: '1rem' }}>
              <BookOpen size={28} />
            </div>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem' }}>
              No Work Logged {activePortfolioService !== 'All' ? `for "${activePortfolioService}"` : 'Yet'}
            </h4>
            <p style={{ fontSize: '0.84rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 1.5rem', lineHeight: 1.4 }}>
              Document client transformations, styling notes, duration, and photos to showcase your craft on your public profile.
            </p>
            <button
              type="button"
              onClick={() => navigate('/expert/portfolio')}
              style={{
                background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
                color: '#0c0e14',
                border: 'none',
                borderRadius: '50px',
                padding: '0.65rem 1.4rem',
                fontFamily: 'Outfit',
                fontSize: '0.84rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(245, 185, 66, 0.3)',
              }}
            >
              <Plus size={16} /> Log Your First Work Sample
            </button>
          </div>
        );
      }

      // ── VISUAL LOOKBOOK VIEW ──
      if (portfolioView === 'lookbook') {
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {/* Quick Add Slot */}
            <div
              onClick={() => navigate('/expert/portfolio')}
              style={{
                aspectRatio: '1 / 1',
                borderRadius: '16px',
                border: '2px dashed rgba(245, 185, 66, 0.35)',
                background: 'rgba(245, 185, 66, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: '0.4rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(245, 185, 66, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
                <Plus size={18} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#f5b942', fontFamily: 'Outfit', fontWeight: 800 }}>
                Log Work
              </span>
            </div>

            {/* Portfolio Cards */}
            {displayedItems.map((item, idx) => {
              const imgUrl = item.imageUrl || item.url || '';
              return (
                <div
                  key={item._id || idx}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#151822',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  }}
                  onClick={() => setSelectedLogDetail(item)}
                >
                  <img
                    src={imgUrl}
                    alt={item.title || 'Work sample'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease',
                    }}
                    loading="lazy"
                  />

                  {/* Top Service Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      left: '6px',
                      background: 'rgba(12, 14, 20, 0.75)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#f5b942',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '50px',
                      fontFamily: 'Outfit',
                      maxWidth: '75%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.service || 'General'}
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePortfolioDelete(item._id);
                    }}
                    disabled={deletingPortfolioId === item._id}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: deletingPortfolioId === item._id ? 'rgba(0,0,0,0.8)' : 'rgba(239,68,68,0.85)',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: deletingPortfolioId === item._id ? 'not-allowed' : 'pointer',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      zIndex: 2,
                    }}
                  >
                    {deletingPortfolioId === item._id ? (
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <X size={13} />
                    )}
                  </button>

                  {/* Bottom Gradient Overlay with Title & Details */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '1.25rem 0.5rem 0.45rem',
                      background: 'linear-gradient(to top, rgba(12,14,20,0.95) 0%, rgba(12,14,20,0.6) 60%, transparent 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.15rem',
                    }}
                  >
                    <span
                      style={{
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title || 'Client Transformation'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.2rem' }}>
                      <span style={{ color: '#94a3b8', fontSize: '0.62rem' }}>
                        {item.duration || (item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Logged')}
                      </span>
                      {item.price && (
                        <span style={{ color: '#f5b942', fontSize: '0.64rem', fontWeight: 800 }}>
                          {item.price.startsWith('₦') ? item.price : `₦${item.price}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }

      // ── DETAILED WORK LOGBOOK JOURNAL VIEW ──
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayedItems.map((item, idx) => {
            const imgUrl = item.imageUrl || item.url || '';
            const formattedDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : 'Recent Entry';

            return (
              <div
                key={item._id || idx}
                style={{
                  background: 'linear-gradient(145deg, #151824 0%, #10121c 100%)',
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: '1rem',
                  display: 'flex',
                  gap: '0.95rem',
                  alignItems: 'center',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Photo Thumbnail */}
                <div
                  onClick={() => setSelectedLogDetail(item)}
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    position: 'relative',
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#1c202d',
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={item.title || 'Work'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    }}
                    className="hover-show"
                  >
                    <Eye size={16} color="#ffffff" />
                  </div>
                </div>

                {/* Log Details */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        background: 'rgba(245, 185, 66, 0.12)',
                        color: '#f5b942',
                        border: '1px solid rgba(245, 185, 66, 0.3)',
                        borderRadius: '50px',
                        padding: '0.1rem 0.45rem',
                        fontSize: '0.65rem',
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                      }}
                    >
                      {item.service || 'General'}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      • {formattedDate}
                    </span>
                  </div>

                  <h4
                    onClick={() => setSelectedLogDetail(item)}
                    style={{
                      fontFamily: 'Outfit',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      margin: 0,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title || 'Client Transformation'}
                  </h4>

                  {/* Note / Technique preview */}
                  {item.clientNote || item.description ? (
                    <p
                      style={{
                        fontSize: '0.74rem',
                        color: '#94a3b8',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontStyle: 'italic',
                      }}
                    >
                      "{item.clientNote || item.description}"
                    </p>
                  ) : null}

                  {/* Duration & Price pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.1rem' }}>
                    {item.duration && (
                      <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} color="#f5b942" /> {item.duration}
                      </span>
                    )}
                    {item.price && (
                      <span style={{ fontSize: '0.72rem', color: '#f5b942', fontWeight: 800 }}>
                        {item.price.startsWith('₦') ? item.price : `₦${item.price}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedLogDetail(item)}
                    style={{
                      background: '#1c202d',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#f5b942',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="View Full Log"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePortfolioDelete(item._id)}
                    disabled={deletingPortfolioId === item._id}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: deletingPortfolioId === item._id ? 'not-allowed' : 'pointer',
                    }}
                    title="Delete Entry"
                  >
                    {deletingPortfolioId === item._id ? (
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.3)', borderTopColor: '#ef4444', animation: 'spin 0.7s linear infinite' }} />
                    ) : (
                      <Trash2 size={13} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    })()}
  </div>

      </div >

  {/* ── MODALS & DRAWERS ── */ }

{/* 1. Withdraw Funds Bank Modal */ }
<WithdrawFundsModal
  isOpen={showWithdrawModal}
  onClose={() => setShowWithdrawModal(false)}
  walletBalance={walletBalance}
  onSuccess={(newBal) => {
    setWalletBalance(newBal);
    fetchWalletData();
  }}
/>



{/* 4. Request Payout / Withdraw Funds Modal */ }
<WithdrawFundsModal

  isOpen={showWithdrawModal}
  onClose={() => setShowWithdrawModal(false)}
  walletBalance={walletBalance}
  onSuccess={() => {
    fetchWalletData();
    fetchDashboardData();
  }}
/>



{/* 5. Add Work to Lookbook & Portfolio Modal */ }
{
  showAddWorkModal && (
    <PopupModal
      isOpen={showAddWorkModal}
      onClose={() => {
        if (!uploadingPortfolio) setShowAddWorkModal(false);
      }}
      title="Log Client Work & Lookbook"
    >
      <form onSubmit={handleSaveWorkLog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.4 }}>
          Document client styles, styling duration, technique notes, and publish directly to your lookbook showcase.
        </p>

        {/* Photo Selection / Preview Area */}
        <div>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
            Work Photo <span style={{ color: '#ef4444' }}>*</span>
          </label>

          {workForm.imagePreview ? (
            <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
              <img
                src={workForm.imagePreview}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <label
                style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  background: 'rgba(12, 14, 20, 0.85)',
                  backdropFilter: 'blur(6px)',
                  color: '#f5b942',
                  border: '1px solid rgba(245, 185, 66, 0.35)',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '50px',
                  fontSize: '0.72rem',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Camera size={12} /> Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleWorkImageSelect}
                  style={{ display: 'none' }}
                  disabled={uploadingPortfolio}
                />
              </label>
            </div>
          ) : (
            <label
              style={{
                width: '100%',
                height: '140px',
                borderRadius: '14px',
                border: '2px dashed rgba(245, 185, 66, 0.35)',
                background: 'rgba(245, 185, 66, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                gap: '0.45rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(245, 185, 66, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
                <Camera size={20} />
              </div>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#f5b942' }}>
                Select / Take Work Photo
              </span>
              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                PNG, JPG, WEBP up to 10MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleWorkImageSelect}
                style={{ display: 'none' }}
                disabled={uploadingPortfolio}
              />
            </label>
          )}
        </div>

        {/* Style / Work Title */}
        <div>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
            Style / Transformation Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Bohemian Knotless Braids, Razor Fade & Beard Sculpt"
            value={workForm.title}
            onChange={(e) => setWorkForm((p) => ({ ...p, title: e.target.value }))}
            style={{
              width: '100%',
              background: '#10131b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem 0.85rem',
              minHeight: '46px',
              boxSizing: 'border-box',
              color: '#ffffff',
              fontFamily: 'Outfit',
              fontSize: '16px',
              outline: 'none',
            }}
            required
          />

          {/* Quick Suggestion Chips */}
          <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', marginTop: '0.5rem', scrollbarWidth: 'none' }}>
            {['Silk Press & Steam', 'Skin Fade + Beard', 'Knotless Braids', 'Russian Almond Gel', 'Soft Glam Makeup'].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setWorkForm((p) => ({ ...p, title: chip }))}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                  fontSize: '0.72rem',
                  padding: '0.35rem 0.75rem',
                  minHeight: '34px',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Service Category Selection */}
        <div>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
            Service Category <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={workForm.service}
            onChange={(e) => setWorkForm((p) => ({ ...p, service: e.target.value }))}
            style={{
              width: '100%',
              background: '#10131b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem 0.85rem',
              minHeight: '46px',
              boxSizing: 'border-box',
              color: '#ffffff',
              fontFamily: 'Outfit',
              fontSize: '16px',
              outline: 'none',
            }}
          >
            {portfolioServices.filter((s) => s !== 'All').map((svc) => (
              <option key={svc} value={svc} style={{ background: '#151822', color: '#ffffff' }}>
                {svc}
              </option>
            ))}
            <option value="General" style={{ background: '#151822', color: '#ffffff' }}>
              General / Bespoke Styling
            </option>
          </select>
        </div>

        {/* Row: Duration & Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Duration
            </label>
            <input
              type="text"
              placeholder="e.g. 2 hrs, 45 mins"
              value={workForm.duration}
              onChange={(e) => setWorkForm((p) => ({ ...p, duration: e.target.value }))}
              style={{
                width: '100%',
                background: '#10131b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '0.75rem 0.85rem',
                minHeight: '46px',
                boxSizing: 'border-box',
                color: '#ffffff',
                fontFamily: 'Outfit',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Fee / Value (₦)
            </label>
            <input
              type="text"
              placeholder="e.g. ₦25,000"
              value={workForm.price}
              onChange={(e) => setWorkForm((p) => ({ ...p, price: e.target.value }))}
              style={{
                width: '100%',
                background: '#10131b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '0.75rem 0.85rem',
                minHeight: '46px',
                boxSizing: 'border-box',
                color: '#ffffff',
                fontFamily: 'Outfit',
                fontSize: '16px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Client & Technique Notes */}
        <div>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
            Technique, Products & Client Notes (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Used botanical scalp butter, straight razor finish. Client requested mid-back length with curly blonde ends."
            value={workForm.clientNote}
            onChange={(e) => setWorkForm((p) => ({ ...p, clientNote: e.target.value }))}
            style={{
              width: '100%',
              background: '#10131b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.75rem 0.85rem',
              color: '#ffffff',
              fontFamily: 'Outfit',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.4,
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploadingPortfolio}
          style={{
            background: 'linear-gradient(135deg, #f5b942 0%, #e0a32d 100%)',
            color: '#0c0e14',
            border: 'none',
            borderRadius: '14px',
            padding: '0.85rem',
            minHeight: '48px',
            fontFamily: 'Outfit',
            fontSize: '0.94rem',
            fontWeight: 800,
            cursor: uploadingPortfolio ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 15px rgba(245, 185, 66, 0.3)',
            marginTop: '0.5rem',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {uploadingPortfolio ? (
            <>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(12,14,20,0.3)', borderTopColor: '#0c0e14', animation: 'spin 0.7s linear infinite' }} />
              <span>Uploading & Publishing Work…</span>
            </>
          ) : (
            <>
              <Sparkles size={16} /> Save to Lookbook & Portfolio
            </>
          )}
        </button>
      </form>
    </PopupModal>
  )
}

{/* 6. Work Log Detail & Lightbox Modal */ }
{
  selectedLogDetail && (
    <PopupModal
      isOpen={!!selectedLogDetail}
      onClose={() => setSelectedLogDetail(null)}
      title={selectedLogDetail.title || 'Work Log Detail'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Full Preview Image */}
        <div
          style={{
            width: '100%',
            maxHeight: '300px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: '#10131b',
          }}
        >
          <img
            src={selectedLogDetail.imageUrl || selectedLogDetail.url}
            alt={selectedLogDetail.title || 'Work detail'}
            style={{ width: '100%', height: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Title & Service Badges */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span
              style={{
                background: 'rgba(245, 185, 66, 0.15)',
                color: '#f5b942',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                borderRadius: '50px',
                padding: '0.15rem 0.6rem',
                fontSize: '0.72rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
              }}
            >
              {selectedLogDetail.service || 'General'}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Logged {selectedLogDetail.createdAt ? new Date(selectedLogDetail.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
            </span>
          </div>

          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            {selectedLogDetail.title || 'Client Transformation'}
          </h3>
        </div>

        {/* Duration & Fee Pills */}
        {(selectedLogDetail.duration || selectedLogDetail.price) && (
          <div style={{ display: 'flex', gap: '0.75rem', background: '#151822', padding: '0.65rem 0.85rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {selectedLogDetail.duration && (
              <div>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Outfit' }}>{selectedLogDetail.duration}</div>
              </div>
            )}
            {selectedLogDetail.price && (
              <div style={{ marginLeft: selectedLogDetail.duration ? 'auto' : 0 }}>
                <div style={{ fontSize: '0.66rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fee / Price</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f5b942', fontFamily: 'Outfit' }}>
                  {selectedLogDetail.price.startsWith('₦') ? selectedLogDetail.price : `₦${selectedLogDetail.price}`}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Client & Technique Notes */}
        {(selectedLogDetail.clientNote || selectedLogDetail.description) && (
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '0.85rem', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.25rem' }}>
              Styling Notes & Technique
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, fontStyle: 'italic' }}>
              "{selectedLogDetail.clientNote || selectedLogDetail.description}"
            </p>
          </div>
        )}

        {/* Actions: Delete or Close */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handlePortfolioDelete(selectedLogDetail._id)}
            disabled={deletingPortfolioId === selectedLogDetail._id}
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '0.65rem 1rem',
              fontFamily: 'Outfit',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: deletingPortfolioId === selectedLogDetail._id ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <Trash2 size={14} /> Remove Entry
          </button>

          <button
            type="button"
            onClick={() => setSelectedLogDetail(null)}
            style={{
              background: '#1c202d',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '0.65rem 1.25rem',
              fontFamily: 'Outfit',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </PopupModal>
  )
}

{/* ── Booking Chat Sheet (Expert <-> Customer, paid bookings only) ── */ }
<BookingChatSheet
  booking={chatBooking}
  currentUserEmail={user?.email}
  viewerRole="specialist"
  isOpen={!!chatBooking}
  onClose={() => setChatBooking(null)}
/>



{/* ── Atelier Check-In Desk Scanner Modal ── */ }
<CheckInScannerModal
  isOpen={showCheckInDesk}
  onClose={() => setShowCheckInDesk(false)}
  onCheckInComplete={(updatedBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b._id === updatedBooking._id ? { ...b, ...updatedBooking } : b))
    );
    showToast('Client arrival confirmed & verified!', 'success');
  }}
/>

    </PageContainer >
  );
};

export default ExpertDashboard;
