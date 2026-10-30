import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  FileText,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { WithdrawFundsModal } from '../components/common/WithdrawFundsModal';

export const ExpertTransactionsPage = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'credit' | 'debit'
  const [searchQuery, setSearchQuery] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [balRes, txRes] = await Promise.allSettled([
        api.getWalletBalance ? api.getWalletBalance() : Promise.resolve(null),
        api.getWalletTransactions ? api.getWalletTransactions() : Promise.resolve([]),
      ]);

      if (balRes.status === 'fulfilled' && balRes.value) {
        const bal = typeof balRes.value.walletBalance === 'number'
          ? balRes.value.walletBalance
          : typeof balRes.value.balance === 'number'
          ? balRes.value.balance
          : typeof balRes.value === 'number'
          ? balRes.value
          : 0;
        setWalletBalance(bal);
      }

      if (txRes.status === 'fulfilled' && Array.isArray(txRes.value)) {
        setTransactions(txRes.value);
      } else if (txRes.status === 'fulfilled' && txRes.value?.transactions) {
        setTransactions(txRes.value.transactions);
      }
    } catch (err) {
      console.error('Error fetching wallet transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Compute lifetime earnings & outflow
  const { totalInflow, totalOutflow } = useMemo(() => {
    let inflow = 0;
    let outflow = 0;
    transactions.forEach((t) => {
      const amt = Math.abs(Number(t.amount || 0));
      if (t.type === 'credit' || t.amount > 0) {
        inflow += amt;
      } else {
        outflow += amt;
      }
    });
    return { totalInflow: inflow, totalOutflow: outflow };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const isCredit = t.type === 'credit' || t.amount > 0;
      if (filterType === 'credit' && !isCredit) return false;
      if (filterType === 'debit' && isCredit) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const desc = (t.description || t.type || '').toLowerCase();
        const ref = (t.reference || t._id || '').toLowerCase();
        return desc.includes(q) || ref.includes(q);
      }
      return true;
    });
  }, [transactions, filterType, searchQuery]);

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast('No transaction data to export.', 'error');
      return;
    }
    const headers = ['Date', 'Description', 'Type', 'Amount (NGN)', 'Reference'];
    const rows = transactions.map((t) => [
      t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Recent',
      `"${(t.description || t.type || 'Wallet Activity').replace(/"/g, '""')}"`,
      t.type === 'credit' || t.amount > 0 ? 'Credit' : 'Debit',
      Math.abs(Number(t.amount || 0)),
      `"${t.reference || t._id || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stylecorner-wallet-statement-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Statement exported to CSV successfully!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageContainer showBack={false}>
      <div style={{ maxWidth: '780px', margin: '0 auto', paddingBottom: '4rem' }}>

        {/* Top Header Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem' }}>
          <button
            onClick={() => {
              if (window.history.length > 2) {
                navigate(-1);
              } else {
                navigate(user?.role === 'staff' || user?.role === 'expert' ? '/expert-dashboard' : '/wallet');
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '0.55rem 0.95rem',
              color: '#e2e8f0',
              fontFamily: 'Outfit',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '0.55rem 0.95rem',
                color: '#e2e8f0',
                fontFamily: 'Outfit',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Export Statement as CSV"
            >
              <Download size={14} /> Export CSV
            </button>
            <button
              onClick={fetchWalletData}
              disabled={loading}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
              title="Refresh ledger"
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f5b942', fontSize: '0.76rem', fontWeight: 800, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>
            <Wallet size={13} /> Financial Ledger & Payout Statements
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
            Wallet Transaction History
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '0.35rem', marginBottom: 0 }}>
            Complete audit trail of all service earnings, appointment credits, top-ups, and bank withdrawals.
          </p>
        </div>

        {/* Financial Summary Card */}
        <div
          style={{
            background: 'radial-gradient(circle at 85% 20%, rgba(245, 185, 66, 0.18) 0%, transparent 60%), linear-gradient(135deg, #151824 0%, #0d1017 100%)',
            border: '1.5px solid rgba(245, 185, 66, 0.32)',
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.6), 0 0 24px rgba(245, 185, 66, 0.08)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.74rem', fontFamily: 'Outfit', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Available Balance
              </span>
              <div style={{ fontFamily: 'Outfit', fontSize: '2.3rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, marginTop: '0.2rem' }}>
                ₦{Number(walletBalance || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem' }}>
                <ShieldCheck size={12} /> Real-time Escrow & Verified Paystack
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  navigate('/payment', {
                    state: {
                      title: 'Wallet Funding',
                      amount: 5000,
                      description: 'Direct Deposit to Atelier Wallet',
                      isTopup: true,
                    },
                  });
                }}
                style={{
                  background: '#f5b942',
                  border: 'none',
                  color: '#0c0e14',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: '0 4px 14px rgba(245, 185, 66, 0.3)',
                }}
              >
                <ArrowDownLeft size={15} /> Top Up Wallet
              </button>

              <button
                onClick={() => setShowWithdrawModal(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  fontSize: '0.82rem',
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <ArrowUpRight size={15} /> Request Payout
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '1rem',
            }}
          >
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '16px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Inflow / Earnings
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#10b981', marginTop: '0.2rem' }}>
                +₦{totalInflow.toLocaleString()}
              </div>
            </div>

            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 800, fontFamily: 'Outfit', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Outflow / Payouts
              </div>
              <div style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#f87171', marginTop: '0.2rem' }}>
                -₦{totalOutflow.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by appointment, service, reference ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#151824',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '14px',
                padding: '0.75rem 1rem 0.75rem 2.6rem',
                color: '#ffffff',
                fontFamily: 'Outfit',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
            {[
              { id: 'all', label: `All Transactions (${transactions.length})` },
              { id: 'credit', label: `Earnings & Credits (+)` },
              { id: 'debit', label: `Withdrawals & Debits (-)` },
            ].map((chip) => {
              const active = filterType === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setFilterType(chip.id)}
                  style={{
                    background: active ? '#f5b942' : '#151824',
                    color: active ? '#0c0e14' : '#94a3b8',
                    border: active ? '1px solid #f5b942' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '50px',
                    padding: '0.4rem 0.95rem',
                    fontFamily: 'Outfit',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transaction History List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  background: '#151824',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  height: '70px',
                  opacity: 0.5,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div
            style={{
              background: '#151824',
              borderRadius: '22px',
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 185, 66, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#f5b942' }}>
              <Wallet size={32} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', margin: '0 0 0.35rem' }}>
              {searchQuery || filterType !== 'all' ? 'No matching transactions' : 'No transaction history recorded yet'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
              {searchQuery || filterType !== 'all'
                ? 'Try clearing your search query or switching your transaction filter tab.'
                : 'When client appointments are marked as completed, fees are settled, or funds are withdrawn, details will appear here instantly.'}
            </p>
            {(searchQuery || filterType !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterType('all');
                }}
                style={{
                  background: 'rgba(245, 185, 66, 0.15)',
                  color: '#f5b942',
                  border: '1px solid rgba(245, 185, 66, 0.35)',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '50px',
                  fontFamily: 'Outfit',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {filteredTransactions.map((t, idx) => {
              const isCredit = t.type === 'credit' || t.amount > 0;
              const formattedDate = t.createdAt
                ? new Date(t.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              return (
                <div
                  key={t._id || idx}
                  style={{
                    background: '#151824',
                    borderRadius: '16px',
                    padding: '1rem 1.15rem',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                    {/* Icon */}
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: isCredit ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: isCredit ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCredit ? '#10b981' : '#f87171',
                        flexShrink: 0,
                      }}
                    >
                      {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'Outfit',
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          color: '#ffffff',
                          marginBottom: '0.2rem',
                          wordBreak: 'break-word',
                        }}
                      >
                        {t.description || t.type || 'Wallet Activity'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span>{formattedDate}</span>
                        {t.reference && (
                          <>
                            <span>•</span>
                            <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>Ref: {String(t.reference).slice(0, 12)}</span>
                          </>
                        )}
                        <span style={{
                          background: isCredit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: isCredit ? '#10b981' : '#f87171',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                        }}>
                          {isCredit ? 'CREDIT' : 'DEBIT'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div
                    style={{
                      fontFamily: 'Outfit',
                      fontSize: '1.08rem',
                      fontWeight: 900,
                      color: isCredit ? '#10b981' : '#f87171',
                      flexShrink: 0,
                      textAlign: 'right',
                    }}
                  >
                    {isCredit ? '+' : '-'}₦{Math.abs(Number(t.amount || 0)).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Withdraw Funds Modal */}
        <WithdrawFundsModal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          walletBalance={walletBalance}
          onSuccess={(newBal) => {
            if (typeof newBal === 'number') setWalletBalance(newBal);
            fetchWalletData();
          }}
        />

      </div>
    </PageContainer>
  );
};

export default ExpertTransactionsPage;
