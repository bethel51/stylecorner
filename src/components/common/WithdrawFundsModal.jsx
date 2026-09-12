import React, { useState, useEffect } from 'react';
import { PopupModal } from './PopupModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  Lock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const WithdrawFundsModal = ({
  isOpen,
  onClose,
  walletBalance = 0,
  onSuccess,
}) => {
  const { user, showToast } = useAuth();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [banksList, setBanksList] = useState([]);
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [selectedBankName, setSelectedBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [resolveError, setResolveError] = useState('');
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

  // 3rd Saturday Schedule Info
  const [windowInfo, setWindowInfo] = useState({
    isOpen: false,
    nextThirdSaturday: 'Loading schedule...',
    daysUntilNext: 0,
    message: '',
  });
  const [loadingWindow, setLoadingWindow] = useState(true);

  // Fetch banks list & window status on mount / open
  useEffect(() => {
    if (isOpen) {
      fetchWindowInfo();
      fetchBanks();
      setResolveError('');
      setWithdrawAmount('');
      setAccountNumber('');
      setAccountName('');
      setSelectedBankCode('');
      setSelectedBankName('');
    }
  }, [isOpen]);

  const fetchWindowInfo = async () => {
    setLoadingWindow(true);
    try {
      const data = await api.getWithdrawalWindow();
      if (data) setWindowInfo(data);
    } catch (e) {
      console.warn('Could not fetch withdrawal window status', e);
    } finally {
      setLoadingWindow(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const data = await api.getBanksList();
      if (Array.isArray(data) && data.length > 0) {
        setBanksList(data);
      }
    } catch (e) {
      console.warn('Failed to load banks list', e);
    }
  };

  // NUBAN Account Resolution
  const handleBankChange = (e) => {
    const code = e.target.value;
    setSelectedBankCode(code);
    const bankObj = banksList.find((b) => b.code === code);
    setSelectedBankName(bankObj ? bankObj.name : '');
    setAccountName('');
    setResolveError('');
    if (accountNumber.trim().length === 10 && code) {
      resolveAccount(accountNumber.trim(), code);
    }
  };

  const handleAccountNumberChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(val);
    setAccountName('');
    setResolveError('');
    if (val.length === 10 && selectedBankCode) {
      resolveAccount(val, selectedBankCode);
    }
  };

  const resolveAccount = async (accNum, bCode) => {
    setResolvingAccount(true);
    setResolveError('');
    try {
      const result = await api.resolveBankAccount(accNum, bCode);
      if (result && result.accountName) {
        setAccountName(result.accountName);
      } else {
        setResolveError('Could not verify account name. Please check bank and number.');
      }
    } catch (err) {
      setResolveError(err.message || 'Account verification failed. Please verify bank & account number.');
    } finally {
      setResolvingAccount(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);

    if (!amt || amt < 1000) {
      showToast('Minimum withdrawal amount is ₦1,000.', 'error');
      return;
    }
    if (amt > walletBalance) {
      showToast(`Insufficient balance. Maximum withdrawable: ₦${Number(walletBalance).toLocaleString()}`, 'error');
      return;
    }
    if (!accountName || !selectedBankName || !accountNumber) {
      showToast('Please resolve and confirm your destination bank account first.', 'error');
      return;
    }

    // Check 3rd Saturday window (allow admin override)
    if (!windowInfo.isOpen && user?.role !== 'admin') {
      showToast(
        `Withdrawals are only accepted on the 3rd Saturday of the month. Next window: ${windowInfo.nextThirdSaturday}.`,
        'error'
      );
      return;
    }

    setWithdrawSubmitting(true);
    try {
      const res = await api.requestWithdrawal({
        amount: amt,
        bankName: selectedBankName,
        bankCode: selectedBankCode,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      });

      showToast(`Withdrawal of ₦${amt.toLocaleString()} submitted successfully! Admin will process transfer.`, 'success');
      onClose();
      if (onSuccess) {
        onSuccess(res.walletBalance !== undefined ? res.walletBalance : walletBalance - amt);
      }
    } catch (err) {
      showToast(err.message || 'Withdrawal failed. Please try again.', 'error');
    } finally {
      setWithdrawSubmitting(false);
    }
  };

  const isWindowClosed = !windowInfo.isOpen && user?.role !== 'admin';

  return (
    <PopupModal
      isOpen={isOpen}
      onClose={onClose}
      title="Withdraw Funds to Nigerian Bank"
    >
      <form onSubmit={handleSubmit} style={{ padding: '0.25rem 0' }}>
        {/* ── 3RD SATURDAY SCHEDULE NOTIFICATION BANNER ── */}
        <div
          style={{
            borderRadius: '14px',
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            border: windowInfo.isOpen
              ? '1px solid rgba(34,197,94,0.35)'
              : '1px solid rgba(234,179,8,0.35)',
            backgroundColor: windowInfo.isOpen
              ? 'rgba(34,197,94,0.08)'
              : 'rgba(234,179,8,0.08)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: windowInfo.isOpen ? '#16a34a' : '#ca8a04',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {windowInfo.isOpen ? <CheckCircle size={16} /> : <Calendar size={16} />}
          </div>
          <div>
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                fontFamily: 'Outfit',
                color: windowInfo.isOpen ? '#15803d' : '#854d0e',
              }}
            >
              {windowInfo.isOpen
                ? '🟢 Withdrawal Window OPEN Today!'
                : '🗓️ Monthly Withdrawal Window: 3rd Saturday'}
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: windowInfo.isOpen ? '#166534' : '#713f12',
                marginTop: '0.15rem',
                lineHeight: 1.4,
              }}
            >
              {windowInfo.isOpen
                ? 'Requests submitted today will be processed and disbursed directly to your verified bank account.'
                : `Withdrawals open exclusively on the 3rd Saturday of every month. Next Window: ${windowInfo.nextThirdSaturday}${windowInfo.daysUntilNext ? ` (${windowInfo.daysUntilNext} day${windowInfo.daysUntilNext === 1 ? '' : 's'} away)` : ''}.`}
            </div>
          </div>
        </div>

        {/* Current Withdrawable Balance Banner */}
        <div
          style={{
            background: '#fafaf9',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '14px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.68rem', color: '#78716c', fontWeight: 800, textTransform: 'uppercase' }}>
              Withdrawable Balance
            </div>
            <div style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 900, color: '#171717' }}>
              ₦{Number(walletBalance).toLocaleString()}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWithdrawAmount(String(walletBalance))}
            style={{
              background: 'rgba(212,175,55,0.15)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: '#b5952f',
              padding: '0.35rem 0.65rem',
              borderRadius: '50px',
              fontSize: '0.72rem',
              fontFamily: 'Outfit',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Withdraw All
          </button>
        </div>

        {/* Amount to Withdraw */}
        <div className="app-input-group" style={{ marginBottom: '0.85rem' }}>
          <label className="app-label">Withdrawal Amount (₦)</label>
          <input
            type="number"
            min="1000"
            max={walletBalance}
            required
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Minimum ₦1,000"
            className="app-input"
            style={{ fontFamily: 'Outfit', fontSize: '1rem', fontWeight: 700 }}
          />
        </div>

        {/* Select Destination Bank */}
        <div className="app-input-group" style={{ marginBottom: '0.85rem' }}>
          <label className="app-label">Select Destination Bank</label>
          <select
            value={selectedBankCode}
            onChange={handleBankChange}
            required
            className="app-input"
            style={{ fontFamily: 'Outfit', fontSize: '0.85rem', fontWeight: 700 }}
          >
            <option value="">Select a Nigerian Bank...</option>
            {banksList.map((b, idx) => (
              <option key={`${b.code}-${idx}`} value={b.code}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* 10-Digit NUBAN Account Number */}
        <div className="app-input-group" style={{ marginBottom: '0.85rem' }}>
          <label className="app-label">10-Digit NUBAN Account Number</label>
          <input
            type="text"
            maxLength={10}
            required
            value={accountNumber}
            onChange={handleAccountNumberChange}
            placeholder="0123456789"
            className="app-input"
            style={{ fontFamily: 'monospace', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.08em' }}
          />
        </div>

        {/* Live Account Resolution Badge */}
        {resolvingAccount && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px dashed #94a3b8',
              borderRadius: '12px',
              padding: '0.75rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              color: '#64748b',
            }}
          >
            <Clock size={16} className="spin-slow" />
            <span>Resolving official NUBAN account name live...</span>
          </div>
        )}

        {accountName && !resolvingAccount && (
          <div
            style={{
              background: 'rgba(34,197,94,0.08)',
              border: '1.5px solid rgba(34,197,94,0.4)',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <ShieldCheck size={20} color="#16a34a" />
            <div>
              <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase' }}>
                Verified Account Name
              </div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>
                {accountName}
              </div>
            </div>
          </div>
        )}

        {resolveError && (
          <div
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '12px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#ef4444',
              fontSize: '0.78rem',
            }}
          >
            <AlertTriangle size={15} />
            <span>{resolveError}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={
            withdrawSubmitting ||
            !accountName ||
            !withdrawAmount ||
            Number(withdrawAmount) < 1000 ||
            Number(withdrawAmount) > walletBalance ||
            isWindowClosed
          }
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '12px',
            backgroundColor: isWindowClosed ? '#94a3b8' : '#d4af37',
            color: isWindowClosed ? '#f1f5f9' : '#111111',
            fontWeight: 800,
            fontSize: '0.9rem',
            border: 'none',
            cursor: isWindowClosed ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            boxShadow: isWindowClosed ? 'none' : '0 4px 14px rgba(212,175,55,0.3)',
            transition: 'all 0.15s ease',
          }}
        >
          {isWindowClosed ? (
            <>
              <Lock size={15} />
              <span>Withdrawals Open on 3rd Saturday</span>
            </>
          ) : (
            <>
              <ArrowUpRight size={16} />
              <span>
                {withdrawSubmitting
                  ? 'Processing Payout Request...'
                  : `Authorize ₦${Number(withdrawAmount || 0).toLocaleString()} Payout`}
              </span>
            </>
          )}
        </button>

        {isWindowClosed && (
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#64748b', marginTop: '0.65rem' }}>
            Next window opens: <strong>{windowInfo.nextThirdSaturday}</strong>
          </div>
        )}
      </form>
    </PopupModal>
  );
};
