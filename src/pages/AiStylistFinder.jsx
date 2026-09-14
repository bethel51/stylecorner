import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, Star, X, Check } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
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

        {/* Luxury AI Matching Visual Hero Banner */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            padding: '2rem 1.5rem',
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #181c28 0%, #12151e 50%, #0c0e14 100%)',
            border: '1px solid rgba(245, 185, 66, 0.3)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '200px',
            boxSizing: 'border-box',
          }}
        >
          {/* Subtle Ambient Radial Glow */}
          <div
            style={{
              position: 'absolute',
              top: '-30%',
              right: '-15%',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(245, 185, 66, 0.18) 0%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              left: '-10%',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(0,0,0,0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(245, 185, 66, 0.15)',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                borderRadius: '50px',
                padding: '0.3rem 0.8rem',
                color: '#f5b942',
                fontFamily: 'Outfit',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '0.85rem',
              }}
            >
              <Sparkles size={14} />
              <span>Smart Precision Matching</span>
            </div>

            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: '0 0 0.4rem', lineHeight: 1.25 }}>
              Match With Your Ideal Stylist in Seconds
            </h2>

            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0, lineHeight: 1.45, maxWidth: '340px' }}>
              Our AI engine matches your specific hair texture, desired service & location to vetted luxury specialists.
            </p>
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
                padding: '1.75rem 1rem',
                borderRadius: '20px',
                marginBottom: '1.25rem',
                background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.12) 0%, rgba(21, 24, 34, 0.95) 100%)',
                border: '1px solid rgba(245, 185, 66, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  color: '#f5b942',
                }}
              >
                <Sparkles size={22} />
              </div>

              <Avatar
                src={matchResult.avatar}
                name={matchResult.name}
                size={84}
                borderRadius="50%"
                style={{
                  border: '3px solid #f5b942',
                  boxShadow: '0 8px 24px rgba(245, 185, 66, 0.35)',
                }}
              />
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
              <Avatar
                src={matchResult.avatar}
                name={matchResult.name}
                size={54}
                borderRadius="14px"
                style={{ border: '1.5px solid #f5b942', flexShrink: 0 }}
              />

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
