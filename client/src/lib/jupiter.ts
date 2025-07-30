import { Connection, PublicKey } from '@solana/web3.js';

// Jupiter API endpoints
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6/quote';
const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6/swap';
const JUPITER_PRICE_API = 'https://price.jup.ag/v4/price';

export interface TokenInfo {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: any[];
}

export interface TokenPrice {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
  extraInfo?: {
    lastSwappedPrice?: {
      lastJupiterSellAt: number;
      lastJupiterSellPrice: number;
      lastJupiterBuyAt: number;
      lastJupiterBuyPrice: number;
    };
  };
}

export class JupiterService {
  private connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  // Get token prices from Jupiter
  async getTokenPrices(tokenMints: string[]): Promise<{ [mint: string]: TokenPrice }> {
    try {
      const ids = tokenMints.join(',');
      const response = await fetch(`${JUPITER_PRICE_API}?ids=${ids}&vsToken=USDC`);
      
      if (!response.ok) {
        throw new Error(`Jupiter price API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  }

  // Get swap quote from Jupiter
  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50 // 0.5% slippage
  ): Promise<SwapQuote | null> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        onlyDirectRoutes: 'false',
        asLegacyTransaction: 'false',
        maxAccounts: '20',
      });

      const response = await fetch(`${JUPITER_QUOTE_API}?${params}`);
      
      if (!response.ok) {
        throw new Error(`Jupiter quote API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting swap quote:', error);
      return null;
    }
  }

  // Get swap transaction from Jupiter
  async getSwapTransaction(
    quoteResponse: SwapQuote,
    userPublicKey: string,
    priorityFee?: number
  ): Promise<{ swapTransaction: string } | null> {
    try {
      const swapRequest = {
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
        useSharedAccounts: true,
        prioritizationFeeLamports: priorityFee || 0,
        asLegacyTransaction: false,
        useTokenLedger: false,
        destinationTokenAccount: null,
      };

      const response = await fetch(JUPITER_SWAP_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(swapRequest),
      });

      if (!response.ok) {
        throw new Error(`Jupiter swap API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting swap transaction:', error);
      return null;
    }
  }

  // Execute a complete swap (quote + transaction)
  async executeSwap(
    inputMint: string,
    outputMint: string,
    amount: number,
    userWallet: string,
    slippageBps: number = 50
  ): Promise<{ transaction: string; quote: SwapQuote } | null> {
    try {
      // Get quote
      const quote = await this.getSwapQuote(inputMint, outputMint, amount, slippageBps);
      if (!quote) {
        throw new Error('Failed to get swap quote');
      }

      // Get transaction
      const swapData = await this.getSwapTransaction(quote, userWallet);
      if (!swapData) {
        throw new Error('Failed to get swap transaction');
      }

      return {
        transaction: swapData.swapTransaction,
        quote,
      };
    } catch (error) {
      console.error('Error executing swap:', error);
      return null;
    }
  }

  // Calculate fund rebalancing swaps
  async calculateRebalancingSwaps(
    currentAllocations: { mint: string; amount: number }[],
    targetAllocations: { mint: string; percentage: number }[],
    totalValue: number
  ): Promise<{
    swaps: { from: string; to: string; amount: number; quote: SwapQuote }[];
    summary: { mint: string; currentAmount: number; targetAmount: number; difference: number }[];
  }> {
    const swaps: { from: string; to: string; amount: number; quote: SwapQuote }[] = [];
    const summary = [];

    try {
      // Calculate target amounts
      for (const target of targetAllocations) {
        const targetAmount = (totalValue * target.percentage) / 100;
        const current = currentAllocations.find(c => c.mint === target.mint);
        const currentAmount = current?.amount || 0;
        const difference = targetAmount - currentAmount;

        summary.push({
          mint: target.mint,
          currentAmount,
          targetAmount,
          difference,
        });

        // If we need more of this token, find tokens to sell
        if (difference > 0) {
          // Find tokens with excess to sell
          for (const currentAlloc of currentAllocations) {
            const targetAlloc = targetAllocations.find(t => t.mint === currentAlloc.mint);
            const targetAmountForThis = targetAlloc ? (totalValue * targetAlloc.percentage) / 100 : 0;
            const excess = currentAlloc.amount - targetAmountForThis;

            if (excess > 0) {
              const amountToSwap = Math.min(excess, difference);
              
              if (amountToSwap > 0) {
                const quote = await this.getSwapQuote(
                  currentAlloc.mint,
                  target.mint,
                  amountToSwap
                );

                if (quote) {
                  swaps.push({
                    from: currentAlloc.mint,
                    to: target.mint,
                    amount: amountToSwap,
                    quote,
                  });
                }
              }
            }
          }
        }
      }

      return { swaps, summary };
    } catch (error) {
      console.error('Error calculating rebalancing swaps:', error);
      return { swaps: [], summary: [] };
    }
  }
}

// Common Solana token mints
export const COMMON_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
} as const;

export const jupiterService = new JupiterService(
  new Connection('https://api.mainnet-beta.solana.com')
);