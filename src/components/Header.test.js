import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header Component', () => {
  const defaultProps = {
    connected: false,
    publicKey: '',
    balance: '',
    handleConnect: jest.fn(),
    handleDisconnect: jest.fn(),
  };

  test('renders the branding title', () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText(/Escrow/i)).toBeInTheDocument();
  });

  test('shows connect buttons when wallet is not connected', () => {
    render(<Header {...defaultProps} />);
    const freighterBtn = screen.getByText(/Connect Freighter/i);
    const albedoBtn = screen.getByText(/Connect Albedo/i);
    expect(freighterBtn).toBeInTheDocument();
    expect(albedoBtn).toBeInTheDocument();
  });

  test('shows wallet info when connected', () => {
    render(
      <Header 
        {...defaultProps} 
        connected={true} 
        publicKey="GABCDEFGHIJKLMNOPQRSTUVWXYZ12345678901234567890ABCD" 
        balance="100.50" 
      />
    );
    // formatPublicKey: slice(0,4) = 'GABC', slice(-4) = 'ABCD'
    expect(screen.getByText('GABC...ABCD')).toBeInTheDocument();
    // Should show balance (text contains emoji prefix)
    expect(screen.getByText((content) => content.includes('100.50'))).toBeInTheDocument();
    // Should show disconnect button
    expect(screen.getByText(/Disconnect/i)).toBeInTheDocument();
  });

  test('hides connect buttons when connected', () => {
    render(
      <Header 
        {...defaultProps} 
        connected={true} 
        publicKey="GABCDE" 
        balance="50" 
      />
    );
    expect(screen.queryByText(/Connect Freighter/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Connect Albedo/i)).not.toBeInTheDocument();
  });
});
