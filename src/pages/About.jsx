import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, Clock, Award, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { preloadRoute } from '../App';

export const About = () => {
  const navigate = useNavigate();

  return (
    <PageContainer title="About Style Corner">
      <div style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        {/* Atelier Hero Banner */}
        <div
          className="app-card"
          style={{
            background: 'linear-gradient(135deg, #171717 0%, #0d0e14 100%)',
            color: '#ffffff',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)',
            textAlign: 'center',
            border: '1.5px solid rgba(245, 185, 66, 0.35)',
            marginBottom: '2rem',
            boxShadow: '0 20px 45px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(245, 185, 66, 0.15)',
              border: '1px solid rgba(245, 185, 66, 0.3)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: "center",
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 16px rgba(245, 185, 66, 0.25)',
            }}
          >
            <Sparkles size={32} />
          </div>

          <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: '0.65rem' }}>
            STYLE<span style={{ color: 'var(--color-accent)' }}>CORNER</span> ATELIER
          </h2>

          <p style={{ color: '#a1a1aa', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', lineHeight: 1.65, maxWidth: '680px', margin: '0 auto 1.5rem' }}>
            Nigeria’s premier technology-driven sanctuary for modern haircut craftsmanship, braiding artistry, 
            lash extensions, nail architecture, and luxury beauty styling.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => {
                preloadRoute('/services');
                navigate('/services');
              }}
              className="btn-cta-gold"
              style={{
                background: 'linear-gradient(135deg, #F5B942 0%, #e8912d 100%)',
                color: '#08090C',
                border: 'none',
                borderRadius: '50px',
                padding: '0.6rem 1.4rem',
                fontFamily: 'Outfit',
                fontWeight: 900,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>Explore Services</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                preloadRoute('/experts');
                navigate('/experts');
              }}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#ffffff',
                borderRadius: '50px',
                padding: '0.6rem 1.4rem',
                fontFamily: 'Outfit',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              Meet Verified Artists
            </button>
          </div>
        </div>

        {/* 2-Column Desktop Grid for Promise & Locations */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="app-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                Our Atelier Promise
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Founded in 2024, Style Corner pairs elite verified beauty specialists with seamless online appointment technology. 
                Whether booking an in-salon experience or a private VIP home visit, every session is backed by escrow protection.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                <Award size={19} color="var(--color-accent)" />
                <span style={{ fontWeight: 600 }}>100% Identity & Artistry Verified Specialists</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                <Sparkles size={19} color="var(--color-accent)" />
                <span style={{ fontWeight: 600 }}>Smart AI Stylist & Aesthetic Matcher</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                <ShieldCheck size={19} color="#10b981" />
                <span style={{ fontWeight: 600 }}>Digital Escrow Safe Checkout & Full Transparency</span>
              </div>
            </div>
          </div>

          <div className="app-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                Atelier Service Regions
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                We proudly serve metropolitan clients across prime residential and business hubs in Lagos and Oyo States.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={19} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>Lagos Hubs</strong>
                  <span>Ikeja GRA, Lekki Phase 1, Victoria Island, Yaba & Surulere</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                <MapPin size={19} color="var(--color-accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ color: 'var(--color-text-primary)', display: 'block' }}>Ibadan Hubs</strong>
                  <span>Bodija, Ring Road, Jericho & Oluyole Estate</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={19} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                <span>Operating Monday – Sunday: 8:00 AM – 9:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
