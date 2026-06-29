import React, { useEffect, useState } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { CONTRACT_ID } from './Soroban';

const rpcServer = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org');

const EventFeed = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let active = true;

    const pollEvents = async () => {
      try {
        const latestLedgerResponse = await rpcServer.getLatestLedger();
        // Search the last 1000 ledgers (approx ~1.5 hours)
        const startLedger = Math.max(0, latestLedgerResponse.sequence - 1000);
        
        const response = await rpcServer.getEvents({
          startLedger: startLedger,
          filters: [
            {
              type: "contract",
              contractIds: [CONTRACT_ID]
            }
          ],
          limit: 10
        });

        if (response.events && response.events.length > 0) {
          const parsed = response.events.reverse().map(e => {
             let topic = "Unknown";
             try {
               const val = StellarSdk.xdr.ScVal.fromXDR(e.topic[1], 'base64');
               if (val.switch().name === 'scvSymbol') {
                 topic = val.sym().toString();
               }
             } catch(err) {}
             return { id: e.id, type: topic, ledger: e.ledger };
          });
          if (active) setEvents(parsed);
        }
      } catch (e) {
        console.error("Error polling events:", e);
      }
      
      if (active) {
        setTimeout(pollEvents, 5000);
      }
    };

    pollEvents();
    return () => { active = false; };
  }, []);

  if (events.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-8 bg-slate-900 rounded-xl p-6 text-slate-500 text-center text-sm border border-slate-800">
        <span className="inline-block w-2 h-2 bg-slate-700 rounded-full animate-pulse mr-2"></span>
        Listening for Escrow Events...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-8 bg-slate-900 rounded-xl p-6 text-slate-300 border border-slate-800">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
        Live Escrow Events
      </h3>
      <div className="space-y-3">
        {events.map(ev => (
          <div key={ev.id} className="flex justify-between items-center text-sm bg-slate-800/50 p-3 rounded border border-slate-700">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${ev.type === 'deposit' ? 'bg-indigo-900 text-indigo-300' : ev.type === 'release' ? 'bg-emerald-900 text-emerald-300' : 'bg-rose-900 text-rose-300'}`}>
                {ev.type}
              </span>
              <span>Event Logged</span>
            </div>
            <span className="font-mono text-slate-500 text-xs">
              Ledger: {ev.ledger}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default EventFeed;
