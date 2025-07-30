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
        return window.solana?.isPhantom ? window.solana : null;
      case 'solflare':
        return window.solflare;
      case 'backpack':
        return window.backpack;
      case 'glow':
        return window.glow;
      case 'slope':
        return window.slope;
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
        setConnected(true);
        setPublicKey(response.publicKey.toString());
        setWalletName(selectedWallet);
        
        // Save to localStorage
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletName', selectedWallet);
        localStorage.setItem('publicKey', response.publicKey.toString());
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
      const provider = getWalletProvider(savedWalletName);
      if (provider) {
        setConnected(true);
        setWalletName(savedWalletName);
        setPublicKey(savedPublicKey);
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