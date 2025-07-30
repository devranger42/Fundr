import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown, Rocket, TrendingUp, Gem, Zap, Shield, ArrowUpRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { DepositWithdrawModal } from "@/components/deposit-withdraw-modal";

interface MockFund {
  manager: string;
  title: string;
  displayName?: string;
  profileImage?: string;
  roi: string;
  aum: string;
  fee: string;
  investors: number;
  icon: string;
  verified?: boolean;
  isPlatform?: boolean;
  comingSoon?: boolean;
  isSample?: boolean;
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
    if (fund.comingSoon) return; // Disable deposits for coming soon funds
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
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div 
                className={`w-10 h-10 md:w-12 md:h-12 ${getIconBgColor()} rounded-full flex items-center justify-center flex-shrink-0`}
              >
                <IconComponent className="text-white w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-dark truncate">{fund.title}</h3>
                <div className="flex items-center space-x-1 min-w-0">
                  <p className="text-xs md:text-sm text-gray-600 flex-shrink-0">Managed by</p>
                  <span className="text-xs md:text-sm font-medium text-gray-800 truncate">
                    {fund.manager}
                    {fund.displayName && !fund.comingSoon && (
                      <span className="text-gray-600 ml-1">({fund.displayName})</span>
                    )}
                  </span>
                  {fund.verified && (
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-500 flex-shrink-0" fill="currentColor" />
                  )}
                  {fund.comingSoon && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium ml-1">
                      Coming Soon
                    </span>
                  )}
                  {fund.isSample && !fund.comingSoon && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium ml-1">
                      Sample
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`text-lg md:text-2xl font-bold whitespace-nowrap ${fund.comingSoon ? 'text-gray-400' : 'text-pump'}`}>{fund.roi}</div>
              <div className="text-xs md:text-sm text-gray-600 whitespace-nowrap">30D ROI</div>
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
          <div className={`font-bold ${fund.comingSoon ? 'text-gray-400' : 'text-dark'}`}>{fund.aum}</div>
          <div className="text-xs text-gray-600">AUM</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-dark">{fund.fee}</div>
          <div className="text-xs text-gray-600">Fee</div>
        </div>
        <div className="text-center">
          <div className={`font-bold ${fund.comingSoon ? 'text-gray-400' : 'text-dark'}`}>{fund.comingSoon ? '-' : fund.investors}</div>
          <div className="text-xs text-gray-600">Investors</div>
        </div>
      </div>
      
      <Button 
        onClick={handleDeposit}
        disabled={fund.comingSoon}
        className={`w-full py-3 font-semibold transition-all duration-200 transform ${
          fund.comingSoon 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-bonk hover:bg-bonk-hover text-white hover:scale-105'
        }`}
      >
        <ArrowUpRight className="w-4 h-4 mr-2" />
        {fund.comingSoon ? 'Coming Soon' : 'Invest Now'}
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