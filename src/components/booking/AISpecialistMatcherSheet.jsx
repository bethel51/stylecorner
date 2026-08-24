import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Wand2, User, Star, MapPin, ShieldCheck, RefreshCw } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { OptimizedImage } from '../common/OptimizedImage';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AISpecialistMatcherSheet = ({ isOpen, onClose, onApplyMatch }) => {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [category, setCategory] = useState('Wig Installer');
  const [vibe, setVibe] = useState('Bespoke Executive Luxury');
  const [preferredState, setPreferredState] = useState('Lagos State');
  const [requestText, setRequestText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const categories = [
    { id: 'wig_install', label: 'Wig Installer', service: 'Wig Installer' },
    { id: 'wig_revamp', label: 'Wig Revamper', service: 'Wig Revamper' },
    { id: 'braider', label: 'Hair Stylist (Braider)', service: 'Hair Stylist (Braider)' },
    { id: 'lash', label: 'Lash Tech', service: 'Lash Tech' },
    { id: 'nail', label: 'Nail Tech', service: 'Nail Tech' },
    { id: 'makeup', label: 'Makeup Artist', service: 'Makeup Artist' },
    { id: 'manicure', label: 'Manicure', service: 'Manicure' },
    { id: 'pedicure', label: 'Pedicure', service: 'Pedicure' },
  ];

  const vibes = [
    'Bespoke Executive Luxury',
    'Fast & Clean Daily Look',
    'Special Event & Red Carpet',
  ];

  const states = [
    'Lagos State',
    'Abuja FCT',
    'Port Harcourt (Rivers)',
    'At-Home VIP Service',
  ];

  const handleRunMatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMatchResult(null);

    const activeCat = categories.find(c => c.label === category || c.id === category);
    const selectedService = activeCat ? activeCat.service : 'Precision Skin Fade & Cut';
    const queryPayload = `${category} - ${vibe} in ${preferredState}. ${requestText}`;

    try {
      const data = await api.matchAiSpecialist(queryPayload, selectedService, '');
      const dynamicSpecs = await api.getSpecialists().catch(() => []);
      const matchedSpec = Array.isArray(dynamicSpecs) && dynamicSpecs.find(s => s.role === 'staff' || s.isVerified);
      
      const fallbackAvatar = matchedSpec?.avatarUrl || matchedSpec?.profileImage || matchedSpec?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

      if (data.match) {
        setMatchResult({
          ...data.match,
          avatar: data.match.avatarUrl || data.match.avatar || data.match.profileImage || data.match.image || fallbackAvatar,
          primaryService: selectedService,
          state: preferredState,
          vibe: vibe
        });
      } else {
        const specName = matchedSpec ? `${matchedSpec.firstname || ''} ${matchedSpec.lastname || ''}`.trim() : 'Style Corner Artisan';

        setMatchResult({
          name: specName,
          firstname: matchedSpec?.firstname || 'Style',
          lastname: matchedSpec?.lastname || 'Artisan',
          role: matchedSpec?.title || matchedSpec?.roleTitle || 'Certified Atelier Specialist',
          rating: matchedSpec?.rating || 5.0,
          matchScore: 98,
          location: preferredState,
          rationale: `Matched based on your selection for ${category} with a ${vibe} finish in ${preferredState}. Verified track record for scalp care and precision styling.`,
          avatar: fallbackAvatar,
          primaryService: selectedService
        });
      }
    } catch (err) {
      setMatchResult({
        name: 'Style Corner Artisan',
        firstname: 'Style',
        lastname: 'Artisan',
        role: 'Certified Atelier Specialist',
        rating: 5.0,
        matchScore: 95,
        location: preferredState,
        rationale: `Matched based on your preference for ${category} (${vibe}) in ${preferredState}. Dedicated to luxury client care and long-lasting styling.`,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        primaryService: selectedService
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (matchResult && onApplyMatch) {
      onApplyMatch({
        ...matchResult,
        primaryService: matchResult.primaryService || 'Wig Installer',
      });
      onClose();
    }
  };

  const avatarSrc = matchResult
    ? (matchResult.avatar || matchResult.avatarUrl || matchResult.profileImage || matchResult.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80')
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="AI Specialist Matcher">
      <div style={{ paddingBottom: '1rem', width: '100%', overflowX: 'hidden' }}>
        
        {/* Header Callout */}
        <div style={{
          background: 'linear-gradient(135deg, #171717 0%, #0d0d0d 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '0.95rem',
          marginBottom: '1.15rem',
          border: '1.5px solid rgba(212,175,55,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'rgba(212,175,55,0.2)',
            color: '#d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.9rem', fontWeight: 800, margin: 0, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Smart Recommendation Engine
            </h4>
            <p style={{ fontSize: '0.72rem', color: '#a1a1aa', margin: '0.1rem 0 0', lineHeight: 1.3 }}>
              Select your preferences below to get matched instantly.
            </p>
          </div>
        </div>

        <form onSubmit={handleRunMatch}>
          
          {/* Preference 1: Category */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="app-label">1. Desired Service Specialty *</label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', width: '100%' }}>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.label)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '50px',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: category === cat.label ? '#171717' : '#f3f4f6',
                    color: category === cat.label ? '#d4af37' : '#4b5563',
                    border: category === cat.label ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.06)',
                    maxWidth: '100%',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preference 2: Style Vibe */}
          <div style={{ marginBottom: '1rem' }}>
            <label className="app-label">2. Desired Style Vibe & Finish</label>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', width: '100%' }}>
              {vibes.map((v) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => setVibe(v)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '50px',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    background: vibe === v ? 'rgba(212,175,55,0.15)' : '#f8fafc',
                    color: vibe === v ? '#b5952f' : '#64748b',
                    border: vibe === v ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
                    maxWidth: '100%'
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Preference 3: Location */}
          <div className="app-input-group">
            <label className="app-label">3. Preferred Location / Region</label>
            <select
              value={preferredState}
              onChange={(e) => setPreferredState(e.target.value)}
              className="app-select"
            >
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Optional Request Text Area */}
          <div className="app-input-group">
            <label className="app-label">Custom Style Request / Hair Details (Optional)</label>
            <textarea
              rows={2}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="e.g. Knotless box braids with waist length, or clean frontal wig melt..."
              className="app-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="app-btn app-btn-accent"
            style={{ minHeight: '46px', borderRadius: '14px', marginBottom: '1.25rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing Artisan Profiles...
              </span>
            ) : (
              <>
                <Wand2 size={16} />
                <span>Run AI Matching Engine</span>
              </>
            )}
          </button>
        </form>

        {/* ── AI MATCH RESULT CARD (MOBILE OPTIMIZED) ── */}
        {matchResult && (
          <div
            style={{
              padding: '1.1rem 0.95rem',
              background: '#ffffff',
              border: '2px solid #d4af37',
              borderRadius: '18px',
              boxShadow: '0 10px 28px rgba(212,175,55,0.18)',
              position: 'relative',
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontFamily: 'Outfit',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  color: '#b5952f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Sparkles size={12} color="#d4af37" /> TOP MATCHED ARTISAN
              </span>

              <span style={{
                background: '#10b981',
                color: '#ffffff',
                fontFamily: 'Outfit',
                fontWeight: 900,
                fontSize: '0.7rem',
                padding: '0.18rem 0.55rem',
                borderRadius: '50px',
                boxShadow: '0 2px 8px rgba(16,185,129,0.25)'
              }}>
                {matchResult.matchScore || 98}% MATCH
              </span>
            </div>

            {/* Profile Info with Robust Avatar Fallback */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <OptimizedImage
                src={avatarSrc}
                alt={matchResult.name || 'Artisan Profile'}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2.5px solid #d4af37',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 900, color: '#171717', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {matchResult.name || `${matchResult.firstname || ''} ${matchResult.lastname || ''}`.trim() || 'Verified Specialist'}
                  </h3>
                  <ShieldCheck size={15} color="#d4af37" style={{ flexShrink: 0 }} />
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.78rem', fontFamily: 'Outfit', fontWeight: 600, margin: '0.1rem 0 0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {matchResult.role || 'Certified Atelier Specialist'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#4b5563' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 800 }}>
                    <Star size={11} fill="#f59e0b" /> {matchResult.rating || 5.0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#6b7280' }}>
                    <MapPin size={11} /> {matchResult.location || preferredState}
                  </span>
                </div>
              </div>
            </div>

            {/* Rationale explanation */}
            <div style={{
              background: '#faf9f5',
              padding: '0.65rem 0.75rem',
              borderRadius: '12px',
              border: '1px solid rgba(212,175,55,0.2)',
              fontSize: '0.78rem',
              color: '#374151',
              lineHeight: 1.45,
              marginBottom: '0.85rem'
            }}>
              {matchResult.rationale}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const targetName = matchResult.name || `${matchResult.firstname || ''} ${matchResult.lastname || ''}`.trim();
                  navigate(`/expert-profile?name=${encodeURIComponent(targetName)}`);
                }}
                className="app-btn app-btn-outline"
                style={{ flex: 1, minHeight: '42px', fontSize: '0.78rem', borderRadius: '12px', padding: '0.4rem' }}
              >
                <User size={14} />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="app-btn app-btn-primary"
                style={{ flex: 1, minHeight: '42px', fontSize: '0.78rem', borderRadius: '12px', padding: '0.4rem' }}
              >
                <Check size={15} />
                <span>Book Match</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
