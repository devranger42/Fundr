import { storage } from "./storage";

// Platform-run index fund definitions
export const PLATFORM_FUNDS = [
  {
    id: "sol50",
    name: "SOL 50 Index",
    description: "Top 50 coins on Solana by market cap and trading volume",
    category: "broad-market",
    rebalanceFrequency: "weekly" as const,
    tokens: [] // Will be populated dynamically
  },
  {
    id: "meme25",
    name: "Meme 25 Index",
    description: "Top 25 meme coins on Solana ecosystem",
    category: "meme",
    rebalanceFrequency: "daily" as const,
    tokens: []
  },
  {
    id: "utility25",
    name: "Utility 25 Index",
    description: "Top 25 utility tokens and DeFi protocols on Solana",
    category: "utility",
    rebalanceFrequency: "weekly" as const,
    tokens: []
  },
  {
    id: "bonk10",
    name: "BONK Launchpad 10 Index",
    description: "Top 10 meme coins launched via BONK launchpad",
    category: "launchpad",
    rebalanceFrequency: "daily" as const,
    tokens: []
  },
  {
    id: "pump10",
    name: "Pump.fun 10 Index",
    description: "Top 10 tokens launched via Pump.fun platform",
    category: "launchpad",
    rebalanceFrequency: "daily" as const,
    tokens: []
  },
  {
    id: "jup10",
    name: "Jupiter Launchpad 10 Index",
    description: "Top 10 launchpad coins from Jupiter ecosystem",
    category: "launchpad",
    rebalanceFrequency: "weekly" as const,
    tokens: []
  },
  {
    id: "believe10",
    name: "Believe Launchpad 10 Index",
    description: "Top 10 tokens launched via Believe launchpad",
    category: "launchpad",
    rebalanceFrequency: "daily" as const,
    tokens: []
  },
  {
    id: "moby10",
    name: "MobyScreener 10 Index",
    description: "Top 10 coins tracked by MobyScreener analytics",
    category: "analytics",
    rebalanceFrequency: "weekly" as const,
    tokens: []
  }
];

