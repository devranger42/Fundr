import { useState, useEffect } from 'react';
import { useWallet } from './use-wallet';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface TokenBalance {
  mint: string;
  symbol: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  valueUSD?: number;
}

interface WalletBalances {
  sol: number;
  tokens: TokenBalance[];
  totalValueUSD: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Popular token mints for balance checking
const POPULAR_TOKEN_MINTS = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', decimals: 6 },
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', decimals: 5 },
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': { symbol: 'JUP', decimals: 6 },
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { symbol: 'RAY', decimals: 6 },
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': { symbol: 'WIF', decimals: 6 },
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', decimals: 9 },
};

export function useWalletBalance(): WalletBalances {
  const { publicKey, connected } = useWallet();
  const [balances, setBalances] = useState<WalletBalances>({
    sol: 0,
    tokens: [],
    totalValueUSD: 0,
    isLoading: false,
    error: null,
    refresh: async () => {},
  });

  const connection = new Connection('https://api.mainnet-beta.solana.com');

  const fetchBalances = async () => {
    if (!connected || !publicKey) {
      setBalances(prev => ({
        ...prev,
        sol: 0,
        tokens: [],
        totalValueUSD: 0,
        isLoading: false,
        error: null,
      }));
      return;
    }

    setBalances(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Get SOL balance
      const pubKey = new PublicKey(publicKey.toString());
      const solBalance = await connection.getBalance(pubKey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;

      // Get token accounts  
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const tokens: TokenBalance[] = [];
      
      for (const account of tokenAccounts.value) {
        const parsedInfo = account.account.data.parsed.info;
        const mint = parsedInfo.mint;
        const balance = parsedInfo.tokenAmount.amount;
        const decimals = parsedInfo.tokenAmount.decimals;
        const uiAmount = parsedInfo.tokenAmount.uiAmount || 0;

        // Only include tokens we recognize and have balance > 0
        if (POPULAR_TOKEN_MINTS[mint as keyof typeof POPULAR_TOKEN_MINTS] && uiAmount > 0) {
          const tokenInfo = POPULAR_TOKEN_MINTS[mint as keyof typeof POPULAR_TOKEN_MINTS];
          tokens.push({
            mint,
            symbol: tokenInfo.symbol,
            balance: parseInt(balance),
            decimals,
            uiAmount,
          });
        }
      }

      // TODO: Fetch USD values from Jupiter price API
      // For now, using mock USD values
      const mockPrices = {
        SOL: 100,
        USDC: 1,
        BONK: 0.00001,
        JUP: 0.5,
        RAY: 2.5,
        WIF: 1.2,
      };

      const tokensWithValues = tokens.map(token => ({
        ...token,
        valueUSD: (mockPrices[token.symbol as keyof typeof mockPrices] || 0) * token.uiAmount,
      }));

      const totalValueUSD = (mockPrices.SOL * solAmount) + 
        tokensWithValues.reduce((sum, token) => sum + (token.valueUSD || 0), 0);

      setBalances({
        sol: solAmount,
        tokens: tokensWithValues,
        totalValueUSD,
        isLoading: false,
        error: null,
        refresh: fetchBalances,
      });

    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      setBalances(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to fetch wallet balances',
      }));
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [connected, publicKey]);

  // Auto-refresh balances every 30 seconds
  useEffect(() => {
    if (!connected || !publicKey) return;
    
    const interval = setInterval(fetchBalances, 30000);
    return () => clearInterval(interval);
  }, [connected, publicKey]);

  return balances;
}