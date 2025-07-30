import { useQuery } from '@tanstack/react-query';
import { useFundrProgram } from './use-fundr-program';
import { PublicKey } from '@solana/web3.js';

interface BlockchainFund {
  id: string;
  publicKey: PublicKey;
  name: string;
  description: string;
  authority: PublicKey;
  managementFee: number;
  performanceFee: number;
  minDeposit: number;
  totalShares: number;
  totalAssets: number;
  investorCount: number;
  createdAt: Date;
  lastFeeCollection: Date;
  highWaterMark: number;
}

export function useBlockchainFunds() {
  const { fundrService, connected } = useFundrProgram();

  return useQuery({
    queryKey: ['blockchain-funds'],
    queryFn: async (): Promise<BlockchainFund[]> => {
      if (!fundrService || !connected) {
        return [];
      }

      try {
        // In a real implementation, this would:
        // 1. Get all fund program accounts from the blockchain
        // 2. Parse the account data into fund objects
        // 3. Return the funds array
        
        // For now, return mock data structure that matches the blockchain schema
        return [
          {
            id: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
            publicKey: new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'),
            name: 'DeFi Alpha Fund',
            description: 'High-yield DeFi strategies on Solana',
            authority: new PublicKey('11111111111111111111111111111111'),
            managementFee: 100, // 1%
            performanceFee: 2000, // 20%
            minDeposit: 1000000000, // 1 SOL
            totalShares: 0,
            totalAssets: 0,
            investorCount: 0,
            createdAt: new Date(),
            lastFeeCollection: new Date(),
            highWaterMark: 1000000
          }
        ];
      } catch (error) {
        console.error('Error fetching blockchain funds:', error);
        return [];
      }
    },
    enabled: connected,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useBlockchainFund(fundId: string) {
  const { fundrService, connected } = useFundrProgram();

  return useQuery({
    queryKey: ['blockchain-fund', fundId],
    queryFn: async (): Promise<BlockchainFund | null> => {
      if (!fundrService || !connected || !fundId) {
        return null;
      }

      try {
        const fundPubkey = new PublicKey(fundId);
        const fundData = await fundrService.getFundData(fundPubkey);
        
        return {
          id: fundId,
          publicKey: fundPubkey,
          name: fundData.name,
          description: fundData.description,
          authority: fundData.authority,
          managementFee: fundData.managementFee,
          performanceFee: fundData.performanceFee,
          minDeposit: fundData.minDeposit.toNumber(),
          totalShares: fundData.totalShares.toNumber(),
          totalAssets: fundData.totalAssets.toNumber(),
          investorCount: fundData.investorCount,
          createdAt: new Date(fundData.createdAt.toNumber() * 1000),
          lastFeeCollection: new Date(fundData.lastFeeCollection.toNumber() * 1000),
          highWaterMark: fundData.highWaterMark.toNumber()
        };
      } catch (error) {
        console.error('Error fetching blockchain fund:', error);
        return null;
      }
    },
    enabled: connected && !!fundId,
  });
}

export function useUserStake(fundId: string, userAddress?: PublicKey) {
  const { fundrService, connected } = useFundrProgram();

  return useQuery({
    queryKey: ['user-stake', fundId, userAddress?.toString()],
    queryFn: async () => {
      if (!fundrService || !connected || !fundId || !userAddress) {
        return null;
      }

      try {
        const fundPubkey = new PublicKey(fundId);
        const stakeData = await fundrService.getUserStake(fundPubkey, userAddress);
        
        return {
          user: stakeData.user,
          fund: stakeData.fund,
          shares: stakeData.shares.toNumber(),
          totalDeposited: stakeData.totalDeposited.toNumber(),
          lastDeposit: new Date(stakeData.lastDeposit.toNumber() * 1000),
          lastWithdrawal: new Date(stakeData.lastWithdrawal.toNumber() * 1000)
        };
      } catch (error) {
        console.error('Error fetching user stake:', error);
        return null;
      }
    },
    enabled: connected && !!fundId && !!userAddress,
  });
}