import React, { useState } from 'react';
import { sendPayment, getBalance } from './Freighter';

const SendPayment = ({ publicKey, setBalance }) => {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      alert("Please connect your wallet first.");
      return;
    }
    
    setLoading(true);
    setStatus('');
    setTxHash('');

    try {
      const response = await sendPayment(publicKey, receiver, amount);
      setStatus('Success!');
      setTxHash(response.hash);
      
      // Update balance
      const newBalance = await getBalance(publicKey);
      setBalance(newBalance);
      
      // Clear form
      setReceiver('');
      setAmount('');
    } catch (error) {
      console.error(error);
      setStatus('Failed: ' + (error.message || 'Transaction rejected or failed.'));
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <p className="text-lg">Please connect your Freighter wallet to start sending funds.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded-xl shadow-md overflow-hidden p-8 border border-slate-200">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">Send XLM Payment</h3>
      
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Receiver Public Key</label>
          <input 
            type="text"
            required
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-black"
            placeholder="G..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (XLM)</label>
          <input 
            type="number"
            required
            min="0.0000001"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-black"
            placeholder="10.5"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {loading ? 'Signing & Sending Transaction...' : 'Send Payment'}
        </button>
      </form>

      {status && (
        <div className={`mt-6 p-4 rounded-lg ${status.startsWith('Success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          <p className="font-medium">{status}</p>
          {txHash && (
            <p className="text-sm mt-2 break-all font-mono">
              <strong>Tx Hash:</strong> {txHash}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SendPayment;
