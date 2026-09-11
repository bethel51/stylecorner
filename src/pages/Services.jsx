import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Sparkles, Clock, Check, Calendar } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { preloadRoute } from '../App';

export const Services = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Hair & Braids', 'Wigs', 'Barbing', 'Lashes & Nails'];

  const servicesList = [
    {
      id: 'nail_tech',
      title: 'Nail Tech',
      category: 'Lashes & Nails',
      price: 18000,
      duration: '60 mins',
      desc: 'Acrylic nail extensions, full gel set architecture, 3D nail art, and cuticle restoration.',
    },
    {
      id: 'lash_tech',
      title: 'Lash Tech',
      category: 'Lashes & Nails',
      price: 20000,
      duration: '60 mins',
      desc: 'Classic, hybrid, and volume lash extensions using lightweight, hypoallergenic silk fibers.',
    },
    {
      id: 'hair_braider',
      title: 'Hair Braider',
      category: 'Hair & Braids',
      price: 35000,
      duration: '120 mins',
      desc: 'Tension-free knotless box braids, goddess braids, cornrows, and loc maintenance.',
    },
    {
      id: 'hair_barber',
      title: 'Hair Barber',
      category: 'Barbing',
      price: 8000,
      duration: '30 mins',
      desc: 'Precision fades, line-ups, beard sculpting, edge-ups & shape-ups by a certified barber.',
    },
    {
      id: 'frontal_wig_install',
      title: 'Frontal Wig Installation',
      category: 'Wigs',
      price: 25000,
      duration: '90 mins',
      desc: 'Flawless frontal & closure wig installation, lace melting, bleaching knots and custom styling.',
    },
    {
      id: 'manicure_pedicure',
      title: 'Manicure plus Pedicure',
      category: 'Lashes & Nails',
      price: 22000,
      duration: '75 mins',
      desc: 'Complete spa hand & foot soak, callus removal, relaxing massage, cuticle care, and gel finish.',
    },
    {
      id: 'wig_revamper',
      title: 'Wig Revamper',
      category: 'Wigs',
      price: 15000,
      duration: '60 mins',
      desc: 'Complete wig washing, deep conditioning treatment, lace replacement, and restyling.',
    },
  ];

  const filteredServices = activeCategory === 'All'
    ? servicesList
    : servicesList.filter(s => s.category === activeCategory);

  return (
    <PageContainer title="Our Signature Services">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '50px',
                fontFamily: 'Outfit',
                fontWeight: 800,
                fontSize: '0.8rem',
                border: activeCategory === cat ? 'none' : '1px solid var(--color-border)',
                background: activeCategory === cat ? '#171717' : '#ffffff',
                color: activeCategory === cat ? '#d4af37' : '#6b7280',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredServices.map((s) => (
            <div key={s.id} className="app-card" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span
                    style={{
                      fontFamily: 'Outfit',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      color: '#d4af37',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {s.category}
                  </span>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#171717', margin: '0.1rem 0' }}>
                    {s.title}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 900, color: '#171717' }}>
                    ₦{Number(s.price).toLocaleString()}
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6b7280' }}>
                    <Clock size={12} /> {s.duration}
                  </span>
                </div>
              </div>

              <p style={{ color: '#4b5563', fontSize: '0.84rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                {s.desc}
              </p>

              <button
                onClick={() => navigate(`/booking?service=${encodeURIComponent(s.title)}`)}
                onMouseEnter={() => preloadRoute('/booking')}
                className="app-btn app-btn-accent"
                style={{ borderRadius: '12px', minHeight: '44px', fontSize: '0.85rem' }}
              >
                <Calendar size={16} />
                <span>Book This Service</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </PageContainer>
  );
};
