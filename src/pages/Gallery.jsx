import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Heart } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';

export const Gallery = () => {
  const navigate = useNavigate();
  const [likes, setLikes] = useState({});

  const items = [
    { id: 1, title: 'Precision Burst Fade', category: 'Haircut', artisan: 'Julian Reed', likes: 142 },
    { id: 2, title: 'Knotless Boho Braids', category: 'Braids', artisan: 'Elena Thorne', likes: 218 },
    { id: 3, title: 'Matte Black Gel Nails', category: 'Nails', artisan: 'Marcus Grey', likes: 98 },
    { id: 4, title: 'Full Beard Sculpting', category: 'Grooming', artisan: 'Julian Reed', likes: 175 },
    { id: 5, title: 'Cornrow Crown Art', category: 'Braids', artisan: 'Elena Thorne', likes: 260 },
    { id: 6, title: 'French Tip Gel Pedicure', category: 'Nails', artisan: 'Marcus Grey', likes: 112 },
  ];

  const toggleLike = (id) => {
    setLikes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <PageContainer title="Style Portfolio Gallery">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {items.map((item) => {
          const isLiked = likes[item.id];
          return (
            <div key={item.id} className="app-card" style={{ marginBottom: 0, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div
                  style={{
                    height: '110px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1f1f1f, #121212)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#d4af37',
                    marginBottom: '0.75rem',
                    border: '1px solid rgba(212,175,55,0.3)',
                    position: 'relative',
                  }}
                >
                  <Sparkles size={28} />
                  <span style={{ fontSize: '0.72rem', fontFamily: 'Outfit', fontWeight: 800, marginTop: '0.4rem', color: '#ffffff' }}>
                    {item.category}
                  </span>

                  <button
                    onClick={() => toggleLike(item.id)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isLiked ? '#ef4444' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} />
                  </button>
                </div>

                <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717' }}>
                  {item.title}
                </h4>

                <p style={{ color: '#6b7280', fontSize: '0.78rem', marginTop: '0.2rem' }}>
                  By {item.artisan}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>
                  ❤️ {item.likes + (isLiked ? 1 : 0)}
                </span>
                <button
                  onClick={() => navigate('/booking')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d4af37',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Get This Style
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};
