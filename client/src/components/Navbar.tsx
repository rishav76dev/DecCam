import { ConnectButton } from '@rainbow-me/rainbowkit';

export function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: '#1a1a1a',
      color: 'white',
      borderBottom: '1px solid #333'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        DecCampaign
      </div>
      <div>
        <ConnectButton />
      </div>
    </nav>
  );
}
