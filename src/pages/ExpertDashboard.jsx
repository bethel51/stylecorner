import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Scissors,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  LogOut,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Star,
  Mail,
  Phone,
  Check,
  Edit,
  Download,
  MapPin,
  Trash2,
  AlertTriangle,
  History,
  Activity,
  MessageSquare,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Layers,
  ChevronRight,
  Camera,
  X,
  Plus,
  ImageIcon,
  BookOpen,
  Eye,
  FileText,
  Tag,
  Maximize2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { uploadToCloudinary } from '../services/cloudinary';
import { Avatar } from '../components/common/Avatar';
import { PageContainer } from '../components/common/PageContainer';
import { StatusBadge } from '../components/common/StatusBadge';
import { SkeletonList } from '../components/common/SkeletonLoader';
import { PopupModal } from '../components/common/PopupModal';
import { BottomSheet } from '../components/common/BottomSheet';
import { WithdrawFundsModal } from '../components/common/WithdrawFundsModal';
import { downloadBookingHistoryCSV, printBookingHistoryReport } from '../utils/bookingHistoryExport';

// ─── Swipeable Booking Request Card ──────────────────────────────────────────
const SwipeableBookingCard = ({
  booking: b,
  updatingId,
  onAccept,
  onDecline,
  onComplete,
  openClientWhatsApp,
}) => {
  const cardRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const THRESHOLD = 75;

  const resetCard = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease';
    cardRef.current.style.transform = 'translateX(0)';
    cardRef.current.style.boxShadow = '';
    currentX.current = 0;
  }, []);

  const handleTouchStart = (e) => {
    if (b.status !== 'pending') return;
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
    if (cardRef.current) {
      cardRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging.current || !cardRef.current || b.status !== 'pending') return;
    const diff = e.touches[0].clientX - startX.current;
    currentX.current = diff;
    const clamped = Math.max(-120, Math.min(120, diff));
    const isRight = clamped > 0;
    cardRef.current.style.transform = `translateX(${clamped}px)`;
    if (isRight) {
      cardRef.current.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.25)';
      cardRef.current.style.borderColor = 'rgba(16, 185, 129, 0.6)';
    } else {
      cardRef.current.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.25)';
      cardRef.current.style.borderColor = 'rgba(239, 68, 68, 0.6)';
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || b.status !== 'pending') return;
    isDragging.current = false;
    const diff = currentX.current;
    if (diff > THRESHOLD) {
      onAccept();
    } else if (diff < -THRESHOLD) {
      onDecline();
    }
    resetCard();
  };

  const isPaid = b.paymentStatus === 'paid';
  const isUpdating = updatingId === b._id;

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '18px' }}>
      {b.status === 'pending' && (
        <>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 800,
              fontSize: '0.78rem',
              fontFamily: 'Outfit',
            }}
          >
            <CheckCircle size={18} /> Accept
          </div>
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 800,
              fontSize: '0.78rem',
              fontFamily: 'Outfit',
            }}
          >
            Decline <XCircle size={18} />
          </div>
        </>
      )}

      <div
        ref={cardRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#151822',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '18px',
          padding: '1.15rem',
          willChange: 'transform',
          touchAction: 'pan-y',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        {/* Row 1: Client Name + Price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {b.clientName || 'Client Appointment'}
            </h4>
            <StatusBadge status={b.status} />
          </div>
          <span style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 900, color: '#f5b942', flexShrink: 0 }}>
            ₦{Number(b.price || 0).toLocaleString()}
          </span>
        </div>

        {/* Row 2: Payment badge & Service */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              fontFamily: 'Outfit',
              background: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 185, 66, 0.15)',
              color: isPaid ? '#10b981' : '#f5b942',
              padding: '0.15rem 0.55rem',
              borderRadius: '50px',
            }}
          >
            {isPaid ? '✓ Paid via Paystack' : '⏳ Payment Pending'}
          </span>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>•</span>
          <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 700, fontFamily: 'Outfit' }}>
            ✂️ {b.service || 'Service'}
          </span>
        </div>

        {/* Row 3: Schedule Date, Time & Location */}
        <div
          style={{
            background: '#1c202d',
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            marginBottom: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.65rem',
            fontSize: '0.75rem',
            color: '#94a3b8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#ffffff', fontWeight: 600 }}>
            <Calendar size={13} color="#f5b942" />
            <span>{b.date || 'TBD'}</span>
          </div>
          {b.time && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={13} color="#f5b942" />
              <span>{b.time}</span>
            </div>
          )}
          {b.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={13} color="#f5b942" />
              <span>{b.location}</span>
            </div>
          )}
        </div>

        {/* Row 4: Client contact buttons */}
        {(b.clientPhone || b.clientEmail) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', gap: '0.5rem', flexWrap: 'wrap' }}>
            {b.clientEmail && (
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                <Mail size={12} /> {b.clientEmail}
              </span>
            )}
            {b.clientPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
                <button
                  type="button"
                  onClick={() => openClientWhatsApp(b.clientPhone, b.clientName)}
                  style={{
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.35)',
                    color: '#4ade80',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <MessageSquare size={12} /> WhatsApp
                </button>
                <a
                  href={`tel:${b.clientPhone}`}
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    color: '#60a5fa',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'Outfit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    textDecoration: 'none',
                  }}
                >
                  <Phone size={12} /> Call
                </a>
              </div>
            )}
          </div>
        )}

        {/* Row 5: Action CTA Buttons */}
        {b.status === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.55rem' }}>
              <button
                onClick={onAccept}
                disabled={isUpdating}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '12px',
                  height: '44px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                  transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: isUpdating ? 0.6 : 1,
                }}
                onMouseDown={e => { if (!isUpdating) e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >
                <CheckCircle size={16} />
                <span>{isUpdating ? 'Updating…' : 'Accept'}</span>
              </button>

              <button
                onClick={onDecline}
                disabled={isUpdating}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  borderRadius: '12px',
                  height: '44px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  fontFamily: 'Outfit',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: isUpdating ? 0.6 : 1,
                }}
                onMouseDown={e => { if (!isUpdating) e.currentTarget.style.transform = 'scale(0.96)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
              >
                <XCircle size={16} />
                <span>Decline</span>
              </button>
            </div>

            {/* Instant WhatsApp Acceptance Message */}
            {b.clientPhone && (
              <a
                href={`https://wa.me/${b.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${b.clientName || 'there'}, your appointment for ${b.service} on ${b.date} at ${b.time} has been ACCEPTED! Looking forward to giving you an exceptional experience at Style Corner. ✂️`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#4ade80',
                  borderRadius: '12px',
                  height: '38px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
              >
                <MessageSquare size={14} />
                <span>WhatsApp Acceptance Message</span>
              </a>
            )}
          </div>
        )}

        {b.status === 'accepted' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={onComplete}
              disabled={isUpdating}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f5b942, #d4960a)',
                color: '#0c0e14',
                border: 'none',
                borderRadius: '12px',
                height: '44px',
                fontSize: '0.84rem',
                fontWeight: 800,
                fontFamily: 'Outfit',
                cursor: isUpdating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 16px rgba(245, 185, 66, 0.35)',
                transition: 'transform 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: isUpdating ? 0.6 : 1,
              }}
              onMouseDown={e => { if (!isUpdating) e.currentTarget.style.transform = 'scale(0.97)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = ''; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            >
              <CheckCircle size={16} />
              <span>{isUpdating ? 'Completing…' : 'Mark as Completed & Credit Earnings'}</span>
            </button>

            {/* WhatsApp Completion Message */}
            {b.clientPhone && (
              <a
                href={`https://wa.me/${b.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${b.clientName || 'there'}, thank you for choosing Style Corner! Your ${b.service} session has been completed. We hope you loved the results! ⭐ Please leave us a review.`)}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.25)',
                  color: '#4ade80',
                  borderRadius: '10px',
                  height: '36px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  fontFamily: 'Outfit',
                  textDecoration: 'none',
                }}
              >
                <MessageSquare size={13} />
                <span>Send Completion Message</span>
              </a>
            )}
          </div>
        )}

        {b.status === 'completed' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              color: '#10b981',
              fontSize: '0.78rem',
              fontWeight: 700,
              fontFamily: 'Outfit',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '0.5rem',
              borderRadius: '10px',
            }}
          >
            <Check size={14} /> Service Completed & Credited to Wallet
          </div>
        )}
      </div>
    </div>
  );
};

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

  // Wallet & Payout States
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState('');
  const [topupSubmitting, setTopupSubmitting] = useState(false);
  const [showWalletHistorySheet, setShowWalletHistorySheet] = useState(false);

  // Profile Photos & Modals
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

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
    try {
      const data = await api.getPortfolio();
      const loadedPortfolio = data.portfolio || [];
      setPortfolio(loadedPortfolio);
      const svcList = (data.services || []).map(s => s.name || s).filter(Boolean);
      const fallback = data.specialties || [];
      const merged = svcList.length > 0 ? svcList : fallback;
      const finalServices = merged.length > 0 ? merged : ['Hair Styling', 'Bespoke Grooming'];
      setPortfolioServices(['All', ...finalServices]);
    } catch (err) {
      console.warn('Portfolio fetch notice:', err.message);
      if (user?.portfolio) {
        setPortfolio(user.portfolio);
      }
      const userServices = (user?.services || []).map(s => s.name || s).filter(Boolean);
      const list = userServices.length > 0 ? userServices : ['Hair Styling', 'Bespoke Grooming'];
      setPortfolioServices(['All', ...list]);
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
        callback: async (response) => {
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
        },
        onClose: () => {
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

  return (
    <PageContainer title="Expert Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2.5rem' }}>

        {/* ── 1. Hero Atelier Specialist Profile Banner ── */}
        <div
          style={{
            background: user?.coverImage
              ? `linear-gradient(180deg, rgba(12,14,20,0.6) 0%, rgba(12,14,20,0.92) 100%), url(${user.coverImage}) center/cover no-repeat`
              : 'linear-gradient(135deg, #151822 0%, #10131b 100%)',
            borderRadius: '24px',
            padding: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top banner action row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span
              style={{
                background: 'rgba(245, 185, 66, 0.15)',
                color: '#f5b942',
                border: '1px solid rgba(245, 185, 66, 0.3)',
                borderRadius: '50px',
                padding: '0.2rem 0.65rem',
                fontSize: '0.68rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Verified Specialist
            </span>

            <label
              style={{
                background: 'rgba(0,0,0,0.65)',
                color: '#f5b942',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                borderRadius: '50px',
                padding: '0.3rem 0.75rem',
                fontSize: '0.72rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Camera size={12} />
              <span>{uploadingCover ? 'Saving...' : 'Cover'}</span>
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Avatar + Specialist Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.15rem' }}>
            <label
              style={{ position: 'relative', flexShrink: 0, cursor: 'pointer', display: 'block' }}
              title="Tap to update profile avatar"
            >
              <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
              <Avatar
                src={user?.avatarUrl || ''}
                name={`${user?.firstname || 'S'} ${user?.lastname || ''}`}
                size={68}
                borderRadius="50%"
                style={{
                  border: '2.5px solid #f5b942',
                  boxShadow: '0 4px 16px rgba(245, 185, 66, 0.25)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#f5b942',
                  color: '#0c0e14',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #151822',
                }}
              >
                <Edit size={10} />
              </div>
            </label>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.15rem', lineHeight: 1.2 }}>
                {user?.firstname || 'Specialist'} {user?.lastname || ''}
              </h2>
              <p style={{ color: '#f5b942', fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 700, margin: '0 0 0.35rem' }}>
                {user?.title ? user.title.toUpperCase() : 'SALON & BEAUTY SPECIALIST'}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                {/* Real Rating & Review Count Badge */}
                <button
                  type="button"
                  onClick={() => setShowReviewsSheet(true)}
                  style={{
                    background: 'rgba(245, 185, 66, 0.12)',
                    border: '1px solid rgba(245, 185, 66, 0.3)',
                    color: '#f5b942',
                    fontSize: '0.7rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                  title="View client reviews"
                >
                  <Star size={11} fill="#f5b942" />
                  <span>{averageRating ? `${averageRating} (${reviews.length} ${reviews.length === 1 ? 'review' : 'reviews'})` : `${reviews.length} reviews`}</span>
                </button>

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
                    padding: '0.2rem 0.65rem',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                  }}
                >
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isAvailable ? '#10b981' : '#ef4444' }} />
                  <span>{isAvailable ? 'ACCEPTING BOOKINGS' : 'ON BREAK'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Profile Controls Bar */}
          <div style={{ display: 'flex', gap: '0.55rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.85rem' }}>
            <button
              onClick={() => navigate(`/expert-profile?name=${encodeURIComponent(`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Specialist')}`)}
              style={{
                flex: 1,
                background: '#1c202d',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                padding: '0.55rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.76rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={13} color="#f5b942" /> View Page
            </button>

            <button
              onClick={() => setShowReviewsSheet(true)}
              style={{
                flex: 1,
                background: '#1c202d',
                border: '1px solid rgba(245, 185, 66, 0.25)',
                color: '#f5b942',
                padding: '0.55rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.76rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <MessageSquare size={13} /> Reviews ({reviews.length})
            </button>

            <button
              onClick={logout}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#f87171',
                padding: '0.55rem 0.85rem',
                borderRadius: '12px',
                fontSize: '0.76rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Sign Out"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </div>


        {/* ── 2. Atelier Wallet & Payout Card ── */}
        <div
          style={{
            background: 'linear-gradient(135deg, #151822 0%, #10131b 100%)',
            borderRadius: '20px',
            padding: '1.25rem',
            border: '1px solid rgba(245, 185, 66, 0.25)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#94a3b8', fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 700 }}>
              <Wallet size={15} color="#f5b942" />
              <span>Available Earnings</span>
            </div>
            <button
              onClick={() => setShowWalletHistorySheet(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#f5b942',
                fontFamily: 'Outfit',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                padding: 0,
              }}
            >
              History <ChevronRight size={13} />
            </button>
          </div>

          <div style={{ fontFamily: 'Outfit', fontSize: '1.95rem', fontWeight: 900, color: '#f5b942', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            ₦{Number(walletBalance || 0).toLocaleString()}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => setShowWithdrawModal(true)}
              style={{
                background: '#f5b942',
                color: '#0c0e14',
                border: 'none',
                borderRadius: '50px',
                height: '42px',
                fontFamily: 'Outfit',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(245, 185, 66, 0.3)',
              }}
            >
              <Building2 size={15} /> Request Payout
            </button>

            <button
              onClick={() => setShowTopupModal(true)}
              style={{
                background: '#1c202d',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '50px',
                height: '42px',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <ArrowUpRight size={15} color="#f5b942" /> Top Up
            </button>
          </div>
        </div>

        {/* ── 3. Performance Metrics Grid (100% Real Data) ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.75rem' }}>
            <Activity size={14} color="#f5b942" />
            <span style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Performance Overview
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {/* Pending */}
            <div
              onClick={() => setFilterTab('pending')}
              style={{
                background: filterTab === 'pending'
                  ? 'linear-gradient(145deg, rgba(245, 185, 66, 0.12) 0%, #151822 100%)'
                  : 'linear-gradient(145deg, #151822 0%, #10131b 100%)',
                borderRadius: '18px',
                padding: '1rem',
                cursor: 'pointer',
                border: filterTab === 'pending' ? '1.5px solid #f5b942' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: filterTab === 'pending' ? '0 6px 20px rgba(245, 185, 66, 0.15)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Pending
                </span>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 185, 66, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
                  <Clock size={14} />
                </div>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.85rem', fontWeight: 900, color: '#f5b942', lineHeight: 1 }}>
                {pendingBookings.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem' }}>
                {pendingBookings.length === 1 ? '1 client waiting' : `${pendingBookings.length} clients waiting`}
              </div>
            </div>

            {/* Confirmed */}
            <div
              onClick={() => setFilterTab('accepted')}
              style={{
                background: filterTab === 'accepted'
                  ? 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, #151822 100%)'
                  : 'linear-gradient(145deg, #151822 0%, #10131b 100%)',
                borderRadius: '18px',
                padding: '1rem',
                cursor: 'pointer',
                border: filterTab === 'accepted' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: filterTab === 'accepted' ? '0 6px 20px rgba(16, 185, 129, 0.15)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Confirmed
                </span>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <CheckCircle size={14} />
                </div>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.85rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                {acceptedBookings.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem' }}>
                Active bookings scheduled
              </div>
            </div>

            {/* Completed */}
            <div
              onClick={() => setFilterTab('completed')}
              style={{
                background: filterTab === 'completed'
                  ? 'linear-gradient(145deg, rgba(96, 165, 250, 0.12) 0%, #151822 100%)'
                  : 'linear-gradient(145deg, #151822 0%, #10131b 100%)',
                borderRadius: '18px',
                padding: '1rem',
                cursor: 'pointer',
                border: filterTab === 'completed' ? '1.5px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: filterTab === 'completed' ? '0 6px 20px rgba(96, 165, 250, 0.15)' : 'none',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Completed
                </span>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                  <Sparkles size={14} />
                </div>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.85rem', fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>
                {completedBookings.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem' }}>
                Successful sessions
              </div>
            </div>

            {/* Revenue */}
            <div
              onClick={() => setShowWalletHistorySheet(true)}
              style={{
                background: 'linear-gradient(145deg, #151822 0%, #10131b 100%)',
                borderRadius: '18px',
                padding: '1rem',
                cursor: 'pointer',
                border: '1px solid rgba(245, 185, 66, 0.18)',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Revenue
                </span>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(245, 185, 66, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5b942' }}>
                  <TrendingUp size={14} />
                </div>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#f5b942', lineHeight: 1.1 }}>
                ₦{Number(totalRevenue).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem' }}>
                Completed revenue
              </div>
            </div>
          </div>
        </div>


        {/* ── 4. Client Appointments & Requests Hub ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Calendar size={15} color="#f5b942" />
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Appointments
              </h3>
            </div>

            <button
              onClick={fetchDashboardData}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.76rem',
                fontFamily: 'Outfit',
              }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>

          {/* Filter Pills Bar */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.35rem',
              marginBottom: '0.85rem',
              scrollbarWidth: 'none',
            }}
          >
            {[
              { id: 'all', label: 'All', count: bookings.length },
              { id: 'pending', label: 'Pending', count: pendingBookings.length },
              { id: 'accepted', label: 'Confirmed', count: acceptedBookings.length },
              { id: 'completed', label: 'Completed', count: completedBookings.length },
              { id: 'today', label: 'Today', count: bookings.filter((b) => isToday(b.date || b.createdAt)).length },
            ].map((tab) => {
              const isActive = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id)}
                  style={{
                    background: isActive ? '#f5b942' : '#151822',
                    color: isActive ? '#0c0e14' : '#94a3b8',
                    border: `1px solid ${isActive ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                    borderRadius: '50px',
                    padding: '0.35rem 0.85rem',
                    fontFamily: 'Outfit',
                    fontSize: '0.76rem',
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      background: isActive ? 'rgba(12, 14, 20, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '50px',
                      fontSize: '0.68rem',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bookings List */}
          {loading && <SkeletonList count={3} />}

          {!loading && filteredBookings.length === 0 && (
            <div
              style={{
                background: '#151822',
                borderRadius: '20px',
                padding: '2.5rem 1.25rem',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <Scissors size={38} color="#f5b942" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>
                No {filterTab === 'all' ? '' : filterTab} appointments
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                {filterTab === 'pending'
                  ? 'You are all caught up! New client booking requests will appear here.'
                  : 'Appointments will be listed here when scheduled by clients.'}
              </p>
            </div>
          )}

          {!loading && filteredBookings.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredBookings.map((b) => (
                <SwipeableBookingCard
                  key={b._id}
                  booking={b}
                  updatingId={updatingId}
                  onAccept={() => handleUpdateStatus(b._id, 'accepted')}
                  onDecline={() => handleUpdateStatus(b._id, 'rejected')}
                  onComplete={() => handleUpdateStatus(b._id, 'completed')}
                  openClientWhatsApp={openClientWhatsApp}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 5. Appointment History Statement & Export Hub ── */}
        <div
          style={{
            background: '#151822',
            borderRadius: '20px',
            padding: '1.15rem',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.94rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
              Export Booking Records
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>
              Download official CSV log & printable statement
            </p>
          </div>

          <button
            onClick={() => {
              if (bookings.length === 0) {
                showToast('No booking records to download.', 'accent');
                return;
              }
              downloadBookingHistoryCSV(bookings, `StyleCorner_Bookings_${user?.firstname || 'Stylist'}.csv`);
              printBookingHistoryReport(bookings, `Appointment History - ${user?.firstname || 'Stylist'}`);
              showToast('Export file downloaded & statement opened!', 'success');
            }}
            style={{
              background: '#1c202d',
              border: '1px solid rgba(245, 185, 66, 0.35)',
              color: '#f5b942',
              padding: '0.55rem 0.95rem',
              borderRadius: '50px',
              fontFamily: 'Outfit',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              flexShrink: 0,
            }}
          >
            <Download size={14} /> Export Records
          </button>
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
              onClick={() => handleOpenAddWorkModal(activePortfolioService !== 'All' ? activePortfolioService : null)}
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
              background: '#151822',
              borderRadius: '16px',
              padding: '0.65rem 0.85rem',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
            }}
          >
            {/* View Mode Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', background: '#0e1017', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={() => setPortfolioView('lookbook')}
                  style={{
                    background: portfolioView === 'lookbook' ? '#f5b942' : 'transparent',
                    color: portfolioView === 'lookbook' ? '#0c0e14' : '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.3rem 0.75rem',
                    fontFamily: 'Outfit',
                    fontSize: '0.74rem',
                    fontWeight: portfolioView === 'lookbook' ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Camera size={13} /> Visual Lookbook
                </button>
                <button
                  type="button"
                  onClick={() => setPortfolioView('logbook')}
                  style={{
                    background: portfolioView === 'logbook' ? '#f5b942' : 'transparent',
                    color: portfolioView === 'logbook' ? '#0c0e14' : '#94a3b8',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.3rem 0.75rem',
                    fontFamily: 'Outfit',
                    fontSize: '0.74rem',
                    fontWeight: portfolioView === 'logbook' ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FileText size={13} /> Work Logbook ({portfolio.length})
                </button>
              </div>

              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                {portfolio.length} total logged work {portfolio.length === 1 ? 'sample' : 'samples'}
              </span>
            </div>

            {/* Service Category Pills */}
            {portfolioServices.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.45rem',
                  overflowX: 'auto',
                  paddingBottom: '0.15rem',
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
                        background: isActive ? '#f5b942' : '#1c202d',
                        color: isActive ? '#0c0e14' : '#94a3b8',
                        border: `1px solid ${isActive ? '#f5b942' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '50px',
                        padding: '0.28rem 0.75rem',
                        fontFamily: 'Outfit',
                        fontSize: '0.72rem',
                        fontWeight: isActive ? 800 : 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                    >
                      <span>{svc}</span>
                      <span
                        style={{
                          background: isActive ? 'rgba(12,14,20,0.25)' : 'rgba(255,255,255,0.08)',
                          padding: '0.08rem 0.35rem',
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
                    background: '#151822',
                    borderRadius: '20px',
                    padding: '2.5rem 1.25rem',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <BookOpen size={42} color="#f5b942" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>
                    No Work Logged {activePortfolioService !== 'All' ? `for "${activePortfolioService}"` : 'Yet'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 1.25rem', lineHeight: 1.4 }}>
                    Document client transformations, styling notes, duration, and photos to showcase your craft on your public profile.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenAddWorkModal(activePortfolioService !== 'All' ? activePortfolioService : null)}
                    style={{
                      background: '#f5b942',
                      color: '#0c0e14',
                      border: 'none',
                      borderRadius: '50px',
                      padding: '0.55rem 1.25rem',
                      fontFamily: 'Outfit',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
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
                    onClick={() => handleOpenAddWorkModal(activePortfolioService !== 'All' ? activePortfolioService : null)}
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
                        background: '#151822',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '0.85rem',
                        display: 'flex',
                        gap: '0.85rem',
                        alignItems: 'center',
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

      </div>

      {/* ── MODALS & DRAWERS ── */}

      {/* 1. Withdraw Funds Bank Modal */}
      <WithdrawFundsModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
        onSuccess={(newBal) => {
          setWalletBalance(newBal);
          fetchWalletData();
        }}
      />

      {/* 2. Paystack Top-Up Modal */}
      {showTopupModal && (
        <PopupModal
          isOpen={showTopupModal}
          onClose={() => setShowTopupModal(false)}
          title="Top Up Atelier Wallet"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
              Add funds directly to your wallet via Paystack secure payment card or bank transfer.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                Amount (₦)
              </label>
              <input
                type="number"
                min="500"
                placeholder="e.g. 5000"
                value={topupAmount}
                onChange={(e) => setTopupAmount(e.target.value)}
                style={{
                  background: '#10131b',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  color: '#ffffff',
                  fontFamily: 'Outfit',
                  fontSize: '1rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {[2000, 5000, 10000, 20000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => setTopupAmount(String(quick))}
                  style={{
                    flex: 1,
                    background: '#1c202d',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#f5b942',
                    borderRadius: '8px',
                    padding: '0.4rem 0',
                    fontSize: '0.76rem',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ₦{quick.toLocaleString()}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowTopupModal(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  borderRadius: '50px',
                  height: '42px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  fontFamily: 'Outfit',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleTopupSubmit}
                disabled={topupSubmitting || !topupAmount}
                style={{
                  background: '#f5b942',
                  border: 'none',
                  color: '#0c0e14',
                  borderRadius: '50px',
                  height: '42px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  fontFamily: 'Outfit',
                  cursor: topupSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {topupSubmitting ? 'Processing…' : 'Proceed to Paystack'}
              </button>
            </div>
          </div>
        </PopupModal>
      )}

      {/* 3. Wallet Transactions Bottom Sheet */}
      <BottomSheet
        isOpen={showWalletHistorySheet}
        onClose={() => setShowWalletHistorySheet(false)}
        title="Wallet Transaction History"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
              <Wallet size={36} color="#f5b942" style={{ marginBottom: '0.5rem', opacity: 0.6 }} />
              <p style={{ margin: 0, fontSize: '0.84rem' }}>No transaction history recorded yet.</p>
            </div>
          ) : (
            transactions.map((t, idx) => (
              <div
                key={t._id || idx}
                style={{
                  background: '#10131b',
                  borderRadius: '14px',
                  padding: '0.85rem 1rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.2rem' }}>
                    {t.description || t.type || 'Wallet Activity'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent'}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '0.94rem',
                    fontWeight: 900,
                    color: t.type === 'credit' || t.amount > 0 ? '#10b981' : '#f87171',
                  }}
                >
                  {t.type === 'credit' || t.amount > 0 ? '+' : '-'}₦{Math.abs(Number(t.amount || 0)).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </BottomSheet>

      {/* 4. Request Payout / Withdraw Funds Modal */}
      <WithdrawFundsModal

        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
        onSuccess={() => {
          fetchWalletData();
          fetchDashboardData();
        }}
      />

      {/* 5. Client Reviews Bottom Sheet */}
      <BottomSheet
        isOpen={showReviewsSheet}
        onClose={() => setShowReviewsSheet(false)}
        title="Client Reviews & Ratings"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Summary Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.12) 0%, #151822 100%)',
              border: '1px solid rgba(245, 185, 66, 0.25)',
              borderRadius: '16px',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 900, color: '#f5b942', lineHeight: 1 }}>
                {averageRating || '5.0'} ★
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Overall Specialist Rating
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {reviews.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Total Verified Reviews
              </div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
              <Star size={36} color="#f5b942" style={{ marginBottom: '0.6rem', opacity: 0.5 }} />
              <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>
                No reviews yet
              </h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                When clients complete appointments with you, their ratings and feedback will appear here in real-time.
              </p>
            </div>
          ) : (
            reviews.map((r, idx) => (
              <div
                key={r._id || idx}
                style={{
                  background: '#151822',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                    {r.customerName || 'Verified Client'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f5b942', fontSize: '0.8rem', fontWeight: 800, fontFamily: 'Outfit' }}>
                    <Star size={12} fill="#f5b942" />
                    <span>{Number(r.rating || 5).toFixed(1)}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#64748b', marginBottom: '0.45rem' }}>
                  Service: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{r.serviceName || 'Specialist Appointment'}</span> • {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}
                </div>

                {r.comment && (
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, fontStyle: 'italic' }}>
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </BottomSheet>

      {/* 5. Add Work to Lookbook & Portfolio Modal */}
      {showAddWorkModal && (
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
                  padding: '0.7rem 0.85rem',
                  color: '#ffffff',
                  fontFamily: 'Outfit',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
                required
              />

              {/* Quick Suggestion Chips */}
              <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', marginTop: '0.4rem', scrollbarWidth: 'none' }}>
                {['Silk Press & Steam', 'Skin Fade + Beard', 'Knotless Braids', 'Russian Almond Gel', 'Soft Glam Makeup'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setWorkForm((p) => ({ ...p, title: chip }))}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#94a3b8',
                      fontSize: '0.66rem',
                      padding: '0.18rem 0.5rem',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
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
                  padding: '0.7rem 0.85rem',
                  color: '#ffffff',
                  fontFamily: 'Outfit',
                  fontSize: '0.88rem',
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
                    padding: '0.7rem 0.85rem',
                    color: '#ffffff',
                    fontFamily: 'Outfit',
                    fontSize: '0.88rem',
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
                    padding: '0.7rem 0.85rem',
                    color: '#ffffff',
                    fontFamily: 'Outfit',
                    fontSize: '0.88rem',
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
                  padding: '0.7rem 0.85rem',
                  color: '#ffffff',
                  fontFamily: 'Outfit',
                  fontSize: '0.82rem',
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
      )}

      {/* 6. Work Log Detail & Lightbox Modal */}
      {selectedLogDetail && (
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
      )}

    </PageContainer>
  );
};

export default ExpertDashboard;
