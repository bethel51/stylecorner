import React, { useState, useEffect, useMemo } from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  SlidersHorizontal,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { getFavorites, toggleFavorite as toggleFavUtil, subscribeToFavorites } from '../utils/favorites';

// Comprehensive, authentic curated lookbook data across Lagos & Ibadan
const GALLERY_ITEMS = [
  {
    id: 'look-1',
    title: 'Knotless Boho Goddess Braids',
    category: 'Braids & Twists',
    serviceId: 'hair_braider',
    stylist: 'Amara Okonjo',
    studio: 'Amara Braid Atelier',
    location: 'Lekki Phase 1, Lagos',
    price: 14500,
    duration: '3h 30m',
    rating: 4.95,
    reviewCount: 142,
    baseLikes: 318,
    image: '/banner-braider.jpg',
    tags: ['Human Hair Curls', 'Mid-Back Length', 'Tension-Free Parting'],
    desc: 'Lightweight square-parted knotless braids seamlessly blended with curled human hair leave-outs. Sealed with organic botanical foaming mousse for zero scalp tension.',
    maintenance: 'Wrap with a satin bonnet at night. Spritz with leave-in conditioner twice weekly to refresh curls.',
    included: ['Pre-stretched hypoallergenic braiding hair', 'Scalp hydration massage', 'Custom curled human hair accents', 'Edge styling'],
  },
  {
    id: 'look-2',
    title: 'Low Taper Fade & Sharp Lineup',
    category: 'Barbering & Fades',
    serviceId: 'barber',
    stylist: 'Tunde Balogun',
    studio: 'ClipperGod Studio',
    location: 'Ikeja GRA, Lagos',
    price: 5500,
    duration: '45 mins',
    rating: 4.98,
    reviewCount: 98,
    baseLikes: 284,
    image: '/banner-barber.jpg',
    tags: ['Skin Fade', 'Straight Razor Lineup', 'Beard Sculpt'],
    desc: 'Seamless skin gradient taper on temples and nape. Finished with razor-sharp geometrical hairline detailing and organic beard oil hydration.',
    maintenance: 'Re-align perimeter every 7 to 10 days to maintain edge crispness. Moisturize daily with beard butter.',
    included: ['Precision clipper fade', 'Hot towel facial prep', 'Straight razor hairline finish', 'Beard balm grooming'],
  },
  {
    id: 'look-3',
    title: 'Milky White Ombré Chrome Nails',
    category: 'Nails & Pedicure',
    serviceId: 'nail_tech',
    stylist: 'Blessing Adebayo',
    studio: 'Luxe Nail Bar',
    location: 'Bodija, Ibadan',
    price: 8000,
    duration: '1h 15m',
    rating: 4.92,
    reviewCount: 65,
    baseLikes: 195,
    image: '/elite-nail-care.jpg',
    tags: ['Russian Manicure', 'Chrome Dusting', 'Medium Coffin'],
    desc: 'Flawless dry cuticle prep with medium coffin acrylic enhancements, milk white ombre fade, and pearlized mirror chrome glaze.',
    maintenance: 'Apply cuticle oil every evening. Wear gloves when using harsh cleaning detergents to prevent chipping.',
    included: ['Russian e-file cuticle care', 'Gel ombre sculpting', 'Mirror chrome powder rub', 'Keratin hand massage'],
  },
  {
    id: 'look-4',
    title: 'Wispy Hybrid Volume Lash Set',
    category: 'Lashes & Brows',
    serviceId: 'lash_tech',
    stylist: 'Chioma Eze',
    studio: 'Lash Artistry Studio',
    location: 'Victoria Island, Lagos',
    price: 9500,
    duration: '1h 45m',
    rating: 4.96,
    reviewCount: 110,
    baseLikes: 226,
    image: 'https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?auto=format&fit=crop&w=800&q=80',
    tags: ['0.05 Volume Fans', 'Spike Accents', 'Custom Mapping'],
    desc: 'Customized wispy eye-mapping combining single classic mink extensions with lightweight handmade Russian volume fans for effortless fluttery eyes.',
    maintenance: 'Avoid steam and oil-based makeup removers. Brush daily with clean spoolie from base to tips.',
    included: ['Under-eye hydrogel collagen pads', 'Custom eye mapping', 'Mink silk extensions', 'Aftercare spoolie kit'],
  },
  {
    id: 'look-5',
    title: 'Soft Bronze Glam & Velvet Lip',
    category: 'Soft Glam Makeup',
    serviceId: 'makeup_artist',
    stylist: 'Zainab Alabi',
    studio: 'Zainab Glam Lounge',
    location: 'Yaba, Lagos',
    price: 18000,
    duration: '1h 20m',
    rating: 4.94,
    reviewCount: 84,
    baseLikes: 271,
    image: '/professional-makeup.jpg',
    tags: ['14h Longwear Base', 'Feathered Brows', 'Mink Lashes'],
    desc: 'Radiant skin-focused soft glam with warm terracotta tones, micro-feathered brows, natural mink falsies, and a transfer-proof chocolate ombré lip.',
    maintenance: 'Touch up T-zone with translucent blotting paper. Setting spray guarantees 14+ hours of sweat-proof wear.',
    included: ['Skin prep & pore treatment', 'Airbrush finish foundation', 'Premium 3D lash application', 'Travel touchup sponge'],
  },
  {
    id: 'look-6',
    title: 'Glueless HD Lace Frontal Melt',
    category: 'Wigs & Revamps',
    serviceId: 'wig_installer',
    stylist: 'Folake Williams',
    studio: 'Crown Craft Wigs',
    location: 'Jericho, Ibadan',
    price: 12000,
    duration: '2h 00m',
    rating: 4.97,
    reviewCount: 73,
    baseLikes: 340,
    image: '/gallery-fashion.jpg',
    tags: ['Bleached Knots', 'Custom Plucking', 'Ghost Bond Melt'],
    desc: 'Ultra-thin HD Swiss lace melt customized to client skin tone with micro-plucked natural hairline and invisible lace melting bands.',
    maintenance: 'Tie down with satin melt band for 10 minutes every morning. Keep lace free of excess oils.',
    included: ['Lace knot bleaching & toning', 'Hairline custom plucking', 'Cornrow braid base', 'Elastic band security install'],
  },
  {
    id: 'look-7',
    title: 'Clean Burst Fade & Sponge Twists',
    category: 'Barbering & Fades',
    serviceId: 'barber',
    stylist: 'Deji Adekunle',
    studio: 'Urban Edge Barbershop',
    location: 'Surulere, Lagos',
    price: 6000,
    duration: '50 mins',
    rating: 4.91,
    reviewCount: 52,
    baseLikes: 165,
    image: '/gallery-barber.jpg',
    tags: ['Burst Fade', 'Sponge Twist Top', 'Nape Taper'],
    desc: 'High contrast burst fade contouring the ear and tapering down the neckline, paired with defined sponge twisted crown curls.',
    maintenance: 'Re-twist crown daily using curl sponge with curling custard on damp hair.',
    included: ['Precision clipper cut', 'Conditioning hair wash', 'Sponge curling session', 'Anti-bump aftershave spray'],
  },
  {
    id: 'look-8',
    title: 'Fulani Tribal Cornrows with Beads',
    category: 'Braids & Twists',
    serviceId: 'hair_braider',
    stylist: 'Maryam Oladipo',
    studio: 'Oladipo Hair Heritage',
    location: 'Ring Road, Ibadan',
    price: 16000,
    duration: '4h 00m',
    rating: 4.98,
    reviewCount: 124,
    baseLikes: 412,
    image: '/gallery-braids.jpg',
    tags: ['Cowrie Shells', 'Wooden Beads', 'Tribal Parting'],
    desc: 'Authentic Fulani cornrows with centered braid and bilateral forward drops, adorned with traditional wooden beads and cowrie shells.',
    maintenance: 'Oil scalp 3 times a week with tea tree or peppermint oil to soothe roots.',
    included: ['Pre-washed braiding extensions', 'Curated bead and shell pack', 'Scalp detox spray', 'Satin scrunchie'],
  },
  {
    id: 'look-9',
    title: 'French Tip Chrome Gel Pedicure',
    category: 'Nails & Pedicure',
    serviceId: 'nail_tech',
    stylist: 'Sarah Briggs',
    studio: 'Briggs Polish Bar',
    location: 'Magodo Phase 2, Lagos',
    price: 7500,
    duration: '1h 00m',
    rating: 4.89,
    reviewCount: 41,
    baseLikes: 153,
    image: '/artistic-card.jpg',
    tags: ['Jelly Soak', 'Callus Removal', 'Micro French'],
    desc: 'Soothing jelly foot bath and dead skin exfoliating treatment, followed by crisp white micro-french smile lines and diamond top coat.',
    maintenance: 'Wear open-toe sandals for 2 hours post appointment to protect high-gloss shine.',
    included: ['Jelly foot soak', 'Dead skin callus buffing', 'E-file cuticle tidy', 'Non-wipe diamond top coat'],
  },
  {
    id: 'look-10',
    title: 'Honey Blonde Balayage Silk Press',
    category: 'Wigs & Revamps',
    serviceId: 'wig_installer',
    stylist: 'Kelechi Nwosu',
    studio: 'Kelechi Silk Lounge',
    location: 'Ikoyi, Lagos',
    price: 22000,
    duration: '2h 30m',
    rating: 4.96,
    reviewCount: 88,
    baseLikes: 305,
    image: '/gallery-balayage.jpg',
    tags: ['Titanium Press', 'Keratin Shield', 'Glass Hair Shine'],
    desc: 'Deep clarifying wash, protein steam treatment, and heat-protective titanium iron pass for bouncy, weightless mirror-shine movement.',
    maintenance: 'Pin curl at night and protect with a silk scarf. Keep strictly away from humidity and water droplets.',
    included: ['Protein steam hydration mask', 'Keratin heat protectant', 'Precision silk press pass', 'Split-end trim'],
  },
  {
    id: 'look-11',
    title: 'Bridal Radiance & HD Camera Glam',
    category: 'Soft Glam Makeup',
    serviceId: 'makeup_artist',
    stylist: 'Bimbo Studio Pro',
    studio: 'Bimbo Glam Atelier',
    location: 'Lekki Phase 1, Lagos',
    price: 25000,
    duration: '2h 00m',
    rating: 5.0,
    reviewCount: 96,
    baseLikes: 450,
    image: '/banner-beauty-team.jpg',
    tags: ['Waterproof Base', 'HD Flash Ready', 'Touchup Kit Included'],
    desc: 'Full luxury bridal application formulated for 14+ hours of wear under bright lights and Nigerian wedding heat without creasing.',
    maintenance: 'Gently dab with provided oil-absorbing blotting papers; do not wipe or rub foundation.',
    included: ['Luxury 24k gold serum prep', 'Waterproof airbrush base', 'Custom mink lashes', 'Complimentary bridal touchup kit'],
  },
  {
    id: 'look-12',
    title: 'Classic Scissor Cut & Herbal Beard Dye',
    category: 'Barbering & Fades',
    serviceId: 'barber',
    stylist: 'Kolawole Bamidele',
    studio: 'Gentlemen Quarters',
    location: 'Oluyole, Ibadan',
    price: 6500,
    duration: '1h 00m',
    rating: 4.9,
    reviewCount: 67,
    baseLikes: 182,
    image: '/modern-barbering.jpg',
    tags: ['Herbal Dye', 'Beard Alignment', 'Scissor Crown Work'],
    desc: 'Scissor-crafted textured crown with soft taper sides and natural black herbal beard tint for full, youthful beard density.',
    maintenance: 'Wash beard with sulfate-free shampoo to preserve dye richness up to 3 weeks.',
    included: ['Consultation & scissor sculpt', 'Organic black beard dye', 'Hot towel steam', 'Argan beard oil polish'],
  },
];

