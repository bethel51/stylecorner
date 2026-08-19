import React, { useState } from 'react';
import { Sparkles, Check, Wand2 } from 'lucide-react';
import { BottomSheet } from '../common/BottomSheet';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AISpecialistMatcherSheet = ({ isOpen, onClose, onApplyMatch }) => {
  const { showToast } = useAuth();
  const [requestText, setRequestText] = useState('');
  const [preferredService, setPreferredService] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);

  const handleRunMatch = async (e) => {
    e.preventDefault();
    if (!requestText.trim()) {
      showToast('Please enter a description of the style or service you want.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await api.matchAiSpecialist(requestText, preferredService);
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
      onApplyMatch(matchResult);
      onClose();
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="AI Specialist Matcher">
      <div>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.5 }}>
          Describe your desired hairstyle, fade, braids, nails, or combo. AI will evaluate specialist portfolios and find your ideal match.
        </p>

        <form onSubmit={handleRunMatch}>
          <div className="app-input-group">
            <label className="app-label">Style Request / Requirements</label>
            <textarea
              rows={3}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="e.g. Skin fade with textured crop top + beard trim for a photoshoot..."
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
              <span>Analyzing Portfolios...</span>
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

            <button
              onClick={handleApply}
              className="app-btn app-btn-primary"
            >
              <Check size={18} />
              <span>Apply & Book with {matchResult.firstname}</span>
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
