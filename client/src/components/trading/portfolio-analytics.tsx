import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target,
  DollarSign,
  Percent,
  Activity,
  AlertTriangle
} from "lucide-react";

interface PortfolioData {
  totalValue: number;
  dayChange: number;
  weekChange: number;
  monthChange: number;
  allocations: {
    symbol: string;
    percentage: number;
    value: number;
    target: number;
    drift: number;
  }[];
  riskMetrics: {
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
    beta: number;
  };
  performance: {
    timestamp: number;
    value: number;
  }[];
}

interface PortfolioAnalyticsProps {
  fundId: string;
}

export function PortfolioAnalytics({ fundId }: PortfolioAnalyticsProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1D" | "7D" | "30D" | "90D">("30D");

  // Generate mock portfolio analytics data
  useEffect(() => {
    const generatePortfolioData = (): PortfolioData => {
      const totalValue = 150000 + Math.random() * 50000;
      
      return {
        totalValue,
        dayChange: (Math.random() - 0.5) * 10,
        weekChange: (Math.random() - 0.4) * 25,
        monthChange: (Math.random() - 0.3) * 40,
        allocations: [
          {
            symbol: "SOL",
            percentage: 35,
            value: totalValue * 0.35,
            target: 30,
            drift: 5
          },
          {
            symbol: "USDC",
            percentage: 25,
            value: totalValue * 0.25,
            target: 25,
            drift: 0
          },
          {
            symbol: "BONK",
            percentage: 20,
            value: totalValue * 0.20,
            target: 25,
            drift: -5
          },
          {
            symbol: "JUP",
            percentage: 12,
            value: totalValue * 0.12,
            target: 15,
            drift: -3
          },
          {
            symbol: "RAY",
            percentage: 8,
            value: totalValue * 0.08,
            target: 5,
            drift: 3
          }
        ],
        riskMetrics: {
          sharpeRatio: 1.2 + Math.random() * 0.8,
          maxDrawdown: 15 + Math.random() * 10,
          volatility: 35 + Math.random() * 15,
          beta: 0.8 + Math.random() * 0.6
        },
        performance: Array.from({ length: 30 }, (_, i) => ({
          timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
          value: totalValue * (0.9 + Math.random() * 0.2)
        }))
      };
    };

    setIsLoading(true);
    setTimeout(() => {
      setPortfolioData(generatePortfolioData());
      setIsLoading(false);
    }, 1000);
  }, [fundId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number, showSign = true) => {
    const sign = showSign && value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getDriftColor = (drift: number) => {
    const absDrift = Math.abs(drift);
    if (absDrift <= 2) return "text-green-600";
    if (absDrift <= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskLevel = (value: number, type: 'sharpe' | 'drawdown' | 'volatility' | 'beta') => {
    switch (type) {
      case 'sharpe':
        if (value > 1.5) return { level: "Excellent", color: "text-green-600" };
        if (value > 1) return { level: "Good", color: "text-yellow-600" };
        return { level: "Poor", color: "text-red-600" };
      case 'drawdown':
        if (value < 10) return { level: "Low Risk", color: "text-green-600" };
        if (value < 20) return { level: "Medium Risk", color: "text-yellow-600" };
        return { level: "High Risk", color: "text-red-600" };
      case 'volatility':
        if (value < 20) return { level: "Low", color: "text-green-600" };
        if (value < 40) return { level: "Medium", color: "text-yellow-600" };
        return { level: "High", color: "text-red-600" };
      case 'beta':
        if (value < 0.7) return { level: "Defensive", color: "text-blue-600" };
        if (value < 1.3) return { level: "Market", color: "text-gray-600" };
        return { level: "Aggressive", color: "text-red-600" };
      default:
        return { level: "Unknown", color: "text-gray-600" };
    }
  };

  if (isLoading || !portfolioData) {
    return (
      <Card className="shadow-lg">
        <CardContent className="flex justify-center items-center h-64">
          <BarChart3 className="w-8 h-8 animate-pulse text-bonk" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-pump" />
            Portfolio Performance
          </CardTitle>
          <CardDescription>
            Real-time fund performance and analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatCurrency(portfolioData.totalValue)}</div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(portfolioData.dayChange)}`}>
                {formatPercentage(portfolioData.dayChange)}
              </div>
              <div className="text-sm text-gray-500">24h Change</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(portfolioData.weekChange)}`}>
                {formatPercentage(portfolioData.weekChange)}
              </div>
              <div className="text-sm text-gray-500">7d Change</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getChangeColor(portfolioData.monthChange)}`}>
                {formatPercentage(portfolioData.monthChange)}
              </div>
              <div className="text-sm text-gray-500">30d Change</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allocation Analysis */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-bonk" />
              Allocation vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.allocations.map((allocation) => (
                <div key={allocation.symbol} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{allocation.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {formatPercentage(allocation.percentage, false)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(allocation.value)}</div>
                      <div className={`text-xs ${getDriftColor(allocation.drift)}`}>
                        {allocation.drift > 0 ? '+' : ''}{allocation.drift}% drift
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={allocation.percentage} className="h-2" />
                    <div 
                      className="absolute top-0 h-2 border-r-2 border-gray-400"
                      style={{ left: `${allocation.target}%` }}
                      title={`Target: ${allocation.target}%`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-pump" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sharpe Ratio</span>
                <div className="text-right">
                  <div className="font-bold">{portfolioData.riskMetrics.sharpeRatio.toFixed(2)}</div>
                  <div className={`text-xs ${getRiskLevel(portfolioData.riskMetrics.sharpeRatio, 'sharpe').color}`}>
                    {getRiskLevel(portfolioData.riskMetrics.sharpeRatio, 'sharpe').level}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Max Drawdown</span>
                <div className="text-right">
                  <div className="font-bold">{formatPercentage(portfolioData.riskMetrics.maxDrawdown, false)}</div>
                  <div className={`text-xs ${getRiskLevel(portfolioData.riskMetrics.maxDrawdown, 'drawdown').color}`}>
                    {getRiskLevel(portfolioData.riskMetrics.maxDrawdown, 'drawdown').level}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Volatility</span>
                <div className="text-right">
                  <div className="font-bold">{formatPercentage(portfolioData.riskMetrics.volatility, false)}</div>
                  <div className={`text-xs ${getRiskLevel(portfolioData.riskMetrics.volatility, 'volatility').color}`}>
                    {getRiskLevel(portfolioData.riskMetrics.volatility, 'volatility').level}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Beta</span>
                <div className="text-right">
                  <div className="font-bold">{portfolioData.riskMetrics.beta.toFixed(2)}</div>
                  <div className={`text-xs ${getRiskLevel(portfolioData.riskMetrics.beta, 'beta').color}`}>
                    {getRiskLevel(portfolioData.riskMetrics.beta, 'beta').level}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rebalancing Alerts */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
            Rebalancing Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {portfolioData.allocations
              .filter(allocation => Math.abs(allocation.drift) > 3)
              .map((allocation) => (
                <div key={allocation.symbol} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium">{allocation.symbol}</span>
                    <span className="text-sm text-gray-600">
                      is {Math.abs(allocation.drift)}% {allocation.drift > 0 ? 'over' : 'under'} target
                    </span>
                  </div>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                    Action Needed
                  </Badge>
                </div>
              ))
            }
            {portfolioData.allocations.every(allocation => Math.abs(allocation.drift) <= 3) && (
              <div className="text-center py-4 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                All allocations are within target ranges
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}