import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Scissors,
  Sparkles,
  Calendar,
  ShoppingBag,
  Star,
  ChevronRight,
  Award,
  Clock,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { AISpecialistMatcherSheet } from '../components/booking/AISpecialistMatcherSheet';
import { OptimizedImage } from '../components/common/OptimizedImage';
import { Avatar } from '../components/common/Avatar';
import { preloadRoute } from '../App';
import { api } from '../services/api';

const SIGNATURE_SERVICES = [
  {
    title: 'Premium Cuts',
    subtitle: 'Barbering & Sculpting',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    path: '/services',
    serviceName: 'Hair Cut Services',
  },
  {
    title: 'Expert Braiding',
    subtitle: 'Box Braids & Knotless',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
    path: '/services',
    serviceName: 'Hair Braiding Services',
  },
  {
    title: 'Lash & Nails',
    subtitle: 'Gel Sets & Lash Artistry',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=70&fm=webp',
    path: '/services',
    serviceName: 'Lash & Nails Combo',
  },
];

const DEFAULT_FEATURED_PRODUCTS = [
  { id: 'p1', title: 'Atelier Gold Pomade', price: 12000, rating: 4.9, badge: 'Bestseller', image: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&w=500&q=80' },
  { id: 'p2', title: 'Botanical Beard Elixir', price: 8500, rating: 4.8, badge: 'Popular', image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&w=500&q=80' },
  { id: 'p3', title: 'Sculpting Clay Wax', price: 9500, rating: 4.9, badge: 'New', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80' },
  { id: 'p4', title: 'Scalp Revitalizing Shampoo', price: 11000, rating: 4.7, image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=500&q=80' },
  { id: 'p5', title: 'Wooden Comb Set', price: 6500, rating: 4.9, image: 'https://images.unsplash.com/photo-1590159763121-7c9fd312190d?auto=format&fit=crop&w=500&q=80' },
];

const POPULAR_SERVICES = [
  {
    id: 'srv-1',
    title: 'Hair Styling',
    price: 'From ₦5,000',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Hair Styling',
  },
  {
    id: 'srv-2',
    title: 'Nails',
    price: 'From ₦3,000',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Nail Tech',
  },
  {
    id: 'srv-3',
    title: 'Braids',
    price: 'From ₦4,000',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Hair Braider',
  },
  {
    id: 'srv-4',
    title: 'Skincare',
    price: 'From ₦6,000',
    image: 'https://images.unsplash.com/photo-1512290900672-1f5be50c76ba?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Skincare',
  },
  {
    id: 'srv-5',
    title: 'Makeup',
    price: 'From ₦8,000',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
    serviceName: 'Makeup Artist',
  },
];

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, showToast } = useAuth();
  const { addToCart = () => {} } = useCart() || {};
  const [showAiSheet, setShowAiSheet] = useState(false);

  const signatureServices = SIGNATURE_SERVICES;

  const [specialists, setSpecialists] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState(DEFAULT_FEATURED_PRODUCTS);

  React.useEffect(() => {
    api.getProducts()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedProducts(data.slice(0, 6).map(p => ({ ...p, id: p._id || p.id })));
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    api.getSpecialists()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const verifiedStaff = data.filter((s) => s.role === 'staff' || s.isVerified === true);
          const mapped = verifiedStaff.map((s) => ({
            name: `${s.firstname || ''} ${s.lastname || ''}`.trim() || 'Verified Specialist',
            role: s.title || s.roleTitle || 'Certified Specialist',
            rating: s.rating || 5.0,
            specialty: Array.isArray(s.services) && s.services[0]
              ? (typeof s.services[0] === 'object' ? (s.services[0].name || s.services[0].title || 'Professional Styling') : String(s.services[0]))
              : (typeof s.services === 'string' ? s.services : 'Professional Hair & Grooming'),
            image: s.avatarUrl || s.profileImage || '',
          }));
          setSpecialists(mapped.slice(0, 3));
        } else {
          setSpecialists([]);
        }
      })
      .catch((err) => console.warn('Home specialists fetch:', err.message));
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const popularServices = POPULAR_SERVICES;

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <PageContainer onOpenAiMatcher={() => setShowAiSheet(true)}>

      {/* ── Screen 1: Editorial Luxury Hero Section ── */}
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundImage: `linear-gradient(180deg, rgba(12,14,20,0.4) 0%, rgba(12,14,20,0.85) 100%), url('/images/hero-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '2.5rem 1.25rem 1.85rem',
          color: '#ffffff',
          boxShadow: '0 15px 40px rgba(0,0,0,0.6)',
          marginBottom: '1.25rem',
        }}
      >
        {/* Dark Editorial Overlay with Warm Luxury Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(12, 14, 20, 0.45) 0%, rgba(12, 14, 20, 0.88) 60%, #0c0e14 100%)',
            zIndex: 1,
          }}
        />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <h1
            style={{
              fontFamily: 'Outfit',
              fontSize: 'clamp(2rem, 7vw, 2.6rem)',
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '0.65rem',
            }}
          >
            Your Style,<br />
            <span style={{ color: '#f5b942' }}>Our Expertise.</span>
          </h1>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: '0.88rem',
              lineHeight: 1.5,
              marginBottom: '1.4rem',
              maxWidth: '340px',
              fontWeight: 400,
            }}
          >
            Book top stylists, get premium beauty services, and shop your favorite products — all in one place.
          </p>

          {/* Search Pill Input */}
          <div
            className="search-pill-container"
            style={{
              marginBottom: '1.25rem',
              background: 'rgba(23, 26, 37, 0.85)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Sparkles size={16} color="#f5b942" />
            <input
              type="text"
              className="search-pill-input"
              placeholder="Search for services, stylists, or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
          </div>

          {/* 4 Quick Actions Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
            }}
          >
            <button
              onClick={() => navigate('/booking')}
              style={{
                background: 'rgba(23, 26, 37, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '0.75rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 185, 66, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f5b942',
                }}
              >
                <Calendar size={18} />
              </div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'Outfit', fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>
                Book a Service
              </span>
            </button>

            <button
              onClick={() => navigate('/experts')}
              style={{
                background: 'rgba(23, 26, 37, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '0.75rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 185, 66, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f5b942',
                }}
              >
                <Scissors size={18} />
              </div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'Outfit', fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>
                Find a Stylist
              </span>
            </button>

            <button
              onClick={() => navigate('/store')}
              style={{
                background: 'rgba(23, 26, 37, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '0.75rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 185, 66, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f5b942',
                }}
              >
                <ShoppingBag size={18} />
              </div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'Outfit', fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>
                Shop Store
              </span>
            </button>

            <button
              onClick={() => navigate('/ai-stylist-finder')}
              style={{
                background: 'rgba(23, 26, 37, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '14px',
                padding: '0.75rem 0.35rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 185, 66, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f5b942',
                }}
              >
                <Sparkles size={18} />
              </div>
              <span style={{ fontSize: '0.68rem', fontFamily: 'Outfit', fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>
                AI Stylist Finder
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Screen 1: Popular Services Carousel ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Popular Services
          </h2>
          <button
            onClick={() => navigate('/services')}
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

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.4rem',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {popularServices.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(`/booking?service=${encodeURIComponent(service.serviceName)}`)}
              style={{
                flex: '0 0 130px',
                scrollSnapAlign: 'start',
                background: '#151822',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              <div style={{ height: '90px', width: '100%', overflow: 'hidden' }}>
                <OptimizedImage
                  src={service.image}
                  alt={service.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ padding: '0.65rem 0.6rem' }}>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '0.84rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.15rem' }}>
                  {service.title}
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                  {service.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Signature Experiences ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Featured Experiences
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {signatureServices.map((item, idx) => (
            <div
              key={idx}
              className="app-card"
              onClick={() => navigate(`/booking?service=${encodeURIComponent(item.serviceName)}`)}
              onMouseEnter={() => preloadRoute('/booking')}
              style={{
                cursor: 'pointer',
                position: 'relative',
                height: '140px',
                borderRadius: '18px',
                overflow: 'hidden',
                padding: 0,
                marginBottom: 0,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              {/* Background Image */}
              <OptimizedImage
                src={item.image}
                alt={item.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
                }}
              />

              {/* Card Content */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  zIndex: 2,
                }}
              >
                <div>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.15rem' }}>
                    {item.title}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>{item.subtitle}</span>
                </div>

                <span
                  style={{
                    color: '#d4af37',
                    fontSize: '0.75rem',
                    fontFamily: 'Outfit',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  Discover <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── AI Specialist Matcher Promo Banner ── */}
      <div
        className="app-card"
        onClick={() => setShowAiSheet(true)}
        style={{
          cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.14), rgba(18,18,18,0.04))',
          border: '1.5px solid rgba(212, 175, 55, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1.15rem',
        }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#171717', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Sparkles size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
            Not sure which stylist to pick?
          </h4>
          <p style={{ color: '#a1a1aa', fontSize: '0.82rem', marginTop: '0.15rem' }}>
            Tell us your style and our AI will match you with the right expert — instantly.
          </p>
        </div>
        <ChevronRight size={18} color="#f5b942" />
      </div>

      {/* ── Recommended Grooming Essentials Showcase ── */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div>
            <span style={{ color: '#f5b942', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.68rem', fontFamily: 'Outfit', fontWeight: 800, display: 'block' }}>
              Atelier Boutique
            </span>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Recommended Essentials
            </h3>
          </div>
          <button
            onClick={() => navigate('/store')}
            style={{ background: 'none', border: 'none', color: '#f5b942', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            View All <ChevronRight size={15} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.85rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}>
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/product/${p.id}`)}
              style={{
                flex: '0 0 170px',
                scrollSnapAlign: 'start',
                background: '#151822',
                borderRadius: '16px',
                padding: '0.75rem',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              {/* Product Thumbnail */}
              <div style={{ width: '100%', height: '120px', borderRadius: '12px', overflow: 'hidden', marginBottom: '0.65rem', backgroundColor: '#1c202d' }}>
                <OptimizedImage src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Details */}
              <div>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.title}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.35rem' }}>
                  <span style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: '#f5b942' }}>
                    ₦{Number(p.price).toLocaleString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(p);
                      showToast(`Added ${p.title} to cart!`, 'success');
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#f5b942',
                      color: '#0c0e14',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top Stylists Showcase ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Top Stylists
          </h3>
          <button
            onClick={() => navigate('/experts')}
            style={{ background: 'none', border: 'none', color: '#f5b942', fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            View Team <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {specialists.length > 0 ? (
            specialists.map((sp, i) => (
              <div
                key={i}
                className="app-card"
                onClick={() => navigate(`/booking?stylist=${encodeURIComponent(sp.name.split(' ')[0])}`)}
                onMouseEnter={() => preloadRoute('/booking')}
                style={{ marginBottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#151822', border: '1px solid rgba(255, 255, 255, 0.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <Avatar
                    src={sp.image}
                    name={sp.name}
                    size={46}
                    border="1.5px solid #f5b942"
                  />
                  <div>
                    <h4 style={{ fontFamily: 'Outfit', fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>{sp.name}</h4>
                    <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, fontFamily: 'Outfit', margin: '0.1rem 0 0' }}>{sp.specialty}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f5b942', fontWeight: 800, fontSize: '0.85rem' }}>
                    <Star size={13} fill="#f5b942" /><span>{sp.rating}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#f5b942', fontWeight: 700 }}>Book Now</span>
                </div>
              </div>
            ))
          ) : (
            <div className="app-card" style={{ textAlign: 'center', padding: '1.25rem', marginBottom: 0, background: '#151822' }}>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 0.5rem' }}>
                All experts are verified dynamically upon registration.
              </p>
              <button
                onClick={() => navigate('/experts')}
                className="app-btn app-btn-outline"
                style={{ minHeight: '38px', fontSize: '0.78rem', width: 'auto', margin: '0 auto' }}
              >
                Explore Stylists
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Ready for a Change CTA Footer Card ── */}
      <div
        className="app-card"
        style={{
          background: '#1A1A1A',
          color: '#ffffff',
          textAlign: 'center',
          padding: '1.75rem 1.25rem',
          borderRadius: '20px',
          border: '1.5px solid rgba(212,175,55,0.4)',
        }}
      >
        <h3 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.35rem' }}>
          Ready to book?
        </h3>
        <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Pick a stylist, choose a service, and get it done.
        </p>
        <button
          onClick={() => navigate('/booking')}
          className="app-btn app-btn-accent"
          style={{ maxWidth: '240px', margin: '0 auto' }}
        >
          <Calendar size={16} /> Book Now
        </button>
      </div>

      <AISpecialistMatcherSheet
        isOpen={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onApplyMatch={(match) => {
          setShowAiSheet(false);
          const params = new URLSearchParams();
          if (match.stylist) params.append('stylist', match.stylist);
          if (match.service) params.append('service', match.service);
          if (match.location) params.append('location', match.location);
          if (match.stylistId) params.append('stylistId', match.stylistId);
          navigate(`/booking?${params.toString()}`);
        }}
      />
    </PageContainer>
  );
};