const CATEGORIES = [
  'All Styles',
  'Braids & Twists',
  'Barbering & Fades',
  'Nails & Pedicure',
  'Lashes & Brows',
  'Soft Glam Makeup',
  'Wigs & Revamps',
];

export const Gallery = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active filter state
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

  const handleToggleLike = (e, item) => {
    e.stopPropagation();
    toggleFavUtil(item.id);
  };

  // Filtered styles based on category & search query
  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter((item) => {
      const matchCategory =
        activeCategory === 'All Styles' || item.category.toLowerCase() === activeCategory.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.stylist.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));

      return matchCategory && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleBookStyle = (style) => {
    if (!style) return;
    const url = `/booking?service=${style.serviceId}&stylist=${encodeURIComponent(style.stylist)}`;
    navigate(url);
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
    <PageContainer title="Lookbook & Styles">
      <SEOHead
        title="Atelier Lookbook & Style Vault | StyleCorner"
        description="Browse signature braids, precision tapers, nail extensions, volume lashes, and frontal melts crafted by top-rated beauty artisans in Lagos and Ibadan."
        canonicalPath="/gallery"
        keywords="Nigerian salon lookbook, Lagos braiders, Ibadan barbers, knotless braids styles, burst fade photos, chrome nails, lash extensions Nigeria"
      />

      <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '3.5rem' }}>
        {/* Header Hero Banner */}
        <div
          style={{
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            padding: '2rem 1.4rem',
            background: 'linear-gradient(135deg, rgba(20,24,33,0.95) 0%, rgba(12,14,20,0.98) 100%)',
            border: '1.5px solid rgba(245,185,66,0.35)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 35px rgba(245,185,66,0.08)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(245,185,66,0.12)',
                border: '1px solid rgba(245,185,66,0.3)',
                borderRadius: '50px',
                padding: '0.35rem 0.85rem',
                marginBottom: '0.9rem',
              }}
            >
              <Sparkles size={14} color="#f5b942" />
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#f5b942',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: 'Outfit, sans-serif',
                }}
              >
                StyleCorner Atelier Lookbook
              </span>
            </div>

            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.15,
                margin: '0 0 0.65rem',
              }}
            >
              Signature Styles.{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #f5b942 0%, #ffd57e 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Verified Artisans.
              </span>
            </h1>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '0.86rem',
                lineHeight: 1.55,
                margin: '0 0 1.25rem',
                maxWidth: '620px',
              }}
            >
              Discover high-definition styling portfolios from verified braiders, barbers, nail artists, lash techs, and makeup masters across Lagos and Ibadan. Tap any style to inspect specs or book instantly.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#cbd5e1',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Star size={14} color="#f5b942" fill="#f5b942" />
                <span>4.95★ Platform Rating</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ShieldCheck size={15} color="#22c55e" />
                <span>100% Escrow Protected</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} color="#f5b942" />
                <span>Lagos & Ibadan Salons & VIP Home Visits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            marginBottom: '1rem',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#151822',
              borderRadius: '16px',
              border: '1.5px solid rgba(255,255,255,0.1)',
              padding: '0.35rem 0.9rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'border-color 0.2s ease',
            }}
          >
            <Search size={18} color="#94a3b8" style={{ flexShrink: 0, marginRight: '0.65rem' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search braids, fades, chrome nails, or location (e.g. Lekki, Bodija)..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontFamily: 'Outfit, sans-serif',
                fontSize: '0.88rem',
                padding: '0.45rem 0',
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
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Slider */}
        <div
          style={{
            display: 'flex',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
            marginBottom: '1.5rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.48rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? 800 : 600,
                  fontFamily: 'Outfit, sans-serif',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  backgroundColor: isActive ? '#f5b942' : '#151822',
                  color: isActive ? '#0c0e14' : '#cbd5e1',
                  border: isActive ? '1px solid #f5b942' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isActive ? '0 4px 14px rgba(245,185,66,0.3)' : 'none',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Lookbook Grid */}
        {filteredItems.length === 0 ? (
          <div
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#151822',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Sparkles size={36} color="#f5b942" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', color: '#ffffff', margin: '0 0 0.5rem' }}>
              No Styles Found
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: '0 0 1.25rem' }}>
              We couldn't find any portfolio styles matching "{searchQuery}".
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
                padding: '0.55rem 1.25rem',
                fontSize: '0.8rem',
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {filteredItems.map((item) => {
              const isLiked = Boolean(favorites[item.id]);
              const likesCount = item.baseLikes + (isLiked ? 1 : 0);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedStyle(item)}
                  style={{
                    backgroundColor: '#151822',
                    borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(245,185,66,0.4)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Photo Header */}
                  <div
                    style={{
                      position: 'relative',
                      height: '240px',
                      overflow: 'hidden',
                      backgroundColor: '#0c0e14',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = '/banner-braider.jpg';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center 25%',
                        transition: 'transform 0.35s ease',
                      }}
                    />

                    {/* Gradient Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(21,24,34,0.95) 0%, rgba(21,24,34,0.3) 50%, transparent 100%)',
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
                          border: '1px solid rgba(245,185,66,0.4)',
                          color: '#f5b942',
                          borderRadius: '50px',
                          padding: '0.25rem 0.65rem',
                          fontSize: '0.68rem',
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
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(12,14,20,0.85)',
                          backdropFilter: 'blur(8px)',
                          WebkitBackdropFilter: 'blur(8px)',
                          border: isLiked ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                          color: isLiked ? '#ef4444' : '#ffffff',
                        }}
                        title={isLiked ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Heart size={15} fill={isLiked ? '#ef4444' : 'none'} />
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
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#f5b942',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          marginBottom: '0.2rem',
                        }}
                      >
                        <Star size={12} fill="#f5b942" />
                        <span>{item.rating}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>({item.reviewCount} reviews)</span>
                      </div>
                      <div
                        style={{
                          color: '#ffffff',
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: '1rem',
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
                      padding: '1rem 1.15rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      flex: 1,
                    }}
                  >
                    <div>
                      {/* Stylist & Location */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', minWidth: 0 }}>
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
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#94a3b8',
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <Clock size={11} />
                          <span>{item.duration}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          color: '#94a3b8',
                          fontSize: '0.72rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <MapPin size={12} color="#f5b942" />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.location}
                        </span>
                      </div>

                      {/* Tags */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.3rem',
                          marginBottom: '0.9rem',
                        }}
                      >
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '6px',
                              padding: '0.2rem 0.45rem',
                              fontSize: '0.66rem',
                              fontWeight: 600,
                              color: '#94a3b8',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.62rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                          Starting from
                        </div>
                        <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#f5b942', fontFamily: 'Outfit' }}>
                          ₦{item.price.toLocaleString()}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStyle(item);
                          }}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '10px',
                            padding: '0.45rem 0.65rem',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontFamily: 'Outfit, sans-serif',
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
                            borderRadius: '10px',
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            color: '#0c0e14',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontFamily: 'Outfit, sans-serif',
                            boxShadow: '0 3px 10px rgba(245,185,66,0.3)',
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
            padding: '1rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#10131b',
              border: '1.5px solid rgba(245, 185, 66, 0.4)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(245, 185, 66, 0.12)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '0.85rem 1.2rem',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#151822',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{selectedStyle.duration}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => handleShareLook(selectedStyle)}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: 'none',
                    color: copiedLink ? '#4ade80' : '#ffffff',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Share Look"
                >
                  {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
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
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {/* Big Photo Preview */}
              <div style={{ position: 'relative', height: '270px', width: '100%', backgroundColor: '#0c0e14' }}>
                <img
                  src={selectedStyle.image}
                  alt={selectedStyle.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                  onError={(e) => {
                    e.target.src = '/banner-braider.jpg';
                  }}
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
                    bottom: '12px',
                    left: '16px',
                    right: '16px',
                  }}
                >
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Outfit' }}>
                    {selectedStyle.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#f5b942', fontWeight: 700, marginTop: '0.2rem' }}>
                    By {selectedStyle.stylist} • {selectedStyle.studio}
                  </div>
                </div>
              </div>

              {/* Details Content */}
              <div style={{ padding: '1.25rem 1.4rem' }}>
                {/* Location & Rating Strip */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1', fontSize: '0.8rem' }}>
                    <MapPin size={14} color="#f5b942" />
                    <span>{selectedStyle.location}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#f5b942', fontSize: '0.82rem', fontWeight: 800 }}>
                    <Star size={13} fill="#f5b942" />
                    <span>{selectedStyle.rating}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({selectedStyle.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f5b942', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    About This Look
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.55, margin: 0 }}>
                    {selectedStyle.desc}
                  </p>
                </div>

                {/* What's Included */}
                {Array.isArray(selectedStyle.included) && (
                  <div style={{ marginBottom: '1.1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f5b942', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Service Includes
                    </div>
                    <div style={{ display: 'grid', gap: '0.4rem' }}>
                      {selectedStyle.included.map((inc) => (
                        <div key={inc} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                          <Check size={13} color="#22c55e" />
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Maintenance Tip */}
                {selectedStyle.maintenance && (
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      backgroundColor: 'rgba(245,185,66,0.06)',
                      border: '1px solid rgba(245,185,66,0.2)',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f5b942', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                      Maintenance & Aftercare
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                      {selectedStyle.maintenance}
                    </div>
                  </div>
                )}

                {/* Escrow badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#4ade80', fontSize: '0.74rem', fontWeight: 700 }}>
                  <ShieldCheck size={15} />
                  <span>100% Escrow Protection: Funds held securely until service completion</span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Fixed CTA */}
            <div
              style={{
                padding: '0.9rem 1.4rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: '#151822',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.64rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                  Base Rate
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#f5b942', fontFamily: 'Outfit' }}>
                  ₦{selectedStyle.price.toLocaleString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(e, selectedStyle)}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    padding: '0.6rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    color: Boolean(favorites[selectedStyle.id]) ? '#ef4444' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  <Heart size={15} fill={Boolean(favorites[selectedStyle.id]) ? '#ef4444' : 'none'} />
                  <span>{selectedStyle.baseLikes + (Boolean(favorites[selectedStyle.id]) ? 1 : 0)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBookStyle(selectedStyle)}
                  style={{
                    background: 'linear-gradient(135deg, #f5b942, #d4af37)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.65rem 1.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    color: '#0c0e14',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontFamily: 'Outfit, sans-serif',
                    boxShadow: '0 4px 15px rgba(245,185,66,0.35)',
                  }}
                >
                  <Calendar size={15} />
                  <span>Book This Look</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
};
