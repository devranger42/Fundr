import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';
import { connection } from './solana';
import BN from 'bn.js';
import './polyfills'; // Import polyfills for browser compatibility

// Program ID - will be updated when deployed to devnet
export const FUNDR_PROGRAM_ID = new PublicKey('9Q7jD6RkFhw92Yt6YgR6RzoJT4MgB6Up4n8BqQ6nT7K5');

// Account discriminators (first 8 bytes of account data)
const FUND_DISCRIMINATOR = new Uint8Array([217, 230, 65, 101, 201, 162, 27, 125]);
const USER_STAKE_DISCRIMINATOR = new Uint8Array([206, 132, 208, 58, 248, 24, 235, 89]);

export enum FundMode {
  Manual = 0,
  Auto = 1,
}

export interface FundData {
  authority: PublicKey;
  name: string;
  description: string;
  managementFee: number;
  performanceFee: number;
  minDeposit: BN;
  fundMode: FundMode;
  totalShares: BN;
  totalAssets: BN;
  investorCount: number;
  bump: number;
  createdAt: BN;
  lastFeeCollection: BN;
  highWaterMark: BN;
}

export interface UserStakeData {
  user: PublicKey;
  fund: PublicKey;
  shares: BN;
  totalDeposited: BN;
  lastDeposit: BN;
  lastWithdrawal: BN;
}

