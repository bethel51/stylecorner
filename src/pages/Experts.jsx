import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Heart, Users, Sparkles } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { Avatar } from '../components/common/Avatar';
import { SkeletonGrid } from '../components/common/SkeletonLoader';
import { preloadRoute } from '../App';
import { api } from '../services/api';
import { getFavorites, toggleFavorite as toggleFavUtil, subscribeToFavorites } from '../utils/favorites';

export const EXPERT_CATEGORIES = [
  'All',
  'Lash Tech',
  'Nail Tech',
  'Hair Braider & Stylist',
  'Barber',
  'Makeup Artist',
  'Wig Installer & Revamper',
];

const CATEGORY_MAP = {
  lash_tech: 'Lash Tech',
  nail_tech: 'Nail Tech',
  hair_braider: 'Hair Braider & Stylist',
  barber: 'Barber',
  makeup_artist: 'Makeup Artist',
  wig_installer: 'Wig Installer & Revamper',
};

export const Experts = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(() => {
    if (categoryParam) {
      return CATEGORY_MAP[categoryParam] || categoryParam;
    }
    return 'All';
  });
  const [favorites, setFavorites] = useState(getFavorites());

  // Sync category param if URL changes
  useEffect(() => {
    if (categoryParam) {
      const mapped = CATEGORY_MAP[categoryParam] || categoryParam;
      if (EXPERT_CATEGORIES.includes(mapped)) {
        setActiveCategory(mapped);
      }
    }
  }, [categoryParam]);

  useEffect(() => {
    return subscribeToFavorites((newFavs) => {
      setFavorites({ ...newFavs });
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const verifiedStaff = data.filter((spec) => spec.role === 'staff' || spec.role === 'expert' || spec.isVerified === true);

          const registeredTeam = verifiedStaff.map((spec) => {
            const fullName = `${spec.firstname || ''} ${spec.lastname || ''}`.trim() || 'Verified Specialist';
            
            // Extract raw service strings
            const rawServices = Array.isArray(spec.services)
              ? spec.services.map((s) => (typeof s === 'object' ? (s.name || s.title || '') : String(s)))
              : (spec.services ? String(spec.services).split(',').map((s) => s.trim()) : []);
            
            const combinedText = [spec.title || '', ...rawServices].join(' ').toLowerCase();

            // Detect matched categories
            const detectedCategories = [];
            if (combinedText.includes('lash')) detectedCategories.push('Lash Tech');
            if (combinedText.includes('nail') || combinedText.includes('manicure') || combinedText.includes('pedicure')) detectedCategories.push('Nail Tech');
            if (combinedText.includes('braid') || combinedText.includes('twist') || combinedText.includes('stylist') || combinedText.includes('hair braider')) detectedCategories.push('Hair Braider & Stylist');
            if (combinedText.includes('barber') || combinedText.includes('fade') || combinedText.includes('beard') || combinedText.includes('barbing')) detectedCategories.push('Barber');
            if (combinedText.includes('makeup') || combinedText.includes('glam') || combinedText.includes('beat')) detectedCategories.push('Makeup Artist');
            if (combinedText.includes('wig') || combinedText.includes('frontal') || combinedText.includes('revamp') || combinedText.includes('lace')) detectedCategories.push('Wig Installer & Revamper');

            // Default fallback if no category matched
            if (detectedCategories.length === 0) {
              detectedCategories.push('Hair Braider & Stylist');
            }

            const firstSpec = rawServices[0] || spec.title || detectedCategories[0];

            return {
              id: spec._id,
              name: fullName,
              categories: detectedCategories,
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

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    // Find reverse key for URL query
    const reverseKey = Object.keys(CATEGORY_MAP).find((k) => CATEGORY_MAP[k] === cat);
    if (reverseKey) {
      setSearchParams({ category: reverseKey });
    } else {
      setSearchParams({});
    }
  };

  const filteredStylists = useMemo(() => {
    return team.filter((s) => {
      const matchesCategory =
        activeCategory === 'All' ||
        (Array.isArray(s.categories) && s.categories.includes(activeCategory));
      const matchesSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(s.categories) && s.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [team, activeCategory, searchQuery]);

  return (
    <PageContainer showBack={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
              Verified Specialists
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
              {activeCategory === 'All' ? 'Browse all verified artisans' : `Showing registered ${activeCategory} specialists`}
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-matcher')}
            onMouseEnter={() => preloadRoute('/ai-matcher')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(245,185,66,0.18), rgba(245,185,66,0.06))',
              border: '1.5px solid rgba(245,185,66,0.45)', borderRadius: '50px',
              padding: '0.45rem 0.85rem', color: '#f5b942', fontFamily: 'Outfit',
              fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer', minHeight: '40px',
            }}
          >
            <Sparkles size={14} /><span>AI Match</span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
          <div className="search-pill-container" style={{ flex: 1 }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              className="search-pill-input"
              placeholder="Search specialists by name or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setActiveCategory('All')}
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
            title="Reset Filters"
            aria-label="Reset Filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* 6 Category Filter Chips */}
        <div
          style={{
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '0.35rem',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {EXPERT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {loading && <SkeletonGrid count={4} height={230} />}

        {/* Specialists Grid */}
        {!loading && filteredStylists.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
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
                  transition: 'all 0.18s ease',
                  position: 'relative',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(245,185,66,0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
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
                      background: 'rgba(0, 0, 0, 0.5)',
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
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    margin: '0 0 0.2rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
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
                    marginBottom: '0.25rem',
                  }}
                >
                  <Star size={12} fill="#f5b942" color="#f5b942" />
                  <span style={{ fontWeight: 800, color: '#f5b942' }}>{stylist.rating}</span>
                  <span style={{ color: '#94a3b8' }}>({stylist.reviewsCount})</span>
                </div>

                {/* Specialty Tag */}
                <p
                  style={{
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    margin: '0 0 0.75rem',
                    fontFamily: 'Outfit',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '2rem',
                  }}
                >
                  {stylist.specialty}
                </p>

                {/* Solid Gold "Book Now" Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/booking?stylist=${encodeURIComponent(stylist.name)}`);
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
                    touchAction: 'manipulation',
                  }}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredStylists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#151822', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', marginTop: '1rem' }}>
            <Users size={36} color="#f5b942" style={{ opacity: 0.8, marginBottom: '0.65rem' }} />
            <h4 style={{ fontFamily: 'Outfit', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem', fontSize: '1rem' }}>
              {searchQuery ? `No specialists found for "${searchQuery}"` : `No ${activeCategory} Specialists Available`}
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0 0 1rem' }}>
              Try switching category or clear search to find more specialists.
            </p>
            <button
              onClick={() => setActiveCategory('All')}
              className="app-btn app-btn-outline"
              style={{ borderRadius: '12px', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              View All Specialists
            </button>
          </div>
        )}

      </div>
    </PageContainer>
  );
};

export default Experts;
