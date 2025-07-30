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
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Funds Disabled</h1>
            <p className="text-gray-600 mb-6">
              Platform-managed index funds are currently disabled. All active funds have been removed.
            </p>
            <Link href="/">
              <Button>
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}