import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';

export const Policies = () => {
  return (
    <PageContainer title="Policies & Terms">
      <div style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="app-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={20} color="#d4af37" />
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717' }}>
              Cancellation & Rescheduling
            </h3>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>
            We request at least 2 hours advance notice for cancellations or appointment rescheduling. No-shows may be subject to a 20% reservation fee.
          </p>
        </div>

        <div className="app-card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <FileText size={20} color="#d4af37" />
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#171717' }}>
              Privacy & Account Security
            </h3>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.5 }}>
            Your account credentials, contact numbers, and appointment histories are stored securely with encrypted tokens. We never share your data.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};