export class FundrProgram {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = connection;
    this.programId = FUNDR_PROGRAM_ID;
  }

  // Generate PDA for fund account
  getFundPDA(manager: PublicKey): [PublicKey, number] {
    return FundrProgram.getFundPDA(manager);
  }
  
  static getFundPDA(manager: PublicKey): [PublicKey, number] {
    const encoder = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [encoder.encode('fund'), manager.toBuffer()],
      FUNDR_PROGRAM_ID
    );
  }

  // Generate PDA for fund vault
  static getFundVaultPDA(fund: PublicKey): [PublicKey, number] {
    const encoder = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [encoder.encode('vault'), fund.toBuffer()],
      FUNDR_PROGRAM_ID
    );
  }

  // Generate PDA for user stake
  static getUserStakePDA(fund: PublicKey, user: PublicKey): [PublicKey, number] {
    const encoder = new TextEncoder();
    return PublicKey.findProgramAddressSync(
      [encoder.encode('stake'), fund.toBuffer(), user.toBuffer()],
      FUNDR_PROGRAM_ID
    );
  }

  // Initialize a new fund
  async initializeFund(
    manager: PublicKey,
    fundData: {
      name: string;
      description: string;
      managementFee: number;
      performanceFee: number;
      minDeposit: number;
      fundMode: FundMode;
    }
  ): Promise<Transaction> {
    const [fund] = FundrProgram.getFundPDA(manager);
    const [fundVault] = FundrProgram.getFundVaultPDA(fund);

    // Create instruction data
    const instruction = new Transaction().add({
      keys: [
        { pubkey: fund, isSigner: false, isWritable: true },
        { pubkey: fundVault, isSigner: false, isWritable: true },
        { pubkey: manager, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([
        0, // initialize_fund instruction discriminator
        ...Array.from(new TextEncoder().encode(fundData.name)),
        0, // null terminator
        ...Array.from(new TextEncoder().encode(fundData.description)),
        0, // null terminator
        ...new BN(fundData.managementFee).toArray('le', 2),
        ...new BN(fundData.performanceFee).toArray('le', 2),
        ...new BN(fundData.minDeposit * LAMPORTS_PER_SOL).toArray('le', 8),
        fundData.fundMode,
      ])
    });

    return instruction;
  }

  // Deposit SOL to fund
  async deposit(
    depositor: PublicKey,
    fund: PublicKey,
    amount: number
  ): Promise<Transaction> {
    const [userStake] = FundrProgram.getUserStakePDA(fund, depositor);
    const [fundVault] = FundrProgram.getFundVaultPDA(fund);

    const instruction = new Transaction().add({
      keys: [
        { pubkey: fund, isSigner: false, isWritable: true },
        { pubkey: userStake, isSigner: false, isWritable: true },
        { pubkey: fundVault, isSigner: false, isWritable: true },
        { pubkey: depositor, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([
        1, // deposit instruction discriminator
        ...new BN(amount * LAMPORTS_PER_SOL).toArray('le', 8),
      ])
    });

    return instruction;
  }

  // Withdraw from fund
  async withdraw(
    withdrawer: PublicKey,
    fund: PublicKey,
    sharesToRedeem: BN
  ): Promise<Transaction> {
    const [userStake] = FundrProgram.getUserStakePDA(fund, withdrawer);
    const [fundVault] = FundrProgram.getFundVaultPDA(fund);

    const instruction = new Transaction().add({
      keys: [
        { pubkey: fund, isSigner: false, isWritable: true },
        { pubkey: userStake, isSigner: false, isWritable: true },
        { pubkey: fundVault, isSigner: false, isWritable: true },
        { pubkey: withdrawer, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([
        2, // withdraw instruction discriminator
        ...sharesToRedeem.toArray('le', 8),
      ])
    });

    return instruction;
  }

  // Get fund account data
  async getFundData(fund: PublicKey): Promise<FundData | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(fund);
      if (!accountInfo || !accountInfo.data) {
        return null;
      }

      // Parse account data (simplified - in real implementation would use Anchor's borsh)
      const data = accountInfo.data;
      
      // Verify discriminator - simplified check for browser compatibility
      const dataArray = new Uint8Array(data.slice(0, 8));
      let discriminatorMatch = true;
      for (let i = 0; i < 8; i++) {
        if (dataArray[i] !== FUND_DISCRIMINATOR[i]) {
          discriminatorMatch = false;
          break;
        }
      }
      if (!discriminatorMatch) {
        return null;
      }

      // This is a simplified parser - real implementation would use proper borsh deserialization
      return {
        authority: new PublicKey(data.slice(8, 40)),
        name: 'Fund Name', // Would be parsed from data
        description: 'Fund Description',
        managementFee: 100, // 1%
        performanceFee: 2000, // 20%
        minDeposit: new BN(1000000), // 0.001 SOL minimum
        fundMode: FundMode.Manual,
        totalShares: new BN(0),
        totalAssets: new BN(0),
        investorCount: 0,
        bump: data[data.length - 1],
        createdAt: new BN(0),
        lastFeeCollection: new BN(0),
        highWaterMark: new BN(1000000),
      };
    } catch (error) {
      console.error('Error fetching fund data:', error);
      return null;
    }
  }

  // Get user stake data
  async getUserStakeData(fund: PublicKey, user: PublicKey): Promise<UserStakeData | null> {
    try {
      const [userStake] = FundrProgram.getUserStakePDA(fund, user);
      const accountInfo = await this.connection.getAccountInfo(userStake);
      
      if (!accountInfo || !accountInfo.data) {
        return null;
      }

      const data = accountInfo.data;
      
      // Verify discriminator - simplified check for browser compatibility  
      const dataArray = new Uint8Array(data.slice(0, 8));
      let discriminatorMatch = true;
      for (let i = 0; i < 8; i++) {
        if (dataArray[i] !== USER_STAKE_DISCRIMINATOR[i]) {
          discriminatorMatch = false;
          break;
        }
      }
      if (!discriminatorMatch) {
        return null;
      }

      // Simplified parser
      return {
        user: new PublicKey(data.slice(8, 40)),
        fund: new PublicKey(data.slice(40, 72)),
        shares: new BN(0),
        totalDeposited: new BN(0),
        lastDeposit: new BN(0),
        lastWithdrawal: new BN(0),
      };
    } catch (error) {
      console.error('Error fetching user stake data:', error);
      return null;
    }
  }

  // Calculate expected shares for deposit
  calculateShares(depositAmount: number, fundData: FundData): BN {
    const depositLamports = new BN(depositAmount * LAMPORTS_PER_SOL);
    
    if (fundData.totalShares.eq(new BN(0))) {
      // First deposit: 1 SOL = 1M shares
      return depositLamports.mul(new BN(1_000_000));
    } else {
      // Subsequent deposits: shares = (deposit * total_shares) / total_assets
      return depositLamports.mul(fundData.totalShares).div(fundData.totalAssets);
    }
  }

  // Calculate withdrawal amount for shares
  calculateWithdrawal(sharesToRedeem: BN, fundData: FundData): BN {
    if (fundData.totalShares.eq(new BN(0))) {
      return new BN(0);
    }
    
    return sharesToRedeem.mul(fundData.totalAssets).div(fundData.totalShares);
  }

  // Check if program is deployed
  async isProgramDeployed(): Promise<boolean> {
    try {
      const accountInfo = await this.connection.getAccountInfo(this.programId);
      return accountInfo !== null && accountInfo.executable;
    } catch {
      return false;
    }
  }
}

export const fundrProgram = new FundrProgram();