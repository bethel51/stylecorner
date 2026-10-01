import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Contact = () => {
  const { showToast } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitContact(form);
      showToast('Thank you! Your message has been sent to our concierge desk.', 'success');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      showToast(err.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Contact Concierge">
      <div style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Left Column: Concierge Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="app-card" style={{ padding: '2rem', height: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(245,185,66,0.12)', border: '1px solid rgba(245,185,66,0.3)', borderRadius: '50px', padding: '0.35rem 0.85rem', color: 'var(--color-accent)', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
                <MessageSquare size={13} />
                <span>Concierge Desk</span>
              </div>

              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 900, color: 'var(--color-text-primary)', margin: '0 0 0.75rem', lineHeight: 1.2 }}>
                We’re Here to Perfect Your Atelier Experience
              </h2>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                Need help matching with a specific stylist, booking wedding & bridal parties, or managing a salon order? 
                Our executive concierge desk is available 7 days a week.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245,185,66,0.12)', border: '1px solid rgba(245,185,66,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Direct Email</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.92rem' }}>concierge@stylecorner.world</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245,185,66,0.12)', border: '1px solid rgba(245,185,66,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>WhatsApp Concierge</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.92rem' }}>+234 810 000 0000</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(245,185,66,0.12)', border: '1px solid rgba(245,185,66,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Operating Hours</span>
                    <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.92rem' }}>Daily: 8:00 AM – 9:00 PM WAT</strong>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={20} color="#10b981" />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Escrow protected appointments with guaranteed on-time specialist arrival.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="app-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>
                Send Us a Message
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', margin: '0 0 1.5rem' }}>
                Fill out the form below and our team will get back to you within minutes.
              </p>

              <div className="app-input-group" style={{ marginBottom: '1.2rem' }}>
                <label className="app-label">Your Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="app-input"
                  placeholder="e.g. Chioma Adeyemi"
                  required
                />
              </div>

              <div className="app-input-group" style={{ marginBottom: '1.2rem' }}>
                <label className="app-label">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="app-input"
                  placeholder="chioma@example.com"
                  required
                />
              </div>

              <div className="app-input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="app-label">Your Inquiry or Message</label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="app-textarea"
                  placeholder="How can our Concierge assist your styling or booking needs?"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="btn-cta-gold"
                style={{
                  width: '100%',
                  minHeight: '50px',
                  background: 'linear-gradient(135deg, #F5B942 0%, #e8912d 100%)',
                  color: '#08090C',
                  border: 'none',
                  borderRadius: '50px',
                  fontFamily: 'Outfit',
                  fontWeight: 900,
                  fontSize: '0.94rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(245,185,66,0.35)',
                }}
              >
                <Send size={16} />
                <span>{submitting ? 'Sending to Concierge...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </PageContainer>
  );
};
