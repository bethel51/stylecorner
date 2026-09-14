import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Heart, Users } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { Avatar } from '../components/common/Avatar';
import { SkeletonGrid } from '../components/common/SkeletonLoader';
import { preloadRoute } from '../App';
import { api } from '../services/api';
import { getFavorites, toggleFavorite as toggleFavUtil, subscribeToFavorites } from '../utils/favorites';

const EXPERT_CATEGORIES = ['All', 'Hair', 'Nails', 'Braids', 'Makeup'];

export const Experts = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState(getFavorites());

  useEffect(() => {
    return subscribeToFavorites((newFavs) => {
      setFavorites({ ...newFavs });
    });
  }, []);

  const categories = EXPERT_CATEGORIES;

  useEffect(() => {
    setLoading(true);
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const verifiedStaff = data.filter((spec) => spec.role === 'staff' || spec.role === 'expert' || spec.isVerified === true);

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
              rating: spec.rating || 5.0,
              reviewsCount: `${spec.reviewsCount || 0}+`,
              image: spec.avatarUrl || spec.profileImage || '',
            };
          });

          setTeam(registeredTeam);
        } else {
          setTeam([]);
        }
      })
      .catch((err) => {
        console.warn('Specialists fetch notice:', err.message);
        setTeam([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    toggleFavUtil(id);
  };


  const filteredStylists = useMemo(() => {
    return team.filter((s) => {
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [team, activeCategory, searchQuery]);

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

        {/* Loading Skeletons */}
        {loading && <SkeletonGrid count={4} height={230} />}

        {/* 2-Column Grid matching Screen 3 */}
        {!loading && filteredStylists.length > 0 && (
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
                <Avatar
                  src={stylist.image}
                  name={stylist.name}
                  size={135}
                  borderRadius="14px"
                  fontSize="2.2rem"
                  style={{ width: '100%', height: '100%' }}
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
      )}

      {!loading && filteredStylists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#151822', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '1rem' }}>
            <Users size={36} color="#f5b942" style={{ opacity: 0.8, marginBottom: '0.65rem' }} />
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem', fontSize: '1rem' }}>
              {searchQuery ? `No stylists found for "${searchQuery}"` : 'No Specialists Found'}
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
              {searchQuery ? 'Try searching for a different name or specialty.' : 'Check back soon for available stylists in this category.'}
            </p>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
