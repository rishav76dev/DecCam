import { useAccount } from 'wagmi'
import { Navbar } from './components/Navbar'
import './App.css'

function App() {
  const { address, isConnected } = useAccount()

  return (
    <div>
      <Navbar />
      <main style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1>Welcome to Web3 Campaign</h1>
        
        {isConnected ? (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '10px' }}>
            <h2>Connected Successfully!</h2>
            <p>Address: <span style={{ fontFamily: 'monospace' }}>{address}</span></p>
          </div>
        ) : (
          <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f0f0f0', color: 'black', borderRadius: '10px' }}>
            <p>Please connect your wallet using the button in the top right.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
