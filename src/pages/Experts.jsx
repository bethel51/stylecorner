import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Heart } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { preloadRoute } from '../App';
import { api } from '../services/api';

const DEFAULT_STYLISTS = [
  {
    id: 's-1',
    name: 'Zainab A.',
    category: 'Hair',
    specialty: 'Hair Stylist',
    rating: 4.9,
    reviewsCount: '200+',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's-2',
    name: 'Tomi B.',
    category: 'Nails',
    specialty: 'Nail Technician',
    rating: 4.8,
    reviewsCount: '195+',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's-3',
    name: 'Blessing E.',
    category: 'Braids',
    specialty: 'Braider',
    rating: 4.9,
    reviewsCount: '160+',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's-4',
    name: 'Dami S.',
    category: 'Makeup',
    specialty: 'Makeup Artist',
    rating: 4.7,
    reviewsCount: '76+',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's-5',
    name: 'Amina K.',
    category: 'Hair',
    specialty: 'Wig Artist',
    rating: 5.0,
    reviewsCount: '110+',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's-6',
    name: 'Chioma N.',
    category: 'Braids',
    specialty: 'Master Braider',
    rating: 4.9,
    reviewsCount: '240+',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
  },
];

export const Experts = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState({});

  const categories = ['All', 'Hair', 'Nails', 'Braids', 'Makeup'];

  useEffect(() => {
    setLoading(true);
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const verifiedStaff = data.filter((spec) => spec.role === 'staff' || spec.isVerified === true);

          const registeredTeam = verifiedStaff.map((spec) => {
            const fullName = `${spec.firstname || ''} ${spec.lastname || ''}`.trim() || 'Verified Specialist';
            const specialtiesList = Array.isArray(spec.services)
              ? spec.services.map((s) => typeof s === 'object' ? (s.name || s.title || 'Specialist Service') : String(s)).filter(Boolean)
              : (spec.services ? String(spec.services).split(',').map((s) => s.trim()).filter(Boolean) : ['Hair Stylist']);
            
            const firstSpec = specialtiesList[0] || 'Hair Stylist';
            let category = 'Hair';
            if (firstSpec.toLowerCase().includes('nail')) category = 'Nails';
            else if (firstSpec.toLowerCase().includes('braid')) category = 'Braids';
            else if (firstSpec.toLowerCase().includes('makeup')) category = 'Makeup';

            return {
              id: spec._id,
              name: fullName,
              category: category,
              specialty: spec.title || firstSpec,
              rating: spec.rating || 4.9,
              reviewsCount: `${spec.reviewsCount || 150}+`,
              image: spec.avatarUrl || spec.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            };
          });

          if (registeredTeam.length > 0) {
            setTeam(registeredTeam);
          } else {
            setTeam(DEFAULT_STYLISTS);
          }
        } else {
          setTeam(DEFAULT_STYLISTS);
        }
      })
      .catch(() => {
        setTeam(DEFAULT_STYLISTS);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredStylists = team.filter((s) => {
    const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageContainer showBack={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        
        {/* Screen 3: Header */}
        <div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
            Top Stylists
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
            Find the perfect stylist for your look.
          </p>
        </div>

        {/* Search Bar + Filter Icon */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div className="search-pill-container" style={{ flex: 1 }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              className="search-pill-input"
              placeholder="Search stylists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: '#171a25',
              color: '#f5b942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Filter"
            aria-label="Filter"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Category Pills */}
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

        {/* 2-Column Grid matching Screen 3 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.85rem',
          }}
        >
          {filteredStylists.map((stylist) => (
            <div
              key={stylist.id}
              onClick={() => navigate(`/expert-profile?name=${encodeURIComponent(stylist.name)}`)}
              onMouseEnter={() => preloadRoute('/expert-profile')}
              style={{
                background: '#151822',
                borderRadius: '18px',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
                position: 'relative',
              }}
            >
              {/* Image with Heart Favorite Icon */}
              <div
                style={{
                  width: '100%',
                  height: '135px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  position: 'relative',
                  marginBottom: '0.65rem',
                  backgroundColor: '#1c202d',
                }}
              >
                <OptimizedImage
                  src={stylist.image}
                  alt={stylist.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  onClick={(e) => toggleFavorite(stylist.id, e)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(6px)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: favorites[stylist.id] ? '#ef4444' : '#ffffff',
                  }}
                  aria-label="Favorite"
                >
                  <Heart
                    size={15}
                    fill={favorites[stylist.id] ? '#ef4444' : 'none'}
                    strokeWidth={favorites[stylist.id] ? 0 : 2}
                  />
                </button>
              </div>

              {/* Stylist Details */}
              <h3
                style={{
                  fontFamily: 'Outfit',
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 0.2rem',
                }}
              >
                {stylist.name}
              </h3>

              {/* Star Rating & Review Count */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.74rem',
                  marginBottom: '0.2rem',
                }}
              >
                <Star size={12} fill="#f5b942" color="#f5b942" />
                <span style={{ fontWeight: 800, color: '#f5b942' }}>{stylist.rating}</span>
                <span style={{ color: '#94a3b8' }}>({stylist.reviewsCount})</span>
              </div>

              {/* Specialty Tag */}
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  margin: '0 0 0.75rem',
                  fontFamily: 'Outfit',
                }}
              >
                {stylist.specialty}
              </p>

              {/* Solid Gold "Book Now" Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/booking?stylist=${encodeURIComponent(stylist.name.split(' ')[0])}`);
                }}
                className="app-btn app-btn-accent"
                style={{
                  minHeight: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  padding: '0 0.5rem',
                  marginTop: 'auto',
                }}
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

        {filteredStylists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
            <p>No stylists found for "{searchQuery}".</p>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
