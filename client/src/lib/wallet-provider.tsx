import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { connection } from './solana';

export interface WalletAdapter {
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]>;
}

class MockWalletAdapter implements WalletAdapter {
  private _publicKey: PublicKey | null = null;
  private _connected = false;
  private _connecting = false;
  private _disconnecting = false;

  get publicKey() { return this._publicKey; }
  get connected() { return this._connected; }
  get connecting() { return this._connecting; }
  get disconnecting() { return this._disconnecting; }

  async connect(): Promise<void> {
    this._connecting = true;
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For devnet testing, generate a test keypair or use saved one
    try {
      const savedWallet = localStorage.getItem('test-wallet');
      if (savedWallet) {
        const walletData = JSON.parse(savedWallet);
        this._publicKey = new PublicKey(walletData.publicKey);
      } else {
        // Generate a new test wallet with valid base58 address
        const testWallet = {
          publicKey: '11111111111111111111111111111111',
          balance: 2.0,
          network: 'devnet'
        };
        localStorage.setItem('test-wallet', JSON.stringify(testWallet));
        this._publicKey = new PublicKey(testWallet.publicKey);
      }
    } catch {
      // Fallback to a valid test public key
      this._publicKey = new PublicKey('11111111111111111111111111111111');
    }
    
    this._connected = true;
    this._connecting = false;
  }

  async disconnect(): Promise<void> {
    this._disconnecting = true;
    await new Promise(resolve => setTimeout(resolve, 500));
    this._publicKey = null;
    this._connected = false;
    this._disconnecting = false;
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    if (!this._connected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // In a real implementation, this would open the wallet to sign
    // For devnet testing, we'll simulate signing
    console.log('Signing transaction with mock wallet...');
    return transaction;
  }

  async signAllTransactions<T extends Transaction | VersionedTransaction>(transactions: T[]): Promise<T[]> {
    if (!this._connected || !this._publicKey) {
      throw new Error('Wallet not connected');
    }
    
    console.log(`Signing ${transactions.length} transactions with mock wallet...`);
    return transactions;
  }
}

interface WalletContextType {
  wallet: WalletAdapter;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  balance: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (transaction: Transaction) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet] = useState<WalletAdapter>(new MockWalletAdapter());
  const [balance, setBalance] = useState(0);

  // Update balance when wallet connects
  useEffect(() => {
    if (wallet.connected && wallet.publicKey) {
      connection.getBalance(wallet.publicKey)
        .then(lamports => setBalance(lamports / 1e9))
        .catch(console.error);
    } else {
      setBalance(0);
    }
  }, [wallet.connected, wallet.publicKey]);

  const sendTransaction = async (transaction: Transaction): Promise<string> => {
    if (!wallet.connected || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign transaction
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const value: WalletContextType = {
    wallet,
    publicKey: wallet.publicKey,
    connected: wallet.connected,
    connecting: wallet.connecting,
    balance,
    connect: wallet.connect.bind(wallet),
    disconnect: wallet.disconnect.bind(wallet),
    sendTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Utility functions for devnet testing
export async function requestDevnetAirdrop(publicKey: PublicKey): Promise<string> {
  try {
    const signature = await connection.requestAirdrop(publicKey, 2e9); // 2 SOL
    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Airdrop failed:', error);
    throw new Error('Airdrop failed. You may need to wait or try the Solana faucet manually.');
  }
}

export async function getDevnetBalance(publicKey: PublicKey): Promise<number> {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    console.error('Failed to get balance:', error);
    return 0;
  }
}