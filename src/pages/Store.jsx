import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Plus,
  Heart,
  ChevronRight,
  Sparkles,
  Scissors,
  Droplet,
  Palette,
  Wand2,
  X,
  Layers,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { preloadRoute } from '../App';
import { api } from '../services/api';
import { SkeletonGrid } from '../components/common/SkeletonLoader';

// Intelligent category inferrer for items lacking an explicit category in DB
const inferProductCategory = (p) => {
  if (p.category && p.category.trim() && p.category.toLowerCase() !== 'general') {
    return p.category.trim();
  }
  const text = `${p.title || ''} ${p.desc || ''}`.toLowerCase();
  if (text.includes('nail') || text.includes('manicure') || text.includes('pedicure') || text.includes('polish')) {
    return 'Nails';
  }
  if (text.includes('makeup') || text.includes('bag') || text.includes('cosmetic') || text.includes('brush') || text.includes('lip')) {
    return 'Makeup';
  }
  if (text.includes('face') || text.includes('serum') || text.includes('mask') || text.includes('skin') || text.includes('steamer') || text.includes('cream')) {
    return 'Skincare';
  }
  if (text.includes('drill') || text.includes('dryer') || text.includes('straightener') || text.includes('clipper') || text.includes('equipment') || text.includes('comb')) {
    return 'Tools';
  }
  return 'Hair';
};

const DEFAULT_STORE_PRODUCTS = [
  {
    id: 'p1',
    title: 'Hair Growth Oil',
    category: 'Hair',
    price: 12000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=400&q=80',
    desc: 'Botanical growth elixir formulated with rosemary and cold-pressed castor oil.',
  },
  {
    id: 'p2',
    title: 'Face Serum',
    category: 'Skincare',
    price: 18000,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
    desc: 'Vitamin C & Hyaluronic acid brightening serum for radiant skin.',
  },
  {
    id: 'p3',
    title: 'Hair Mask',
    category: 'Hair',
    price: 9500,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=400&q=80',
    desc: 'Deep conditioning argan butter mask for hydration and strand repair.',
  },
  {
    id: 'p4',
    title: 'Edge Control',
    category: 'Hair',
    price: 7000,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    desc: '24hr extreme hold edge tamer without flaking or residue.',
  },
  {
    id: 'p5',
    title: 'Face Mask',
    category: 'Skincare',
    price: 9500,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80',
    desc: 'Purifying clay and tea tree detoxifying pore mask.',
  },
  {
    id: 'p6',
    title: 'Silk Edge Wrap',
    category: 'Tools',
    price: 5000,
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=400&q=80',
    desc: '100% pure silk wrap band for protecting edges and braids.',
  },
];

