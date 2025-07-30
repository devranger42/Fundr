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
    
  );
}
