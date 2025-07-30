import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Rocket, TrendingUp, Gem, Zap, Shield, ArrowUpRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { DepositWithdrawModal } from "@/components/deposit-withdraw-modal";

interface MockFund {
  manager: string;
  title: string;
  roi: string;
  aum: string;
  fee: string;
  investors: number;
  icon: string;
  verified?: boolean;
  allocations: {
    name: string;
    percentage: number;
    color: string;
  }[];
}

interface MockFundCardProps {
  fund: MockFund;
}

const iconMap = {
  crown: Crown,
  rocket: Rocket,
  trending: TrendingUp,
  gem: Gem,
  zap: Zap,
  shield: Shield,
};

export default function MockFundCard({ fund }: MockFundCardProps) {
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const handleDeposit = () => {
    setDepositModalOpen(true);
  };

  const IconComponent = iconMap[fund.icon as keyof typeof iconMap] || Crown;

  const getIconBgColor = () => {
    switch (fund.icon) {
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
      <Link href={`/fund/mock`}>
        <div className="cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${getIconBgColor()} rounded-full flex items-center justify-center`}>
                <IconComponent className="text-white text-lg w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-dark">{fund.title}</h3>
                <div className="flex items-center space-x-1">
                  <p className="text-sm text-gray-500">Managed by</p>
                  <span className="text-sm font-medium text-gray-700">{fund.manager}</span>
                  {fund.verified && (
                    <CheckCircle className="w-4 h-4 text-blue-500" fill="currentColor" />
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pump">{fund.roi}</div>
              <div className="text-sm text-gray-500">30D ROI</div>
            </div>
          </div>
        </div>
      </Link>
      
      {fund.allocations.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-dark mb-3">Fund Allocation</h4>
          <div className="space-y-3">
            {fund.allocations.map((allocation, index) => (
              <div key={index}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-6 h-6 rounded-full`}
                      style={{ backgroundColor: allocation.color }}
                    ></div>
                    <span className="font-medium">{allocation.name}</span>
                  </div>
                  <span className="font-bold">{allocation.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${allocation.percentage}%`,
                      backgroundColor: allocation.color 
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="font-bold text-dark">{fund.aum}</div>
          <div className="text-xs text-gray-500">AUM</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-dark">{fund.fee}</div>
          <div className="text-xs text-gray-500">Fee</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-dark">{fund.investors}</div>
          <div className="text-xs text-gray-500">Investors</div>
        </div>
      </div>
      
      <Button 
        onClick={handleDeposit}
        className="w-full bg-bonk hover:bg-bonk-hover text-white py-3 font-semibold transition-all duration-200 transform hover:scale-105"
      >
        <ArrowUpRight className="w-4 h-4 mr-2" />
        Invest Now
      </Button>

      <DepositWithdrawModal
        fundId="mock"
        fundName={fund.title}
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
    </div>
  );
}