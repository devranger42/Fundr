// Solana and smart contract types for Fundr DApp

export interface FundAccount {
  publicKey: string;
  manager: string;
  name: string;
  description: string;
  totalAssets: number; // in lamports
  totalShares: number;
  managementFee: number; // percentage (0-20)
  createdAt: number; // timestamp
  isActive: boolean;
  tokenAllocations: TokenAllocation[];
}

export interface TokenAllocation {
  mintAddress: string;
  symbol: string;
  percentage: number;
  currentValue: number; // in lamports
}

export interface InvestorStake {
  investor: string;
  fundPublicKey: string;
  shares: number;
  initialInvestment: number; // in lamports
  currentValue: number; // in lamports
  depositedAt: number; // timestamp
}

export interface SwapInstruction {
  fromMint: string;
  toMint: string;
  amount: number;
  slippageBps: number; // basis points (e.g., 100 = 1%)
}

export interface FundPerformance {
  fundPublicKey: string;
  totalReturn: number; // percentage
  dailyReturn: number; // percentage
  weeklyReturn: number; // percentage
  monthlyReturn: number; // percentage
  sharpeRatio: number;
  maxDrawdown: number; // percentage
  aum: number; // assets under management in lamports
}

// Program instruction types
export enum FundrInstruction {
  InitializeFund = 0,
  Deposit = 1,
  Withdraw = 2,
  Rebalance = 3,
  UpdateFee = 4,
  CloseFund = 5,
}

export interface InitializeFundParams {
  name: string;
  description: string;
  managementFee: number;
  initialTokenAllocations: TokenAllocation[];
}

export interface DepositParams {
  fundPublicKey: string;
  amount: number; // in lamports
}

export interface WithdrawParams {
  fundPublicKey: string;
  shares: number;
}

export interface RebalanceParams {
  fundPublicKey: string;
  newAllocations: TokenAllocation[];
  swapInstructions: SwapInstruction[];
}

// Platform constants
export const PLATFORM_FEE_BPS = 100; // 1%
export const MAX_MANAGEMENT_FEE_BPS = 2000; // 20%
export const FUND_TOKEN_DECIMALS = 9;
export const SOL_DECIMALS = 9;

// Common token addresses on Solana mainnet
export const TOKENS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  BONK: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  WIF: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
  POPCAT: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
} as const;

export type TokenSymbol = keyof typeof TOKENS;