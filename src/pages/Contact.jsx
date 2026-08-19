import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';

export const Contact = () => {
  const { showToast } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      showToast('Thank you! Your message has been sent to our desk.', 'success');
      setForm({ name: '', email: '', message: '' });
      setSubmitting(false);
    }, 600);
  };

  return (
    <PageContainer title="Contact Atelier">
      <div style={{ maxWidth: '440px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit} className="app-card">
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#171717', marginBottom: '1rem' }}>
            Send Us a Message
          </h3>

          <div className="app-input-group">
            <label className="app-label">Your Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="app-input"
              placeholder="Full Name"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="app-input"
              placeholder="email@domain.com"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Message</label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="app-textarea"
              placeholder="How can our Concierge assist you today?"
              required
            />
          </div>

          <button type="submit" disabled={submitting} className="app-btn app-btn-primary">
            <Send size={16} />
            <span>{submitting ? 'Sending...' : 'Send Message'}</span>
          </button>
        </form>
      </div>
    </PageContainer>
  );
};
