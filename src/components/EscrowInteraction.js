import React, { useState } from 'react';
import { depositEscrow, releaseEscrow, refundEscrow } from './Soroban';
import { getBalance } from './Freighter';

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white inline-block mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const StatusAlert = ({ status, type }) => {
  if (!status) return null;

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    loading: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  const icons = {
    success: '✅',
    error: '❌',
    loading: '⏳',
  };

  return (
    <div className={`p-4 rounded-xl text-sm font-mono break-all border ${styles[type]} transition-all duration-300 animate-fadeIn`}>
      <span className="mr-2">{icons[type]}</span>
      {status}
    </div>
  );
};

const EscrowInteraction = ({ publicKey, balance, setBalance, walletType }) => {
  const [landlord, setLandlord] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('loading');
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState('');

  const updateBalance = async () => {
    try {
      const newBal = await getBalance(publicKey);
      setBalance(newBal);
    } catch(e) {
      console.error('Balance refresh failed:', e);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!publicKey) return alert("Connect wallet first!");
    if (!landlord || !amount) return;
    
    setLoading(true);
    setActiveAction('deposit');
    setStatusType('loading');
    setStatus('Simulating and signing deposit transaction...');
    
    try {
      const hash = await depositEscrow(walletType, publicKey, landlord, amount);
      setStatusType('success');
      setStatus(
        <span>
          Deposit successful! Tx Hash:{' '}
          <a href={`https://stellar.expert/explorer/testnet/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-600 font-bold">
            {hash.substring(0, 8)}...{hash.substring(hash.length - 8)}
          </a>
        </span>
      );
      updateBalance();
    } catch (e) {
      console.error(e);
      setStatusType('error');
      setStatus(`Deposit failed: ${e.message}`);
    }
    setLoading(false);
    setActiveAction('');
  };

  const handleRelease = async () => {
    if (!publicKey) return alert("Connect wallet first!");
    setLoading(true);
    setActiveAction('release');
    setStatusType('loading');
    setStatus('Simulating and signing release transaction...');
    
    try {
      const hash = await releaseEscrow(walletType, publicKey);
      setStatusType('success');
      setStatus(
        <span>
          Escrow released successfully! Tx Hash:{' '}
          <a href={`https://stellar.expert/explorer/testnet/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-600 font-bold">
            {hash.substring(0, 8)}...{hash.substring(hash.length - 8)}
          </a>
        </span>
      );
      updateBalance();
    } catch (e) {
      console.error(e);
      setStatusType('error');
      setStatus(`Release failed: ${e.message}`);
    }
    setLoading(false);
    setActiveAction('');
  };

  const handleRefund = async () => {
    if (!publicKey) return alert("Connect wallet first!");
    setLoading(true);
    setActiveAction('refund');
    setStatusType('loading');
    setStatus('Simulating and signing refund transaction...');
    
    try {
      const hash = await refundEscrow(walletType, publicKey);
      setStatusType('success');
      setStatus(
        <span>
          Escrow refunded successfully! Tx Hash:{' '}
          <a href={`https://stellar.expert/explorer/testnet/tx/${hash}`} target="_blank" rel="noopener noreferrer" className="underline hover:text-orange-600 font-bold">
            {hash.substring(0, 8)}...{hash.substring(hash.length - 8)}
          </a>
        </span>
      );
      updateBalance();
    } catch (e) {
      console.error(e);
      setStatusType('error');
      setStatus(`Refund failed: ${e.message}`);
    }
    setLoading(false);
    setActiveAction('');
  };

  if (!publicKey) return null;

  return (
    <div id="escrow-section" className="max-w-6xl mx-auto py-16 px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Deposit Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg">📝</div>
            <div>
              <h3 id="heading-deposit" className="text-xl font-bold text-gray-900">Escrow Details</h3>
              <p className="text-sm text-gray-500">Tenant: Lock Deposit</p>
            </div>
          </div>
          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label htmlFor="input-landlord" className="block text-sm font-medium text-gray-700 mb-1.5">Landlord Address</label>
              <input
                id="input-landlord"
                type="text" required value={landlord} onChange={(e) => setLandlord(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm"
                placeholder="G..."
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="input-amount" className="block text-sm font-medium text-gray-700 mb-1.5">Amount (XLM)</label>
              <input
                id="input-amount"
                type="number" required min="1" step="any" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 bg-gray-50 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 focus:bg-white focus:outline-none transition-all duration-200 text-sm"
                placeholder="100"
                disabled={loading}
              />
            </div>
            <button
              id="btn-deposit"
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center shadow-md shadow-orange-200"
            >
              {loading && activeAction === 'deposit' ? <><Spinner /> Processing...</> : '🔒 Deposit to Escrow'}
            </button>
          </form>

          {/* Landlord Actions */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm">🏡</div>
              <h4 className="text-sm font-bold text-gray-900">Landlord Actions</h4>
            </div>
            <div className="flex gap-3">
              <button
                id="btn-release"
                onClick={handleRelease}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all duration-200 text-sm flex items-center justify-center"
              >
                {loading && activeAction === 'release' ? <><Spinner /> Releasing...</> : '✅ Release Funds'}
              </button>
              <button
                id="btn-refund"
                onClick={handleRefund}
                disabled={loading}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-all duration-200 text-sm flex items-center justify-center"
              >
                {loading && activeAction === 'refund' ? <><Spinner /> Refunding...</> : '↩️ Refund Tenant'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Balance & Status */}
        <div className="space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg p-6 md:p-8 text-white">
            <p className="text-sm font-medium text-orange-100 mb-1">Your Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight">{balance ? Number(balance).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'}</span>
              <span className="text-lg font-medium text-orange-200">XLM</span>
            </div>
            <div className="mt-4 pt-4 border-t border-orange-300/30">
              <div className="flex items-center gap-2 text-sm text-orange-100">
                <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                Connected to Stellar Testnet
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Network</p>
              <p className="text-sm font-bold text-gray-900">Testnet</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className="text-sm font-bold text-green-600">Active</p>
            </div>
          </div>

          {/* Status Display */}
          <StatusAlert status={status} type={statusType} />
        </div>
      </div>
    </div>
  );
};

export default EscrowInteraction;