// Mock token data for platform funds (in production, this would come from real APIs)
const MOCK_TOKEN_ALLOCATIONS = {
  sol50: [
    { symbol: "SOL", address: "So11111111111111111111111111111111111111112", percentage: 25 },
    { symbol: "USDC", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", percentage: 15 },
    { symbol: "JUP", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", percentage: 10 },
    { symbol: "RAY", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", percentage: 8 },
    { symbol: "ORCA", address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", percentage: 7 },
    // Additional tokens would be added dynamically
  ],
  meme25: [
    { symbol: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", percentage: 20 },
    { symbol: "WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", percentage: 15 },
    { symbol: "POPCAT", address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", percentage: 12 },
    { symbol: "MEW", address: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", percentage: 10 },
    { symbol: "BOME", address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", percentage: 8 },
  ],
  utility25: [
    { symbol: "JUP", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", percentage: 18 },
    { symbol: "RAY", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", percentage: 15 },
    { symbol: "ORCA", address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", percentage: 12 },
    { symbol: "MNGO", address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac", percentage: 10 },
    { symbol: "SRM", address: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", percentage: 8 },
  ]
};

export async function createPlatformFunds() {
  console.log("Creating platform index funds...");
  
  try {
    // Check if platform funds already exist
    const existingFunds = await storage.getAllFunds();
    const existingPlatformFunds = existingFunds.filter((fund: any) => fund.isPlatformFund);
    
    if (existingPlatformFunds.length > 0) {
      console.log(`Found ${existingPlatformFunds.length} existing platform funds`);
      return existingPlatformFunds;
    }

    // Create platform authority user if it doesn't exist
    let platformUser;
    try {
      // Try to find existing platform user
      const users = await storage.getAllUsers();
      platformUser = users.find((u: any) => u.username === 'platform-authority');
      
      if (!platformUser) {
        platformUser = await storage.createUser({
          username: 'platform-authority',
          password: 'platform-managed-funds',
          displayName: 'Fundr Platform',
          bio: 'Official Fundr platform index funds'
        });
      }
    } catch (error) {
      console.error("Error creating platform user:", error);
      return [];
    }

    const createdFunds = [];

    // Create each platform fund
    for (const fundDef of PLATFORM_FUNDS.slice(0, 3)) { // Start with first 3 funds
      try {
        const allocations = MOCK_TOKEN_ALLOCATIONS[fundDef.id as keyof typeof MOCK_TOKEN_ALLOCATIONS] || [];
        
        const fundData = {
          publicKey: `platform-fund-${fundDef.id}`, // Mock address for demo
          managerId: platformUser.id,
          name: fundDef.name,
          description: fundDef.description,
          managementFee: 0, // No management fees for platform funds
          performanceFee: 0, // No performance fees for platform funds
          minDeposit: 1, // 1 SOL minimum
          fundMode: "auto" as const, // Always auto allocation
          allocationOption: "locked" as const, // Platform controlled
          jupiterStrictList: true, // Use strict list for security
          isPlatformFund: true,
          rebalanceFrequency: fundDef.rebalanceFrequency,
          totalAssets: Math.floor(Math.random() * 50000) + 10000, // Mock TVL
          totalShares: Math.floor(Math.random() * 1000000) + 100000,
          isActive: true
        };

        const fund = await storage.createFund(fundData);
        
        // Create fund allocations (commented out until we add the method to storage)
        // for (const allocation of allocations) {
        //   await storage.createFundAllocation({
        //     fundId: fund.id,
        //     tokenMint: allocation.address,
        //     tokenSymbol: allocation.symbol,
        //     targetPercentage: allocation.percentage * 100, // Convert to basis points
        //     currentValue: Math.floor((allocation.percentage / 100) * fundData.totalAssets)
        //   });
        // }

        createdFunds.push(fund);
        console.log(`Created platform fund: ${fund.name}`);
      } catch (error) {
        console.error(`Failed to create platform fund ${fundDef.name}:`, error);
      }
    }

    console.log(`Successfully created ${createdFunds.length} platform funds`);
    return createdFunds;
  } catch (error) {
    console.error("Error creating platform funds:", error);
    return [];
  }
}

export async function rebalancePlatformFunds() {
  console.log("Rebalancing platform funds...");
  
  try {
    const funds = await storage.getAllFunds();
    const platformFunds = funds.filter((fund: any) => fund.isPlatformFund && fund.isActive);
    
    for (const fund of platformFunds) {
      // In production, this would:
      // 1. Fetch latest market data from CoinGecko/DexScreener
      // 2. Calculate new allocations based on fund strategy
      // 3. Execute rebalancing trades via Jupiter
      // 4. Update fund allocations in database
      
      console.log(`Rebalancing ${fund.name} (frequency: ${fund.rebalanceFrequency})`);
      
      // Mock rebalancing - randomly adjust allocations slightly
      const allocations = await storage.getFundAllocations(fund.id);
      for (const allocation of allocations) {
        const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
        const currentValue = allocation.currentValue || 0;
        const newValue = Math.max(0, currentValue * (1 + variance));
        
        await storage.updateFundAllocation(allocation.id, {
          currentValue: Math.floor(newValue)
        });
      }
    }
    
    console.log("Platform fund rebalancing completed");
  } catch (error) {
    console.error("Error rebalancing platform funds:", error);
  }
}

// Schedule rebalancing (in production, this would use a proper job scheduler)
export function startRebalancingScheduler() {
  // Daily rebalancing check at 12:00 UTC
  setInterval(async () => {
    const now = new Date();
    if (now.getUTCHours() === 12 && now.getUTCMinutes() === 0) {
      await rebalancePlatformFunds();
    }
  }, 60000); // Check every minute
}