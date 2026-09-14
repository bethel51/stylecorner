import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, Star, X, Check } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { Avatar } from '../components/common/Avatar';
import { api } from '../services/api';

export const AiStylistFinder = () => {
  const navigate = useNavigate();

  const [hairType, setHairType] = useState('Curly');
  const [lookingFor, setLookingFor] = useState('Hair');
  const [preferredStyle, setPreferredStyle] = useState('Trendy');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const hairTypes = ['Straight', 'Wavy', 'Curly', 'Coily'];
  const lookingForOptions = ['Hair', 'Nails', 'Braids', 'Makeup'];
  const preferredStyles = ['Natural', 'Trendy', 'Classic', 'Bold'];

  const handleFindStylist = async () => {
    setLoading(true);
    try {
      const queryPayload = `${lookingFor} styling for ${hairType} hair with ${preferredStyle} preference.`;
      const data = await api.matchAiSpecialist(queryPayload, lookingFor, '').catch(() => ({}));
      const specialists = await api.getSpecialists().catch(() => []);

      let matchedSpec = null;
      if (Array.isArray(specialists) && specialists.length > 0) {
        matchedSpec = specialists.find((s) => s.role === 'staff' || s.isVerified) || specialists[0];
      }

      const name = data?.match?.name || (matchedSpec ? `${matchedSpec.firstname || ''} ${matchedSpec.lastname || ''}`.trim() : 'Verified Style Specialist');
      const avatar = data?.match?.avatarUrl || matchedSpec?.avatarUrl || matchedSpec?.profileImage || '';

      setMatchResult({
        name: name || 'Verified Style Specialist',
        role: matchedSpec?.title || `${lookingFor} Specialist`,
        rating: matchedSpec?.rating || 5.0,
        reviewsCount: `${matchedSpec?.reviewsCount || 24}+`,
        avatar: avatar,
        tags: [lookingFor, `${hairType} Hair`, `${preferredStyle} Styles`],
      });
      setShowMatchModal(true);
    } catch (err) {
      setMatchResult({
        name: 'Verified Style Specialist',
        role: `${lookingFor} Specialist`,
        rating: 5.0,
        reviewsCount: '24+',
        avatar: '',
        tags: [lookingFor, `${hairType} Hair`, `${preferredStyle} Styles`],
      });
      setShowMatchModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer showBack={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Screen 5: Header */}
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
            AI Stylist Finder
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
            Tell us your style, and we'll match you with the perfect stylist.
          </p>
        </div>

        {/* Hero Image with Gold Sparkle Overlay */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            borderRadius: '24px',
            overflow: 'hidden',
            backgroundColor: '#151822',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <OptimizedImage
            src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
            alt="AI Matcher Stylist"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(12, 14, 20, 0.2) 0%, rgba(12, 14, 20, 0.7) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(245, 185, 66, 0.2)',
              border: '1px solid rgba(245, 185, 66, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f5b942',
            }}
          >
            <Sparkles size={20} />
          </div>
        </div>

        {/* Main CTA: Find My Stylist -> */}
        <button
          onClick={handleFindStylist}
          disabled={loading}
          className="app-btn app-btn-accent"
          style={{
            fontSize: '0.95rem',
            padding: '1rem',
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(245, 185, 66, 0.35)',
          }}
        >
          {loading ? 'Matching with Top Stylists...' : (
            <>
              <span>Find My Stylist</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Quick Questions (Optional) */}
        <div style={{ marginTop: '0.5rem' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.85rem' }}>
            Quick Questions <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 400 }}>(Optional)</span>
          </h3>

          {/* Question 1: What's your hair type? */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.45rem', fontFamily: 'Outfit', fontWeight: 600 }}>
              What's your hair type?
            </label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {hairTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setHairType(t)}
                  className={`category-chip ${hairType === t ? 'active' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: What are you looking for? */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.45rem', fontFamily: 'Outfit', fontWeight: 600 }}>
              What are you looking for?
            </label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {lookingForOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLookingFor(opt)}
                  className={`category-chip ${lookingFor === opt ? 'active' : ''}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Preferred style */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.45rem', fontFamily: 'Outfit', fontWeight: 600 }}>
              Preferred style
            </label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {preferredStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => setPreferredStyle(style)}
                  className={`category-chip ${preferredStyle === style ? 'active' : ''}`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ── Screen 12: AI Stylist Match Result Modal ── */}
      {showMatchModal && matchResult && (
        <div className="bottom-sheet-overlay" onClick={() => setShowMatchModal(false)}>
          <div
            className="bottom-sheet-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0e1119',
              borderTop: '1px solid rgba(245, 185, 66, 0.4)',
              borderLeft: '1px solid rgba(245, 185, 66, 0.2)',
              borderRight: '1px solid rgba(245, 185, 66, 0.2)',
              padding: '1.5rem 1.25rem 2.25rem',
            }}
          >
            {/* Brand Header with Close Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', color: '#ffffff' }}>
                STYLE<span style={{ color: '#f5b942' }}>CORNER</span>
              </span>
              <button
                onClick={() => setShowMatchModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Luxury Model Visual with Gold Accents */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '180px',
                borderRadius: '20px',
                overflow: 'hidden',
                marginBottom: '1.25rem',
                backgroundColor: '#151822',
              }}
            >
              <OptimizedImage
                src={matchResult.avatar}
                alt={matchResult.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(14, 17, 25, 0.9) 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  color: '#f5b942',
                }}
              >
                <Sparkles size={24} />
              </div>
            </div>

            {/* Headline & Subtitle */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>
                Your Perfect Match
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.45, maxWidth: '320px', margin: '0 auto' }}>
                Based on your style, preferences and hair type, we found the best stylist for you.
              </p>
            </div>

            {/* Matched Stylist Card */}
            <div
              style={{
                background: '#151822',
                borderRadius: '18px',
                padding: '1rem',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1.5px solid #f5b942',
                }}
              >
                <OptimizedImage
                  src={matchResult.avatar}
                  alt={matchResult.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.2rem' }}>
                  {matchResult.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.74rem', color: '#94a3b8', marginBottom: '0.45rem' }}>
                  <span>{matchResult.role}</span>
                  <span>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#f5b942', fontWeight: 800 }}>
                    <Star size={12} fill="#f5b942" />
                    <span>{matchResult.rating}</span>
                  </div>
                  <span>({matchResult.reviewsCount})</span>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {matchResult.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(245, 185, 66, 0.12)',
                        color: '#f5b942',
                        border: '1px solid rgba(245, 185, 66, 0.3)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '50px',
                        fontSize: '0.68rem',
                        fontFamily: 'Outfit',
                        fontWeight: 700,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={() => {
                  setShowMatchModal(false);
                  navigate(`/expert-profile?name=${encodeURIComponent(matchResult.name)}`);
                }}
                className="app-btn app-btn-accent"
                style={{ borderRadius: '14px', minHeight: '46px' }}
              >
                <span>View Profile</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  setShowMatchModal(false);
                  navigate(`/booking?stylist=${encodeURIComponent(matchResult.name.split(' ')[0])}&service=${encodeURIComponent(lookingFor)}`);
                }}
                className="app-btn app-btn-outline"
                style={{ borderRadius: '14px', minHeight: '46px' }}
              >
                Book Now
              </button>
            </div>

          </div>
        </div>
      )}

    </PageContainer>
  );
};
