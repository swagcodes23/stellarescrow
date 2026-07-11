import React, { useState, useEffect } from 'react';

const TX_STORAGE_KEY = 'stellarEscrow_transactions';

/* ─── Helpers ─── */
export const saveTx = (tx) => {
  const existing = JSON.parse(localStorage.getItem(TX_STORAGE_KEY) || '[]');
  existing.unshift(tx);
  // Keep last 50 transactions
  if (existing.length > 50) existing.length = 50;
  localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(existing));
  // Dispatch event so TransactionCenter picks it up live
  window.dispatchEvent(new Event('txUpdated'));
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};

const truncateHash = (hash) => {
  if (!hash) return '';
  if (hash.length <= 20) return hash;
  return hash.substring(0, 16) + '...' + hash.substring(hash.length - 16);
};

const getActionLabel = (type) => {
  switch (type) {
    case 'deposit': return 'Deposit to Escrow';
    case 'release': return 'Release Escrow Funds';
    case 'refund': return 'Refund to Tenant';
    default: return type;
  }
};

const getActionIcon = (type) => {
  switch (type) {
    case 'deposit': return '🔒';
    case 'release': return '✅';
    case 'refund': return '↩️';
    default: return '📄';
  }
};

/* ─── Tab Button ─── */
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
      active
        ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
    }`}
  >
    {children}
  </button>
);

/* ─── Transaction Card ─── */
const TransactionCard = ({ tx, index }) => {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(tx.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="tx-card bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 p-5 md:p-6"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top Row: Action + Status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
            tx.type === 'deposit' ? 'bg-indigo-50' :
            tx.type === 'release' ? 'bg-emerald-50' : 'bg-rose-50'
          }`}>
            {getActionIcon(tx.type)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm md:text-base">
              {getActionLabel(tx.type)}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-gray-400 font-mono">
                Track ID: {tx.trackId || tx.hash?.substring(0, 6)}
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-gray-400">
                Timestamp: {formatDate(tx.timestamp)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0 ${
          tx.status === 'success'
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
            : tx.status === 'failed'
            ? 'bg-red-50 text-red-600 border border-red-200'
            : 'bg-amber-50 text-amber-600 border border-amber-200'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            tx.status === 'success' ? 'bg-emerald-500' :
            tx.status === 'failed' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
          }`}></span>
          {tx.status === 'success' ? 'Confirmed' :
           tx.status === 'failed' ? 'Failed' : 'Pending'}
        </span>
      </div>

      {/* Tx Hash Row */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 font-medium mb-1">Stellar Tx Hash</p>
          <p className="text-xs md:text-sm font-mono text-gray-700 truncate" title={tx.hash}>
            {truncateHash(tx.hash)}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          {/* Copy Button */}
          <button
            onClick={copyHash}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors group relative"
            title="Copy hash"
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          {/* Block Explorer Link */}
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg text-xs font-semibold transition-all duration-200 border border-orange-200 hover:border-orange-300 group"
          >
            View in Block Explorer
            <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Amount (if available) */}
      {tx.amount && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <span className="text-orange-500 font-bold">{tx.amount} XLM</span>
          <span className="text-gray-300">•</span>
          <span className="text-xs">via {tx.walletType === 'albedo' ? 'Albedo' : 'Freighter'}</span>
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─── */
const TransactionCenter = () => {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('logs');
  const [filterType, setFilterType] = useState('all');

  const loadTransactions = () => {
    const stored = JSON.parse(localStorage.getItem(TX_STORAGE_KEY) || '[]');
    setTransactions(stored);
  };

  useEffect(() => {
    loadTransactions();
    // Listen for live updates from EscrowInteraction
    const handler = () => loadTransactions();
    window.addEventListener('txUpdated', handler);
    return () => window.removeEventListener('txUpdated', handler);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(TX_STORAGE_KEY);
    setTransactions([]);
  };

  const filtered = filterType === 'all'
    ? transactions
    : transactions.filter(tx => tx.type === filterType);

  return (
    <div id="tx-center" className="max-w-4xl mx-auto py-16 md:py-24 px-4 md:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <span className="text-orange-500">📋</span> Transaction Center
          </h2>
          <p className="mt-2 text-gray-500 text-sm md:text-base">
            Track transaction status, Stellar Tx hashes, and view on-chain activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
            Tx Logs
          </TabButton>
          <TabButton active={activeTab === 'live'} onClick={() => setActiveTab('live')}>
            Live Feed
          </TabButton>
        </div>
      </div>

      {activeTab === 'logs' ? (
        <>
          {/* Filter + Clear */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Local Transaction History</span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter pills */}
              {['all', 'deposit', 'release', 'refund'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 capitalize ${
                    filterType === type
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
              {transactions.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium ml-2"
                >
                  Clear History
                </button>
              )}
            </div>
          </div>

          {/* Transaction List */}
          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((tx, i) => (
                <TransactionCard key={tx.hash + tx.timestamp} tx={tx} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                📭
              </div>
              <p className="text-gray-400 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-300 mt-1">
                Your escrow transactions will appear here after you make a deposit, release, or refund.
              </p>
            </div>
          )}
        </>
      ) : (
        /* Live Feed Tab — links to the existing EventFeed */
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
            📡
          </div>
          <p className="text-gray-600 font-semibold">Live Event Feed</p>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
            The live on-chain event feed is displayed below in the Events section. It polls the Stellar Soroban RPC for real-time contract events.
          </p>
          <a
            href="#event-feed"
            className="inline-flex items-center gap-1.5 mt-4 text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors"
          >
            Jump to Live Events
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      )}

      {/* Block Explorer CTA */}
      <div className="mt-8 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg">🔍</div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Explore All Transactions</p>
            <p className="text-xs text-gray-500">View the full contract activity on Stellar Expert Block Explorer</p>
          </div>
        </div>
        <a
          href="https://stellar.expert/explorer/testnet/contract/CDTQUZTEFN3GWEPKRCRD4ABGMYIZUQDSLEL6SF4SSO4EJGQVXTC7QXBV"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-orange-200 hover:shadow-lg transform hover:scale-[1.02]"
        >
          Open Block Explorer
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default TransactionCenter;
