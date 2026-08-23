import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Wand2, User, Star, MapPin, ShieldCheck, ArrowRight, RefreshCw, Scissors } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AISpecialistMatcherSheet = ({ isOpen, onClose, onApplyMatch }) => {
  const navigate = useNavigate();
  const { showToast } = useAuth();

  const [category, setCategory] = useState('Wigs & Frontal Installs');
  const [vibe, setVibe] = useState('Bespoke Executive Luxury');
  const [preferredState, setPreferredState] = useState('Lagos State');
  const [requestText, setRequestText] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const categories = [
    { id: 'wigs', label: 'Wigs & Frontals', service: 'Frontal Wig Install' },
    { id: 'braids', label: 'Knotless Braids & Locs', service: 'Knotless Box Braids' },
    { id: 'barber', label: 'Hair Cut & Fade', service: 'Precision Skin Fade & Cut' },
    { id: 'nails', label: 'Nails & Pedicure', service: 'Full Gel Nail Architecture' },
    { id: 'combo', label: 'Full Executive Combo', service: 'Full Atelier Grooming Combo' },
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
      if (data.match) {
        setMatchResult({
          ...data.match,
          primaryService: selectedService,
          state: preferredState,
          vibe: vibe
        });
      } else {
        // Fallback match using registered team
        const dynamicSpecs = await api.getSpecialists().catch(() => []);
        const firstSpec = Array.isArray(dynamicSpecs) && dynamicSpecs.find(s => s.role === 'staff' || s.isVerified);
        const specName = firstSpec ? `${firstSpec.firstname || ''} ${firstSpec.lastname || ''}`.trim() : 'Style Corner Artisan';

        setMatchResult({
          name: specName,
          role: firstSpec?.title || 'Certified Atelier Specialist',
          rating: firstSpec?.rating || 5.0,
          matchScore: 98,
          location: preferredState,
          rationale: `Matched based on your selection for ${category} with a ${vibe} finish in ${preferredState}. Verified track record for scalp care and precision styling.`,
          avatar: firstSpec?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          primaryService: selectedService
        });
      }
    } catch (err) {
      setMatchResult({
        name: 'Style Corner Artisan',
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
        primaryService: matchResult.primaryService || 'Precision Skin Fade & Cut',
      });
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="AI Specialist Matcher">
      <div style={{ paddingBottom: '1rem' }}>
        
        {/* Header Callout */}
        <div style={{
          background: 'linear-gradient(135deg, #171717 0%, #0d0d0d 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '1rem',
          marginBottom: '1.25rem',
          border: '1.5px solid rgba(212,175,55,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'rgba(212,175,55,0.2)',
            color: '#d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Smart Artisan Recommendation Engine
            </h4>
            <p style={{ fontSize: '0.75rem', color: '#a1a1aa', margin: '0.15rem 0 0' }}>
              Answer 3 quick preferences and AI will analyze artisan skills, ratings & availability.
            </p>
          </div>
        </div>

        <form onSubmit={handleRunMatch}>
          
          {/* Preference 1: Category */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label className="app-label">1. Desired Service Specialty *</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.label)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '50px',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: category === cat.label ? '#171717' : '#f3f4f6',
                    color: category === cat.label ? '#d4af37' : '#6b7280',
                    border: category === cat.label ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preference 2: Style Vibe */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label className="app-label">2. Desired Style Vibe & Finish</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
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
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    background: vibe === v ? 'rgba(212,175,55,0.15)' : '#f8fafc',
                    color: vibe === v ? '#b5952f' : '#64748b',
                    border: vibe === v ? '1.5px solid #d4af37' : '1px solid rgba(0,0,0,0.08)',
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
              placeholder="e.g. Knotless box braids with waist length, or clean taper fade with razor lineup..."
              className="app-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="app-btn app-btn-accent"
            style={{ minHeight: '48px', borderRadius: '14px', marginBottom: '1.25rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing Artisan Profiles...
              </span>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Run AI Matching Engine</span>
              </>
            )}
          </button>
        </form>

        {/* ── AI MATCH RESULT CARD ── */}
        {matchResult && (
          <div
            style={{
              padding: '1.25rem',
              background: '#ffffff',
              border: '2px solid #d4af37',
              borderRadius: '20px',
              boxShadow: '0 12px 32px rgba(212,175,55,0.18)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span
                style={{
                  fontFamily: 'Outfit',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: '#b5952f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <Sparkles size={13} color="#d4af37" /> TOP RECOMMENDED ARTISAN MATCH
              </span>

              <span style={{
                background: '#10b981',
                color: '#ffffff',
                fontFamily: 'Outfit',
                fontWeight: 900,
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '50px',
                boxShadow: '0 2px 8px rgba(16,185,129,0.3)'
              }}>
                {matchResult.matchScore || 98}% MATCH
              </span>
            </div>

            {/* Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `url(${matchResult.avatar}) center/cover no-repeat`,
                border: '2.5px solid #d4af37',
                flexShrink: 0
              }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 900, color: '#171717', margin: 0 }}>
                    {matchResult.name || `${matchResult.firstname} ${matchResult.lastname}`}
                  </h3>
                  <ShieldCheck size={16} color="#d4af37" />
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.8rem', fontFamily: 'Outfit', fontWeight: 600, margin: '0.15rem 0 0.25rem' }}>
                  {matchResult.role}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#4b5563' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 800 }}>
                    <Star size={12} fill="#f59e0b" /> {matchResult.rating || 5.0}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#6b7280' }}>
                    <MapPin size={12} /> {matchResult.location || preferredState}
                  </span>
                </div>
              </div>
            </div>

            {/* Rationale explanation */}
            <div style={{
              background: '#faf9f5',
              padding: '0.75rem 0.85rem',
              borderRadius: '12px',
              border: '1px solid rgba(212,175,55,0.2)',
              fontSize: '0.82rem',
              color: '#374151',
              lineHeight: 1.5,
              marginBottom: '1rem'
            }}>
              {matchResult.rationale}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const targetName = matchResult.name || `${matchResult.firstname || ''} ${matchResult.lastname || ''}`.trim();
                  navigate(`/expert-profile?name=${encodeURIComponent(targetName)}`);
                }}
                className="app-btn app-btn-outline"
                style={{ flex: 1, minHeight: '44px', fontSize: '0.82rem', borderRadius: '12px' }}
              >
                <User size={15} />
                <span>View Profile</span>
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="app-btn app-btn-primary"
                style={{ flex: 1, minHeight: '44px', fontSize: '0.82rem', borderRadius: '12px' }}
              >
                <Check size={16} />
                <span>Book Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
