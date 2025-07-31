import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Fund, FundAllocation, InvestorStake, FundTransaction } from "@shared/schema";

export interface FundWithAllocations extends Fund {
  allocations: FundAllocation[];
}

export interface FundDetail extends FundWithAllocations {
  stakes: InvestorStake[];
  transactions: FundTransaction[];
}

export interface StakeWithFund extends InvestorStake {
  fund: Fund;
}

// Hook to fetch all funds
export function useFunds() {
  return useQuery<FundWithAllocations[]>({
    queryKey: ['/api/funds'],
  });
}

// Hook to fetch specific fund details
export function useFund(fundId: string) {
  return useQuery<FundDetail>({
    queryKey: ['/api/funds', fundId],
    enabled: !!fundId,
  });
}

// Hook to fetch user's fund stakes
export function useUserStakes() {
  return useQuery<StakeWithFund[]>({
    queryKey: ['/api/user/stakes'],
  });
}

// Hook to fetch user's transactions
export function useUserTransactions() {
  return useQuery<FundTransaction[]>({
    queryKey: ['/api/user/transactions'],
  });
}

// Hook to create a new fund
export function useCreateFund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fundData: {
      name: string;
      description: string;
      managementFee: number;
      publicKey: string;
      managerId: string;
      allocations?: {
        tokenMint: string;
        tokenSymbol: string;
        targetPercentage: number;
      }[];
    }) => {
      const response = await apiRequest('POST', '/api/funds', fundData);
      
      return response;
    },
    onSuccess: () => {
      // Invalidate funds list to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
    },
  });
}

// Hook to deposit to a fund
export function useDeposit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fundId: string; amount: number }) => {
      const response = await apiRequest('POST', `/api/funds/${data.fundId}/deposit`, { 
        amount: Math.round(data.amount * 1e9) // Convert SOL to lamports
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/funds', variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stakes'] });
    },
  });
}

// Hook to withdraw from a fund
export function useWithdraw() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fundId: string; amount: number }) => {
      const response = await apiRequest('POST', `/api/funds/${data.fundId}/withdraw`, { 
        amount: Math.round(data.amount * 1e9) // Convert SOL to lamports
      });
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/funds', variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stakes'] });
    },
  });
}

// Hook to update fund allocations
export function useUpdateAllocations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      fundId,
      allocations,
    }: {
      fundId: string;
      allocations: {
        tokenMint: string;
        tokenSymbol: string;
        targetPercentage: number;
      }[];
    }) => {
      const response = await apiRequest('PUT', `/api/funds/${fundId}/allocations`, { allocations });
      
      return response;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific fund and funds list
      queryClient.invalidateQueries({ queryKey: ['/api/funds', variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ['/api/funds'] });
    },
  });
}

// Hook to deposit to a fund
export function useDepositToFund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      fundId,
      amount,
      shares,
    }: {
      fundId: string;
      amount: number;
      shares: number;
    }) => {
      const response = await fetch(`/api/funds/${fundId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, shares }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/funds', variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stakes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
    },
  });
}

// Hook to withdraw from a fund
export function useWithdrawFromFund() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      fundId,
      shares,
    }: {
      fundId: string;
      shares: number;
    }) => {
      const response = await fetch(`/api/funds/${fundId}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shares }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/funds', variables.fundId] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/stakes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
    },
  });
}

// Hook to update transaction status (for internal use)
export function useUpdateTransactionStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      transactionId,
      status,
      txSignature,
    }: {
      transactionId: string;
      status: string;
      txSignature?: string;
    }) => {
      const response = await fetch(`/api/transactions/${transactionId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, txSignature }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate transaction-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
    },
  });
}