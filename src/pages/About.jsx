import React from 'react';
import { Sparkles, MapPin, Phone, Mail, Clock, Award } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';

export const About = () => {
  return (
    <PageContainer title="About Style Corner">
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <div
          className="app-card"
          style={{
            background: 'linear-gradient(135deg, #171717, #0d0d0d)',
            color: '#ffffff',
            borderRadius: '20px',
            padding: '1.75rem 1.25rem',
            textAlign: 'center',
            border: '1.5px solid rgba(212, 175, 55, 0.4)',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(212, 175, 55, 0.15)',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Sparkles size={28} />
          </div>

          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.5rem' }}>
            STYLE<span style={{ color: '#d4af37' }}>CORNER</span> ATELIER
          </h2>

          <p style={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 1.6 }}>
            The premier sanctuary for modern haircut craftsmanship, braiding artistry, nail architecture, and luxury executive grooming.
          </p>
        </div>

        <div className="app-card">
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#171717', marginBottom: '0.75rem' }}>
            Our Atelier Promise
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1rem' }}>
            Founded in 2024, Style Corner pairs elite artisan hair technicians with cutting-edge mobile appointment technology to ensure seamless client booking and personalized styling experiences.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#171717' }}>
              <Award size={18} color="#d4af37" />
              <span>Licensed Master Stylists & Technicians</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#171717' }}>
              <Sparkles size={18} color="#d4af37" />
              <span>AI Specialist Portfolio Matcher</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', color: '#171717' }}>
              <Clock size={18} color="#d4af37" />
              <span>Automated Day Appointment Reminders</span>
            </div>
          </div>
        </div>

        <div className="app-card">
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', fontWeight: 800, color: '#171717', marginBottom: '0.75rem' }}>
            Flagship Lounge Location
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={18} color="#d4af37" />
              <span>123 Fashion Ave, Fashion District, NY 10001</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Phone size={18} color="#d4af37" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Mail size={18} color="#d4af37" />
              <span>info@stylecorner.com</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
