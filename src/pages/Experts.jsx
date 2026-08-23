import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Star, Calendar, Award } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { api } from '../services/api';

const DEFAULT_TEAM = [
  {
    name: 'Stella Hair',
    role: 'Wig Installer & Hair Artisan',
    experience: '8+ Years Experience',
    rating: 4.9,
    specialties: ['Frontal Wig Install', 'Closure Wig Install', 'Wig Revamp'],
    bio: 'Specialized in luxury wigs, closures, frontals, and custom wig customization. Flawless melting & scalp-matching lace.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Amina Bello',
    role: 'Knotless Braids & Extensions Artisan',
    experience: '9+ Years Experience',
    rating: 5.0,
    specialties: ['Knotless Box Braids', 'Cornrows & Custom Pattern'],
    bio: 'Renowned for gentle tension-free knotless braiding techniques and protective styling.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Tunde Adebayo',
    role: 'Master Barber & Cut Architect',
    experience: '12+ Years Experience',
    rating: 4.9,
    specialties: ['Precision Skin Fade & Cut', 'Beard Trim & Sculpting'],
    bio: 'Specializing in precision hair geometry and classic tailored cuts for executive clients.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
];

export const Experts = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(DEFAULT_TEAM);

  useEffect(() => {
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const registeredTeam = data.map((spec) => {
            const fullName = `${spec.firstname || ''} ${spec.lastname || ''}`.trim() || 'Style Specialist';
            const specialtiesList = Array.isArray(spec.services)
              ? spec.services
              : (spec.services ? String(spec.services).split(',').map((s) => s.trim()) : ['Custom Styling']);
            return {
              name: fullName,
              role: 'Certified Style Specialist',
              experience: 'Verified Atelier Expert',
              rating: 5.0,
              specialties: specialtiesList,
              bio: `Expert stylist specialized in ${specialtiesList.join(', ')}.`,
              image: spec.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            };
          });

          // Avoid duplicating default team members if registered with same name
          const existingNames = new Set(registeredTeam.map((t) => t.name.toLowerCase()));
          const filteredDefault = DEFAULT_TEAM.filter((d) => !existingNames.has(d.name.toLowerCase()));
          setTeam([...registeredTeam, ...filteredDefault]);
        }
      })
      .catch((err) => console.warn('Could not fetch dynamic specialists:', err.message));
  }, []);

  return (
    <PageContainer title="Our Expert Team">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {team.map((m, idx) => (
          <div key={idx} className="app-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <img
                src={m.image}
                alt={m.name}
                loading="lazy"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  objectFit: 'cover',
                  border: '1.5px solid rgba(212, 175, 55, 0.4)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                }}
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717' }}>
                    {m.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d4af37', fontSize: '0.82rem', fontWeight: 800 }}>
                    <Star size={13} fill="#d4af37" />
                    <span>{m.rating}</span>
                  </div>
                </div>

                <p style={{ color: '#d4af37', fontSize: '0.82rem', fontFamily: 'Outfit', fontWeight: 700 }}>
                  {m.role}
                </p>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{m.experience}</span>
              </div>
            </div>

            <p style={{ color: '#4b5563', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '0.85rem' }}>
              {m.bio}
            </p>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {m.specialties.map((spec, i) => (
                <span
                  key={i}
                  style={{
                    background: '#faf9f6',
                    border: '1px solid var(--color-border)',
                    fontSize: '0.72rem',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    color: '#171717',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '50px',
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
                style={{ flex: 1, minHeight: '44px', fontSize: '0.82rem' }}
              >
                <span>View Profile</span>
              </button>

              <button
                onClick={() => navigate(`/booking?stylist=${encodeURIComponent(m.name.split(' ')[0])}`)}
                className="app-btn app-btn-primary"
                style={{ flex: 1, minHeight: '44px', fontSize: '0.82rem' }}
              >
                <Calendar size={15} />
                <span>Book Session</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};
