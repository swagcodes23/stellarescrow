import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Stellar SDKs that require browser/extension APIs
jest.mock('@stellar/freighter-api', () => ({
  isConnected: jest.fn().mockResolvedValue({ isConnected: false }),
  requestAccess: jest.fn().mockResolvedValue({ address: '' }),
  signTransaction: jest.fn(),
}));

jest.mock('@albedo-link/intent', () => ({
  __esModule: true,
  default: {
    publicKey: jest.fn(),
    tx: jest.fn(),
  },
}));

jest.mock('@stellar/stellar-sdk', () => ({
  Horizon: { Server: jest.fn().mockImplementation(() => ({ loadAccount: jest.fn() })) },
  rpc: { 
    Server: jest.fn().mockImplementation(() => ({ 
      getLatestLedger: jest.fn().mockResolvedValue({ sequence: 1000 }),
      getEvents: jest.fn().mockResolvedValue({ events: [] }),
    })),
    Api: { isSimulationError: jest.fn().mockReturnValue(false) },
  },
  Networks: { TESTNET: 'Test SDF Network ; September 2015' },
  Contract: jest.fn(),
  TransactionBuilder: jest.fn(),
  nativeToScVal: jest.fn(),
}));

describe('App Component', () => {
  test('renders the app title', () => {
    render(<App />);
    const titleElement = screen.getByRole('heading', { level: 1 });
    expect(titleElement).toHaveTextContent(/Reinvented/);
  });

  test('shows connect wallet buttons when not connected', () => {
    render(<App />);
    expect(screen.getByText(/Connect Freighter/i, { selector: 'button' })).toBeInTheDocument();
    expect(screen.getByText(/Connect Albedo/i, { selector: 'button' })).toBeInTheDocument();
  });

  test('shows wallet connection prompt when not connected', () => {
    render(<App />);
    expect(screen.getByText(/Connect your wallet above/i)).toBeInTheDocument();
  });

  test('does not show escrow interaction when wallet not connected', () => {
    render(<App />);
    expect(screen.queryByText(/Tenant: Lock Deposit/i)).not.toBeInTheDocument();
  });

  test('renders the footer with Stellar link', () => {
    render(<App />);
    const elements = screen.getAllByText(/Soroban Smart Contracts/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
