import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Plus,
  Minus,
  Eye,
  PieChart,
  Target,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { useFunds } from "@/hooks/use-funds";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useToast } from "@/hooks/use-toast";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { data: allFunds, isLoading: fundsLoading } = useFunds();
  const walletBalance = useWalletBalance();
  const { toast } = useToast();
  
  // Mock invested funds data
  const [investments] = useState([
    {
      fundId: "0f1eef0d-579b-434f-89e2-42aa2924e8e2",
      fundName: "DeFi Alpha",
      managerName: "SolanaMaxi",
      investedAmount: 50,
      currentValue: 62.5,
      shares: 1250000000, // in lamports
      roi: 25.0,
      since: "30 days ago"
    },
    {
      fundId: "1a2b3c4d-123e-456f-789g-012h345i678j",
      fundName: "Meme Momentum",
      managerName: "PumpMaster",
      investedAmount: 25,
      currentValue: 31.2,
      shares: 625000000,
      roi: 24.8,
      since: "15 days ago"
    }
  ]);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalROI = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  const formatCurrency = (amount: number, decimals = 2) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(decimals)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(decimals)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(decimals)}K`;
    return `$${amount.toFixed(decimals)}`;
  };

  const formatSOL = (lamports: number) => {
    return (lamports / 1e9).toFixed(3);
  };

  const handleDeposit = (fundId: string) => {
    toast({
      title: "Deposit Feature",
      description: "Deposit functionality will be implemented with smart contracts",
    });
  };

  const handleWithdraw = (fundId: string) => {
    toast({
      title: "Withdraw Feature", 
      description: "Withdrawal functionality will be implemented with smart contracts",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-dark mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access your investment dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Dashboard Header */}
      <section className="bg-gradient-to-br from-dark to-darker text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Investment Dashboard</h1>
              <p className="text-gray-300">Track your fund investments and performance</p>
            </div>
            <Link href="/">
              <Button className="bg-bonk hover:bg-bonk-hover text-white">
                <Plus className="w-4 h-4 mr-2" />
                Discover Funds
              </Button>
            </Link>
          </div>
          
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-bonk" />
                <Badge variant="outline" className="text-white border-white">
                  Total Invested
                </Badge>
              </div>
              <div className="text-3xl font-bold">{formatSOL(totalInvested * 1e9)} SOL</div>
              <div className="text-sm text-gray-300">
                ≈ {formatCurrency(totalInvested * 100)} USD
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-pump" />
                <Badge variant="outline" className="text-white border-white">
                  Current Value
                </Badge>
              </div>
              <div className="text-3xl font-bold text-pump">{formatSOL(totalValue * 1e9)} SOL</div>
              <div className="text-sm text-gray-300">
                ≈ {formatCurrency(totalValue * 100)} USD
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 text-bonk" />
                <Badge variant="outline" className="text-white border-white">
                  Total ROI
                </Badge>
              </div>
              <div className={`text-3xl font-bold ${totalROI >= 0 ? 'text-pump' : 'text-red-400'}`}>
                {totalROI >= 0 ? '+' : ''}{totalROI.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-300">
                +{formatSOL((totalValue - totalInvested) * 1e9)} SOL
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Wallet className="w-8 h-8 text-pump" />
                <Badge variant="outline" className="text-white border-white">
                  Wallet Balance
                </Badge>
              </div>
              <div className="text-3xl font-bold">{walletBalance.sol.toFixed(3)} SOL</div>
              <div className="text-sm text-gray-300">
                {formatCurrency(walletBalance.totalValueUSD)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="investments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="investments">My Investments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="discover">Discover Funds</TabsTrigger>
          </TabsList>

          {/* My Investments Tab */}
          <TabsContent value="investments" className="space-y-6">
            {investments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {investments.map((investment) => (
                  <Card key={investment.fundId} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{investment.fundName}</CardTitle>
                        <Badge variant={investment.roi >= 0 ? "default" : "destructive"}>
                          {investment.roi >= 0 ? '+' : ''}{investment.roi.toFixed(1)}%
                        </Badge>
                      </div>
                      <CardDescription>
                        Managed by {investment.managerName} • Invested {investment.since}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Invested</div>
                          <div className="font-bold">
                            {formatSOL(investment.investedAmount * 1e9)} SOL
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatCurrency(investment.investedAmount * 100)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Current Value</div>
                          <div className="font-bold text-pump">
                            {formatSOL(investment.currentValue * 1e9)} SOL
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatCurrency(investment.currentValue * 100)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Shares</div>
                          <div className="font-bold">
                            {(investment.shares / 1e6).toFixed(2)}M
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">P&L</div>
                          <div className={`font-bold ${investment.roi >= 0 ? 'text-pump' : 'text-red-600'}`}>
                            {investment.roi >= 0 ? '+' : ''}{formatSOL((investment.currentValue - investment.investedAmount) * 1e9)} SOL
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleDeposit(investment.fundId)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <ArrowUpRight className="w-4 h-4 mr-1" />
                          Deposit
                        </Button>
                        <Button
                          onClick={() => handleWithdraw(investment.fundId)}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <ArrowDownRight className="w-4 h-4 mr-1" />
                          Withdraw
                        </Button>
                        <Link href={`/fund/${investment.fundId}`} className="flex-1">
                          <Button size="sm" className="w-full bg-bonk hover:bg-bonk-hover text-white">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="text-center py-12">
                  <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-dark mb-2">No Investments Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Start investing in funds to see your portfolio here
                  </p>
                  <Link href="/">
                    <Button className="bg-bonk hover:bg-bonk-hover text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Explore Funds
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart Placeholder */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-bonk" />
                    Portfolio Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">Performance chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-pump" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">7-Day Return</span>
                      <span className="font-bold text-pump">+8.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">30-Day Return</span>
                      <span className="font-bold text-pump">+{totalROI.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Best Performing Fund</span>
                      <span className="font-bold">{investments[0]?.fundName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Fees Paid</span>
                      <span className="font-bold">0.15 SOL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Discover Funds Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-dark mb-2">Discover New Funds</h3>
                <p className="text-gray-600 mb-6">
                  Browse available funds and find new investment opportunities
                </p>
                <Link href="/">
                  <Button className="bg-bonk hover:bg-bonk-hover text-white">
                    <Eye className="w-4 h-4 mr-2" />
                    Browse All Funds
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}