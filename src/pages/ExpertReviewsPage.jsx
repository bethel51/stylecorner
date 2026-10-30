import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Sparkles,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  Award,
  CheckCircle2,
  Calendar,
  User,
  Share2,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ExpertReviewsPage = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [starFilter, setStarFilter] = useState('all'); // 'all' | '5' | '4' | '3' | '2' | '1'

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Fetch reviews for this specialist
      const targetId = user?._id || user?.id;
      let data = [];
      if (targetId) {
        try {
          data = await api.getReviews(targetId);
        } catch (e) {
          // fallback to staff reviews if different endpoint
          try {
            data = await api.getStaffReviews(targetId);
          } catch (err) {}
        }
      }
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user?._id]);

  // Compute metrics
  const totalReviews = reviews.length;
  const averageRating = useMemo(() => {
    if (!totalReviews) return '5.0';
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return (sum / totalReviews).toFixed(1);
  }, [reviews, totalReviews]);

  // Star breakdown counts
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.round(Number(r.rating || 5));
      if (counts[star] !== undefined) counts[star]++;
      else if (star >= 5) counts[5]++;
      else counts[1]++;
    });
    return counts;
  }, [reviews]);

  // Filtered reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Star filter
      if (starFilter !== 'all') {
        const star = Math.round(Number(r.rating || 5));
        if (String(star) !== starFilter) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const client = (r.customerName || r.clientName || '').toLowerCase();
        const comment = (r.comment || '').toLowerCase();
        const service = (r.serviceName || r.service || '').toLowerCase();
        return client.includes(q) || comment.includes(q) || service.includes(q);
      }
      return true;
    });
  }, [reviews, starFilter, searchQuery]);

  const handleShareReviews = () => {
    const publicUrl = `${window.location.origin}/expert-profile?name=${encodeURIComponent(`${user?.firstname || ''} ${user?.lastname || ''}`.trim() || 'Specialist')}`;
    if (navigator.share) {
      navigator.share({
        title: `${user?.firstname || 'Specialist'}'s Verified Client Reviews`,
        text: `Check out my verified client reviews on Style Corner Atelier (${averageRating} ★ from ${totalReviews} clients)!`,
        url: publicUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(publicUrl);
      showToast('Public profile link copied to clipboard!', 'success');
    }
  };

  return (
    <PageContainer showBack={false}>
      <div style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '4rem' }}>
        
        {/* Top Header Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
          <button
            onClick={() => navigate('/expert-dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.55rem 0.95rem',
              color: '#e2e8f0',
              fontFamily: 'Outfit',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleShareReviews}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(245, 185, 66, 0.12)',
                border: '1px solid rgba(245, 185, 66, 0.3)',
                borderRadius: '12px',
                padding: '0.55rem 0.95rem',
                color: '#f5b942',
                fontFamily: 'Outfit',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
              title="Share verified ratings"
            >
              <Share2 size={14} /> Share
            </button>
            <button
              onClick={fetchReviews}
              disabled={loading}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
              title="Refresh reviews"
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f5b942', fontSize: '0.76rem', fontWeight: 800, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            <Sparkles size={13} /> Specialist Reputation & Trust
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            Client Reviews & Ratings
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Real-time verified feedback and performance ratings submitted by clients after completed appointments.
          </p>
        </div>

        {/* Hero Rating Summary Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.12) 0%, #151824 45%, #0f121a 100%)',
            border: '1.5px solid rgba(245, 185, 66, 0.3)',
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.6), 0 0 20px rgba(245, 185, 66, 0.06)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          {/* Big Score Block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '22px',
                background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.25) 0%, rgba(245, 185, 66, 0.08) 100%)',
                border: '1.5px solid rgba(245, 185, 66, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ fontFamily: 'Outfit', fontSize: '2.1rem', fontWeight: 900, color: '#f5b942', lineHeight: 1 }}>
                {averageRating}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#f5b942', marginTop: '0.2rem' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={11}
                    fill={s <= Math.round(Number(averageRating)) ? '#f5b942' : 'transparent'}
                    color="#f5b942"
                  />
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '0.2rem 0.55rem', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800, fontFamily: 'Outfit', marginBottom: '0.35rem' }}>
                <ShieldCheck size={12} /> 100% Verified Clients
              </div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Overall Specialist Rating
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '0.2rem 0 0' }}>
                Calculated from <strong style={{ color: '#ffffff' }}>{totalReviews}</strong> {totalReviews === 1 ? 'verified review' : 'verified reviews'}
              </p>
            </div>
          </div>

          {/* Star Rating Breakdown Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', paddingLeft: '1.25rem' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem' }}>
                  <div style={{ width: '42px', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#cbd5e1', fontWeight: 700, fontFamily: 'Outfit' }}>
                    <span>{star}</span> <Star size={10} fill="#f5b942" color="#f5b942" />
                  </div>
                  <div style={{ flex: 1, height: '7px', background: 'rgba(255, 255, 255, 0.07)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: star >= 4 ? '#f5b942' : star === 3 ? '#60a5fa' : '#f87171',
                        borderRadius: '10px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                  <div style={{ width: '28px', textAlign: 'right', color: '#64748b', fontWeight: 700, fontFamily: 'Outfit' }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by client name, service, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#151824',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '0.75rem 1rem 0.75rem 2.6rem',
                color: '#ffffff',
                fontFamily: 'Outfit',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Star Filter Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem', scrollbarWidth: 'none' }}>
            {[
              { id: 'all', label: `All (${totalReviews})` },
              { id: '5', label: `5 Stars (${starCounts[5]})` },
              { id: '4', label: `4 Stars (${starCounts[4]})` },
              { id: '3', label: `3 Stars (${starCounts[3]})` },
              { id: '2', label: `2 Stars (${starCounts[2]})` },
              { id: '1', label: `1 Star (${starCounts[1]})` },
            ].map((chip) => {
              const active = starFilter === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setStarFilter(chip.id)}
                  style={{
                    background: active ? '#f5b942' : '#151824',
                    color: active ? '#0c0e14' : '#94a3b8',
                    border: active ? '1px solid #f5b942' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '50px',
                    padding: '0.4rem 0.85rem',
                    fontFamily: 'Outfit',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  background: '#151824',
                  borderRadius: '18px',
                  padding: '1.25rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  height: '110px',
                  opacity: 0.5,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div
            style={{
              background: '#151824',
              borderRadius: '22px',
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 185, 66, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#f5b942' }}>
              <Star size={32} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.4rem' }}>
              {searchQuery || starFilter !== 'all' ? 'No matching reviews found' : 'No client reviews yet'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.86rem', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              {searchQuery || starFilter !== 'all'
                ? 'Try adjusting your search terms or filter selection.'
                : 'As verified clients complete their scheduled appointments with you, their ratings and reviews will automatically appear on this page.'}
            </p>
            {(searchQuery || starFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStarFilter('all');
                }}
                style={{
                  background: 'rgba(245, 185, 66, 0.15)',
                  color: '#f5b942',
                  border: '1px solid rgba(245, 185, 66, 0.35)',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '50px',
                  fontFamily: 'Outfit',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredReviews.map((r, idx) => {
              const ratingNum = Number(r.rating || 5);
              const clientInitials = (r.customerName || 'VC')
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={r._id || idx}
                  style={{
                    background: '#151824',
                    borderRadius: '20px',
                    padding: '1.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 8px 24px -10px rgba(0, 0, 0, 0.4)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  {/* Top row: Client info & Star Rating */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.25) 0%, rgba(245, 185, 66, 0.08) 100%)',
                          border: '1px solid rgba(245, 185, 66, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f5b942',
                          fontFamily: 'Outfit',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          flexShrink: 0,
                        }}
                      >
                        {clientInitials}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                            {r.customerName || 'Verified Client'}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontSize: '0.68rem', fontWeight: 800, fontFamily: 'Outfit', padding: '0.1rem 0.45rem', borderRadius: '50px' }}>
                            <CheckCircle2 size={10} /> Verified Booking
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Service: <span style={{ color: '#94a3b8', fontWeight: 600 }}>{r.serviceName || r.service || 'Specialist Appointment'}</span> • {r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: 'rgba(245, 185, 66, 0.12)',
                        border: '1px solid rgba(245, 185, 66, 0.3)',
                        borderRadius: '50px',
                        padding: '0.25rem 0.65rem',
                        color: '#f5b942',
                        fontFamily: 'Outfit',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      <Star size={13} fill="#f5b942" />
                      <span>{ratingNum.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Comment / Feedback */}
                  {r.comment && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        color: '#e2e8f0',
                        fontSize: '0.86rem',
                        lineHeight: 1.5,
                        fontStyle: 'italic',
                      }}
                    >
                      "{r.comment}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageContainer>
  );
};

export default ExpertReviewsPage;
