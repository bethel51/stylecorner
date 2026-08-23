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
import { CartSheet } from '../components/store/CartSheet';
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
  const { addToCart, itemCount } = useCart();
  const { showToast } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [allProducts, setAllProducts] = useState(DEFAULT_PRODUCTS);
  const [isWishlisted, setIsWishlisted] = useState(false);

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
    setShowCartSheet(true);
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
    <PageContainer title={product.title}>
      <div style={{ paddingBottom: '3rem', maxWidth: '640px', margin: '0 auto' }}>

        {/* Top Header Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => navigate('/store')}
            style={{
              background: '#ffffff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              padding: '0.5rem 0.85rem',
              fontSize: '0.82rem',
              fontFamily: 'Outfit',
              fontWeight: 800,
              color: '#171717',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
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
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                cursor: 'pointer'
              }}
              title="Share product"
            >
              <Share2 size={16} />
            </button>

            <button
              onClick={() => setShowCartSheet(true)}
              style={{
                position: 'relative',
                background: '#171717',
                color: '#ffffff',
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
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)'
              }}
            >
              <ShoppingBag size={16} color="#d4af37" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span style={{
                  background: '#d4af37',
                  color: '#171717',
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
          background: '#ffffff',
          borderRadius: '22px',
          padding: '1rem',
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
          marginBottom: '1.25rem',
          position: 'relative'
        }}>
          {/* Badge */}
          {product.badge && (
            <span style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              background: 'rgba(17,17,17,0.85)',
              backdropFilter: 'blur(6px)',
              color: '#d4af37',
              fontSize: '0.72rem',
              fontFamily: 'Outfit',
              fontWeight: 800,
              padding: '0.25rem 0.75rem',
              borderRadius: '50px',
              border: '1px solid rgba(212,175,55,0.4)',
              zIndex: 2,
              textTransform: 'uppercase'
            }}>
              {product.badge}
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              showToast(isWishlisted ? 'Removed from saved items' : 'Saved to your favorites!', 'accent');
            }}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.9)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              zIndex: 2,
              color: isWishlisted ? '#ef4444' : '#6b7280'
            }}
          >
            <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
          </button>

          {/* Main Image Display */}
          <div style={{
            width: '100%',
            height: '320px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#f8fafc',
            marginBottom: product.secondaryImage ? '0.85rem' : 0
          }}>
            <img
              src={selectedImage || product.image}
              alt={product.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'all 0.3s ease'
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
                  border: selectedImage === product.image ? '2.5px solid #d4af37' : '1px solid rgba(0,0,0,0.1)',
                  opacity: selectedImage === product.image ? 1 : 0.65,
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={product.image} alt="Primary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div
                onClick={() => setSelectedImage(product.secondaryImage)}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImage === product.secondaryImage ? '2.5px solid #d4af37' : '1px solid rgba(0,0,0,0.1)',
                  opacity: selectedImage === product.secondaryImage ? 1 : 0.65,
                  transition: 'all 0.2s ease'
                }}
              >
                <img src={product.secondaryImage} alt="Secondary" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}
        </div>

        {/* ── Product Info & Actions Card ── */}
        <div style={{
          background: '#ffffff',
          borderRadius: '22px',
          padding: '1.5rem',
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 6px 24px rgba(0,0,0,0.04)',
          marginBottom: '1.25rem'
        }}>
          {/* Rating & Reviews */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d4af37' }}>
              <Star size={15} fill="#d4af37" />
              <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '0.9rem', color: '#171717' }}>
                {product.rating || 4.9}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#6b7280', fontFamily: 'Outfit' }}>
              ({product.reviewsCount || 112} verified customer reviews)
            </span>
          </div>

          {/* Title & Price */}
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.45rem', fontWeight: 900, color: '#171717', margin: '0 0 0.5rem', lineHeight: 1.2 }}>
            {product.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 900, color: '#b5952f' }}>
              ₦{Number(product.price).toLocaleString()}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#10b981', fontFamily: 'Outfit', fontWeight: 800, background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.5rem', borderRadius: '50px' }}>
              In Stock & Ready for Delivery
            </span>
          </div>

          {/* Description */}
          <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            {product.desc || 'Premium salon-grade grooming formula crafted for peak performance, scent, and texture control.'}
          </p>

          {/* Key Benefits List */}
          <div style={{
            background: '#faf9f5',
            borderRadius: '16px',
            padding: '1rem',
            border: '1px solid rgba(212,175,55,0.2)',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 800, color: '#171717', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.65rem' }}>
              Key Product Highlights
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {(product.benefits || [
                'Formulated with 100% organic hair-nourishing extracts',
                'Provides long-lasting hold with lightweight texture',
                'Suitable for daily salon styling or home maintenance'
              ]).map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#374151' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(16,185,129,0.15)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Check size={11} />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity Picker & Total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.85rem', color: '#171717' }}>
              Quantity:
            </span>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f3f4f6',
              borderRadius: '12px',
              padding: '4px 8px',
              border: '1px solid rgba(0,0,0,0.08)'
            }}>
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <Minus size={14} />
              </button>

              <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1rem', padding: '0 1rem', color: '#171717' }}>
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
              className="app-btn app-btn-primary"
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '0.92rem',
                borderRadius: '14px',
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
              className="app-btn app-btn-accent"
              style={{
                width: '100%',
                minHeight: '48px',
                fontSize: '0.92rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Zap size={18} />
              <span>Buy Now (Instant Checkout)</span>
            </button>
          </div>
        </div>

        {/* ── Related Recommendations Grid ── */}
        <div>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 900, color: '#171717', marginBottom: '0.85rem' }}>
            Recommended Grooming Essentials
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/product/${rel.id}`)}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '0.65rem',
                  border: '1px solid rgba(0,0,0,0.07)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'transform 0.15s ease'
                }}
              >
                <div style={{ width: '100%', height: '80px', borderRadius: '10px', overflow: 'hidden', marginBottom: '0.4rem', background: '#f3f4f6' }}>
                  <img src={rel.image} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '0.78rem', fontWeight: 800, color: '#171717', margin: '0 0 0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {rel.title}
                </h4>
                <div style={{ fontFamily: 'Outfit', fontSize: '0.82rem', fontWeight: 900, color: '#b5952f' }}>
                  ₦{Number(rel.price).toLocaleString()}
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
