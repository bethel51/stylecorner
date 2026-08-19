import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Star, Calendar, Award } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';

export const Experts = () => {
  const navigate = useNavigate();

  const team = [
    {
      name: 'Julian Reed',
      role: 'Master Barber & Haircut Architect',
      experience: '12+ Years Experience',
      rating: 4.9,
      specialties: ['Skin Fades', 'Hot Towel Razor Shave', 'Textured Crops'],
      bio: 'Specializing in precision hair geometry and classic tailored cuts for executive clients.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Elena Thorne',
      role: 'Braiding & Extensions Artisan',
      experience: '9+ Years Experience',
      rating: 5.0,
      specialties: ['Knotless Box Braids', 'Wig Installation', 'Scalp Care'],
      bio: 'Renowned for gentle tension-free knotless braiding techniques and protective styling.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Marcus Grey',
      role: 'Nail Architect & Pedicure Tech',
      experience: '7+ Years Experience',
      rating: 4.8,
      specialties: ['Gel Sculpting', 'Luxury Foot Spa', 'Nail Artistry'],
      bio: 'Creating immaculate nail shapes, custom color gels, and soothing therapeutic foot treatments.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  ];

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

            <button
              onClick={() => navigate(`/booking?stylist=${encodeURIComponent(m.name.split(' ')[0])}`)}
              className="app-btn app-btn-primary"
            >
              <Calendar size={16} />
              <span>Book Session with {m.name.split(' ')[0]}</span>
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};
