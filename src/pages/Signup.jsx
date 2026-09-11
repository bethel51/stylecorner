import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, Scissors, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageContainer } from '../components/common/PageContainer';

const EXPERT_SERVICES = [
  { id: 'nail_tech', label: 'Nail Tech', icon: '💅', desc: 'Gel extensions, nail architecture & 3D nail art' },
  { id: 'lash_tech', label: 'Lash Tech', icon: '👁️', desc: 'Classic, hybrid & volume silk lash extensions' },
  { id: 'hair_braider', label: 'Hair Braider', icon: '🪢', desc: 'Knotless box braids, goddess braids & twists' },
  { id: 'hair_barber', label: 'Hair Barber', icon: '💈', desc: 'Precision fades, line-ups & beard sculpting' },
  { id: 'frontal_wig_install', label: 'Frontal Wig Installation', icon: '💇‍♀️', desc: 'Lace melting, custom frontal install & styling' },
  { id: 'manicure_pedicure', label: 'Manicure plus Pedicure', icon: '🦶', desc: 'Exfoliation, massage, cuticle prep & gel polish' },
  { id: 'wig_revamper', label: 'Wig Revamper', icon: '✨', desc: 'Deep washing, lace restoration & hot-comb revamp' },
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
        showToast(`Strictly maximum 2 services allowed. Deselect one to choose a different service.`, 'error');
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

    if (role === 'staff') {
      if (selectedServices.length === 0) {
        showToast('Please select up to 2 services you offer.', 'error');
        return;
      }
      if (selectedServices.length > MAX_SERVICES) {
        showToast(`Strictly select not more than ${MAX_SERVICES} services.`, 'error');
        return;
      }
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
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(0,0,0,0.02) 100%)',
              border: '1.5px solid rgba(212,175,55,0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label className="app-label" style={{ margin: 0, color: '#171717', fontWeight: 800 }}>
                  Services You Offer *
                </label>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  color: selectedServices.length === MAX_SERVICES ? '#10b981' : '#d4af37',
                  fontFamily: 'Outfit',
                  background: selectedServices.length === MAX_SERVICES ? 'rgba(16,185,129,0.12)' : 'rgba(212,175,55,0.15)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '50px',
                  border: selectedServices.length === MAX_SERVICES ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(212,175,55,0.3)',
                }}>
                  {selectedServices.length}/{MAX_SERVICES} Selected {selectedServices.length === MAX_SERVICES && '✓'}
                </span>
              </div>

              <p style={{ fontSize: '0.76rem', color: '#6b7280', margin: '0 0 0.85rem', lineHeight: 1.4 }}>
                Choose up to <strong>2 services</strong> you specialize in. Strictly not more than two services per verified expert account.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.55rem' }}>
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
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.75rem 0.9rem',
                        borderRadius: '14px',
                        border: isSelected
                          ? '1.5px solid #d4af37'
                          : '1px solid rgba(0,0,0,0.08)',
                        backgroundColor: isSelected
                          ? 'rgba(212,175,55,0.12)'
                          : isDisabled ? 'rgba(0,0,0,0.02)' : '#ffffff',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        opacity: isDisabled ? 0.45 : 1,
                        boxShadow: isSelected ? '0 4px 14px rgba(212,175,55,0.15)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        <span style={{ fontSize: '1.3rem', lineHeight: 1, flexShrink: 0 }}>{service.icon}</span>
                        <div style={{ minWidth: 0 }}>
                          <span style={{
                            display: 'block',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 800 : 600,
                            color: isSelected ? '#171717' : '#374151',
                            fontFamily: 'Outfit',
                          }}>
                            {service.label}
                          </span>
                          <span style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            color: isSelected ? '#785c00' : '#9ca3af',
                            marginTop: '0.1rem',
                          }}>
                            {service.desc}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? 'none' : '1.5px solid #d1d5db',
                        backgroundColor: isSelected ? '#d4af37' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isSelected && <Check size={12} color="#000" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '12px',
                  backgroundColor: selectedServices.length === MAX_SERVICES ? 'rgba(16,185,129,0.08)' : 'rgba(212,175,55,0.1)',
                  border: selectedServices.length === MAX_SERVICES ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(212,175,55,0.3)',
                }}>
                  <p style={{ fontSize: '0.74rem', color: selectedServices.length === MAX_SERVICES ? '#059669' : '#92700a', fontWeight: 700, margin: 0, fontFamily: 'Outfit' }}>
                    {selectedServices.length === MAX_SERVICES ? '✓ Selected (Maximum 2 reached):' : 'Selected:'} {selectedServices.join(' · ')}
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
