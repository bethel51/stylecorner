import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Edit,
  ShoppingBag,
  Truck,
  Shield,
  Download,
  Plus,
  MapPin,
  Trash2,
  AlertTriangle,
  History,
  Activity,
  ListOrdered,
  MessageSquare,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { PopupModal } from '../components/common/PopupModal';
import { BottomSheet } from '../components/common/BottomSheet';
import { ImagePreviewModal } from '../components/common/ImagePreviewModal';
import { downloadBookingHistoryCSV, printBookingHistoryReport } from '../utils/bookingHistoryExport';

// ─── Swipeable Booking Request Card ────────────────────────────────────────
const SwipeableBookingCard = ({ booking: b, updatingId, onAccept, onDecline, openClientWhatsApp }) => {
  const cardRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const THRESHOLD = 80; // px to trigger action

  const resetCard = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease';
    cardRef.current.style.transform = 'translateX(0)';
    cardRef.current.style.boxShadow = '';
    currentX.current = 0;
  }, []);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !cardRef.current) return;
    const diff = e.touches[0].clientX - startX.current;
    currentX.current = diff;
    const clamped = Math.max(-140, Math.min(140, diff));
    const progress = Math.min(Math.abs(clamped) / THRESHOLD, 1);
    const isRight = clamped > 0;
    cardRef.current.style.transform = `translateX(${clamped}px)`;
    if (isRight) {
      cardRef.current.style.boxShadow = `0 8px 32px rgba(16,185,129,${0.15 + progress * 0.35})`;
      cardRef.current.style.borderColor = `rgba(16,185,129,${0.3 + progress * 0.7})`;
    } else {
      cardRef.current.style.boxShadow = `0 8px 32px rgba(239,68,68,${0.15 + progress * 0.35})`;
      cardRef.current.style.borderColor = `rgba(239,68,68,${0.3 + progress * 0.7})`;
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = currentX.current;
    if (diff > THRESHOLD) {
      // Swipe right → Accept
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        cardRef.current.style.transform = 'translateX(110%)';
        cardRef.current.style.opacity = '0';
      }
      setTimeout(onAccept, 280);
    } else if (diff < -THRESHOLD) {
      // Swipe left → Decline
      if (cardRef.current) {
        cardRef.current.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        cardRef.current.style.transform = 'translateX(-110%)';
        cardRef.current.style.opacity = '0';
      }
      setTimeout(onDecline, 280);
    } else {
      resetCard();
    }
  };

  const isPaid = ['paid_wallet', 'paid_card', 'paid_transfer'].includes(b.paymentStatus);
  const isUpdating = updatingId === b._id;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '18px' }}>
      {/* Swipe hint backgrounds */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
        paddingLeft: '1.5rem',
        background: 'linear-gradient(90deg, rgba(16,185,129,0.25) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <CheckCircle size={28} color="#10b981" />
      </div>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '18px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        paddingRight: '1.5rem',
        background: 'linear-gradient(270deg, rgba(239,68,68,0.25) 0%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <XCircle size={28} color="#ef4444" />
      </div>

      {/* The actual card */}
      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(245,158,11,0.35)',
          borderRadius: '18px',
          padding: '1rem',
          willChange: 'transform',
          touchAction: 'pan-y',
        }}
      >
        {/* Row 1: Client Name + Price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 900, color: '#ffffff', margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {b.clientName || 'Client'}
          </h4>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 900, color: '#f59e0b', flexShrink: 0 }}>
            ₦{Number(b.price).toLocaleString()}
          </span>
        </div>

        {/* Row 2: Payment badge */}
        <div style={{ marginBottom: '0.75rem' }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 800,
            background: isPaid ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.15)',
            color: isPaid ? '#34d399' : '#f59e0b',
            padding: '0.2rem 0.6rem', borderRadius: '50px',
            display: 'inline-block',
          }}>
            {isPaid ? '✓ Paid by Client' : '⏳ Payment Pending'}
          </span>
        </div>

        {/* Row 3: Service + Date/Time info box */}
        <div style={{
          background: 'rgba(0,0,0,0.3)', borderRadius: '12px',
          padding: '0.6rem 0.8rem', marginBottom: '0.85rem',
        }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', color: '#ffffff', marginBottom: '0.3rem' }}>
            ✂️ {b.service}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#a8a29e', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem' }}>
            <Clock size={11} color="#f59e0b" />
            <span>{b.date} at {b.time}</span>
            {b.location && (
              <>
                <span style={{ opacity: 0.4 }}>•</span>
                <MapPin size={11} color="#f59e0b" />
                <span>{b.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Row 4: Contact row (email + WhatsApp + Call) */}
        {(b.clientEmail || b.clientPhone) && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.4rem',
            alignItems: 'center', marginBottom: '0.85rem',
            fontSize: '0.72rem', color: '#d6d3d1',
          }}>
            {b.clientEmail && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Mail size={11} color="#f59e0b" /> {b.clientEmail}
              </span>
            )}
            {b.clientPhone && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => openClientWhatsApp(b.clientPhone, b.clientName)}
                  style={{
                    background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)',
                    color: '#4ade80', padding: '0.2rem 0.55rem', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '0.68rem', fontWeight: 800, fontFamily: 'Outfit',
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                  }}
                >
                  <MessageSquare size={11} /> WhatsApp
                </button>
                <a
                  href={`tel:${b.clientPhone}`}
                  style={{
                    background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.4)',
                    color: '#60a5fa', padding: '0.2rem 0.55rem', borderRadius: '8px',
                    fontSize: '0.68rem', fontWeight: 800, fontFamily: 'Outfit',
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none',
                  }}
                >
                  <Phone size={11} /> Call
                </a>
              </span>
            )}
          </div>
        )}

        {/* Row 5: Accept / Decline buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
          <button
            onClick={onAccept}
            disabled={isUpdating}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none', color: '#fff',
              borderRadius: '12px', minHeight: '46px',
              fontSize: '0.85rem', fontWeight: 900, fontFamily: 'Outfit',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
              opacity: isUpdating ? 0.6 : 1,
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <CheckCircle size={16} />
            <span>{isUpdating ? 'Updating…' : 'Accept'}</span>
          </button>

          <button
            onClick={onDecline}
            disabled={isUpdating}
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1.5px solid rgba(239,68,68,0.45)',
              color: '#f87171',
              borderRadius: '12px', minHeight: '46px',
              fontSize: '0.85rem', fontWeight: 800, fontFamily: 'Outfit',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
              opacity: isUpdating ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <XCircle size={16} />
            <span>Decline</span>
          </button>
        </div>

        {/* Swipe hint pill */}
        <div style={{
          marginTop: '0.7rem', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '0.4rem',
          fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)',
          fontFamily: 'Outfit', letterSpacing: '0.04em',
        }}>
          <span>← Decline</span>
          <span style={{ width: '24px', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
          <span>Swipe</span>
          <span style={{ width: '24px', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.12)', display: 'inline-block' }} />
          <span>Accept →</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export const ExpertDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, deleteAccount, showToast } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Dedicated Sheet/Page Navigation States
  const [showAppointmentsSheet, setShowAppointmentsSheet] = useState(false);
  const [showActivitySheet, setShowActivitySheet] = useState(false);

  // Atelier Expert Wallet & Payout States
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalsList, setWithdrawalsList] = useState([]);
  const [banksList, setBanksList] = useState([]);

  // Top-Up Modal State
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupSubmitting, setTopupSubmitting] = useState(false);

  // Withdraw Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [accountResolved, setAccountResolved] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  // Wallet History Sheet State
  const [showWalletHistorySheet, setShowWalletHistorySheet] = useState(false);
  const [walletFilterTab, setWalletFilterTab] = useState('all'); // 'all' | 'earnings' | 'withdrawals' | 'topups'

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEnlargedAvatar, setShowEnlargedAvatar] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Avatar edit state
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [avatarInput, setAvatarInput] = useState(user?.avatarUrl || '');
  const [coverInput, setCoverInput] = useState(user?.coverImage || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (user) {
      setAvatarInput(user.avatarUrl || '');
      setCoverInput(user.coverImage || '');
    }
  }, [user]);

  const handleExpertPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarInput(previewUrl);
    showToast('Profile photo updated!', 'success');
    setUploadingPhoto(true);

    try {
      const url = await uploadToCloudinary(file);
      setAvatarInput(url);
      await updateProfile({ avatarUrl: url });
      showToast('Profile picture updated & synced across website!', 'success');
      setShowAvatarSheet(false);
    } catch (err) {
      showToast(err.message || 'Failed to upload photo. Please try again.', 'error');
      setAvatarInput(user?.avatarUrl || '');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleExpertCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCoverInput(previewUrl);
    showToast('Cover banner updated!', 'success');
    setUploadingCover(true);

    try {
      const url = await uploadToCloudinary(file);
      setCoverInput(url);
      await updateProfile({ coverImage: url });
      showToast('Cover banner updated & synced across website!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to upload cover banner.', 'error');
      setCoverInput(user?.coverImage || '');
    } finally {
      setUploadingCover(false);
    }
  };

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

  const fetchWalletData = async () => {
    try {
      const [walletRes, txnsRes, withRes, banksRes] = await Promise.allSettled([
        api.getWalletBalance(),
        api.getWalletTransactions(),
        api.getWalletWithdrawals(),
        api.getBanksList(),
      ]);
      if (walletRes.status === 'fulfilled') {
        setWalletBalance(walletRes.value?.walletBalance ?? 0);
      }
      if (txnsRes.status === 'fulfilled') {
        setTransactions(Array.isArray(txnsRes.value) ? txnsRes.value : []);
      }
      if (withRes.status === 'fulfilled') {
        setWithdrawalsList(Array.isArray(withRes.value) ? withRes.value : []);
      }
      if (banksRes.status === 'fulfilled') {
        const bl = Array.isArray(banksRes.value) ? banksRes.value : [];
        setBanksList(bl);
        if (bl.length > 0 && !selectedBankCode) {
          setSelectedBankCode(bl[0].code);
          setSelectedBankName(bl[0].name);
        }
      }
    } catch (e) {
      console.warn('Wallet data notice:', e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsData] = await Promise.all([
        api.getBookings(),
        fetchWalletData(),
      ]);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch appointments data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Bank Account Resolution for Withdrawal
  const handleResolveAccount = async (accNum, bCode) => {
    if (!accNum || accNum.length !== 10 || !bCode) return;
    setResolvingAccount(true);
    setResolveError('');
    try {
      const res = await api.resolveBankAccount(accNum, bCode);
      if (res && res.accountName) {
        setAccountName(res.accountName);
        setAccountResolved(true);
      } else {
        setAccountName('');
        setAccountResolved(false);
        setResolveError('Could not verify account name. Please check account number.');
      }
    } catch (err) {
      setAccountName('');
      setAccountResolved(false);
      setResolveError(err.message || 'Verification failed. Please check account details.');
    } finally {
      setResolvingAccount(false);
    }
  };

  const onAccountNumberChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setAccountNumber(val);
    setAccountResolved(false);
    setResolveError('');
    if (val.length === 10 && selectedBankCode) {
      handleResolveAccount(val, selectedBankCode);
    } else {
      setAccountName('');
    }
  };

  const onBankChange = (e) => {
    const code = e.target.value;
    const found = banksList.find((b) => String(b.code) === String(code));
    setSelectedBankCode(code);
    setSelectedBankName(found ? found.name : '');
    setAccountResolved(false);
    setResolveError('');
    if (accountNumber.length === 10 && code) {
      handleResolveAccount(accountNumber, code);
    }
  };

  // Withdraw Submission
  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt < 1000) {
      showToast('Minimum withdrawal amount is ₦1,000.', 'error');
      return;
    }
    if (amt > walletBalance) {
      showToast(`Insufficient balance. Maximum withdrawable: ₦${Number(walletBalance).toLocaleString()}`, 'error');
      return;
    }
    if (!selectedBankCode || !accountNumber || accountNumber.length !== 10) {
      showToast('Please enter a valid 10-digit Nigerian account number and select a bank.', 'error');
      return;
    }
    if (!accountName) {
      showToast('Please verify your account details before submitting payout.', 'error');
      return;
    }

    setWithdrawSubmitting(true);
    try {
      const res = await api.requestWithdrawal({
        amount: amt,
        bankName: selectedBankName || 'Bank',
        bankCode: selectedBankCode,
        accountNumber,
        accountName,
      });
      setWalletBalance(res.walletBalance ?? (walletBalance - amt));
      showToast(`Withdrawal of ₦${amt.toLocaleString()} submitted! Funds will reflect shortly.`, 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setAccountNumber('');
      setAccountName('');
      setAccountResolved(false);
      fetchWalletData();
    } catch (err) {
      showToast(err.message || 'Withdrawal failed. Please try again.', 'error');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  // Top Up Submission (Paystack)
  const handleTopupSubmit = async (e) => {
    if (e) e.preventDefault();
    const amt = Number(topupAmount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid top-up amount.', 'error');
      return;
    }
    setTopupSubmitting(true);
    try {
      const config = await api.getPaystackConfig();
      const pKey = config.publicKey;

      if (!window.PaystackPop || !pKey) {
        showToast('Paystack payment gateway is currently unavailable. Please try again shortly.', 'error');
        setTopupSubmitting(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: pKey,
        email: user?.email || 'expert@stylecorner.com',
        amount: Math.round(amt * 100),
        currency: 'NGN',
        ref: 'EXP-TOPUP-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        callback: function(response) {
          (async () => {
            try {
              const res = await api.verifyPaystackPayment({
                reference: response.reference,
                isTopup: true,
                amount: amt,
              });
              setWalletBalance(res.walletBalance);
              showToast(`Wallet credited with ₦${amt.toLocaleString()} via Paystack! 🎉`, 'success');
              setShowTopupModal(false);
              setTopupAmount('');
              fetchWalletData();
            } catch (err) {
              showToast(err.message || 'Top-up verification failed', 'error');
            } finally {
              setTopupSubmitting(false);
            }
          })();
        },
        onClose: () => {
          showToast('Top-up cancelled', 'accent');
          setTopupSubmitting(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      showToast(err.message || 'Top-up failed', 'error');
      setTopupSubmitting(false);
    }
  };

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
        showToast('Service completed! Earnings credited to your Atelier Wallet! 💰', 'success');
        fetchWalletData();
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

  // Download booking history handler
  const handleDownloadHistory = () => {
    if (bookings.length === 0) {
      showToast('No booking history available to download.', 'error');
      return;
    }
    const success = downloadBookingHistoryCSV(bookings, `Expert_Booking_History_${user?.firstname || 'Stylist'}.csv`);
    printBookingHistoryReport(bookings, `Expert Appointment History Statement - ${user?.firstname || 'Stylist'}`);
    if (success) showToast('Booking history downloaded & printable statement opened!', 'success');
  };

  // Clear all booking history handler
  const handleClearHistory = async () => {
    if (bookings.length === 0) {
      showToast('No booking history to clear.', 'accent');
      return;
    }
    if (!window.confirm('Are you sure you want to clear and delete all booking history?')) return;
    try {
      setLoading(true);
      await api.clearBookingHistory();
      setBookings([]);
      showToast('All booking history cleared successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to clear history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = completedBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);

  const isToday = (dateVal) => {
    if (!dateVal) return false;
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
  };

  const todayBookings = bookings.filter(b => isToday(b.date || b.createdAt));

  const openClientWhatsApp = (phone, name = 'Client') => {
    const clean = (phone || '').replace(/[^0-9+]/g, '');
    if (!clean) {
      showToast('No phone number available for WhatsApp', 'error');
      return;
    }
    const intl = clean.startsWith('+') ? clean.slice(1) : clean.startsWith('0') ? '234' + clean.slice(1) : clean;
    const msg = encodeURIComponent(`Hello ${name}, this is ${user?.firstname || 'your Stylist'} from Style Corner regarding your salon appointment.`);
    window.open(`https://wa.me/${intl}?text=${msg}`, '_blank');
  };

  const filteredList = bookings.filter((b) => {
    if (filterStatus === 'today') return isToday(b.date || b.createdAt);
    if (filterStatus === 'all') return true;
    return b.status === filterStatus;
  });

  // Reusable Section Label Components
  const sectionLabel = {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    marginBottom: '1rem',
  };
  const sectionTitle = {
    fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 900,
    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em',
  };
  const sectionIcon = (bg, color) => ({
    width: '26px', height: '26px', borderRadius: '8px',
    background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <PageContainer title="Expert Dashboard">
      <div style={{ paddingBottom: '2rem' }}>

        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO EXPERT PROFILE BANNER
        ══════════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════════
            SECTION 1 — HERO EXPERT PROFILE BANNER
        ══════════════════════════════════════════════ */}
        <div
          className="hero-profile-banner"
          style={{
            background: user?.coverImage
              ? `linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.75) 100%), url(${user.coverImage}) center/cover no-repeat`
              : 'linear-gradient(135deg, #111111 0%, #1c1917 60%, #0c0a09 100%)',
            borderRadius: '24px',
            padding: '1.25rem',
            marginBottom: '1rem',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 20px 48px rgba(0,0,0,0.22)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top Header Row inside Banner: Status badge & Cover Photo Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{
              background: 'rgba(212,175,55,0.15)',
              color: '#d4af37',
              border: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '50px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.65rem',
              fontFamily: 'Outfit',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase'
            }}>
              SPECIALIST ATELIER
            </span>

            <label
              style={{
                background: 'rgba(0,0,0,0.75)',
                color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.4)',
                borderRadius: '50px',
                padding: '0.3rem 0.7rem',
                fontSize: '0.7rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              <Edit size={11} />
              <span>{uploadingCover ? 'Updating...' : 'Change Cover Photo'}</span>
              <input type="file" accept="image/*" onChange={handleExpertCoverChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Avatar + Info Row below top header row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.1rem' }}>
            <label
              style={{ position: 'relative', flexShrink: 0, cursor: 'pointer', display: 'block' }}
              title="Tap to change profile picture"
            >
              <input type="file" accept="image/*" onChange={handleExpertPhotoChange} style={{ display: 'none' }} />
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: user?.avatarUrl
                    ? `url(${user.avatarUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #d4af37, #b5952f)',
                  border: '2.5px solid #d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(212,175,55,0.35)',
                }}
              >
                {!user?.avatarUrl && <Scissors size={32} color="#ffffff" />}
              </div>
              <div
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#d4af37', color: '#111111', border: '2px solid #111111',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Edit size={10} />
              </div>
            </label>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <h2 className="dashboard-user-name" style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.1 }}>
                  {user?.firstname} {user?.lastname}
                </h2>
                {user?.rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d4af37', fontSize: '0.8rem', fontWeight: 900 }}>
                    <Star size={13} fill="#d4af37" /> {user.rating}
                  </div>
                )}
              </div>

              <p style={{ color: '#d4af37', fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 800, margin: '0.2rem 0 0.5rem', letterSpacing: '0.04em' }}>
                {user?.title ? user.title.toUpperCase() : 'VERIFIED STYLE SPECIALIST'}
              </p>

              {/* Status Switcher Toggle Pill */}
              <button
                type="button"
                onClick={() => {
                  const next = !isAvailable;
                  setIsAvailable(next);
                  showToast(next ? 'Status set to: Accepting Bookings' : 'Status set to: On Break / Away', 'accent');
                }}
                style={{
                  background: isAvailable ? 'rgba(16, 185, 129, 0.16)' : 'rgba(239, 68, 68, 0.16)',
                  border: isAvailable ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                  color: isAvailable ? '#10b981' : '#f87171',
                  fontSize: '0.7rem',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }} />
                <span>{isAvailable ? 'AVAILABLE FOR BOOKINGS' : 'ON BREAK'}</span>
              </button>
            </div>
          </div>

          {/* Quick Profile Controls Bar */}
          <div style={{ display: 'flex', gap: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.09)', paddingTop: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate(`/expert-profile?name=${encodeURIComponent(`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Specialist')}`)}
              style={{
                flex: '1 1 160px',
                background: 'rgba(212,175,55,0.18)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#d4af37',
                padding: '0.65rem 0.5rem',
                borderRadius: '14px',
                fontSize: '0.8rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Sparkles size={14} /> My Professional Page
            </button>

            <button
              onClick={logout}
              style={{
                flex: '1 1 100px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                padding: '0.65rem 0.8rem',
                borderRadius: '14px',
                fontSize: '0.8rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2 — EARNINGS & APPOINTMENT METRICS TILES
        ══════════════════════════════════════════════ */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(212,175,55,0.15)', '#d4af37')}><DollarSign size={13} /></div>
            <span style={sectionTitle}>Performance Overview</span>
          </div>

          <div className="dashboard-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            <div
              onClick={() => { setFilterStatus('pending'); setShowAppointmentsSheet(true); }}
              style={{
                background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)',
                borderRadius: '18px', padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                {pendingBookings.length}
              </div>
              <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                Pending
              </div>
            </div>

            <div
              onClick={() => { setFilterStatus('accepted'); setShowAppointmentsSheet(true); }}
              style={{
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)',
                borderRadius: '18px', padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                {acceptedBookings.length}
              </div>
              <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                Confirmed
              </div>
            </div>

            <div
              onClick={() => { setFilterStatus('completed'); setShowAppointmentsSheet(true); }}
              style={{
                background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)',
                borderRadius: '18px', padding: '1rem 0.5rem', textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '1.7rem', fontWeight: 900, color: '#b5952f', lineHeight: 1 }}>
                ₦{Number(totalRevenue).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', fontFamily: 'Outfit', fontWeight: 800, color: '#6b7280', marginTop: '0.3rem', textTransform: 'uppercase' }}>
                Earnings
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 2.5 — ATELIER EXPERT WALLET & PAYOUT HUB
        ══════════════════════════════════════════════ */}
        <div
          style={{
            background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)',
            borderRadius: '24px',
            padding: '1.25rem',
            marginBottom: '1rem',
            border: '1.5px solid rgba(212, 175, 55, 0.45)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Ambient Gold Gradient */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px', width: '130px', height: '130px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '13px',
                background: 'rgba(212,175,55,0.18)', color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Wallet size={21} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.72rem', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  ATELIER EXPERT WALLET
                </div>
                <div style={{ fontFamily: 'Outfit', fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                  ₦{Number(walletBalance).toLocaleString()}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWalletHistorySheet(true)}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#d4d4d8',
                padding: '0.35rem 0.7rem',
                borderRadius: '50px',
                fontSize: '0.72rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <History size={13} /> Payout Ledger
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.9rem', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Service Earnings
              </span>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 900, color: '#34d399', marginTop: '0.15rem' }}>
                ₦{Number(totalRevenue).toLocaleString()}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Settlement Gateway
              </span>
              <div style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} color="#10b981" /> Paystack Direct
              </div>
            </div>
          </div>

          {/* Quick Action Buttons: Top Up + Withdraw Funds */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={() => setShowTopupModal(true)}
              style={{
                flex: 1,
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#d4af37',
                borderRadius: '14px',
                padding: '0.75rem 0.5rem',
                fontFamily: 'Outfit',
                fontSize: '0.82rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Plus size={15} /> Top Up Wallet
            </button>

            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #d4af37 0%, #b5952f 100%)',
                border: 'none',
                color: '#111111',
                borderRadius: '14px',
                padding: '0.75rem 0.5rem',
                fontFamily: 'Outfit',
                fontSize: '0.82rem',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 16px rgba(212,175,55,0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowUpRight size={16} /> Withdraw Funds
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            INCOMING BOOKING REQUESTS (Awaiting Acceptance)
        ══════════════════════════════════════════════ */}
        <div
          style={{
            background: pendingBookings.length > 0
              ? 'linear-gradient(135deg, #1c1917 0%, #292524 100%)'
              : '#ffffff',
            border: pendingBookings.length > 0
              ? '1.5px solid rgba(245, 158, 11, 0.5)'
              : '1px solid rgba(0, 0, 0, 0.07)',
            borderRadius: '22px',
            padding: '1.25rem',
            marginBottom: '1rem',
            boxShadow: pendingBookings.length > 0
              ? '0 12px 32px rgba(245, 158, 11, 0.15)'
              : '0 4px 16px rgba(0,0,0,0.04)',
            color: pendingBookings.length > 0 ? '#ffffff' : '#171717',
            transition: 'all 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: pendingBookings.length > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(212, 175, 55, 0.12)',
                color: pendingBookings.length > 0 ? '#f59e0b' : '#d4af37',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={16} />
              </div>
              <div>
                <h3 style={{
                  fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 900, margin: 0,
                  color: pendingBookings.length > 0 ? '#ffffff' : '#171717',
                }}>
                  Incoming Booking Requests
                </h3>
                <span style={{ fontSize: '0.72rem', color: pendingBookings.length > 0 ? '#d6d3d1' : '#6b7280' }}>
                  {pendingBookings.length > 0
                    ? `${pendingBookings.length} request(s) awaiting your decision`
                    : 'All client requests up to date'}
                </span>
              </div>
            </div>

            {pendingBookings.length > 0 && (
              <span style={{
                background: '#f59e0b', color: '#171717',
                fontSize: '0.7rem', fontFamily: 'Outfit', fontWeight: 900,
                padding: '0.25rem 0.65rem', borderRadius: '50px',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Action Required
              </span>
            )}
          </div>

          {pendingBookings.length === 0 ? (
            <div style={{
              background: 'rgba(0,0,0,0.02)',
              borderRadius: '16px',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              border: '1px dashed rgba(0,0,0,0.08)',
            }}>
              <CheckCircle size={28} color="#10b981" style={{ margin: '0 auto 0.4rem', display: 'block', opacity: 0.8 }} />
              <p style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 800, color: '#171717', margin: '0 0 0.2rem' }}>
                No Pending Booking Requests
              </p>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                When customers book an appointment with you, their requests will appear here with Accept and Decline options.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingBookings.map((b) => (
                <SwipeableBookingCard
                  key={b._id}
                  booking={b}
                  updatingId={updatingId}
                  onAccept={() => handleUpdateStatus(b._id, 'accepted')}
                  onDecline={() => handleUpdateStatus(b._id, 'rejected')}
                  openClientWhatsApp={openClientWhatsApp}
                />
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════
            CONFIRMED APPOINTMENTS (Mark Completed)
        ══════════════════════════════════════════════ */}
        {acceptedBookings.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '22px',
              padding: '1.25rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.12)', color: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 900, color: '#171717', margin: 0 }}>
                    Active Confirmed Appointments ({acceptedBookings.length})
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    Accepted appointments ready for service completion
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {acceptedBookings.map((b) => (
                <div
                  key={b._id}
                  style={{
                    background: '#fafafa',
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: '16px',
                    padding: '0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.55rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717', margin: 0 }}>
                        {b.clientName || 'Client'} — <span style={{ color: '#b5952f' }}>{b.service}</span>
                      </h4>
                      <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span>📅 {b.date} at {b.time}</span>
                        {b.clientPhone && (
                          <button
                            type="button"
                            onClick={() => openClientWhatsApp(b.clientPhone, b.clientName)}
                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#16a34a', padding: '0.1rem 0.4rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 800, fontFamily: 'Outfit' }}
                          >
                            WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 900, color: '#171717' }}>
                        ₦{Number(b.price).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(b._id, 'completed')}
                    disabled={updatingId === b._id}
                    className="app-btn app-btn-accent"
                    style={{ width: '100%', minHeight: '40px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 900, gap: '0.35rem' }}
                  >
                    <CheckCircle size={15} />
                    <span>{updatingId === b._id ? 'Updating...' : 'Mark Service Completed'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SECTION 3 — MY EXPERT SERVICES & OFFERINGS
        ══════════════════════════════════════════════ */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.07)',
            borderRadius: '22px',
            padding: '1.1rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={sectionLabel}>
              <div style={sectionIcon('#171717', '#d4af37')}><Scissors size={13} /></div>
              <span style={sectionTitle}>My Offered Services</span>
            </div>

            <button
              onClick={() => navigate('/profile')}
              style={{
                background: 'rgba(212,175,55,0.12)',
                border: '1px solid rgba(212,175,55,0.3)',
                color: '#b5952f',
                padding: '0.35rem 0.75rem',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                marginBottom: '1rem',
              }}
            >
              <Edit size={12} /> Edit Offerings
            </button>
          </div>

          {/* List of Expert Services */}
          {(() => {
            const rawList = user?.services && user.services.length > 0 ? user.services : user?.specialties;
            const specs = Array.isArray(rawList)
              ? rawList.map(s => (typeof s === 'object' ? (s.name || s.title || String(s)) : String(s)))
              : (typeof rawList === 'string' && rawList.trim())
                ? rawList.split(',').map(s => s.trim())
                : ['Wig Installer', 'Hair Stylist (Braider)', 'Manicure & Gel Nails', 'Scalp Care Treatment'];

            return (
              <div className="dashboard-services-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {specs.map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#faf9f6',
                      border: '1px solid rgba(0,0,0,0.06)',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <Sparkles size={13} color="#d4af37" style={{ flexShrink: 0 }} />
                      <span style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#171717', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {typeof s === 'object' ? (s.name || s.title || String(s)) : String(s)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.62rem', background: 'rgba(16,185,129,0.12)', color: '#059669', padding: '0.15rem 0.45rem', borderRadius: '50px', fontWeight: 900, textTransform: 'uppercase', flexShrink: 0 }}>
                      Active
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 4 — QUICK SHORTCUTS (ICON CARDS)
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '22px', padding: '1.1rem', marginBottom: '1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('#171717', '#d4af37')}><Sparkles size={13} /></div>
            <span style={sectionTitle}>Specialist Shortcuts</span>
          </div>

          <div className="dashboard-quick-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => setShowAppointmentsSheet(true)}
              style={{
                background: 'rgba(212,175,55,0.12)', border: '1.5px solid rgba(212,175,55,0.4)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#d4af37', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ListOrdered size={22} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717' }}>
                  Appointments Queue
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Manage {bookings.length} client requests
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowActivitySheet(true)}
              style={{
                background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.3)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#10b981', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Activity size={22} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717' }}>
                  Recent Activity Feed
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Live booking events
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                const next = !isAvailable;
                setIsAvailable(next);
                showToast(next ? 'Status: Accepting Bookings' : 'Status: On Break', 'accent');
              }}
              style={{
                background: isAvailable ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                border: isAvailable ? '1.5px solid rgba(16,185,129,0.25)' : '1.5px solid rgba(239,68,68,0.25)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: isAvailable ? '#10b981' : '#ef4444', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Clock size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: isAvailable ? '#059669' : '#dc2626' }}>
                  {isAvailable ? 'Available' : 'On Break'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Toggle availability
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate(`/expert-profile?name=${encodeURIComponent(user?.firstname || 'Stella Hair')}`)}
              style={{
                background: 'rgba(236,72,153,0.08)', border: '1.5px solid rgba(236,72,153,0.3)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#ec4899', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Scissors size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717' }}>
                  Manage Public Page
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Edit bio, photos & prices
                </div>
              </div>
            </button>

            <button
              onClick={handleDownloadHistory}
              style={{
                background: 'rgba(59,130,246,0.08)', border: '1.5px solid rgba(59,130,246,0.25)',
                borderRadius: '18px', padding: '1.1rem 0.85rem',
                cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                minHeight: '102px',
              }}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: '#3b82f6', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Download size={20} />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#171717' }}>
                  Export CSV / PDF
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.15rem', fontWeight: 600 }}>
                  Statement & records
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            SECTION 5 — ACCOUNT SETTINGS & DANGER ZONE
        ══════════════════════════════════════════════ */}
        <div style={{
          background: '#fff', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: '22px', padding: '1.1rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
        }}>
          <div style={sectionLabel}>
            <div style={sectionIcon('rgba(239,68,68,0.1)', '#ef4444')}><AlertTriangle size={13} /></div>
            <span style={sectionTitle}>Account & Data Settings</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              onClick={logout}
              className="app-btn app-btn-outline"
              style={{ justifyContent: 'center', gap: '0.5rem', minHeight: '46px', borderRadius: '14px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} /> Sign Out of Account
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="app-btn"
              style={{
                background: 'rgba(239, 68, 68, 0.07)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.22)',
                justifyContent: 'center',
                gap: '0.5rem',
                minHeight: '46px',
                borderRadius: '14px',
                fontSize: '0.85rem',
              }}
            >
              <Trash2 size={16} /> Delete Account Permanently
            </button>
          </div>
        </div>

      </div>

      {/* ═══ DEDICATED FULL-PAGE BOTTOM SHEETS FOR EXPERT APPOINTMENTS & RECENT ACTIVITY ═══ */}

      {/* ── 1. DEDICATED EXPERT APPOINTMENTS QUEUE PAGE SHEET ── */}
      <BottomSheet
        isOpen={showAppointmentsSheet}
        onClose={() => setShowAppointmentsSheet(false)}
        title="Client Appointments Queue"
      >
        <div style={{ paddingBottom: '1rem', maxWidth: '100%', overflow: 'hidden' }}>

          {/* Export & Clear Actions Toolbar */}
          <div className="history-toolbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleDownloadHistory}
              style={{
                flex: '1 1 auto', minWidth: '120px', background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.35)',
                color: '#b5952f', padding: '0.6rem 0.5rem', borderRadius: '12px',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.75rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                minHeight: '42px',
              }}
            >
              <Download size={14} /> Export CSV
            </button>

            <button
              onClick={handleClearHistory}
              style={{
                flex: '1 1 auto', minWidth: '120px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#ef4444', padding: '0.6rem 0.5rem', borderRadius: '12px',
                fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.75rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                minHeight: '42px',
              }}
            >
              <Trash2 size={14} /> Clear History
            </button>
          </div>

          {/* Status Filter Pills Horizontal Scroll */}
          <div style={{
            display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem',
            marginBottom: '1rem', scrollbarWidth: 'none',
          }}>
            {[
              { id: 'all', label: `All (${bookings.length})` },
              { id: 'today', label: `Today (${todayBookings.length})` },
              { id: 'pending', label: `Pending (${pendingBookings.length})` },
              { id: 'accepted', label: `Confirmed (${acceptedBookings.length})` },
              { id: 'completed', label: `Completed (${completedBookings.length})` },
            ].map((pill) => (
              <button
                key={pill.id}
                onClick={() => setFilterStatus(pill.id)}
                style={{
                  background: filterStatus === pill.id ? '#171717' : '#f3f4f6',
                  color: filterStatus === pill.id ? '#d4af37' : '#6b7280',
                  border: filterStatus === pill.id ? 'none' : '1px solid rgba(0,0,0,0.06)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '50px',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: filterStatus === pill.id ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : filteredList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#6b7280' }}>
              <Calendar size={38} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#171717', marginBottom: '0.25rem' }}>
                No Bookings Found
              </h4>
              <p style={{ fontSize: '0.82rem' }}>
                Client requests matching this filter will show up here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredList.map((b) => (
                <div
                  key={b._id}
                  style={{
                    border: '1px solid rgba(0,0,0,0.07)',
                    borderRadius: '16px',
                    padding: '0.9rem',
                    background: '#fafafa',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 0%', minWidth: 0 }}>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {b.clientName || 'Client'}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#6b7280', marginTop: '0.2rem', flexWrap: 'wrap', overflow: 'hidden' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                          <Mail size={11} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.clientEmail}</span>
                        </span>
                        {b.clientPhone && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                              <Phone size={11} style={{ flexShrink: 0 }} /> {b.clientPhone}
                            </span>
                            <button
                              type="button"
                              onClick={() => openClientWhatsApp(b.clientPhone, b.clientName)}
                              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#16a34a', padding: '0.12rem 0.4rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                              title="Message Client on WhatsApp"
                            >
                              <MessageSquare size={10} /> WhatsApp
                            </button>
                            <a
                              href={`tel:${b.clientPhone}`}
                              style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', color: '#2563eb', padding: '0.12rem 0.4rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.66rem', fontWeight: 700, fontFamily: 'Outfit', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}
                              title="Call Client"
                            >
                              <Phone size={10} /> Call
                            </a>
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', marginBottom: '0.75rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#171717', fontFamily: 'Outfit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: '1 1 0%', minWidth: 0 }}>
                        {b.service}
                      </span>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1rem', color: '#b5952f', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        ₦{Number(b.price).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#4b5563', marginTop: '0.35rem', fontWeight: 700 }}>
                      <Clock size={13} color="#d4af37" style={{ flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.date} at {b.time}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(b._id, 'accepted')}
                          disabled={updatingId === b._id}
                          className="app-btn app-btn-primary"
                          style={{ flex: '1 1 auto', minHeight: '42px', fontSize: '0.78rem', borderRadius: '12px', minWidth: '110px' }}
                        >
                          <CheckCircle size={14} /> Accept
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(b._id, 'rejected')}
                          disabled={updatingId === b._id}
                          className="app-btn app-btn-outline"
                          style={{ flex: '1 1 auto', minHeight: '42px', fontSize: '0.78rem', borderColor: '#ef4444', color: '#ef4444', borderRadius: '12px', minWidth: '90px' }}
                        >
                          <XCircle size={14} /> Decline
                        </button>
                      </>
                    )}

                    {b.status === 'accepted' && (
                      <button
                        onClick={() => handleUpdateStatus(b._id, 'completed')}
                        disabled={updatingId === b._id}
                        className="app-btn app-btn-accent"
                        style={{ width: '100%', minHeight: '42px', fontSize: '0.8rem', borderRadius: '12px' }}
                      >
                        <CheckCircle size={14} /> Mark Completed
                      </button>
                    )}

                    {b.status === 'completed' && (
                      <div style={{ width: '100%', textAlign: 'center', fontSize: '0.75rem', color: '#10b981', fontFamily: 'Outfit', fontWeight: 800, padding: '0.45rem', background: 'rgba(16,185,129,0.08)', borderRadius: '10px' }}>
                        ✓ Completed & Settled
                      </div>
                    )}

                    {(b.status === 'rejected' || b.status === 'cancelled') && (
                      <div style={{ width: '100%', textAlign: 'center', fontSize: '0.75rem', color: '#ef4444', fontFamily: 'Outfit', fontWeight: 800, padding: '0.45rem', background: 'rgba(239,68,68,0.08)', borderRadius: '10px' }}>
                        ✕ Request Declined
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* ── 2. DEDICATED RECENT APPOINTMENT STREAM PAGE SHEET ── */}
      <BottomSheet
        isOpen={showActivitySheet}
        onClose={() => setShowActivitySheet(false)}
        title="Recent Appointment Stream"
      >
        <div style={{ paddingBottom: '1.5rem' }}>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem' }}>
            Live stream timeline of client appointments and booking updates in real-time.
          </p>

          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
              No active appointments yet. Client bookings will appear here in real time!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookings
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.7rem 0.75rem', borderRadius: '14px',
                    background: '#fafafa', border: '1px solid rgba(0,0,0,0.06)',
                    gap: '0.5rem', overflow: 'hidden',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '1 1 0%', minWidth: 0, overflow: 'hidden' }}>
                      <div style={{
                        width: '36px', height: '36px', minWidth: '36px', borderRadius: '10px',
                        background: 'rgba(212,175,55,0.15)', color: '#d4af37', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Calendar size={15} />
                      </div>
                      <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <div style={{
                          fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#171717',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.clientName || 'Client'} — {item.service || 'Service'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#6b7280', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          📅 {item.date || ''} @ {item.time || ''} · ₦{Number(item.price || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Delete Confirmation Modal */}
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
            Are you sure? This will permanently delete your expert account and all associated booking data. This cannot be undone.
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

      {/* Avatar Edit Sheet */}
      <BottomSheet
        isOpen={showAvatarSheet}
        onClose={() => setShowAvatarSheet(false)}
        title="Edit Profile Picture"
      >
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <label
              htmlFor="expert-avatar-upload"
              style={{
                cursor: uploadingPhoto ? 'wait' : 'pointer',
                position: 'relative',
                display: 'inline-block',
              }}
            >
              <div
                style={{
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  background: avatarInput
                    ? `url(${avatarInput}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #d4af37, #b5952f)',
                  border: '3px solid #d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(212,175,55,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {!avatarInput && <Scissors size={36} color="#ffffff" />}
                {uploadingPhoto ? (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
                    <RefreshCw size={18} color="#d4af37" style={{ animation: 'spin 1s linear infinite' }} />
                    <span style={{ color: '#d4af37', fontSize: '0.65rem', fontFamily: 'Outfit', fontWeight: 800 }}>Saving...</span>
                  </div>
                ) : (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.45)', padding: '2px 0', display: 'flex', justifyContent: 'center' }}>
                    <Edit size={12} color="#ffffff" />
                  </div>
                )}
              </div>
            </label>

            <label
              htmlFor="expert-avatar-upload"
              style={{
                cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                background: uploadingPhoto ? 'rgba(212,175,55,0.3)' : 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#d4af37',
                padding: '0.5rem 1.25rem',
                borderRadius: '50px',
                fontSize: '0.82rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Edit size={14} />
              {uploadingPhoto ? 'Uploading...' : avatarInput ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input
              id="expert-avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              disabled={uploadingPhoto}
              onChange={handleExpertPhotoChange}
            />

            <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', fontFamily: 'Outfit' }}>
              Photo uploads automatically and saves to your profile
            </p>
          </div>
        </div>
      </BottomSheet>

      {/* Profile Picture Full Size Modal */}
      <ImagePreviewModal
        isOpen={showEnlargedAvatar}
        onClose={() => setShowEnlargedAvatar(false)}
        imageUrl={user?.avatarUrl}
        title={`${user?.firstname || 'Expert'}'s Profile Picture`}
      />

      {/* ── TOP UP WALLET MODAL (PAYSTACK) ── */}
      <PopupModal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="Top Up Atelier Wallet"
      >
        <form onSubmit={handleTopupSubmit} style={{ padding: '0.5rem 0' }}>
          <p style={{ fontSize: '0.82rem', color: '#6b7280', margin: '0 0 1rem', lineHeight: 1.5 }}>
            Add funds instantly to your Atelier Expert Wallet using Paystack (supports Card, Apple Pay, Bank Transfer & USSD).
          </p>

          {/* Quick Preset Chips */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {[5000, 10000, 25000, 50000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setTopupAmount(String(preset))}
                style={{
                  background: topupAmount === String(preset) ? 'rgba(212,175,55,0.22)' : '#f4f4f5',
                  border: topupAmount === String(preset) ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
                  color: topupAmount === String(preset) ? '#b5952f' : '#18181b',
                  borderRadius: '12px',
                  padding: '0.5rem 0.2rem',
                  fontSize: '0.75rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ₦{(preset / 1000).toLocaleString()}k
              </button>
            ))}
          </div>

          <div className="app-input-group" style={{ marginBottom: '1.25rem' }}>
            <label className="app-label">Amount to Add (₦)</label>
            <input
              type="number"
              min="500"
              step="500"
              required
              value={topupAmount}
              onChange={(e) => setTopupAmount(e.target.value)}
              placeholder="e.g. 10000"
              className="app-input"
              style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 700 }}
            />
          </div>

          <button
            type="submit"
            disabled={topupSubmitting || !topupAmount}
            className="app-btn app-btn-primary"
            style={{
              width: '100%',
              minHeight: '48px',
              borderRadius: '14px',
              fontWeight: 900,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #09a5db 0%, #00c3aa 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 20px -4px rgba(0, 195, 170, 0.4)'
            }}
          >
            <ShieldCheck size={18} />
            <span>{topupSubmitting ? 'Opening Paystack...' : `Pay ₦${Number(topupAmount || 0).toLocaleString()} via Paystack`}</span>
          </button>

          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: '#9ca3af', fontSize: '0.72rem' }}>
            <Lock size={12} />
            <span>Secured with 256-Bit SSL Encryption</span>
          </div>
        </form>
      </PopupModal>

      {/* ── WITHDRAW FUNDS MODAL (NIGERIAN BANK RESOLVER) ── */}
      <PopupModal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setResolveError('');
        }}
        title="Withdraw Funds to Nigerian Bank"
      >
        <form onSubmit={handleWithdrawSubmit} style={{ padding: '0.5rem 0' }}>
          {/* Current Withdrawable Balance Banner */}
          <div style={{
            background: '#fafaf9',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '14px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: '#78716c', fontWeight: 800, textTransform: 'uppercase' }}>
                Withdrawable Balance
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#171717' }}>
                ₦{Number(walletBalance).toLocaleString()}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setWithdrawAmount(String(walletBalance))}
              style={{
                background: 'rgba(212,175,55,0.15)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#b5952f',
                padding: '0.35rem 0.65rem',
                borderRadius: '50px',
                fontSize: '0.72rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Withdraw All
            </button>
          </div>

          {/* Amount to Withdraw */}
          <div className="app-input-group" style={{ marginBottom: '0.85rem' }}>
            <label className="app-label">Withdrawal Amount (₦)</label>
            <input
              type="number"
              min="1000"
              max={walletBalance}
              required
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Minimum ₦1,000"
              className="app-input"
              style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700 }}
            />
          </div>

          {/* Select Nigerian Bank */}
          <div className="app-input-group" style={{ marginBottom: '0.85rem' }}>
            <label className="app-label">Select Destination Bank</label>
            <select
              value={selectedBankCode}
              onChange={onBankChange}
              required
              className="app-input"
              style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <option value="">Select a Nigerian Bank...</option>
              {banksList.map((b, idx) => (
                <option key={`${b.code}-${idx}`} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* 10-Digit NUBAN Account Number */}
          <div className="app-input-group" style={{ marginBottom: '0.85rem' }}>
            <label className="app-label">10-Digit NUBAN Account Number</label>
            <input
              type="text"
              maxLength={10}
              required
              value={accountNumber}
              onChange={onAccountNumberChange}
              placeholder="0123456789"
              className="app-input"
              style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.08em' }}
            />
          </div>

          {/* Live Account Resolution Badge */}
          {resolvingAccount && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.78rem',
              color: '#64748b'
            }}>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
              <span>Verifying NUBAN account name via Paystack...</span>
            </div>
          )}

          {accountResolved && accountName && (
            <div style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1.5px solid rgba(16,185,129,0.3)',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: '#065f46',
              fontWeight: 800
            }}>
              <CheckCircle2 size={16} color="#10b981" />
              <div>
                <span style={{ fontSize: '0.68rem', color: '#059669', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  Verified Account Holder
                </span>
                <span>{accountName}</span>
              </div>
            </div>
          )}

          {resolveError && (
            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              fontSize: '0.78rem',
              color: '#b91c1c',
              fontWeight: 600
            }}>
              ⚠️ {resolveError}
            </div>
          )}

          {/* Zero Fee Notice */}
          <div style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: '12px',
            padding: '0.55rem 0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.72rem',
            color: '#854d0e',
            fontWeight: 700
          }}>
            <Building2 size={13} />
            <span>Paystack Transfer Fee: ₦0 (100% covered by Style Corner Atelier)</span>
          </div>

          <button
            type="submit"
            disabled={withdrawSubmitting || !accountName || !withdrawAmount || Number(withdrawAmount) > walletBalance}
            className="app-btn app-btn-primary"
            style={{
              width: '100%',
              minHeight: '48px',
              borderRadius: '14px',
              fontWeight: 900,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: 'linear-gradient(135deg, #d4af37 0%, #b5952f 100%)',
              color: '#111111',
              border: 'none',
              boxShadow: '0 8px 20px -4px rgba(212, 175, 55, 0.4)'
            }}
          >
            <ArrowUpRight size={18} />
            <span>{withdrawSubmitting ? 'Processing Transfer...' : `Authorize ₦${Number(withdrawAmount || 0).toLocaleString()} Payout`}</span>
          </button>
        </form>
      </PopupModal>

      {/* ── WALLET TRANSACTION & PAYOUT LEDGER SHEET ── */}
      <BottomSheet
        isOpen={showWalletHistorySheet}
        onClose={() => setShowWalletHistorySheet(false)}
        title="Atelier Wallet & Payout Ledger"
      >
        <div style={{ paddingBottom: '1.5rem' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'all', label: 'All Transactions' },
              { id: 'earnings', label: 'Service Earnings' },
              { id: 'withdrawals', label: 'Payouts' },
              { id: 'topups', label: 'Top-Ups' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setWalletFilterTab(tab.id)}
                style={{
                  background: walletFilterTab === tab.id ? '#18181b' : '#f4f4f5',
                  color: walletFilterTab === tab.id ? '#d4af37' : '#71717a',
                  border: walletFilterTab === tab.id ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '50px',
                  fontSize: '0.75rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Transactions List */}
          {(() => {
            const filtered = transactions.filter((t) => {
              if (walletFilterTab === 'earnings') return t.type === 'service_earning';
              if (walletFilterTab === 'withdrawals') return t.type === 'withdrawal';
              if (walletFilterTab === 'topups') return t.type === 'wallet_topup';
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#9ca3af' }}>
                  <Wallet size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>No transaction records found in this category.</p>
                </div>
              );
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {filtered.map((item, idx) => {
                  const isCredit = item.direction === 'credit';
                  return (
                    <div
                      key={item._id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.85rem',
                        borderRadius: '14px',
                        background: '#fafafa',
                        border: '1px solid rgba(0,0,0,0.06)',
                        gap: '0.5rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: isCredit ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                          color: isCredit ? '#10b981' : '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'Outfit',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            color: '#18181b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.description || (item.type === 'service_earning' ? 'Service Earnings' : item.type === 'withdrawal' ? 'Bank Withdrawal' : 'Wallet Top-Up')}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#71717a', marginTop: '0.1rem' }}>
                            {new Date(item.createdAt || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · Ref: {item.reference?.slice(0, 14)}...
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontFamily: 'Outfit',
                          fontSize: '0.92rem',
                          fontWeight: 900,
                          color: isCredit ? '#10b981' : '#18181b'
                        }}>
                          {isCredit ? '+' : '-'}₦{Number(item.amount || 0).toLocaleString()}
                        </div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          fontFamily: 'Outfit',
                          textTransform: 'uppercase',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '50px',
                          background: item.status === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                          color: item.status === 'success' ? '#059669' : '#d97706',
                          marginTop: '0.15rem'
                        }}>
                          {item.status || 'success'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </BottomSheet>
    </PageContainer>
  );
};
