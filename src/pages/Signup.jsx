import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, Scissors, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

const EXPERT_SERVICES = [
  { id: 'lash', label: 'Lash Tech', icon: '👁️' },
  { id: 'nail', label: 'Nail Tech', icon: '💅' },
  { id: 'wig_install', label: 'Wig Installer', icon: '💇‍♀️' },
  { id: 'wig_revamp', label: 'Wig Revamper', icon: '✨' },
  { id: 'makeup', label: 'Makeup Artist', icon: '💄' },
  { id: 'braider', label: 'Hair Stylist (Braider)', icon: '🪢' },
  { id: 'pedicure', label: 'Pedicure', icon: '🦶' },
  { id: 'manicure', label: 'Manicure', icon: '💅' },
];

const MAX_SERVICES = 2;

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
  });

  const [selectedServices, setSelectedServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleService = (label) => {
    setSelectedServices(prev => {
      if (prev.includes(label)) {
        return prev.filter(s => s !== label);
      }
      if (prev.length >= MAX_SERVICES) {
        showToast(`You can select up to ${MAX_SERVICES} services.`, 'error');
        return prev;
      }
      return [...prev, label];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstname || !form.email || !form.password) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    if (role === 'staff' && selectedServices.length === 0) {
      showToast('Please select at least one service specialty.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        ...form,
        role: role === 'staff' ? 'staff' : 'customer',
        services: role === 'staff' ? selectedServices : [],
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
      <div style={{ maxWidth: '460px', margin: '0.5rem auto 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: '#171717', color: '#d4af37',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1.5px solid rgba(212,175,55,0.4)',
            }}
          >
            {role === 'staff' ? <Scissors size={26} /> : <Sparkles size={26} />}
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 800, color: '#171717' }}>
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
              <input type="text" name="firstname" value={form.firstname} onChange={handleChange}
                placeholder="Alex" className="app-input" required />
            </div>
            <div className="app-input-group">
              <label className="app-label">Last Name</label>
              <input type="text" name="lastname" value={form.lastname} onChange={handleChange}
                placeholder="Morgan" className="app-input" />
            </div>
          </div>

          <div className="app-input-group">
            <label className="app-label">Email Address *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="alex@example.com" className="app-input" required />
          </div>

          <div className="app-input-group">
            <label className="app-label">Phone Number</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+1 (555) 000-0000" className="app-input" />
          </div>

          <div className="app-input-group">
            <label className="app-label">Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="••••••••" className="app-input" required />
          </div>

          {/* Service Selection for Experts */}
          {role === 'staff' && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label className="app-label" style={{ margin: 0 }}>Your Specialties *</label>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, color: selectedServices.length >= MAX_SERVICES ? '#d4af37' : '#9ca3af',
                  fontFamily: 'Outfit',
                }}>
                  {selectedServices.length}/{MAX_SERVICES} selected
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {EXPERT_SERVICES.map(service => {
                  const isSelected = selectedServices.includes(service.label);
                  const isDisabled = !isSelected && selectedServices.length >= MAX_SERVICES;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.label)}
                      disabled={isDisabled}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 0.75rem',
                        borderRadius: '12px',
                        border: isSelected
                          ? '1.5px solid #d4af37'
                          : '1.5px solid rgba(0,0,0,0.1)',
                        backgroundColor: isSelected
                          ? 'rgba(212,175,55,0.1)'
                          : isDisabled ? 'rgba(0,0,0,0.02)' : '#f9fafb',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        opacity: isDisabled ? 0.4 : 1,
                        position: 'relative',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', lineHeight: 1, flexShrink: 0 }}>{service.icon}</span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#92700a' : '#374151',
                        fontFamily: 'Outfit', lineHeight: 1.3,
                        flex: 1,
                      }}>
                        {service.label}
                      </span>
                      {isSelected && (
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          backgroundColor: '#d4af37', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Check size={11} color="#000" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.85rem', borderRadius: '10px', backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <p style={{ fontSize: '0.75rem', color: '#92700a', fontWeight: 600, margin: 0, fontFamily: 'Outfit' }}>
                    ✓ Selected: {selectedServices.join(' · ')}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="app-btn app-btn-primary"
            style={{ marginTop: '1rem' }}
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
              style={{ color: '#d4af37', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </PageContainer>
  );
};
