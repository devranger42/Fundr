import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Rocket, TrendingUp, Gem, Zap, Shield, ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { DepositWithdrawModal } from "@/components/deposit-withdraw-modal";
import type { FundWithAllocations } from "@/hooks/use-funds";

interface FundCardProps {
  fund: FundWithAllocations;
}

const iconMap = {
  crown: Crown,
  rocket: Rocket,
  trending: TrendingUp,
  gem: Gem,
  zap: Zap,
  shield: Shield,
};

export default function FundCard({ fund }: FundCardProps) {
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const handleDeposit = () => {
    setDepositModalOpen(true);
  };

  // Calculate basic metrics from the fund data  
  const totalAssetsSOL = fund.totalAssets ? (fund.totalAssets / 1e9).toFixed(2) : '0.00'; // Convert lamports to SOL
  const managementFeePercent = (fund.managementFee / 100).toFixed(1); // Convert basis points to percentage
  
  // Generate allocation colors based on token symbol
  const getTokenColor = (symbol: string) => {
    const colors = {
      'BONK': '#FF9233',
      'SOL': '#00FFB2', 
      'USDC': '#2775CA',
      'JUP': '#3B82F6',
      'RAY': '#10B981',
      'WIF': '#8B5CF6',
      'PEPE': '#EAB308',
      'MYRO': '#EF4444',
      'ORCA': '#9333EA',
      'POPCAT': '#EC4899',
      'FWOG': '#F97316',
      'GOAT': '#06B6D4',
    };
    return colors[symbol as keyof typeof colors] || '#6B7280';
  };
  
  // Get a random icon for display (in real app, this would be stored with fund)
  const icons = ['crown', 'rocket', 'trending', 'gem', 'zap', 'shield'];
  const iconIndex = fund.id.charCodeAt(0) % icons.length;
  const iconName = icons[iconIndex];
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Crown;

  const getIconBgColor = () => {
    switch (iconName) {
      case 'crown': return 'bg-gradient-to-br from-orange-500 to-orange-600';
      case 'rocket': return 'bg-gradient-to-br from-green-500 to-green-600';
      case 'trending': return 'bg-gradient-to-br from-blue-500 to-blue-700';
      case 'gem': return 'bg-gradient-to-br from-purple-500 to-purple-700';
      case 'zap': return 'bg-gradient-to-br from-red-500 to-red-700';
      case 'shield': return 'bg-gradient-to-br from-green-500 to-green-700';
      default: return 'bg-gradient-to-br from-orange-500 to-orange-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 p-6 border border-gray-100">
      <Link href={`/fund/${fund.id}`}>
        <div className="cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${getIconBgColor()} rounded-full flex items-center justify-center`}>
                <IconComponent className="text-white text-lg w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-dark">{fund.name}</h3>
                <p className="text-sm text-gray-500">Fund Manager</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pump">+12.5%</div>
              <div className="text-sm text-gray-500">30D ROI</div>
            </div>
          </div>
        </div>
      </Link>
      
      {fund.allocations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-dark mb-3">Fund Allocation</h4>
          <div className="space-y-3">
            {fund.allocations.map((allocation) => {
              const color = getTokenColor(allocation.tokenSymbol);
              const percentage = (allocation.targetPercentage / 100); // Convert basis points to percentage
              return (
                <div key={allocation.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-6 h-6 rounded-full`}
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="font-medium">{allocation.tokenSymbol}</span>
                    </div>
                    <span className="font-bold">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="font-bold text-dark">{totalAssetsSOL} SOL</div>
          <div className="text-xs text-gray-500">AUM</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-dark">{managementFeePercent}%</div>
          <div className="text-xs text-gray-500">Fee</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-dark">0</div>
          <div className="text-xs text-gray-500">Investors</div>
        </div>
      </div>
      
      <Button 
        onClick={handleDeposit}
        className="w-full bg-bonk hover:bg-bonk-hover text-white py-3 font-semibold transition-all duration-200 transform hover:scale-105"
      >
        <ArrowUpRight className="w-4 h-4 mr-2" />
        Deposit SOL
      </Button>
      
      <DepositWithdrawModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        type="deposit"
        fundName={fund.name}
        fundId={fund.id}
        sharePrice={0.00008}
      />
    </div>
  );
}
