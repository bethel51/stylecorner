import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, Scissors, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

export const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'customer';
  const { register, showToast } = useAuth();

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    services: role === 'staff' ? 'Hair Cut Services, Hair Braiding Services' : '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstname || !form.email || !form.password) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await register({
        ...form,
        role: role === 'staff' ? 'staff' : 'customer',
      });
      showToast('Registration successful! Check your email for OTP code.', 'success');
      navigate(`/verify?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title={`Register as ${role === 'staff' ? 'Expert' : 'Client'}`}>
      <div style={{ maxWidth: '420px', margin: '0.5rem auto 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#171717',
              color: '#d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1.5px solid rgba(212,175,55,0.4)',
            }}
          >
            {role === 'staff' ? <Scissors size={26} /> : <Sparkles size={26} />}
          </div>
          <h2
            style={{
              fontFamily: 'Outfit',
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#171717',
            }}
          >
            Create Your Account
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            {role === 'staff'
              ? 'Join our artisan squad of elite grooming experts'
              : 'Unlock seamless mobile booking and grooming rewards'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="app-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="app-input-group">
              <label className="app-label">First Name *</label>
              <input
                type="text"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                placeholder="Alex"
                className="app-input"
                required
              />
            </div>

            <div className="app-input-group">
              <label className="app-label">Last Name</label>
              <input
                type="text"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                placeholder="Morgan"
                className="app-input"
              />
            </div>
          </div>

          <div className="app-input-group">
            <label className="app-label">Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="alex@example.com"
              className="app-input"
              required
            />
          </div>

          <div className="app-input-group">
            <label className="app-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="app-input"
            />
          </div>

          {role === 'staff' && (
            <div className="app-input-group">
              <label className="app-label">Specialties / Services (comma-separated)</label>
              <input
                type="text"
                name="services"
                value={form.services}
                onChange={handleChange}
                placeholder="Hair Cut Services, Hair Braiding Services, Nails"
                className="app-input"
              />
            </div>
          )}

          <div className="app-input-group">
            <label className="app-label">Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="app-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="app-btn app-btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            {submitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Continue to OTP Verification</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>
            Already registered?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{
                color: '#d4af37',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </PageContainer>
  );
};
