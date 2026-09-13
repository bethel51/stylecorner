import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { preloadRoute } from '../App';
import { api } from '../services/api';

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
  const { addToCart = () => {}, itemCount = 0 } = useCart() || {};
  const { showToast } = useAuth();

  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState({});

  const categoryPills = [
    { label: 'Hair', icon: Scissors, cat: 'Hair' },
    { label: 'Skincare', icon: Droplet, cat: 'Skincare' },
    { label: 'Makeup', icon: Palette, cat: 'Makeup' },
    { label: 'Nails', icon: Wand2, cat: 'Nails' },
    { label: 'Tools', icon: Sparkles, cat: 'Tools' },
  ];

  const fetchProducts = async () => {
    try {
      const data = await api.getProducts();
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data.map((p) => ({ ...p, id: p._id || p.id })));
      } else {
        setProducts(DEFAULT_STORE_PRODUCTS);
      }
    } catch (err) {
      setProducts(DEFAULT_STORE_PRODUCTS);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = (p, e) => {
    if (e) e.stopPropagation();
    addToCart(p);
    showToast(`Added ${p.title} to cart!`, 'success');
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'All' ||
      (p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.desc && p.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <PageContainer showBack={true} onOpenCart={() => navigate('/cart')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Screen 4: Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem' }}>
              Style Store
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
              Premium beauty products, handpicked for you.
            </p>
          </div>

          <button
            onClick={() => navigate('/cart')}
            style={{
              position: 'relative',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#151822',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
            }}
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && <span className="badge-dot" />}
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-pill-container">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            className="search-pill-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* 5 Circular Category Icons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.2rem 0.25rem',
          }}
        >
          {categoryPills.map((item) => {
            const Icon = item.icon;
            const isSelected = activeCategory === item.cat;
            return (
              <button
                key={item.label}
                onClick={() => setActiveCategory(isSelected ? 'All' : item.cat)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: isSelected ? '#f5b942' : '#151822',
                    border: `1px solid ${isSelected ? '#f5b942' : 'rgba(255, 255, 255, 0.08)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSelected ? '#0c0e14' : '#f5b942',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Icon size={20} />
                </div>
                <span
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: isSelected ? '#f5b942' : '#94a3b8',
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
          <div style={{ maxWidth: '60%', zIndex: 2 }}>
            <h3
              style={{
                fontFamily: 'Outfit',
                fontSize: '1.18rem',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '0.35rem',
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
                marginBottom: '0.75rem',
              }}
            >
              Premium products for healthy hair, glowing skin and flawless looks.
            </p>
            <button
              onClick={() => setActiveCategory('All')}
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
              Shop Now
            </button>
          </div>

          <div
            style={{
              width: '100px',
              height: '100px',
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

        {/* Featured Products Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Featured Products
          </h2>
          <button
            onClick={() => setActiveCategory('All')}
            style={{
              background: 'none',
              border: 'none',
              color: '#f5b942',
              fontFamily: 'Outfit',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.15rem',
            }}
          >
            See all <ChevronRight size={15} />
          </button>
        </div>

        {/* 2-Column Product Grid matching Screen 4 */}
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
                transition: 'transform 0.15s ease',
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

                <button
                  onClick={(e) => toggleFavorite(p.id, e)}
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

              {/* Title */}
              <h3
                style={{
                  fontFamily: 'Outfit',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  margin: '0 0 0.35rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
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
                }}
              >
                <span
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: '#f5b942',
                  }}
                >
                  ₦{Number(p.price).toLocaleString()}
                </span>

                <button
                  onClick={(e) => handleAdd(p, e)}
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#f5b942',
                    color: '#0c0e14',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(245, 185, 66, 0.35)',
                  }}
                  aria-label={`Add ${p.title} to cart`}
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
            <p>No products found for "{searchQuery}".</p>
          </div>
        )}

      </div>
    </PageContainer>
  );
};
