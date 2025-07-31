import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  connected: boolean;
  publicKey: string | null;
  walletName: string | null;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => void;
  connecting: boolean;
}

const WalletContext = createContext<WalletContextType | null>(null);

interface WalletProviderProps {
  children: ReactNode;
}



export function WalletProvider({ children }: WalletProviderProps) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const getWalletProvider = (walletName: string) => {
    switch (walletName.toLowerCase()) {
      case 'phantom':
        // Check multiple ways Phantom might be available (desktop vs mobile)
        return window.solana?.isPhantom ? window.solana : 
               window.phantom?.solana?.isPhantom ? window.phantom.solana : null;
      case 'solflare':
        return window.solflare?.isSolflare ? window.solflare : null;
      case 'backpack':
        return window.backpack?.isBackpack ? window.backpack : null;
      case 'glow':
        return window.glow?.isGlow ? window.glow : null;
      case 'slope':
        return window.slope?.isSlope ? window.slope : null;
      default:
        return window.solana?.isPhantom ? window.solana : null;
    }
  };

  const connect = async (selectedWallet: string) => {
    try {
      setConnecting(true);
      const provider = getWalletProvider(selectedWallet);
      
      if (!provider) {
        throw new Error(`${selectedWallet} wallet not found. Please install it.`);
      }

      const response = await provider.connect();
      
      if (response.publicKey) {
        // Validate the public key is valid base58
        const publicKeyString = response.publicKey.toString();
        console.log('Received public key from wallet:', publicKeyString);
        
        if (!publicKeyString || publicKeyString.length === 0) {
          throw new Error('Invalid public key received from wallet');
        }
        
        // Test if it's valid base58 by trying to create a PublicKey
        try {
          const { PublicKey } = await import('@solana/web3.js');
          new PublicKey(publicKeyString);
          console.log('Public key validation successful');
        } catch (e) {
          console.error('Invalid public key from wallet:', e);
          console.error('Public key that failed validation:', publicKeyString);
          throw new Error('Wallet connection issue. Please try again or use a different wallet.');
        }
        
        setConnected(true);
        setPublicKey(publicKeyString);
        setWalletName(selectedWallet);
        
        // Save to localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletName', selectedWallet);
        localStorage.setItem('publicKey', publicKeyString);
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setConnected(false);
    setPublicKey(null);
    setWalletName(null);
    
    // Clear localStorage
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletName');
    localStorage.removeItem('publicKey');
    
    // Disconnect from wallet if available
    if (walletName) {
      const provider = getWalletProvider(walletName);
      if (provider?.disconnect) {
        provider.disconnect();
      }
    }
  };

  // Auto-connect on mount if previously connected
  useEffect(() => {
    const savedConnected = localStorage.getItem('walletConnected');
    const savedWalletName = localStorage.getItem('walletName');
    const savedPublicKey = localStorage.getItem('publicKey');
    
    if (savedConnected === 'true' && savedWalletName && savedPublicKey) {
      // Validate saved public key before auto-connecting
      try {
        import('@solana/web3.js').then(({ PublicKey }) => {
          new PublicKey(savedPublicKey);
          const provider = getWalletProvider(savedWalletName);
          if (provider) {
            setConnected(true);
            setWalletName(savedWalletName);
            setPublicKey(savedPublicKey);
          }
        });
      } catch (e) {
        // Clear invalid saved data
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletName');
        localStorage.removeItem('publicKey');
        console.warn('Cleared invalid saved wallet data');
      }
    }
  }, []);

  const value = {
    connected,
    publicKey,
    walletName,
    connect,
    disconnect,
    connecting
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}