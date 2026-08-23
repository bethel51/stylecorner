import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Wand2, User } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AISpecialistMatcherSheet = ({ isOpen, onClose, onApplyMatch }) => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [requestText, setRequestText] = useState('');
  const [primaryService, setPrimaryService] = useState('Precision Skin Fade & Cut');
  const [secondaryService, setSecondaryService] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const servicesList = [
    'Precision Skin Fade & Cut',
    'Beard Trim & Sculpting',
    'Knotless Box Braids',
    'Cornrows & Custom Pattern',
    'Full Gel Nail Architecture',
    'Luxury Pedicure Session',
    'Full Atelier Grooming Combo',
  ];

  const handleRunMatch = async (e) => {
    e.preventDefault();
    if (!requestText.trim() && !primaryService) {
      showToast('Please select a service or enter a style description.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await api.matchAiSpecialist(requestText, primaryService, secondaryService);
      if (data.match) {
        setMatchResult(data.match);
      }
    } catch (err) {
      showToast(err.message || 'AI Matcher connection issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (matchResult && onApplyMatch) {
      onApplyMatch({
        ...matchResult,
        primaryService: primaryService || matchResult.primaryService,
        secondaryService: secondaryService || matchResult.secondaryService,
      });
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="AI Specialist Matcher">
      <div>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          Select your primary & optional secondary service, or describe your desired look. AI will find the best specialist for your exact combo.
        </p>

        <form onSubmit={handleRunMatch}>
          {/* Primary Service Dropdown */}
          <div className="app-input-group">
            <label className="app-label">Primary Service</label>
            <select
              value={primaryService}
              onChange={(e) => setPrimaryService(e.target.value)}
              className="app-select"
            >
              {servicesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Secondary Service Dropdown */}
          <div className="app-input-group">
            <label className="app-label">Secondary Combo Service (Optional)</label>
            <select
              value={secondaryService}
              onChange={(e) => setSecondaryService(e.target.value)}
              className="app-select"
            >
              <option value="">-- None --</option>
              {servicesList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Request Text Area */}
          <div className="app-input-group">
            <label className="app-label">Custom Style Notes / Requests</label>
            <textarea
              rows={2}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="e.g. Low skin fade with textured crop top + beard trim for a photoshoot..."
              className="app-textarea"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="app-btn app-btn-accent"
            style={{ marginBottom: '1.25rem' }}
          >
            {loading ? (
              <span>Matching Specialist...</span>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Find Best Match</span>
              </>
            )}
          </button>
        </form>

        {matchResult && (
          <div
            style={{
              padding: '1.25rem',
              background: '#faf9f6',
              border: '1.5px solid rgba(212, 175, 55, 0.4)',
              borderRadius: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontFamily: 'Outfit',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#b5952f',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                TOP ARTISAN MATCH
              </span>
              <span className="status-badge status-accepted">
                {matchResult.matchScore || 98}% MATCH
              </span>
            </div>

            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#171717', marginBottom: '0.3rem' }}>
              {matchResult.name || `${matchResult.firstname} ${matchResult.lastname}`}
            </h3>

            <p style={{ color: '#4b5563', fontSize: '0.83rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              {matchResult.rationale}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  onClose();
                  const targetName = matchResult.name || `${matchResult.firstname || ''} ${matchResult.lastname || ''}`.trim();
                  navigate(`/expert-profile?name=${encodeURIComponent(targetName)}`);
                }}
                className="app-btn app-btn-outline"
                style={{ flex: 1, minHeight: '44px', fontSize: '0.82rem' }}
              >
                <User size={15} />
                <span>View Profile</span>
              </button>

              <button
                onClick={handleApply}
                className="app-btn app-btn-primary"
                style={{ flex: 1, minHeight: '44px', fontSize: '0.82rem' }}
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
