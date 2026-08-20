import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Sparkles, Clock, Check, Calendar } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';

export const Services = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Hair', 'Braids', 'Nails', 'Grooming'];

  const servicesList = [
    {
      id: 'h1',
      title: 'Precision Skin Fade & Cut',
      category: 'Hair',
      price: 45,
      duration: '45 mins',
      desc: 'Master barber haircut including sharp hot towel finish and scalp massage.',
    },
    {
      id: 'h2',
      title: 'Beard Trim & Sculpting',
      category: 'Grooming',
      price: 30,
      duration: '30 mins',
      desc: 'Precision razor edging, organic beard oil conditioning, and thermal hot towel.',
    },
    {
      id: 'b1',
      title: 'Knotless Box Braids',
      category: 'Braids',
      price: 120,
      duration: '120 mins',
      desc: 'Lightweight tension-free knotless box braids customized to your length preference.',
    },
    {
      id: 'b2',
      title: 'Cornrows & Custom Pattern',
      category: 'Braids',
      price: 85,
      duration: '90 mins',
      desc: 'Intricate scalp braid art and custom geometry styling by expert braiding tech.',
    },
    {
      id: 'n1',
      title: 'Full Gel Nail Architecture',
      category: 'Nails',
      price: 55,
      duration: '60 mins',
      desc: 'Nail shape sculpting, cuticle care, custom gel shade and high-gloss top coat.',
    },
    {
      id: 'n2',
      title: 'Luxury Pedicure Session',
      category: 'Nails',
      price: 50,
      duration: '45 mins',
      desc: 'Exfoliating foot soak, deep massage, nail shaping and polish finish.',
    },
    {
      id: 'g1',
      title: 'Full Atelier Grooming Combo',
      category: 'Grooming',
      price: 110,
      duration: '105 mins',
      desc: 'The complete executive session: Haircut, beard treatment, and mini facial treatment.',
    },
  ];

  const filtered =
    activeCategory === 'All'
      ? servicesList
      : servicesList.filter((s) => s.category === activeCategory);

  const handleBookService = (serviceTitle) => {
    navigate(`/booking?service=${encodeURIComponent(serviceTitle)}`);
  };

  return (
    <PageContainer title="Services Menu">
      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1rem',
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '50px',
              border: activeCategory === cat ? 'none' : '1px solid var(--color-border)',
              background: activeCategory === cat ? '#171717' : '#ffffff',
              color: activeCategory === cat ? '#d4af37' : '#6b7280',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filtered.map((s) => (
          <div key={s.id} className="app-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    color: '#d4af37',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {s.category}
                </span>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: t.text, marginTop: '0.2rem' }}>
                  {s.title}
                </h3>
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: t.text }}>
                ${s.price}
              </div>
            </div>

            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.5rem 0 0.85rem', lineHeight: 1.5 }}>
              {s.desc}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>
                <Clock size={14} color="#d4af37" />
                <span>{s.duration}</span>
              </div>

              <button
                onClick={() => handleBookService(s.title)}
                className="app-btn app-btn-primary"
                style={{ width: 'auto', minHeight: '38px', padding: '0.4rem 1rem', fontSize: '0.82rem' }}
              >
                <Calendar size={14} />
                <span>Book This</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};
