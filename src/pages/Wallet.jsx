import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  Eye,
  EyeOff,
  Plus,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  ArrowUpRight,
  History,
  Gift,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { PageContainer } from '../components/common/PageContainer';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { WithdrawFundsModal } from '../components/common/WithdrawFundsModal';
import { PopupModal } from '../components/common/PopupModal';

export const Wallet = () => {
  const navigate = useNavigate();
  const { user, showToast } = useAuth();

  const [walletBalance, setWalletBalance] = useState(user?.walletBalance ?? 0);
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('5000');
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const fetchBalance = async () => {
    try {
      const data = await api.getWalletBalance();
      if (data && typeof data.walletBalance === 'number') {
        setWalletBalance(data.walletBalance);
      }
    } catch (e) {}
  };

  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const data = await api.getWalletTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (e) {
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  const handleFundWallet = (e) => {
    e.preventDefault();
    const amt = Number(fundAmount);
    if (!amt || amt < 500) {
      showToast('Minimum deposit is ₦500', 'error');
      return;
    }
    setShowFundModal(false);
    navigate('/payment', {
      state: {
        title: 'Wallet Funding',
        amount: amt,
        description: 'Direct Deposit to Atelier Wallet',
        isTopup: true,
      },
    });
  };

  return (
    <PageContainer showBack={true}>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingBottom: '3rem' }}>
        
        {/* Screen 10: Header */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
            Wallet & Payments
          </h1>
        </div>

        {/* Screen 10: Wallet Balance Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            borderRadius: '22px',
            padding: '1.25rem',
            border: '1px solid var(--color-border)',
            marginBottom: '1.5rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontFamily: 'Outfit', fontWeight: 600 }}>
              Wallet Balance
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
              aria-label="Toggle balance visibility"
            >
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          <div
            style={{
              fontFamily: 'Outfit',
              fontSize: '2.1rem',
              fontWeight: 900,
              color: 'var(--color-text-primary)',
              marginBottom: '1.15rem',
              letterSpacing: '-0.02em',
            }}
          >
            {showBalance ? `₦${Number(walletBalance).toLocaleString()}` : '••••••••'}
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => setShowFundModal(true)}
              className="app-btn app-btn-accent"
              style={{
                flex: 1,
                minHeight: '44px',
                height: '44px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 800,
              }}
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Fund Wallet</span>
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="app-btn app-btn-outline"
              style={{
                flex: 1,
                minHeight: '44px',
                height: '44px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
              }}
            >
              <ArrowUpRight size={16} />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.85rem' }}>
            Payment Methods
          </h2>

          {/* Paystack Card */}
          <div
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              padding: '1rem',
              border: '1.5px solid #f5b942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.65rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--color-surface-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f5b942',
                }}
              >
                <CreditCard size={20} />
              </div>
              <div>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                  Paystack Secured Gateway
                </h4>
                <span style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>Cards, Bank Transfer & USSD</span>
              </div>
            </div>

            <div
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#f5b942',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0c0e14',
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>

          {/* + Add Card */}
          <button
            onClick={() => setShowFundModal(true)}
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              borderRadius: '16px',
              padding: '0.85rem 1rem',
              border: '1px dashed var(--color-border-accent)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              color: '#f5b942',
              fontFamily: 'Outfit',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
            <span>Fund Wallet via Card / Transfer</span>
          </button>
        </div>

        {/* Navigation Rows matching Screen 10 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <div
            onClick={() => setShowTransactionsModal(true)}
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              padding: '1rem',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <History size={18} color="var(--color-text-secondary)" />
              <span style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Transaction History
              </span>
            </div>
            <ChevronRight size={18} color="var(--color-text-muted)" />
          </div>

          <div
            onClick={() => setShowRewardsModal(true)}
            style={{
              background: 'var(--color-surface)',
              borderRadius: '16px',
              padding: '1rem',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Gift size={18} color="#f5b942" />
              <span style={{ fontFamily: 'Outfit', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Referral & Rewards
              </span>
            </div>
            <ChevronRight size={18} color="var(--color-text-muted)" />
          </div>
        </div>

      </div>

      {/* Fund Wallet Modal */}
      <PopupModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        title="Fund Atelier Wallet"
      >
        <form onSubmit={handleFundWallet}>
          <div className="app-input-group">
            <label className="app-label">Deposit Amount (₦)</label>
            <input
              type="number"
              className="app-input"
              value={fundAmount}
              onChange={(e) => setFundAmount(e.target.value)}
              placeholder="e.g. 5000"
              min="500"
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', marginBottom: '1.25rem' }}>
            {[2000, 5000, 10000, 20000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setFundAmount(String(amt))}
                style={{
                  flex: 1,
                  padding: '0.45rem',
                  borderRadius: '10px',
                  background: fundAmount === String(amt) ? '#f5b942' : '#1c202d',
                  color: fundAmount === String(amt) ? '#0c0e14' : '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.75rem',
                  fontFamily: 'Outfit',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ₦{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="app-btn app-btn-accent"
            style={{ borderRadius: '12px' }}
          >
            Proceed to Secure Payment
          </button>
        </form>
      </PopupModal>

      {/* Transaction History Modal */}
      <PopupModal
        isOpen={showTransactionsModal}
        onClose={() => setShowTransactionsModal(false)}
        title="Transaction History"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {loadingTx ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b', fontFamily: 'Outfit', fontSize: '0.85rem' }}>
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <History size={32} color="#64748b" style={{ marginBottom: '0.65rem', opacity: 0.6 }} />
              <p style={{ fontFamily: 'Outfit', fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                No transactions yet
              </p>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.78rem', color: '#475569', marginTop: '0.25rem' }}>
                Fund your wallet or book a service to get started
              </p>
            </div>
          ) : (
            transactions.map((tx, idx) => (
              <div
                key={tx._id || tx.id || idx}
                style={{
                  background: 'var(--color-surface-hover)',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text-primary)', margin: '0 0 0.15rem' }}>
                    {tx.type || tx.description || 'Transaction'}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                    {tx.date || (tx.createdAt ? new Date(tx.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '')}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'Outfit',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: tx.amount > 0 ? '#10b981' : 'var(--color-text-primary)',
                  }}
                >
                  {tx.amount > 0 ? `+₦${Number(tx.amount).toLocaleString()}` : `-₦${Math.abs(Number(tx.amount)).toLocaleString()}`}
                </span>
              </div>
            ))
          )}
        </div>
      </PopupModal>

      {/* Rewards Modal */}
      <PopupModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        title="Referral & Rewards"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(245, 185, 66, 0.15)',
              color: '#f5b942',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem',
            }}
          >
            <Gift size={26} />
          </div>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem' }}>
            Earn ₦2,000 on Every Referral
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45, marginBottom: '1.25rem' }}>
            Share your unique code with friends. They get 10% off their first service, and you receive ₦2,000 wallet credit!
          </p>
          <div
            style={{
              background: '#1c202d',
              borderRadius: '12px',
              padding: '0.75rem',
              border: '1px dashed #f5b942',
              fontFamily: 'Outfit',
              fontWeight: 800,
              fontSize: '1rem',
              color: '#f5b942',
              letterSpacing: '0.1em',
            }}
          >
            {user?.firstname ? `${user.firstname.toUpperCase()}-VIP` : 'STYLECORNER-VIP'}
          </div>
        </div>

      </PopupModal>

      {/* 3rd Saturday Withdraw Modal */}
      <WithdrawFundsModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        walletBalance={walletBalance}
        onSuccess={() => fetchBalance()}
      />

    </PageContainer>
  );
};
