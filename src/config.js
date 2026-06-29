/**
 * Centralized application configuration.
 * All network endpoints, contract IDs, and feature flags are managed here.
 * Supports environment variables for easy switching between testnet/mainnet.
 */

const config = {
  // Stellar Network
  network: process.env.REACT_APP_STELLAR_NETWORK || 'TESTNET',
  networkPassphrase: process.env.REACT_APP_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',

  // RPC & Horizon Endpoints
  horizonUrl: process.env.REACT_APP_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: process.env.REACT_APP_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',

  // Contract Addresses
  escrowContractId: process.env.REACT_APP_ESCROW_CONTRACT_ID || 'CDTQUZTEFN3GWEPKRCRD4ABGMYIZUQDSLEL6SF4SSO4EJGQVXTC7QXBV',
  nativeTokenContract: process.env.REACT_APP_NATIVE_TOKEN_CONTRACT || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',

  // Polling
  eventPollIntervalMs: parseInt(process.env.REACT_APP_EVENT_POLL_INTERVAL || '5000', 10),
  eventLedgerLookback: parseInt(process.env.REACT_APP_EVENT_LEDGER_LOOKBACK || '1000', 10),

  // Transaction
  defaultFeeSats: process.env.REACT_APP_DEFAULT_FEE || '100000',
  txTimeoutSeconds: parseInt(process.env.REACT_APP_TX_TIMEOUT || '30', 10),
  maxRetries: parseInt(process.env.REACT_APP_MAX_RETRIES || '25', 10),
};

export default config;