export const Store = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart = () => {}, itemCount = 0 } = useCart() || {};
  const { showToast } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'All');
  const [favorites, setFavorites] = useState({});

  const categoryPills = [
    { label: 'All', icon: Layers, cat: 'All' },
    { label: 'Hair', icon: Scissors, cat: 'Hair' },
    { label: 'Skincare', icon: Droplet, cat: 'Skincare' },
    { label: 'Makeup', icon: Palette, cat: 'Makeup' },
    { label: 'Nails', icon: Wand2, cat: 'Nails' },
    { label: 'Tools', icon: Sparkles, cat: 'Tools' },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((p) => ({
          ...p,
          id: p._id || p.id,
          category: inferProductCategory(p),
        }));
        setProducts(normalized);
      } else {
        const normalized = DEFAULT_STORE_PRODUCTS.map((p) => ({
          ...p,
          category: inferProductCategory(p),
        }));
        setProducts(normalized);
      }
    } catch (err) {
      const normalized = DEFAULT_STORE_PRODUCTS.map((p) => ({
        ...p,
        category: inferProductCategory(p),
      }));
      setProducts(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleFavorite = (id, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = (p, e) => {
    if (e) e.stopPropagation();
    addToCart(p);
    showToast(`Added "${p.title}" to your cart!`, 'success');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const productCat = (p.category || '').toLowerCase();
      const matchesCategory =
        activeCategory === 'All' ||
        productCat === activeCategory.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.desc && p.desc.toLowerCase().includes(query)) ||
        productCat.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <PageContainer showBack={true} onOpenCart={() => navigate('/cart')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', paddingBottom: '2rem' }}>
        
        {/* Screen 4: Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.2rem' }}>
              Style Store
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
              Curated luxury hair & beauty essentials
            </p>
          </div>

          <button
            onClick={() => navigate('/cart')}
            style={{
              position: 'relative',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: '#151822',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label="View Shopping Cart"
          >
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className="badge-dot" />}
          </button>
        </div>

        {/* Search Bar with Clear Button */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            background: '#151822',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '50px',
            padding: '0.65rem 1rem',
            gap: '0.65rem',
          }}
        >
          <Search size={17} color="#64748b" style={{ flexShrink: 0 }} />
          <input
            type="text"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontFamily: 'inherit',
            }}
            placeholder="Search hair oils, tools, makeup, skincare..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Circular Category Strip with Horizontal Scroll on Mobile */}
        <div
          style={{
            display: 'flex',
            gap: '0.85rem',
            overflowX: 'auto',
            padding: '0.35rem 0.15rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {categoryPills.map((item) => {
            const Icon = item.icon;
            const isSelected = activeCategory === item.cat;
            return (
              <button
                key={item.label}
                onClick={() => setActiveCategory(isSelected && item.cat !== 'All' ? 'All' : item.cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  outline: 'none',
                  flexShrink: 0,
                  padding: 0,
                  minWidth: '58px',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: isSelected ? '#f5b942' : '#151822',
                    border: `1.5px solid ${isSelected ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#0c0e14' : '#f5b942',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isSelected ? '0 4px 14px rgba(245, 185, 66, 0.3)' : 'none',
                  }}
                >
                  <Icon size={20} />
                </div>
                <span
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? '#f5b942' : '#94a3b8',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Screen 4: Promo Banner "Glow Up Your Routine" */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fce8cc 0%, #ecd0a2 100%)',
            borderRadius: '20px',
            padding: '1.25rem 1.15rem',
            color: '#1a160d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ maxWidth: '64%', zIndex: 2 }}>
            <h3
              style={{
                fontFamily: 'Outfit',
                fontSize: '1.18rem',
                fontWeight: 800,
                lineHeight: 1.15,
                margin: '0 0 0.35rem',
                color: '#1a160d',
              }}
            >
              Glow Up<br />Your Routine
            </h3>
            <p
              style={{
                fontSize: '0.74rem',
                lineHeight: 1.35,
                color: '#52432a',
                margin: '0 0 0.75rem',
              }}
            >
              Verified premium beauty essentials for radiant skin and healthy hair.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              style={{
                background: '#151822',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                padding: '0.45rem 1rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              Shop All ({products.length})
            </button>
          </div>

          <div
            style={{
              width: '95px',
              height: '95px',
              borderRadius: '16px',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <OptimizedImage
              src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80"
              alt="Promo Cosmetics"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Section Header with dynamic count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              {activeCategory === 'All' ? 'Featured Products' : `${activeCategory} Collection`}
            </h2>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available
            </span>
          </div>

          {activeCategory !== 'All' && (
            <button
              onClick={() => setActiveCategory('All')}
              style={{
                background: 'none',
                border: 'none',
                color: '#f5b942',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
              }}
            >
              View all <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* Loading Skeleton Grid */}
        {loading && <SkeletonGrid count={4} height={220} />}

        {/* 2-Column Product Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.85rem',
            }}
          >
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                onMouseEnter={() => preloadRoute(`/product/${p.id}`)}
                style={{
                  background: '#151822',
                  borderRadius: '18px',
                  padding: '0.75rem',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                {/* Product Photo with Heart Favorite Icon */}
                <div
                  style={{
                    width: '100%',
                    height: '135px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    backgroundColor: '#1c202d',
                    marginBottom: '0.65rem',
                    position: 'relative',
                  }}
                >
                  <OptimizedImage
                    src={p.image}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {p.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: 'rgba(245, 185, 66, 0.95)',
                        color: '#0c0e14',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '6px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        fontFamily: 'Outfit',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {p.badge}
                    </div>
                  )}

                  <button
                    onClick={(e) => toggleFavorite(p.id, e)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.5)',
                      backdropFilter: 'blur(6px)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: favorites[p.id] ? '#ef4444' : '#ffffff',
                    }}
                    aria-label="Favorite"
                  >
                    <Heart
                      size={15}
                      fill={favorites[p.id] ? '#ef4444' : 'none'}
                      strokeWidth={favorites[p.id] ? 0 : 2}
                    />
                  </button>
                </div>

                {/* Category tag */}
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#f5b942',
                    fontFamily: 'Outfit',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                    marginBottom: '0.2rem',
                  }}
                >
                  {p.category}
                </span>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '0 0 0.45rem',
                    lineHeight: 1.25,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '2.5em',
                  }}
                >
                  {p.title}
                </h3>

                {/* Price & Gold (+) Add Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 'auto',
                    paddingTop: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Outfit',
                      fontSize: '0.94rem',
                      fontWeight: 800,
                      color: '#f5b942',
                    }}
                  >
                    ₦{Number(p.price).toLocaleString()}
                  </span>

                  <button
                    onClick={(e) => handleAdd(p, e)}
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      backgroundColor: '#f5b942',
                      color: '#0c0e14',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(245, 185, 66, 0.35)',
                      flexShrink: 0,
                    }}
                    aria-label={`Add ${p.title} to cart`}
                  >
                    <Plus size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State Clean Fix */}
        {!loading && filteredProducts.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              color: '#94a3b8',
              background: '#151822',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              margin: '1rem 0',
            }}
          >
            <ShoppingBag size={44} color="#f5b942" style={{ marginBottom: '0.75rem', opacity: 0.85 }} />
            <h3 style={{ fontFamily: 'Outfit', color: '#ffffff', fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.35rem' }}>
              {searchQuery.trim()
                ? `No products matching "${searchQuery.trim()}"`
                : `No products in ${activeCategory}`}
            </h3>
            <p style={{ fontSize: '0.82rem', margin: '0 0 1.25rem', color: '#64748b' }}>
              Try searching with another keyword or explore our full collection.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              style={{
                background: '#f5b942',
                color: '#0c0e14',
                border: 'none',
                borderRadius: '50px',
                padding: '0.55rem 1.35rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              View All Products
            </button>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
export default Store;
