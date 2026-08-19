import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Scissors, ArrowRight, ShieldCheck } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';

export const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    navigate(`/signup?role=${role}`);
  };

  return (
    <PageContainer title="Join Style Corner">
      <div style={{ maxWidth: '420px', margin: '1rem auto 2rem', textAlign: 'center' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(212, 175, 55, 0.12)',
            color: '#d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            border: '1px solid rgba(212, 175, 55, 0.3)',
          }}
        >
          <ShieldCheck size={28} />
        </div>

        <h2
          style={{
            fontFamily: 'Outfit',
            fontSize: '1.75rem',
            fontWeight: 800,
            color: '#171717',
            marginBottom: '0.5rem',
          }}
        >
          Select Account Type
        </h2>

        <p
          style={{
            color: '#6b7280',
            fontSize: '0.9rem',
            marginBottom: '2rem',
            lineHeight: 1.5,
          }}
        >
          Choose your account role to customize your Style Corner mobile experience.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Customer Role Card */}
          <div
            className="app-card"
            onClick={() => handleSelectRole('customer')}
            style={{
              cursor: 'pointer',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              border: '2px solid rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#171717',
                  color: '#d4af37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}
              >
                <User size={22} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#171717',
                  }}
                >
                  Client / Customer
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  Book visits, match AI specialists, buy grooming products.
                </p>
              </div>
            </div>
            <ArrowRight size={18} color="#d4af37" />
          </div>

          {/* Expert / Staff Role Card */}
          <div
            className="app-card"
            onClick={() => handleSelectRole('staff')}
            style={{
              cursor: 'pointer',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textAlign: 'left',
              border: '2px solid rgba(212,175,55,0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #d4af37, #b5952f)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                }}
              >
                <Scissors size={22} />
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#171717',
                  }}
                >
                  Expert / Technician
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                  Manage appointments, review requests, offer services.
                </p>
              </div>
            </div>
            <ArrowRight size={18} color="#171717" />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <p style={{ color: '#6b7280', fontSize: '0.88rem' }}>
            Already have an account?{' '}
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
