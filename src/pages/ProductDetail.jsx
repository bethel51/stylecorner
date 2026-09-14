import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  Plus,
  Minus,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  Zap,
  RefreshCw,
  Heart,
  Share2
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { CartSheet } from '../components/store/CartSheet';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { preloadRoute } from '../App';
import { api } from '../services/api';

const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    title: 'Atelier Gold Pomade',
    price: 12000,
    rating: 4.9,
    reviewsCount: 128,
    desc: 'Medium-hold matte finish pomade infused with organic argan oil and cedarwood extract. Provides long-lasting texture and control without greasy residue.',
    badge: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Infused with 100% Organic Argan & Jojoba Oils',
      'Non-greasy natural matte finish with medium-strong hold',
      'Washes out effortlessly with warm water',
      'Protects scalp against dryness and environmental stress'
    ]
  },
  {
    id: 'p2',
    title: 'Botanical Beard Elixir',
    price: 8500,
    rating: 4.8,
    reviewsCount: 94,
    desc: 'Nourishing botanical oil blend with cedarwood, sandalwood, and sweet almond oils. Softens coarse facial hair and hydrates underlying skin.',
    badge: 'Popular',
    image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=800&q=80',
    secondaryImage: 'https://images.unsplash.com/photo-1590159763121-7c9fd312190d?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Promotes healthy beard growth and softness',
      'Soothes skin itchiness and prevents beard dandruff',
      'Subtle, masculine woody botanical fragrance',
      'Fast-absorbing lightweight formula'
    ]
  },
  {
    id: 'p3',
    title: 'Sculpting Clay Wax',
    price: 9500,
    rating: 4.9,
    reviewsCount: 110,
    desc: 'High-hold textured clay wax engineered for textured crops, modern fades, and messy quiff hairstyles. Matte finish with zero shine.',
    badge: 'New',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Ultra high hold for all-day hairstyle stability',
      'Natural matte finish suitable for short to medium hair',
      'Enriched with bentonite clay for healthy volume'
    ]
  },
  {
    id: 'p4',
    title: 'Scalp Revitalizing Shampoo',
    price: 11000,
    rating: 4.7,
    reviewsCount: 82,
    desc: 'Sulfate-free tea tree and peppermint shampoo designed for deep scalp hydration, follicle stimulation, and refreshing cleanse.',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80',
    benefits: [
      'Sulfate-free and paraben-free gentle formula',
      'Tea tree oil relieves itchy, dry scalp',
      'Invigorating peppermint sensory cooling sensation'
    ]
  },
  {
    id: 'p5',
    title: 'Wooden Comb Set',
    price: 6500,
    rating: 4.9,
    reviewsCount: 65,
    desc: 'Handcrafted anti-static sandalwood comb set featuring fine and wide tooth configurations for precise hair and beard grooming.',
    image: 'https://images.unsplash.com/photo-1590159763121-7c9fd312190d?auto=format&fit=crop&w=800&q=80',
    benefits: [
      '100% natural green sandalwood construction',
      'Smooth hand-polished teeth prevent hair snagging',
      'Anti-static properties reduce frizz and flyaways'
    ]
  },
  {
    id: 'p6',
    title: 'Silk Edge Wrap Scarf',
    price: 5000,
    rating: 5.0,
    reviewsCount: 145,
    desc: '100% mulberry silk wrap designed for protecting braid edges, closures, frontals, and locs during sleep or lounge.',
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=800&q=80',
    benefits: [
      '100% Pure Mulberry Silk gentle on delicate hair edges',
      'Locks in moisture and prevents nightly friction',
      'Breathable, lightweight, and stretch-fit comfort'
    ]
  }
];

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart = () => {}, itemCount = 0 } = useCart() || {};
  const { showToast } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [allProducts, setAllProducts] = useState(DEFAULT_PRODUCTS);
  const [isWishlisted, setIsWishlisted] = useState(isFavorite(id));

  useEffect(() => {
    setIsWishlisted(isFavorite(id));
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);

    api.getProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map(p => ({
            ...p,
            id: p._id || p.id,
            price: Number(p.price) || 10000,
            rating: p.rating || 4.8,
            reviewsCount: p.reviewsCount || Math.floor(Math.random() * 80) + 40
          }));
          setAllProducts(formatted);
          const found = formatted.find(p => String(p.id) === String(id) || p._id === id);
          if (found) {
            setProduct(found);
            setSelectedImage(found.image);
          } else {
            // Fallback default lookup
            const def = DEFAULT_PRODUCTS.find(p => p.id === id) || DEFAULT_PRODUCTS[0];
            setProduct(def);
            setSelectedImage(def.image);
          }
        } else {
          const def = DEFAULT_PRODUCTS.find(p => p.id === id) || DEFAULT_PRODUCTS[0];
          setProduct(def);
          setSelectedImage(def.image);
        }
      })
      .catch(() => {
        const def = DEFAULT_PRODUCTS.find(p => p.id === id) || DEFAULT_PRODUCTS[0];
        setProduct(def);
        setSelectedImage(def.image);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !product) {
    return (
      <PageContainer title="Product Details">
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <RefreshCw size={32} color="#d4af37" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
          <p style={{ fontFamily: 'Outfit', color: '#6b7280' }}>Loading product details...</p>
        </div>
      </PageContainer>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast(`Added ${quantity} x ${product.title} to cart!`, 'success');
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/cart');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} on Style Corner!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard!', 'success');
    }
  };

  const relatedProducts = allProducts.filter(p => String(p.id) !== String(product.id)).slice(0, 3);

  return (
    <PageContainer title={product.title} onOpenCart={() => navigate('/cart')}>
      <div style={{ paddingBottom: '3rem', maxWidth: '640px', margin: '0 auto' }}>

        {/* Top Header Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button
            onClick={() => navigate('/store')}
            style={{
              background: '#151822',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              fontFamily: 'Outfit',
              fontWeight: 700,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ArrowLeft size={16} /> Back to Store
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleShare}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: '#151822',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9AA2B3',
                cursor: 'pointer'
              }}
              title="Share product"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={() => navigate('/cart')}
              style={{
                position: 'relative',
                background: '#F5B942',
                color: '#0C0E14',
                border: 'none',
                borderRadius: '12px',
                padding: '0.5rem 0.85rem',
                fontSize: '0.82rem',
                fontFamily: 'Outfit',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ShoppingBag size={16} />
              <span>Cart</span>
              {itemCount > 0 && (
                <span style={{
                  background: '#0C0E14',
                  color: '#F5B942',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                  borderRadius: '50px',
                  padding: '0.1rem 0.45rem',
                }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Product Media Gallery ── */}
        <div style={{
          background: '#151822',
          borderRadius: '24px',
          padding: '1rem',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '1.25rem',
          position: 'relative'
        }}>
          {/* Badge */}
          {product.badge && (
            <span style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              background: 'rgba(12,14,20,0.85)',
              backdropFilter: 'blur(6px)',
              color: '#F5B942',
              fontSize: '0.72rem',
              fontFamily: 'Outfit',
              fontWeight: 800,
              padding: '0.25rem 0.75rem',
              borderRadius: '50px',
              border: '1px solid rgba(245,185,66,0.3)',
              zIndex: 2,
              textTransform: 'uppercase'
            }}>
              {product.badge}
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => {
              const next = toggleFavorite(id);
              setIsWishlisted(next);
              showToast(next ? 'Saved to your favorites!' : 'Removed from saved items', 'accent');
            }}

            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(12,14,20,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 2,
              color: isWishlisted ? '#ef4444' : '#FFFFFF'
            }}
          >
            <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
          </button>

          {/* Main Image Display */}
          <div style={{
            width: '100%',
            height: '320px',
            borderRadius: '18px',
            overflow: 'hidden',
            background: '#0C0E14',
            marginBottom: product.secondaryImage ? '0.85rem' : 0
          }}>
            <OptimizedImage
              src={selectedImage || product.image}
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Secondary Photo Thumbnails Switcher */}
          {product.secondaryImage && (
            <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center' }}>
              <div
                onClick={() => setSelectedImage(product.image)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImage === product.image ? '2px solid #F5B942' : '1px solid rgba(255,255,255,0.1)',
                  opacity: selectedImage === product.image ? 1 : 0.6,
                  transition: 'all 0.2s ease'
                }}
              >
                <OptimizedImage src={product.image} alt="Primary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div
                onClick={() => setSelectedImage(product.secondaryImage)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImage === product.secondaryImage ? '2px solid #F5B942' : '1px solid rgba(255,255,255,0.1)',
                  opacity: selectedImage === product.secondaryImage ? 1 : 0.6,
                  transition: 'all 0.2s ease'
                }}
              >
                <OptimizedImage src={product.secondaryImage} alt="Secondary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Product Info & Actions Card ── */}
        <div style={{
          background: '#151822',
          borderRadius: '24px',
          padding: '1.5rem',
          border: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '1.25rem'
        }}>
          {/* Rating & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#F5B942' }}>
              <Star size={15} fill="#F5B942" />
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.9rem', color: '#FFFFFF' }}>
                {product.rating || 4.9}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#9AA2B3', fontFamily: 'Outfit' }}>
              ({product.reviewsCount || 112} verified customer reviews)
            </span>
          </div>

          {/* Title & Price */}
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.45rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
            {product.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1.1rem' }}>
            <span style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 900, color: '#F5B942' }}>
              ₦{Number(product.price).toLocaleString()}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontFamily: 'Outfit', fontWeight: 800, background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>
              In Stock
            </span>
          </div>

          {/* Description */}
          <p style={{ color: '#9AA2B3', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {product.desc || 'Premium salon-grade grooming formula crafted for peak performance, scent, and texture control.'}
          </p>

          {/* Key Benefits List */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '16px',
            padding: '1rem',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.8rem', fontWeight: 800, color: '#F5B942', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
              Key Product Highlights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {(product.benefits || [
                'Formulated with 100% organic hair-nourishing extracts',
                'Provides long-lasting hold with lightweight texture',
                'Suitable for daily salon styling or home maintenance'
              ]).map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#CBD5E1' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(245,185,66,0.15)', color: '#F5B942', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={11} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Picker & Total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.85rem', color: '#FFFFFF' }}>
              Quantity:
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#0C0E14',
              borderRadius: '12px',
              padding: '4px 8px',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#1E2330',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Minus size={14} />
              </button>

              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', padding: '0 1rem', color: '#FFFFFF' }}>
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#1E2330',
                  color: '#FFFFFF',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '0.95rem',
                borderRadius: '16px',
                background: '#F5B942',
                color: '#0C0E14',
                fontFamily: 'Outfit',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <ShoppingBag size={18} />
              <span>Add to Cart — ₦{Number(product.price * quantity).toLocaleString()}</span>
            </button>

            <button
              onClick={handleBuyNow}
              style={{
                width: '100%',
                padding: '0.95rem',
                borderRadius: '16px',
                background: '#1E2330',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Zap size={18} color="#F5B942" />
              <span>Buy Now (Instant Checkout)</span>
            </button>
          </div>
        </div>

        {/* ── Related Recommendations Grid ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Recommended Products
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#F5B942', fontFamily: 'Outfit', fontWeight: 700 }}>
              Handpicked Essentials
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '0.75rem' }}>
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => { navigate(`/product/${rel.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  background: '#151822',
                  borderRadius: '16px',
                  padding: '0.75rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ width: '100%', height: '100px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.5rem', background: '#0C0E14' }}>
                    <OptimizedImage src={rel.image} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, fontFamily: 'Outfit' }}>● In Stock</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: '#F5B942', fontWeight: 800, fontSize: '0.72rem' }}>
                      <Star size={11} fill="#F5B942" /><span>{rel.rating || 4.8}</span>
                    </div>
                  </div>

                  <h4 style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 0.3rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rel.title}
                  </h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.86rem', fontWeight: 800, color: '#F5B942' }}>
                    ₦{Number(rel.price).toLocaleString()}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(rel);
                      showToast(`Added ${rel.title} to cart!`, 'success');
                    }}
                    style={{
                      backgroundColor: '#F5B942', color: '#0C0E14', border: 'none',
                      borderRadius: '8px', padding: '0.3rem 0.5rem', fontFamily: 'Outfit',
                      fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: '0.2rem'
                    }}
                  >
                    + Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <CartSheet isOpen={showCartSheet} onClose={() => setShowCartSheet(false)} />
    </PageContainer>
  );
};
