import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/wallet-provider';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { fundrProgram, FUNDR_PROGRAM_ID } from '@/lib/fundr-program';

// Solana RPC endpoint
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';

export function useFundrProgram() {
  const { connected, publicKey } = useWallet();
  const [fundrService, setFundrService] = useState<typeof fundrProgram | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    setFundrService(fundrProgram);

    if (connected && publicKey) {
      const wallet = {
        publicKey,
        signTransaction: async (tx: any) => {
          // Mock transaction signing for development
          return tx;
        },
        signAllTransactions: async (txs: any[]) => {
          return txs;
        }
      };

      // Mock initialization for now
      setIsInitialized(true);
    } else {
      setIsInitialized(false);
    }
  }, [connected, publicKey]);

  const createFund = useCallback(async (
    name: string,
    description: string,
    managementFee: number,
    performanceFee: number,
    minDeposit: number
  ) => {
    if (!fundrService) {
      throw new Error('Fundr service not available');
    }

    if (!connected || !publicKey) {
      throw new Error('Wallet not connected');
    }

    console.log('Creating fund with hook:', { name, description, managementFee, performanceFee, minDeposit });

    try {
      // Convert percentages to basis points for the service call
      const managementFeeBasisPoints = managementFee * 100;
      const performanceFeeBasisPoints = performanceFee * 100;
      
      const result = await fundrService.initializeFund(publicKey, {
        name,
        description,
        managementFee: managementFeeBasisPoints,
        performanceFee: performanceFeeBasisPoints,
        minDeposit,
        fundMode: 0 // Manual mode
      });
      
      console.log('Fund creation successful:', result);
      return result;
    } catch (error) {
      console.error('Fund creation failed in hook:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [fundrService, connected, publicKey]);

  const depositToFund = useCallback(async (
    fundAddress: PublicKey,
    amount: number
  ) => {
    if (!fundrService || !isInitialized) {
      throw new Error('Fundr service not initialized');
    }

    const transaction = await fundrService.deposit(publicKey!, fundAddress, amount);
    return transaction;
  }, [fundrService, isInitialized]);

  const withdrawFromFund = useCallback(async (
    fundAddress: PublicKey,
    shareAmount: number
  ) => {
    if (!fundrService || !isInitialized) {
      throw new Error('Fundr service not initialized');
    }

    const { BN } = await import('bn.js');
    const transaction = await fundrService.withdraw(publicKey!, fundAddress, new BN(shareAmount));
    return transaction;
  }, [fundrService, isInitialized]);

  const getFundData = useCallback(async (fundAddress: PublicKey) => {
    if (!fundrService) {
      throw new Error('Fundr service not initialized');
    }

    return await fundrService.getFundData(fundAddress);
  }, [fundrService]);

  const getUserStake = useCallback(async (
    fundAddress: PublicKey,
    userAddress: PublicKey
  ) => {
    if (!fundrService) {
      throw new Error('Fundr service not initialized');
    }

    return await fundrService.getUserStake(fundAddress, userAddress);
  }, [fundrService]);

  const rebalanceFund = useCallback(async (
    fundAddress: PublicKey,
    tokenInMint: PublicKey,
    tokenOutMint: PublicKey,
    amount: number,
    slippageBps: number = 50
  ) => {
    if (!fundrService || !isInitialized) {
      throw new Error('Fundr service not initialized');
    }

    const { BN } = await import('@coral-xyz/anchor');
    return await fundrService.rebalance(
      fundAddress,
      tokenInMint,
      tokenOutMint,
      new BN(amount),
      slippageBps
    );
  }, [fundrService, isInitialized]);

  const reclaimRent = useCallback(async (
    fundAddress: PublicKey,
    closedAccountAddress: PublicKey
  ) => {
    if (!fundrService || !isInitialized) {
      throw new Error('Fundr service not initialized');
    }

    return await fundrService.reclaimRent(fundAddress, closedAccountAddress);
  }, [fundrService, isInitialized]);

  const closeTokenAccount = useCallback(async (
    fundAddress: PublicKey,
    tokenAccountAddress: PublicKey
  ) => {
    if (!fundrService || !isInitialized) {
      throw new Error('Fundr service not initialized');
    }

    return await fundrService.closeTokenAccount(fundAddress, tokenAccountAddress);
  }, [fundrService, isInitialized]);

  return {
    fundrService,
    isInitialized,
    connected: connected && !!publicKey,
    programId: FUNDR_PROGRAM_ID,
    createFund,
    depositToFund,
    withdrawFromFund,
    getFundData,
    getUserStake,
    rebalanceFund,
    reclaimRent,
    closeTokenAccount,
  };
}