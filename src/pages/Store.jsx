import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Check, Star, RefreshCw, Eye } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartSheet } from '../components/store/CartSheet';
import { api } from '../services/api';

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    title: 'Atelier Gold Pomade',
    price: 12000,
    rating: 4.9,
    desc: 'Medium-hold matte finish pomade infused with organic argan oil.',
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p2',
    title: 'Botanical Beard Elixir',
    price: 8500,
    rating: 4.8,
    desc: 'Nourishing oil blend with jojoba and cedarwood fragrance.',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p3',
    title: 'Sculpting Clay Wax',
    price: 9500,
    rating: 4.9,
    desc: 'High-hold textured clay wax for textured crops and modern fades.',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p4',
    title: 'Scalp Revitalizing Shampoo',
    price: 11000,
    rating: 4.7,
    desc: 'Sulfate-free tea tree shampoo for deep scalp hydration.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p5',
    title: 'Wooden Comb Set',
    price: 6500,
    rating: 4.9,
    desc: 'Anti-static sandalwood comb set for precise hair and beard styling.',
    image: 'https://images.unsplash.com/photo-1590159763121-7c9fd312190d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p6',
    title: 'Silk Edge Wrap Scarf',
    price: 5000,
    rating: 5.0,
    desc: '100% mulberry silk wrap for protecting braid edges and locs.',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=500&q=80',
  },
];

export const Store = () => {
  const navigate = useNavigate();
  const { addToCart, itemCount } = useCart();
  const { showToast } = useAuth();
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredImageMap, setHoveredImageMap] = useState({});

  const fetchStoreProducts = async () => {
    try {
      const data = await api.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data.map(p => ({ ...p, id: p._id || p.id })));
      } else {
        setProducts(DEFAULT_PRODUCTS);
      }
    } catch (err) {
      console.error('Dynamic products load failed:', err);
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreProducts();

    const handleFocus = () => {
      fetchStoreProducts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleAdd = (p, e) => {
    if (e) e.stopPropagation();
    addToCart(p);
    showToast(`Added ${p.title} to cart!`, 'success');
  };

  return (
    <PageContainer title="Grooming Store">
      {/* Hero Store Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #171717 0%, #0d0d0d 100%)',
          borderRadius: '20px',
          padding: '1.25rem 1.25rem 1.1rem',
          color: '#ffffff',
          marginBottom: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(212,175,55,0.4)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.68rem', fontFamily: 'Outfit', fontWeight: 800, color: '#d4af37', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ATELIER ESSENTIALS
            </span>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 900, margin: '0.2rem 0 0.25rem', color: '#ffffff' }}>
              Style Corner Boutique
            </h2>
            <p style={{ color: '#a1a1aa', fontSize: '0.78rem', margin: 0, maxWidth: '240px' }}>
              Handpicked pomades, botanical oils & silk hair protection.
            </p>
          </div>

          <button
            onClick={() => setShowCartSheet(true)}
            style={{
              position: 'relative',
              background: '#d4af37',
              color: '#121212',
              border: 'none',
              borderRadius: '14px',
              padding: '0.65rem 0.9rem',
              fontFamily: 'Outfit',
              fontWeight: 900,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 6px 18px rgba(212,175,55,0.35)',
              flexShrink: 0,
            }}
          >
            <ShoppingBag size={16} />
            <span>Cart</span>
            {itemCount > 0 && (
              <span
                style={{
                  background: '#121212',
                  color: '#d4af37',
                  fontSize: '0.7rem',
                  borderRadius: '50px',
                  padding: '0.1rem 0.45rem',
                  fontWeight: 900,
                }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {products.map((p) => {
          const currentImg = hoveredImageMap[p.id] || p.image;
          const hasSecondary = !!p.secondaryImage;

          return (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              className="app-card"
              style={{
                marginBottom: 0,
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div>
                {/* Product Image Container with Dual Photo support */}
                <div
                  onMouseEnter={() => {
                    if (p.secondaryImage) setHoveredImageMap(prev => ({ ...prev, [p.id]: p.secondaryImage }));
                  }}
                  onMouseLeave={() => {
                    setHoveredImageMap(prev => ({ ...prev, [p.id]: p.image }));
                  }}
                  style={{ position: 'relative', width: '100%', height: '130px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem', background: '#f3f4f6' }}
                >
                  <img
                    src={currentImg}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s ease' }}
                  />
                  
                  {p.badge && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(18, 18, 18, 0.85)',
                        backdropFilter: 'blur(4px)',
                        color: '#d4af37',
                        fontSize: '0.65rem',
                        fontFamily: 'Outfit',
                        fontWeight: 800,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '50px',
                        textTransform: 'uppercase',
                        border: '1px solid rgba(212,175,55,0.3)',
                      }}
                    >
                      {p.badge}
                    </span>
                  )}

                  {/* Dual Photo Indicator Pills */}
                  {hasSecondary && (
                    <div style={{ position: 'absolute', bottom: '6px', right: '6px', display: 'flex', gap: '3px' }}>
                      <span
                        onClick={(e) => { e.stopPropagation(); setHoveredImageMap(prev => ({ ...prev, [p.id]: p.image })); }}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: currentImg === p.image ? '#d4af37' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}
                      />
                      <span
                        onClick={(e) => { e.stopPropagation(); setHoveredImageMap(prev => ({ ...prev, [p.id]: p.secondaryImage })); }}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: currentImg === p.secondaryImage ? '#d4af37' : 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }}
                      />
                    </div>
                  )}
                </div>

                <h3 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#171717', lineHeight: 1.3 }}>
                  {p.title}
                </h3>

                <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0.25rem 0 0.65rem', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.desc}
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                  <span style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 900, color: '#171717' }}>
                    ₦{Number(p.price).toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 800 }}>
                    <Star size={12} fill="#d4af37" />
                    <span>{p.rating}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleAdd(p, e)}
                  className="app-btn app-btn-primary"
                  style={{ minHeight: '36px', padding: '0.4rem', fontSize: '0.78rem' }}
                >
                  <Plus size={14} /> Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <CartSheet isOpen={showCartSheet} onClose={() => setShowCartSheet(false)} />
    </PageContainer>
  );
};
