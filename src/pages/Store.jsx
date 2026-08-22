import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Check, Star, RefreshCw } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartSheet } from '../components/store/CartSheet';
import { api } from '../services/api';

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    title: 'Atelier Gold Pomade',
    price: 28,
    rating: 4.9,
    desc: 'Medium-hold matte finish pomade infused with organic argan oil.',
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p2',
    title: 'Botanical Beard Elixir',
    price: 24,
    rating: 4.8,
    desc: 'Nourishing oil blend with jojoba and cedarwood fragrance.',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p3',
    title: 'Sculpting Clay Wax',
    price: 26,
    rating: 4.9,
    desc: 'High-hold textured clay wax for textured crops and modern fades.',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p4',
    title: 'Scalp Revitalizing Shampoo',
    price: 32,
    rating: 4.7,
    desc: 'Sulfate-free tea tree shampoo for deep scalp hydration.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p5',
    title: 'Wooden Comb Set',
    price: 18,
    rating: 4.9,
    desc: 'Anti-static sandalwood comb set for precise hair and beard styling.',
    image: 'https://images.unsplash.com/photo-1590159763121-7c9fd312190d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'p6',
    title: 'Silk Edge Wrap Scarf',
    price: 15,
    rating: 5.0,
    desc: '100% mulberry silk wrap for protecting braid edges and locs.',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=500&q=80',
  },
];

export const Store = () => {
  const { addToCart, itemCount } = useCart();
  const { showToast } = useAuth();
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreProducts();
  }, []);

  const fetchStoreProducts = async () => {
    try {
      const data = await api.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data.map(p => ({ ...p, id: p._id || p.id })));
      }
    } catch (err) {
      console.error('Dynamic products load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (prod) => {
    addToCart(prod);
    showToast(`Added ${prod.title} to cart!`, 'success');
  };

  return (
    <PageContainer title="Grooming Store" onOpenCart={() => setShowCartSheet(true)}>
      {/* Store Header Banner */}
      <div
        className="app-card"
        style={{
          background: 'linear-gradient(135deg, #171717, #0d0d0d)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '1.5rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          border: '1px solid rgba(212,175,55,0.4)',
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', color: '#d4af37', fontFamily: 'Outfit', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            ATELIER STORE
          </span>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 900, marginTop: '0.2rem' }}>
            Professional Grooming
          </h2>
          <p style={{ color: '#8e8e93', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            Artisan pomades, oils & scalp care delivered to your door.
          </p>
        </div>

        <button
          onClick={() => setShowCartSheet(true)}
          style={{
            background: 'linear-gradient(135deg, #d4af37, #b5952f)',
            border: 'none',
            color: '#ffffff',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            fontFamily: 'Outfit',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 6px 16px rgba(212,175,55,0.3)',
          }}
        >
          <ShoppingBag size={18} />
          <span>Cart ({itemCount})</span>
        </button>
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
        {products.map((p) => (
          <div key={p.id} className="app-card" style={{ marginBottom: 0, padding: '0.85rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Product Image Container */}
              <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem', background: '#f3f4f6' }}>
                <img
                  src={p.image}
                  alt={p.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                  ${p.price}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d4af37', fontSize: '0.75rem', fontWeight: 800 }}>
                  <Star size={12} fill="#d4af37" />
                  <span>{p.rating}</span>
                </div>
              </div>

              <button
                onClick={() => handleAdd(p)}
                className="app-btn app-btn-primary"
                style={{ minHeight: '36px', padding: '0.4rem', fontSize: '0.78rem' }}
              >
                <Plus size={14} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <CartSheet isOpen={showCartSheet} onClose={() => setShowCartSheet(false)} />
    </PageContainer>
  );
};
