import React from 'react';

const Header = ({ connected, publicKey, balance, handleConnect, handleDisconnect }) => {

  const formatPublicKey = (key) => {
    if (!key) return "";
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
            Stellar<span className="text-orange-500">Escrow</span>
          </h2>
        </div>

        {/* Nav Links - hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#hero" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">Home</a>
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">About</a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors">How it Works</a>
        </nav>

        {/* Wallet Section */}
        <div className="wallet-section">
          {!connected ? (
            <div className="flex gap-2">
              <button
                id="btn-connect-freighter"
                onClick={() => handleConnect('freighter')}
                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium px-4 py-2 rounded-full text-sm transition-all duration-200 shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-200"
              >
                Connect Freighter
              </button>
              <button
                id="btn-connect-albedo"
                onClick={() => handleConnect('albedo')}
                className="border border-orange-300 text-orange-600 hover:bg-orange-50 font-medium px-4 py-2 rounded-full text-sm transition-all duration-200"
              >
                Connect Albedo
              </button>
            </div>
          ) : (
            <div className="wallet-info flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-gray-700 font-mono text-xs">
                  {formatPublicKey(publicKey)}
                </span>
              </div>
              <span className="text-sm font-semibold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                💰 {balance} XLM
              </span>
              <button
                id="btn-disconnect"
                onClick={handleDisconnect}
                className="text-gray-400 hover:text-red-500 font-medium px-3 py-1.5 rounded-full text-xs transition-all duration-200 border border-gray-200 hover:border-red-200"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
