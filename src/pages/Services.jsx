import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ChevronRight, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { preloadRoute } from '../App';

const SERVICE_CATEGORIES = ['All', 'Hair', 'Nails', 'Braids', 'Skincare', 'Makeup'];

const SERVICES_LIST = [
  {
    id: 'hair_styling',
    title: 'Hair Styling',
    category: 'Hair',
    price: 'From ₦5,000',
    numericPrice: 5000,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=300&q=80',
    desc: 'Wash, blow dry, straightening, hot oil treatments and silk presses.',
  },
  {
    id: 'nail_care',
    title: 'Nail Care',
    category: 'Nails',
    price: 'From ₦3,000',
    numericPrice: 3000,
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=300&q=80',
    desc: 'Manicure, pedicure, acrylic extensions and 3D gel nail art.',
  },
  {
    id: 'braiding',
    title: 'Braiding',
    category: 'Braids',
    price: 'From ₦4,000',
    numericPrice: 4000,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
    desc: 'Cornrows, box braids, knotless braids, twist and faux locs.',
  },
  {
    id: 'skincare',
    title: 'Skincare',
    category: 'Skincare',
    price: 'From ₦6,000',
    numericPrice: 6000,
    image: 'https://images.unsplash.com/photo-1512290900672-1f5be50c76ba?auto=format&fit=crop&w=300&q=80',
    desc: 'Hydra facials, deep exfoliation, blackhead extraction and skin glow therapy.',
  },
  {
    id: 'makeup',
    title: 'Makeup',
    category: 'Makeup',
    price: 'From ₦8,000',
    numericPrice: 8000,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=300&q=80',
    desc: 'Bridal glam, soft natural beat, photoshoot makeup and brow sculpting.',
  },
  {
    id: 'barbering',
    title: 'Precision Barbing',
    category: 'Hair',
    price: 'From ₦5,000',
    numericPrice: 5000,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=300&q=80',
    desc: 'Sharp fades, line-ups, beard trimming & hot towel royal grooming.',
  },
];

export const Services = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = SERVICE_CATEGORIES;

  const filteredServices = useMemo(() => {
    return SERVICES_LIST.filter((s) => {
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <PageContainer showBack={true} onOpenAiMatcher={() => navigate('/ai-matcher')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        
        {/* Screen Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
              Services
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
              Professional beauty & grooming services, tailored for you.
            </p>
          </div>

          <button
            onClick={() => navigate('/ai-matcher')}
            onMouseEnter={() => preloadRoute('/ai-matcher')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.15) 0%, rgba(245, 185, 66, 0.05) 100%)',
              border: '1.5px solid rgba(245, 185, 66, 0.45)',
              borderRadius: '50px',
              padding: '0.5rem 0.9rem',
              color: '#f5b942',
              fontFamily: 'Outfit',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              minHeight: '44px',
              touchAction: 'manipulation',
            }}
          >
            <Sparkles size={15} />
            <span>AI Matcher</span>
          </button>
        </div>

        {/* Search Bar + Filter Icon (Directs to Experts Directory) */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div className="search-pill-container" style={{ flex: 1 }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              className="search-pill-input"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => navigate('/experts')}
            onMouseEnter={() => preloadRoute('/experts')}
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#171a25',
              color: '#f5b942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
            title="Browse Specialists Directory"
            aria-label="Browse Specialists Directory"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* AI Specialist Matcher Feature Banner (Directs to /ai-matcher) */}
        <div
          onClick={() => navigate('/ai-matcher')}
          onMouseEnter={() => preloadRoute('/ai-matcher')}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 185, 66, 0.12) 0%, rgba(20, 24, 34, 0.95) 100%)',
            border: '1px solid rgba(245, 185, 66, 0.35)',
            borderRadius: '18px',
            padding: '1rem 1.15rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease, transform 0.2s ease',
            touchAction: 'manipulation',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(245, 185, 66, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f5b942',
                flexShrink: 0,
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.15rem' }}>
                Unsure which service to pick?
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.76rem', margin: 0 }}>
                Let our AI Matcher pair your look with verified artists.
              </p>
            </div>
          </div>
          <span
            style={{
              color: '#f5b942',
              fontSize: '0.8rem',
              fontWeight: 800,
              fontFamily: 'Outfit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Match Now →
          </span>
        </div>

        {/* Category Pills Scroll */}
        <div
          style={{
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '0.2rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services List - Direct Navigation to Booking Page */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredServices.map((s) => (
            <div
              key={s.id}
              onClick={() => navigate(`/booking?service=${encodeURIComponent(s.title)}`)}
              onMouseEnter={() => preloadRoute('/booking')}
              style={{
                background: '#151822',
                borderRadius: '16px',
                padding: '0.85rem 1rem',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
                touchAction: 'manipulation',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0, marginRight: '0.5rem' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    backgroundColor: '#1c202d',
                    flexShrink: 0,
                  }}
                >
                  <OptimizedImage
                    src={s.image}
                    alt={s.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.82rem', color: '#f5b942', fontWeight: 800, fontFamily: 'Outfit' }}>
                      {s.price}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>•</span>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      {s.category}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/booking?service=${encodeURIComponent(s.title)}`);
                  }}
                  className="app-btn app-btn-accent"
                  style={{
                    minHeight: '38px',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.76rem',
                    borderRadius: '12px',
                    touchAction: 'manipulation',
                  }}
                >
                  Book Now
                </button>
                <ChevronRight size={18} color="#64748b" />
              </div>
            </div>
          ))}

          {filteredServices.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
              <p>No services match "{searchQuery}".</p>
            </div>
          )}
        </div>

      </div>
    </PageContainer>
  );
};
