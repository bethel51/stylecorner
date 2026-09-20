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
              background: '#151822', color: '#F5B942',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
              border: '1.5px solid rgba(245,185,66,0.3)',
            }}
          >
            {role === 'staff' ? <Scissors size={26} /> : <Sparkles size={26} />}
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
            Create Your Account
          </h2>
          <p style={{ color: '#9AA2B3', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            {role === 'staff'
              ? 'Join our artisan squad of elite grooming experts'
              : 'Unlock seamless mobile booking and grooming rewards'}
          </p>
        </div>

        <div style={{ background: '#151822', borderRadius: '24px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
          <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>First Name *</label>
              <input type="text" name="firstname" value={form.firstname} onChange={handleChange}
                placeholder="Alex" required style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Last Name</label>
              <input type="text" name="lastname" value={form.lastname} onChange={handleChange}
                placeholder="Morgan" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Email Address *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="alex@example.com" required style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Phone Number</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+234 800 000 0000" style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#9AA2B3', marginBottom: '0.4rem', fontFamily: 'Outfit' }}>Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              placeholder="••••••••" required style={{ width: '100%', padding: '0.8rem 0.9rem', borderRadius: '12px', background: '#0C0E14', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', fontFamily: 'Outfit', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Service Selection for Experts */}
          {role === 'staff' && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              background: 'rgba(245,185,66,0.05)',
              border: '1px solid rgba(245,185,66,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ margin: 0, color: '#FFFFFF', fontWeight: 700, fontSize: '0.82rem', fontFamily: 'Outfit' }}>
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

              <p style={{ fontSize: '0.76rem', color: '#9AA2B3', margin: '0 0 0.85rem', lineHeight: 1.4 }}>
                Choose up to <strong style={{ color: '#F5B942' }}>2 services</strong> you specialize in.
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
                          ? '1.5px solid #F5B942'
                          : '1px solid rgba(255,255,255,0.08)',
                        backgroundColor: isSelected
                          ? 'rgba(245,185,66,0.1)'
                          : isDisabled ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        opacity: isDisabled ? 0.4 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
                        <span style={{ fontSize: '1.3rem', lineHeight: 1, flexShrink: 0 }}>{service.icon}</span>
                        <div style={{ minWidth: 0 }}>
                          <span style={{
                            display: 'block',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 700 : 600,
                            color: isSelected ? '#F5B942' : '#FFFFFF',
                            fontFamily: 'Outfit',
                          }}>
                            {service.label}
                          </span>
                          <span style={{
                            display: 'block',
                            fontSize: '0.68rem',
                            color: '#9AA2B3',
                            marginTop: '0.1rem',
                          }}>
                            {service.desc}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        border: isSelected ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                        backgroundColor: isSelected ? '#F5B942' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        {isSelected && <Check size={12} color="#0C0E14" strokeWidth={3} />}
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
            style={{
              width: '100%', padding: '1rem', borderRadius: '16px', marginTop: '1.25rem',
              background: submitting ? 'rgba(245,185,66,0.6)' : '#F5B942',
              color: '#0C0E14', fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              minHeight: '54px',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
            }}
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
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <p style={{ color: '#9AA2B3', fontSize: '0.88rem' }}>
            Already registered?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                background: 'none', border: 'none',
                color: '#F5B942', fontWeight: 700, cursor: 'pointer',
                fontSize: '0.88rem', fontFamily: 'Outfit',
                padding: '0.25rem 0.1rem',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </PageContainer>
  );
};
