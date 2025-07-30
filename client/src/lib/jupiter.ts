// Jupiter API integration for token swaps
// Jupiter is the aggregator used for swapping tokens on Solana

export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: RoutePlan[];
}

export interface RoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface SwapRequest {
  quoteResponse: JupiterQuoteResponse;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  useSharedAccounts?: boolean;
  feeAccount?: string;
  computeUnitPriceMicroLamports?: number;
}

export class JupiterService {
  private baseUrl = 'https://quote-api.jup.ag/v6';

  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50
  ): Promise<JupiterQuoteResponse> {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false'
    });

    const response = await fetch(`${this.baseUrl}/quote?${params}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter quote failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getSwapTransaction(swapRequest: SwapRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(swapRequest),
    });

    if (!response.ok) {
      throw new Error(`Jupiter swap failed: ${response.statusText}`);
    }

    const { swapTransaction } = await response.json();
    return swapTransaction;
  }

  async getTokenPrices(mints: string[]): Promise<Record<string, number>> {
    const mintParam = mints.join(',');
    const response = await fetch(`https://price.jup.ag/v4/price?ids=${mintParam}`);
    
    if (!response.ok) {
      throw new Error(`Jupiter price fetch failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  // Helper method to calculate optimal swap amounts for rebalancing
  calculateRebalanceSwaps(
    currentAllocations: { mint: string; amount: number }[],
    targetAllocations: { mint: string; percentage: number }[],
    totalValue: number
  ): { fromMint: string; toMint: string; amount: number }[] {
    const swaps: { fromMint: string; toMint: string; amount: number }[] = [];
    
    // Calculate target amounts
    const targetAmounts = targetAllocations.map(target => ({
      mint: target.mint,
      targetAmount: (totalValue * target.percentage) / 100,
    }));

    // Find tokens to sell (over-allocated)
    const overAllocated = currentAllocations.filter(current => {
      const target = targetAmounts.find(t => t.mint === current.mint);
      return target && current.amount > target.targetAmount;
    });

    // Find tokens to buy (under-allocated)
    const underAllocated = targetAmounts.filter(target => {
      const current = currentAllocations.find(c => c.mint === target.mint);
      return !current || current.amount < target.targetAmount;
    });

    // Create swap instructions
    for (const over of overAllocated) {
      const target = targetAmounts.find(t => t.mint === over.mint)!;
      const excessAmount = over.amount - target.targetAmount;

      for (const under of underAllocated) {
        const current = currentAllocations.find(c => c.mint === under.mint);
        const deficit = under.targetAmount - (current?.amount || 0);
        
        if (deficit > 0 && excessAmount > 0) {
          const swapAmount = Math.min(excessAmount, deficit);
          swaps.push({
            fromMint: over.mint,
            toMint: under.mint,
            amount: swapAmount,
          });
        }
      }
    }

    return swaps;
  }
}

export const jupiterService = new JupiterService();