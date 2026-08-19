import React, { useState } from 'react';
import { ShoppingBag, Plus, Check, Star } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CartSheet } from '../components/store/CartSheet';

export const Store = () => {
  const { addToCart, itemCount } = useCart();
  const { showToast } = useAuth();
  const [showCartSheet, setShowCartSheet] = useState(false);

  const products = [
    {
      id: 'p1',
      title: 'Atelier Gold Pomade',
      price: 28,
      rating: 4.9,
      desc: 'Medium-hold matte finish pomade infused with organic argan oil.',
      badge: 'Bestseller',
    },
    {
      id: 'p2',
      title: 'Botanical Beard Elixir',
      price: 24,
      rating: 4.8,
      desc: 'Nourishing oil blend with jojoba and cedarwood fragrance.',
      badge: 'Popular',
    },
    {
      id: 'p3',
      title: 'Sculpting Clay Wax',
      price: 26,
      rating: 4.9,
      desc: 'High-hold textured clay wax for textured crops and modern fades.',
      badge: 'New',
    },
    {
      id: 'p4',
      title: 'Scalp Revitalizing Shampoo',
      price: 32,
      rating: 4.7,
      desc: 'Sulfate-free tea tree shampoo for deep scalp hydration.',
    },
    {
      id: 'p5',
      title: 'Handcrafted Wooden Comb Set',
      price: 18,
      rating: 4.9,
      desc: 'Anti-static sandalwood comb set for precise hair and beard styling.',
    },
    {
      id: 'p6',
      title: 'Silk Edge Wrapping Scarf',
      price: 15,
      rating: 5.0,
      desc: '100% mulberry silk wrap for protecting braid edges and locs.',
    },
  ];

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
          <div key={p.id} className="app-card" style={{ marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {p.badge && (
                <span
                  style={{
                    background: 'rgba(212, 175, 55, 0.15)',
                    color: '#d4af37',
                    fontSize: '0.68rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '50px',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '0.5rem',
                  }}
                >
                  {p.badge}
                </span>
              )}

              <h3 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', fontWeight: 800, color: '#171717', lineHeight: 1.3 }}>
                {p.title}
              </h3>

              <p style={{ color: '#6b7280', fontSize: '0.78rem', margin: '0.35rem 0 0.65rem', lineHeight: 1.4 }}>
                {p.desc}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <span style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 900, color: '#171717' }}>
                  ${p.price}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d4af37', fontSize: '0.78rem', fontWeight: 800 }}>
                  <Star size={12} fill="#d4af37" />
                  <span>{p.rating}</span>
                </div>
              </div>

              <button
                onClick={() => handleAdd(p)}
                className="app-btn app-btn-primary"
                style={{ minHeight: '36px', padding: '0.4rem', fontSize: '0.8rem' }}
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
