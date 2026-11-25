import React, { useState, useEffect, useMemo } from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  Search,
  X,
  Eye,
  Calendar,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  ChevronRight,
  Share2,
  Check,
  Camera,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { api } from '../services/api';
import { getFavorites, toggleFavorite as toggleFavUtil, subscribeToFavorites } from '../utils/favorites';
import { SkeletonGrid } from '../components/common/SkeletonLoader';

export const Gallery = () => {
  const navigate = useNavigate();

  // Dynamic state loaded strictly from verified experts
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & search states
  const [activeCategory, setActiveCategory] = useState('All Styles');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Favorites state synced with app utility
  const [favorites, setFavorites] = useState(getFavorites());

  useEffect(() => {
    return subscribeToFavorites((newFavs) => {
      setFavorites({ ...newFavs });
    });
  }, []);

  // Fetch real uploaded pictures from verified experts only
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .getGalleryItems()
      .then((items) => {
        if (!isMounted) return;
        if (Array.isArray(items)) {
          // Strict filter: only items with valid image URLs
          const valid = items.filter((item) => item && typeof item.image === 'string' && item.image.trim().length > 0);
          setGalleryItems(valid);
        } else {
          setGalleryItems([]);
        }
      })
      .catch((err) => {
        console.warn('Gallery feed notice:', err.message);
        if (isMounted) setGalleryItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleLike = (e, item) => {
    e.stopPropagation();
    toggleFavUtil(item.id);
  };

  // Derive categories strictly from uploaded pictures
  const categories = useMemo(() => {
    if (!galleryItems || galleryItems.length === 0) return ['All Styles'];
    const unique = Array.from(new Set(galleryItems.map((i) => i.category).filter(Boolean)));
    return ['All Styles', ...unique];
  }, [galleryItems]);

  // Filtered styles based on category & search query
  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchCategory =
        activeCategory === 'All Styles' ||
        (item.category && item.category.toLowerCase() === activeCategory.toLowerCase());

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.stylist && item.stylist.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.desc && item.desc.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [galleryItems, activeCategory, searchQuery]);

  const handleBookStyle = (style) => {
    if (!style) return;
    const params = new URLSearchParams();
    if (style.expertId) params.set('stylistId', style.expertId);
    if (style.stylist) params.set('stylist', style.stylist);
    if (style.category && style.category !== 'General') params.set('service', style.category);
    navigate(`/booking?${params.toString()}`);
  };

  const handleShareLook = async (style) => {
    if (!style) return;
    const shareUrl = `${window.location.origin}/gallery?look=${style.id}`;
    if (navigator.share && navigator.canShare && navigator.canShare({ url: shareUrl })) {
      try {
        await navigator.share({
          title: `StyleCorner — ${style.title}`,
          text: `Check out ${style.title} by ${style.stylist} on StyleCorner!`,
          url: shareUrl,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <PageContainer title="Lookbook">
      <SEOHead
        title="Atelier Lookbook & Verified Work | StyleCorner"
        description="Browse genuine hairstyles, haircuts, nail sets, and beauty looks uploaded by verified beauty professionals in Lagos and Ibadan."
        canonicalPath="/gallery"
        keywords="verified stylist work, lookbook Lagos, barbers lookbook Ibadan, genuine hair portfolio, verified specialists"
      />

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {/* Sleek, Mobile-Optimized Header Banner */}
        <div
          style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            padding: '1.25rem 1.15rem',
            background: 'linear-gradient(135deg, rgba(21,24,34,0.96) 0%, rgba(12,14,20,0.98) 100%)',
            border: '1px solid rgba(245,185,66,0.35)',
            boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
            marginBottom: '1rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(245,185,66,0.12)',
                border: '1px solid rgba(245,185,66,0.3)',
                borderRadius: '50px',
                padding: '0.25rem 0.75rem',
                marginBottom: '0.65rem',
              }}
            >
              <Sparkles size={13} color="#f5b942" />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#f5b942',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                Verified Lookbook
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.35rem, 5vw, 2rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.2,
                margin: '0 0 0.45rem',
              }}
            >
              Real Work by{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #f5b942 0%, #ffd57e 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Verified Experts
              </span>
            </h1>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '0.82rem',
                lineHeight: 1.5,
                margin: '0 0 0.85rem',
                maxWidth: '600px',
              }}
            >
              Only authentic styles photographed and uploaded directly by verified beauty artisans across Lagos & Ibadan.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldCheck size={14} color="#22c55e" />
                <span>100% Escrow Protected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={13} color="#f5b942" />
                <span>Lagos & Ibadan</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Camera size={13} color="#f5b942" />
                <span>{galleryItems.length} Uploaded {galleryItems.length === 1 ? 'Look' : 'Looks'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar - Fixed width, no horizontal clip */}
        <div
          style={{
            position: 'relative',
            marginBottom: '0.85rem',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#151822',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.3rem 0.75rem',
              boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <Search size={16} color="#94a3b8" style={{ flexShrink: 0, marginRight: '0.5rem' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styles or locations..."
              style={{
                width: '100%',
                minWidth: 0,
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.84rem',
                padding: '0.4rem 0',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.2rem',
                  flexShrink: 0,
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider - Only shown if real categories exist */}
        {categories.length > 1 && (
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingBottom: '0.4rem',
              marginBottom: '1.25rem',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
            }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '0.42rem 0.9rem',
                    borderRadius: '50px',
                    fontSize: '0.74rem',
                    fontWeight: isActive ? 800 : 600,
                    fontFamily: 'Outfit, sans-serif',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    backgroundColor: isActive ? '#f5b942' : '#151822',
                    color: isActive ? '#0c0e14' : '#cbd5e1',
                    border: isActive ? '1px solid #f5b942' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isActive ? '0 3px 12px rgba(245,185,66,0.3)' : 'none',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ padding: '2rem 0' }}>
            <SkeletonGrid count={4} columns={2} />
          </div>
        ) : galleryItems.length === 0 ? (
          /* ── STRICT EMPTY STATE: No dummy photos. Only verified uploads allowed ── */
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#151822',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              marginTop: '0.5rem',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245,185,66,0.1)',
                border: '1px solid rgba(245,185,66,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: '#f5b942',
              }}
            >
              <Camera size={30} />
            </div>

            <h3
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 0.5rem',
              }}
            >
              No Lookbook Photos Uploaded Yet
            </h3>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                maxWidth: '460px',
                margin: '0 auto 1.5rem',
              }}
            >
              Verified specialists will showcase their authentic style transformations here once uploaded to their portfolios.
            </p>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => navigate('/expert/portfolio')}
                style={{
                  background: 'linear-gradient(135deg, #f5b942, #d4af37)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#0c0e14',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 14px rgba(245,185,66,0.3)',
                }}
              >
                <Upload size={14} />
                <span>Are You an Expert? Upload Lookbook</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/experts')}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  padding: '0.65rem 1.15rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontFamily: 'Outfit, sans-serif',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>Browse Verified Experts</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Search yielded no matches */
          <div
            style={{
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#151822',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Sparkles size={32} color="#f5b942" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', color: '#ffffff', margin: '0 0 0.4rem' }}>
              No Styles Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 1rem' }}>
              No uploaded styles match "{searchQuery}".
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All Styles');
                setSearchQuery('');
              }}
              style={{
                background: 'linear-gradient(135deg, #f5b942, #d4af37)',
                border: 'none',
                borderRadius: '50px',
                padding: '0.5rem 1.15rem',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0c0e14',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* ── REAL UPLOADED WORK FROM VERIFIED EXPERTS ── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {filteredItems.map((item) => {
              const isLiked = Boolean(favorites[item.id]);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedStyle(item)}
                  style={{
                    backgroundColor: '#151822',
                    borderRadius: '18px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.3)',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Photo Header */}
                  <div
                    style={{
                      position: 'relative',
                      height: '210px',
                      overflow: 'hidden',
                      backgroundColor: '#0c0e14',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 25%',
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(21,24,34,0.95) 0%, rgba(21,24,34,0.2) 50%, transparent 100%)',
                      }}
                    />

                    {/* Top Badges */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        right: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        zIndex: 2,
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: 'rgba(12,14,20,0.85)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: '1px solid rgba(245,185,66,0.35)',
                          color: '#f5b942',
                          borderRadius: '50px',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.66rem',
                          fontWeight: 800,
                          fontFamily: 'Outfit, sans-serif',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.category}
                      </span>

                      {/* Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleLike(e, item)}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(12,14,20,0.85)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: isLiked ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: isLiked ? '#ef4444' : '#ffffff',
                        }}
                      >
                        <Heart size={14} fill={isLiked ? '#ef4444' : 'none'} />
                      </button>
                    </div>

                    {/* Bottom Photo Title Info */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '12px',
                        right: '12px',
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          color: '#ffffff',
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '0.95rem',
                          fontWeight: 800,
                          lineHeight: 1.25,
                        }}
                      >
                        {item.title}
                      </div>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div
                    style={{
                      padding: '0.85rem 1rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div>
                      {/* Stylist & Location */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <span
                          style={{
                            color: '#cbd5e1',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            fontFamily: 'Outfit, sans-serif',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          By {item.stylist}
                        </span>

                        {item.duration && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              color: '#94a3b8',
                              fontSize: '0.68rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <Clock size={11} />
                            <span>{item.duration}</span>
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#94a3b8',
                          fontSize: '0.72rem',
                          marginBottom: '0.65rem',
                        }}
                      >
                        <MapPin size={11} color="#f5b942" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.location}
                        </span>
                      </div>

                      {item.desc && (
                        <p
                          style={{
                            fontSize: '0.74rem',
                            color: '#94a3b8',
                            lineHeight: 1.4,
                            margin: '0 0 0.65rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {item.desc}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.65rem',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        marginTop: '0.35rem',
                      }}
                    >
                      <div>
                        {item.price > 0 ? (
                          <>
                            <div style={{ fontSize: '0.58rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                              Starting from
                            </div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#f5b942', fontFamily: 'Outfit' }}>
                              ₦{item.price.toLocaleString()}
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f5b942', fontFamily: 'Outfit' }}>
                            {item.displayPrice || 'Book Session'}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStyle(item);
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.72rem',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                          }}
                          title="Inspect Style"
                        >
                          <Eye size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookStyle(item);
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #f5b942, #d4af37)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            color: '#0c0e14',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                            fontFamily: 'Outfit, sans-serif',
                            boxShadow: '0 2px 8px rgba(245,185,66,0.3)',
                          }}
                        >
                          <span>Book</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── QUICK VIEW DETAIL MODAL ─── */}
      {selectedStyle && (
        <div
          onClick={() => setSelectedStyle(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 6, 8, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#10131b',
              border: '1px solid rgba(245, 185, 66, 0.4)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#151822',
              }}
            >
              <span
                style={{
                  backgroundColor: 'rgba(245,185,66,0.15)',
                  border: '1px solid rgba(245,185,66,0.35)',
                  color: '#f5b942',
                  borderRadius: '50px',
                  padding: '0.2rem 0.6rem',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                }}
              >
                {selectedStyle.category}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => handleShareLook(selectedStyle)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: copiedLink ? '#4ade80' : '#ffffff',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Share Look"
                >
                  {copiedLink ? <Check size={13} /> : <Share2 size={13} />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStyle(null)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <div style={{ position: 'relative', height: '240px', width: '100%', backgroundColor: '#0c0e14' }}>
                <img
                  src={selectedStyle.image}
                  alt={selectedStyle.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(to top, rgba(16,19,27,0.95) 0%, rgba(16,19,27,0.2) 60%, transparent 100%)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '14px',
                    right: '14px',
                  }}
                >
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Outfit' }}>
                    {selectedStyle.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#f5b942', fontWeight: 700, marginTop: '0.2rem' }}>
                    By {selectedStyle.stylist} • {selectedStyle.studio}
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.15rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#cbd5e1', fontSize: '0.76rem' }}>
                    <MapPin size={13} color="#f5b942" />
                    <span>{selectedStyle.location}</span>
                  </div>
                  {selectedStyle.duration && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#94a3b8', fontSize: '0.72rem' }}>
                      <Clock size={12} />
                      <span>{selectedStyle.duration}</span>
                    </div>
                  )}
                </div>

                {selectedStyle.desc && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f5b942', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                      Style Details
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                      {selectedStyle.desc}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.72rem', fontWeight: 700 }}>
                  <ShieldCheck size={14} />
                  <span>100% Escrow Protection: Funds released only after appointment completion</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div
              style={{
                padding: '0.75rem 1.15rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: '#151822',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {selectedStyle.price > 0 ? (
                  <>
                    <div style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Base Rate
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#f5b942', fontFamily: 'Outfit' }}>
                      ₦{selectedStyle.price.toLocaleString()}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f5b942', fontFamily: 'Outfit' }}>
                    {selectedStyle.displayPrice || 'Book Session'}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleBookStyle(selectedStyle)}
                style={{
                  background: 'linear-gradient(135deg, #f5b942, #d4af37)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  color: '#0c0e14',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'Outfit, sans-serif',
                  boxShadow: '0 3px 12px rgba(245,185,66,0.3)',
                }}
              >
                <Calendar size={14} />
                <span>Book This Look</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
