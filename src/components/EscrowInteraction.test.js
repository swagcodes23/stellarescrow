import { render, screen } from '@testing-library/react';
import EscrowInteraction from './EscrowInteraction';

// Mock the Soroban module
jest.mock('./Soroban', () => ({
  depositEscrow: jest.fn(),
  releaseEscrow: jest.fn(),
  refundEscrow: jest.fn(),
}));

jest.mock('./Freighter', () => ({
  getBalance: jest.fn().mockResolvedValue('100'),
}));

describe('EscrowInteraction Component', () => {
  const defaultProps = {
    publicKey: 'GABCDEFGHIJKLMNOP',
    balance: '100',
    setBalance: jest.fn(),
    walletType: 'freighter',
  };

  test('renders nothing when publicKey is empty', () => {
    const { container } = render(
      <EscrowInteraction publicKey="" setBalance={jest.fn()} walletType="" />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders deposit form when wallet is connected', () => {
    render(<EscrowInteraction {...defaultProps} />);
    expect(screen.getByText(/Tenant: Lock Deposit/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('G...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('100')).toBeInTheDocument();
  });

  test('renders landlord action buttons', () => {
    render(<EscrowInteraction {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Release Funds/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Refund Tenant/i })).toBeInTheDocument();
  });

  test('renders deposit button', () => {
    render(<EscrowInteraction {...defaultProps} />);
    expect(screen.getByText(/Deposit to Escrow/i)).toBeInTheDocument();
  });
});
