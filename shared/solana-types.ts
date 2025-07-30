// Shared TypeScript types for Solana integration

export interface WalletAdapter {
  name: string;
  icon: string;
  url: string;
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction?(transaction: any): Promise<any>;
  signAllTransactions?(transactions: any[]): Promise<any[]>;
  signMessage?(message: Uint8Array): Promise<Uint8Array>;
}

export interface SolanaTransaction {
  id: string;
  signature?: string;
  type: 'deposit' | 'withdraw' | 'rebalance' | 'create_fund';
  status: 'pending' | 'confirmed' | 'failed';
  amount?: number;
  shares?: number;
  fundId: string;
  userId: string;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface TokenMetadata {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;
}

export interface FundPDA {
  address: string;
  manager: string;
  name: string;
  description: string;
  totalAssets: number;
  totalShares: number;
  managementFee: number;
  performanceFee: number;
  isActive: boolean;
  createdAt: number;
  lastRebalance: number;
}

export interface StakePDA {
  address: string;
  fund: string;
  investor: string;
  shares: number;
  initialInvestment: number;
  depositedAt: number;
  lastUpdated: number;
}

export interface AllocationPDA {
  fund: string;
  tokenMint: string;
  targetPercentage: number;
  currentAmount: number;
  lastUpdated: number;
}

export interface TransactionPDA {
  address: string;
  fund: string;
  user: string;
  type: 'deposit' | 'withdraw' | 'rebalance';
  amount: number;
  shares?: number;
  signature: string;
  slot: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

// Anchor program instruction types
export interface CreateFundInstruction {
  name: string;
  description: string;
  managementFee: number;
  performanceFee: number;
  initialAllocations: {
    tokenMint: string;
    percentage: number;
  }[];
}

export interface DepositInstruction {
  fundAddress: string;
  amount: number;
}

export interface WithdrawInstruction {
  fundAddress: string;
  shares: number;
}

export interface RebalanceInstruction {
  fundAddress: string;
  newAllocations: {
    tokenMint: string;
    percentage: number;
  }[];
  swapInstructions: {
    fromMint: string;
    toMint: string;
    amount: number;
    minimumOutAmount: number;
  }[];
}

// Jupiter integration types
export interface JupiterQuoteResponse {
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
  routePlan: JupiterRoute[];
  contextSlot: number;
  timeTaken: number;
}

export interface JupiterRoute {
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

export interface JupiterSwapRequest {
  quoteResponse: JupiterQuoteResponse;
  userPublicKey: string;
  wrapAndUnwrapSol: boolean;
  useSharedAccounts: boolean;
  prioritizationFeeLamports?: number;
  asLegacyTransaction: boolean;
  useTokenLedger: boolean;
  destinationTokenAccount?: string;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

// Platform fee structure
export interface PlatformFees {
  depositFee: number; // 1% for $FUND token buy/burn
  withdrawalFee: number; // 1% for platform treasury
  maxManagementFee: number; // Maximum 20% management fee
  maxPerformanceFee: number; // Maximum 20% performance fee
}

export const DEFAULT_PLATFORM_FEES: PlatformFees = {
  depositFee: 1.0, // 1%
  withdrawalFee: 1.0, // 1%
  maxManagementFee: 20.0, // 20%
  maxPerformanceFee: 20.0, // 20%
};

// Common token addresses on Solana
export const SOLANA_TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  POPCAT: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
  FIDA: 'EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  SRM: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
} as const;

export type SolanaTokenSymbol = keyof typeof SOLANA_TOKENS;