import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  Phone, 
  Mail, 
  Heart,
  Instagram,
  CheckCircle2
} from 'lucide-react';
import { preloadRoute } from '../../App';

export const DesktopFooter = () => {
  const navigate = useNavigate();

  const handleNav = (path) => {
    preloadRoute(path);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="desktop-atelier-footer">
      <div className="desktop-footer-inner">
        {/* Top Feature Highlight Strip */}
        <div className="desktop-footer-highlight-strip">
          <div className="footer-strip-item">
            <div className="footer-strip-icon">
              <ShieldCheck size={20} color="var(--color-accent)" />
            </div>
            <div>
              <div className="footer-strip-title">100% Vetted Talent</div>
              <div className="footer-strip-desc">Rigorous identity & artistry verification</div>
            </div>
          </div>

          <div className="footer-strip-divider" />

          <div className="footer-strip-item">
            <div className="footer-strip-icon">
              <Sparkles size={20} color="var(--color-accent)" />
            </div>
            <div>
              <div className="footer-strip-title">AI Aesthetic Matcher</div>
              <div className="footer-strip-desc">Personalized styling recommendations</div>
            </div>
          </div>

          <div className="footer-strip-divider" />

          <div className="footer-strip-item">
            <div className="footer-strip-icon">
              <MapPin size={20} color="var(--color-accent)" />
            </div>
            <div>
              <div className="footer-strip-title">Lagos & Ibadan Hubs</div>
              <div className="footer-strip-desc">Top-rated local salons & home services</div>
            </div>
          </div>

          <div className="footer-strip-divider" />

          <div className="footer-strip-item">
            <div className="footer-strip-icon">
              <Clock size={20} color="var(--color-accent)" />
            </div>
            <div>
              <div className="footer-strip-title">Instant Escrow Protection</div>
              <div className="footer-strip-desc">Funds released only after satisfaction</div>
            </div>
          </div>
        </div>

        {/* 4 Main Columns */}
        <div className="desktop-footer-grid">
          {/* Column 1: Brand & Atelier Vision */}
          <div className="desktop-footer-col brand-col">
            <div 
              className="footer-logo-row" 
              onClick={() => handleNav('/')}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src="/pwa-icon-192.png" 
                alt="StyleCorner Logo" 
                className="footer-logo-img" 
              />
              <div>
                <span className="footer-brand-title">
                  STYLE<span style={{ color: 'var(--color-accent)' }}>CORNER</span>
                </span>
                <span className="footer-brand-subtitle">Modern Grooming & Atelier Styling</span>
              </div>
            </div>

            <p className="footer-brand-desc">
              Nigeria’s curated platform connecting clients with elite barbers, braiders, 
              lash technicians, nail artists, makeup specialists, and wig installers. 
              Seamless appointment booking, home visits, and luxury beauty store.
            </p>

            <div className="footer-location-badge">
              <span className="location-pulse-dot" />
              <span>Active in Ikeja · Lekki · Yaba · VI · Bodija · Ring Road</span>
            </div>

            <div className="footer-trust-pill">
              <CheckCircle2 size={15} color="#10b981" />
              <span>Official Escrow & SSL Encrypted Checkout</span>
            </div>
          </div>

          {/* Column 2: Core Atelier Services */}
          <div className="desktop-footer-col">
            <h4 className="footer-col-title">Atelier Services</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleNav('/booking?service=Hair+Braider+%26+Stylist')} className="footer-link-btn">
                  Hair Braiding & Locs <ArrowUpRight size={13} className="arrow-hover" />
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/booking?service=Barber')} className="footer-link-btn">
                  Precision Barbering & Fades <ArrowUpRight size={13} className="arrow-hover" />
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/booking?service=Lash+Tech')} className="footer-link-btn">
                  Silk Lash Extensions <ArrowUpRight size={13} className="arrow-hover" />
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/booking?service=Nail+Tech')} className="footer-link-btn">
                  Gel & Acrylic Nail Art <ArrowUpRight size={13} className="arrow-hover" />
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/booking?service=Makeup+Artist')} className="footer-link-btn">
                  Bridal & Event Makeup <ArrowUpRight size={13} className="arrow-hover" />
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/booking?service=Wig+Installer+%26+Revamper')} className="footer-link-btn">
                  Lace Frontal & Wig Revamp <ArrowUpRight size={13} className="arrow-hover" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Platform Discovery */}
          <div className="desktop-footer-col">
            <h4 className="footer-col-title">Explore StyleCorner</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleNav('/services')} className="footer-link-btn">
                  All Services Directory
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/experts')} className="footer-link-btn">
                  Verified Specialists
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/ai-matcher')} className="footer-link-btn highlight-accent">
                  ✦ AI Stylist Matcher
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/store')} className="footer-link-btn">
                  Luxury Grooming Store
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/gallery')} className="footer-link-btn">
                  Atelier Portfolio Gallery
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/billboard-flyers')} className="footer-link-btn">
                  Marketing Flyers & Banners
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/role-selection')} className="footer-link-btn highlight-gold">
                  Join as a Stylist / Barber →
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Client Care & Policies */}
          <div className="desktop-footer-col">
            <h4 className="footer-col-title">Support & Trust</h4>
            <ul className="footer-links-list">
              <li>
                <button onClick={() => handleNav('/about')} className="footer-link-btn">
                  About Our Atelier
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/contact')} className="footer-link-btn">
                  Contact Concierge
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/policies')} className="footer-link-btn">
                  Cancellation & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/policies')} className="footer-link-btn">
                  Privacy & Data Security
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('/policies')} className="footer-link-btn">
                  Terms of Service
                </button>
              </li>
            </ul>

            <div className="footer-concierge-card">
              <div className="concierge-badge">VIP Concierge</div>
              <div className="concierge-hours">Daily: 8:00 AM – 9:00 PM WAT</div>
              <div className="concierge-location">Headquartered in Victoria Island, Lagos</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="desktop-footer-bottom-bar">
          <div className="footer-copyright">
            © {new Date().getFullYear()} StyleCorner Atelier Technologies. All rights reserved.
          </div>

          <div className="footer-bottom-links">
            <span onClick={() => handleNav('/policies')}>Terms</span>
            <span className="dot-sep">·</span>
            <span onClick={() => handleNav('/policies')}>Privacy</span>
            <span className="dot-sep">·</span>
            <span onClick={() => handleNav('/policies')}>Security</span>
            <span className="dot-sep">·</span>
            <span onClick={() => handleNav('/contact')}>Help</span>
          </div>

          <div className="footer-craft-mark">
            Crafted for Luxury Beauty & Modern Grooming in Nigeria
          </div>
        </div>
      </div>
    </footer>
  );
};
