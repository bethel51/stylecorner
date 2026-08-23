import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Star, Calendar, ShieldCheck, UserPlus, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { api } from '../services/api';

export const Experts = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter strictly for staff/expert accounts
          const verifiedStaff = data.filter((spec) => spec.role === 'staff' || spec.isVerified === true);

          const registeredTeam = verifiedStaff.map((spec) => {
            const fullName = `${spec.firstname || ''} ${spec.lastname || ''}`.trim() || 'Verified Specialist';
            const specialtiesList = Array.isArray(spec.services)
              ? spec.services
              : (spec.services ? String(spec.services).split(',').map((s) => s.trim()) : ['Bespoke Styling', 'Executive Care']);
            return {
              id: spec._id,
              name: fullName,
              role: spec.title || spec.roleTitle || 'Certified Style Specialist',
              experience: spec.experience || 'Verified Atelier Expert',
              rating: spec.rating || 5.0,
              specialties: specialtiesList,
              bio: spec.bio || `Specialized in ${specialtiesList.join(', ')} with verified professional credentials.`,
              image: spec.avatarUrl || spec.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            };
          });

          setTeam(registeredTeam);
        } else {
          setTeam([]);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch registered specialists:', err.message);
        setTeam([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer title="Verified Expert Team">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '140px', borderRadius: '16px', marginBottom: '1rem' }} />
            <div className="skeleton" style={{ height: '140px', borderRadius: '16px' }} />
          </div>
        ) : team.length > 0 ? (
          team.map((m, idx) => (
            <div key={m.id || idx} className="app-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <img
                  src={m.image}
                  alt={m.name}
                  loading="lazy"
                  decoding="async"
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    objectFit: 'cover',
                    border: '2px solid rgba(212, 175, 55, 0.4)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                    flexShrink: 0
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 900, color: '#171717', margin: 0 }}>
                      {m.name}
                    </h3>
                    <ShieldCheck size={16} color="#d4af37" />
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.8rem', fontFamily: 'Outfit', fontWeight: 700, margin: '0.15rem 0 0.25rem' }}>
                    {m.role}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 800 }}>
                      <Star size={12} fill="#f59e0b" />
                      <span>{m.rating}</span>
                    </span>
                    <span>• {m.experience}</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                {m.bio}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                {m.specialties.map((spec, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      background: 'rgba(212, 175, 55, 0.1)',
                      color: '#b5952f',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '50px',
                      fontSize: '0.72rem',
                      fontFamily: 'Outfit',
                      fontWeight: 700,
                    }}
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => navigate(`/expert-profile?name=${encodeURIComponent(m.name)}`)}
                  className="app-btn app-btn-outline"
                  style={{ flex: 1, minHeight: '42px', fontSize: '0.82rem', borderRadius: '12px' }}
                >
                  View Profile
                </button>
                <button
                  onClick={() => navigate(`/booking?stylist=${encodeURIComponent(m.name)}`)}
                  className="app-btn app-btn-primary"
                  style={{ flex: 1, minHeight: '42px', fontSize: '0.82rem', borderRadius: '12px' }}
                >
                  <Calendar size={14} />
                  Book Now
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="app-card"
            style={{
              textAlign: 'center',
              padding: '2.5rem 1.5rem',
              background: '#ffffff',
              border: '1.5px dashed rgba(212,175,55,0.4)',
              borderRadius: '20px'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(212,175,55,0.15)',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <Scissors size={26} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 900, color: '#171717', marginBottom: '0.35rem' }}>
              No Verified Experts Found
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.82rem', lineHeight: 1.5, maxWidth: '320px', margin: '0 auto 1.25rem' }}>
              Only verified specialists registered on Style Corner are displayed here. Are you a beauty or grooming professional?
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="app-btn app-btn-accent"
              style={{ width: 'auto', margin: '0 auto', padding: '0.75rem 1.5rem', borderRadius: '14px' }}
            >
              <UserPlus size={16} />
              Register as an Expert
            </button>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
