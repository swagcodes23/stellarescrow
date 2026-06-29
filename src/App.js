import React, { useState } from 'react';
import './App.css';
import Header from "./components/Header";
import EscrowInteraction from "./components/EscrowInteraction";
import EventFeed from "./components/EventFeed";
import ErrorBoundary from "./components/ErrorBoundary";
import { checkConnection, retrievePublicKey, getBalance } from './components/Freighter';
import { retrievePublicKeyAlbedo } from './components/Albedo';

/* ─── FAQ Accordion Item ─── */
const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left text-gray-800 hover:text-orange-600 transition-colors"
      >
        <span className="font-medium text-sm md:text-base">{question}</span>
        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}>
        <p className="text-sm text-gray-500 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

function App() {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState("");
  const [walletType, setWalletType] = useState("");

  const handleConnect = async (type) => {
    try {
      let key = "";
      if (type === 'albedo') {
        key = await retrievePublicKeyAlbedo();
      } else {
        const isWalletConnected = await checkConnection();
        if (isWalletConnected) {
          key = await retrievePublicKey();
        } else {
          alert("The Freighter wallet extension is not installed or not detected in this browser. Please install Freighter!");
          return;
        }
      }

      if (key) {
         setPublicKey(key);
         setWalletType(type);
         setConnected(true);
         const accountBalance = await getBalance(key);
         setBalance(accountBalance);
      } else {
         alert("Wallet returned an empty key. Connection rejected or wallet locked.");
      }
    } catch (error) {
      alert("Error connecting to wallet: " + error.message);
      console.error("Error connecting wallet or fetching balance:", error);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    setPublicKey("");
    setBalance("");
    setWalletType("");
  };

  return (
    <ErrorBoundary>
      <div className="App min-h-screen bg-white">
        <Header
          connected={connected}
          publicKey={publicKey}
          balance={balance}
          handleConnect={handleConnect}
          handleDisconnect={handleDisconnect}
        />

        {/* ═══════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════ */}
        <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 to-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <h1 id="app-title" className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                  Rental Deposits,<br />
                  <span className="text-orange-500">Reinvented</span> with <span className="text-orange-500">Stellar</span>Escrow
                </h1>
                <p className="mt-6 text-lg text-gray-500 max-w-lg leading-relaxed">
                  Secure your rental deposit on the Stellar blockchain. A trustless, 
                  transparent escrow for landlords and tenants — without middlemen, 
                  powered by Soroban Smart Contracts.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a href="#escrow-section" className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold px-7 py-3 rounded-full shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-xl hover:shadow-orange-200 transform hover:scale-[1.02]">
                    Get Started
                  </a>
                  <a href="#features" className="inline-flex items-center border-2 border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-600 font-semibold px-7 py-3 rounded-full transition-all duration-200">
                    Learn More
                  </a>
                </div>

                {!connected && (
                  <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                    ⚡ Connect your wallet above to get started with the escrow.
                  </div>
                )}
              </div>

              {/* Right: Flow Icons */}
              <div className="hidden lg:flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 w-36 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-2xl">🏠</div>
                  <span className="text-sm font-bold text-gray-800">Landlord</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>
                <div className="flex flex-col items-center gap-2 bg-white rounded-2xl shadow-lg p-6 border border-orange-200 w-36 hover:shadow-xl transition-shadow ring-2 ring-orange-100">
                  <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-2xl">📄</div>
                  <span className="text-sm font-bold text-gray-800">Agreement</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>
                <div className="flex flex-col items-center gap-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 w-36 hover:shadow-xl transition-shadow">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center text-2xl">👤</div>
                  <span className="text-sm font-bold text-gray-800">Tenant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            HOW IT WORKS SECTION
        ═══════════════════════════════════════════ */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Effortless Security for <span className="text-orange-500">Everyone</span>
              </h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                From deposit to release, every step is secured on the Stellar blockchain.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '🔗', title: 'Connect Wallet', desc: 'Link your Freighter or Albedo wallet to get started instantly.' },
                { icon: '📝', title: 'Create Agreement', desc: 'Set landlord address and deposit amount for the escrow.' },
                { icon: '🔒', title: 'Secure Lock', desc: 'Funds are locked in a Soroban smart contract on-chain.' },
                { icon: '✅', title: 'Release Funds', desc: 'Landlord releases or refunds the deposit with one click.' },
              ].map((item, i) => (
                <div key={i} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300 text-center">
                  <div className="w-14 h-14 bg-orange-50 group-hover:bg-orange-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            WHY STELLAR ESCROW SECTION
        ═══════════════════════════════════════════ */}
        <section id="features" className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Why <span className="text-orange-500">StellarEscrow</span>?
              </h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                Built for the complexities of property management, combining trusted security with lightning-fast transactions.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: '📜', title: 'Smart Contract Escrow', desc: 'Deposits are held by immutable Soroban smart contracts, not by any person or company.' },
                { icon: '🛡️', title: 'Protected Deposits', desc: 'Funds remain locked until both parties agree, eliminating disputes and fraud.' },
                { icon: '⚡', title: 'Fast Transactions', desc: 'Stellar\'s 5-second finality means deposits are locked and released almost instantly.' },
                { icon: '🔍', title: 'Transparent Agreements', desc: 'Every transaction is recorded on the public blockchain ledger for full auditability.' },
                { icon: '🤝', title: 'Neutral Trust', desc: 'No middlemen or intermediaries. The smart contract is the only trusted third party.' },
                { icon: '🌍', title: 'Borderless Payments', desc: 'Works across borders with minimal fees, powered by Stellar\'s global network.' },
              ].map((item, i) => (
                <div key={i} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-300">
                  <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-100 rounded-xl flex items-center justify-center text-xl mb-4 transition-colors">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            ESCROW INTERACTION (Functional Component)
        ═══════════════════════════════════════════ */}
        <section className="bg-white">
          <EscrowInteraction publicKey={publicKey} setBalance={setBalance} walletType={walletType} />
        </section>

        {/* ═══════════════════════════════════════════
            TRADITIONAL ESCROW IS BROKEN
        ═══════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                  Traditional Escrow is Broken.<br />
                  <span className="text-orange-500">We Fixed It.</span>
                </h2>
                <div className="mt-8 space-y-6">
                  {[
                    { icon: '🚫', title: 'No Middlemen', desc: 'Cut out the banks and lawyers. Our smart contracts handle everything automatically, saving you time and money.' },
                    { icon: '💰', title: 'Reduced Fees', desc: 'Stellar transactions cost fractions of a cent. No more paying 1-3% in traditional escrow fees.' },
                    { icon: '⚙️', title: 'Programmable Release', desc: 'Funds are released or refunded programmatically based on contract conditions.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                  <span className="text-3xl font-extrabold text-orange-500">5s</span>
                  <p className="text-sm text-gray-500 mt-2">Transaction Finality</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                  <span className="text-3xl font-extrabold text-orange-500">$0.01</span>
                  <p className="text-sm text-gray-500 mt-2">Average Fee</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                  <span className="text-3xl font-extrabold text-orange-500">100%</span>
                  <p className="text-sm text-gray-500 mt-2">On-Chain Transparency</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                  <span className="text-3xl font-extrabold text-orange-500">0</span>
                  <p className="text-sm text-gray-500 mt-2">Middlemen Required</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            EVENT FEED
        ═══════════════════════════════════════════ */}
        <section className="bg-white py-8">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <EventFeed />
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FAQ SECTION
        ═══════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-gray-500">Everything you need to know about the escrow process.</p>
            </div>
            <div>
              <FAQItem
                question="How secure is the escrow?"
                answer="Your funds are held by a Soroban smart contract on the Stellar blockchain. The contract code is immutable and publicly auditable — no one can tamper with it."
              />
              <FAQItem
                question="How do I connect my wallet?"
                answer="Click the 'Connect Freighter' or 'Connect Albedo' button in the navigation bar. Make sure your wallet is set to the Stellar Testnet."
              />
              <FAQItem
                question="What happens if there is a dispute?"
                answer="The landlord can either release the funds to themselves or refund them back to the tenant. The smart contract enforces that only the registered landlord can trigger these actions."
              />
              <FAQItem
                question="Are there any fees?"
                answer="Stellar network fees are minimal (fractions of a cent per transaction). There are no platform fees — StellarEscrow is fully open-source."
              />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA BANNER
        ═══════════════════════════════════════════ */}
        <section className="py-16 px-4 md:px-8">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl p-10 md:p-16 text-center text-white shadow-xl shadow-orange-200">
            <h2 className="text-3xl md:text-4xl font-extrabold">Ready to Secure Your Next Rental?</h2>
            <p className="mt-4 text-orange-100 max-w-xl mx-auto">
              Join thousands using the power of blockchain for transparent, trustless escrow.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="#hero" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-8 py-3 rounded-full transition-all duration-200 shadow-lg transform hover:scale-[1.02]">
                Start Your First Escrow
              </a>
              <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="border-2 border-white/50 hover:border-white text-white font-semibold px-8 py-3 rounded-full transition-all duration-200">
                Explore Stellar
              </a>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════ */}
        <footer className="bg-white border-t border-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <span className="font-bold text-gray-900">Stellar<span className="text-orange-500">Escrow</span></span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="https://stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Stellar</a>
                <a href="https://soroban.stellar.org" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Soroban Smart Contracts</a>
                <a href="https://github.com/swagcodes23/stellarescrow" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">GitHub</a>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                © 2024 StellarEscrow. Decentralized rental deposit escrow on the Stellar network.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
