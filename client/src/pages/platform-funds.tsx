import { useState, useEffect } from "react";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Zap, 
  Target,
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  Rocket,
  Shield
} from "lucide-react";

interface PlatformFund {
  id: string;
  name: string;
  description: string;
  isPlatformFund: boolean;
  rebalanceFrequency: string;
  totalAssets: number;
  totalShares: number;
  isActive: boolean;
  createdAt: string;
}

const FUND_CATEGORIES = {
  'sol50': { icon: Building2, color: 'bg-blue-500', label: 'Broad Market' },
  'meme25': { icon: Sparkles, color: 'bg-purple-500', label: 'Meme Coins' },
  'utility25': { icon: Zap, color: 'bg-green-500', label: 'Utility' },
  'bonk10': { icon: Rocket, color: 'bg-bonk', label: 'BONK Launch' },
  'pump10': { icon: TrendingUp, color: 'bg-pump', label: 'Pump.fun' },
  'jup10': { icon: Target, color: 'bg-yellow-500', label: 'Jupiter' },
  'believe10': { icon: Shield, color: 'bg-indigo-500', label: 'Believe' },
  'moby10': { icon: Users, color: 'bg-pink-500', label: 'Analytics' }
};

function getFundCategory(fundName: string) {
  const key = Object.keys(FUND_CATEGORIES).find(k => 
    fundName.toLowerCase().includes(k.toLowerCase().replace(/\d+/, ''))
  );
  return key ? FUND_CATEGORIES[key as keyof typeof FUND_CATEGORIES] : FUND_CATEGORIES.sol50;
}

function PlatformFundCard({ fund }: { fund: PlatformFund }) {
  const category = getFundCategory(fund.name);
  const IconComponent = category.icon;
  
  // Mock performance data (in production, this would come from real calculations)
  const performance7d = (Math.random() - 0.5) * 20; // -10% to +10%
  const performance30d = (Math.random() - 0.5) * 40; // -20% to +20%
  const tvlFormatted = `$${(fund.totalAssets / 1000000).toFixed(1)}M`;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: category.color.replace('bg-', '#') }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${category.color} text-white`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{fund.name}</CardTitle>
              <p className="text-sm text-gray-500 mb-2">Managed by Fundr</p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  Platform Fund
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {category.label}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">{tvlFormatted}</div>
            <div className="text-xs text-gray-500">Total Value</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {fund.description}
        </p>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-sm font-medium ${performance7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {performance7d >= 0 ? '+' : ''}{performance7d.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">7D Performance</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className={`text-sm font-medium ${performance30d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {performance30d >= 0 ? '+' : ''}{performance30d.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">30D Performance</div>
          </div>
        </div>

        {/* Fund Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Rebalances {fund.rebalanceFrequency}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{Math.floor(fund.totalShares / 1000)}k investors</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link href={`/fund/${fund.id}`}>
            <Button className="w-full bg-gradient-to-r from-bonk to-pump hover:opacity-90 text-white">
              View Fund Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlatformFunds() {
  const { data: platformFunds = [], isLoading, error } = useQuery<PlatformFund[]>({
    queryKey: ['/api/platform-funds'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bonk mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading platform funds...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600">Failed to load platform funds</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="w-8 h-8 text-bonk" />
            <h1 className="text-4xl font-bold text-dark">Platform Index Funds</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Official Fundr index funds offering passive exposure to popular Solana sectors. 
            Automatically rebalanced with transparent, low-cost investing.
          </p>
          
          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Shield className="w-6 h-6 text-bonk mx-auto mb-2" />
              <h3 className="font-semibold text-dark">Non-Custodial</h3>
              <p className="text-sm text-gray-600">Your funds remain secure on-chain</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <Zap className="w-6 h-6 text-pump mx-auto mb-2" />
              <h3 className="font-semibold text-dark">Auto Rebalancing</h3>
              <p className="text-sm text-gray-600">Dynamic allocation adjustments</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <DollarSign className="w-6 h-6 text-bonk mx-auto mb-2" />
              <h3 className="font-semibold text-dark">Low Fees</h3>
              <p className="text-sm text-gray-600">Only 1% platform fee on transactions</p>
            </div>
          </div>
        </div>

        {/* Platform Funds Grid */}
        {platformFunds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {platformFunds.map((fund) => (
              <PlatformFundCard key={fund.id} fund={fund} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Platform Funds Available</h3>
            <p className="text-gray-600 mb-6">Platform index funds are being prepared for launch</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-bonk text-bonk hover:bg-bonk hover:text-white"
            >
              Refresh Page
            </Button>
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Coming Soon</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { name: "DeFi Top 15", icon: Zap },
              { name: "Gaming Top 10", icon: Target },
              { name: "NFT Top 10", icon: Sparkles },
              { name: "AI Top 5", icon: Rocket }
            ].map((fund, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-sm opacity-60">
                <fund.icon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <div className="text-sm font-medium text-gray-600">{fund.name}</div>
                <div className="text-xs text-gray-400 mt-1">Q2 2025</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}