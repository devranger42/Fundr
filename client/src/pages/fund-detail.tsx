import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import FeeCalculator from "@/components/fee-calculator";
import { useState } from "react";
import { ArrowLeft, TrendingUp, Users, DollarSign, Calendar, Award } from "lucide-react";
import { Link } from "wouter";
import FundrLogo from "@/components/fundr-logo";

// Mock fund data - would come from route params in real app
const fundData = {
  manager: "@solanaking",
  title: "Premium Trader",
  description: "A conservative-aggressive fund focusing on established Solana ecosystem tokens with proven track records. 5+ years of trading experience in both traditional and crypto markets.",
  roi: "+45.2%",
  aum: "$324K",
  fee: "2.5%",
  investors: 89,
  minDeposit: "0.1 SOL",
  inception: "Dec 2024",
  winRate: "73%",
  maxDrawdown: "-12.4%",
  allocations: [
    { name: "BONK", percentage: 50, color: "#FF9233", value: "$162K" },
    { name: "WIF", percentage: 30, color: "#8B5CF6", value: "$97K" },
    { name: "JUP", percentage: 20, color: "#3B82F6", value: "$65K" },
  ],
  performance: [
    { period: "1D", roi: "+2.1%" },
    { period: "7D", roi: "+8.7%" },
    { period: "30D", roi: "+45.2%" },
    { period: "All", roi: "+68.9%" },
  ],
  recentTrades: [
    { action: "Buy", token: "BONK", amount: "15K SOL", price: "$0.000032", time: "2h ago" },
    { action: "Sell", token: "RAY", amount: "8K SOL", price: "$4.21", time: "1d ago" },
    { action: "Buy", token: "WIF", amount: "12K SOL", price: "$2.18", time: "3d ago" },
  ],
};

export default function FundDetail() {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleDeposit = () => {
    console.log(`Depositing ${depositAmount} SOL to ${fundData.manager}`);
  };

  const handleWithdraw = () => {
    console.log(`Withdrawing ${withdrawAmount} SOL from ${fundData.manager}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Fund Header */}
      <section className="bg-gradient-to-br from-dark to-darker text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Funds
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">{fundData.manager}</h1>
              <p className="text-xl text-gray-300 mb-4">{fundData.title}</p>
              <p className="text-gray-300 max-w-lg">{fundData.description}</p>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <Badge className="bg-pump text-black px-3 py-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {fundData.roi} ROI
                </Badge>
                <Badge className="bg-bonk text-white px-3 py-1">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {fundData.aum} AUM
                </Badge>
                <Badge className="bg-white text-dark px-3 py-1">
                  <Users className="w-4 h-4 mr-1" />
                  {fundData.investors} Investors
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-pump">{fundData.winRate}</div>
                  <div className="text-sm text-gray-300">Win Rate</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white">{fundData.fee}</div>
                  <div className="text-sm text-gray-300">Profit Fee</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-400">{fundData.maxDrawdown}</div>
                  <div className="text-sm text-gray-300">Max Drawdown</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-300">{fundData.inception}</div>
                  <div className="text-sm text-gray-300">Inception</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Performance Chart */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-dark">Performance Overview</CardTitle>
                  <CardDescription>Fund performance across different time periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    {fundData.performance.map((perf, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">{perf.period}</div>
                        <div className="text-lg font-bold text-pump">{perf.roi}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Placeholder for chart */}
                  <div className="h-64 bg-gradient-to-r from-pump/20 to-bonk/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-12 h-12 text-pump mx-auto mb-2" />
                      <p className="text-gray-600">Performance chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fund Allocation */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-dark">Current Allocation</CardTitle>
                  <CardDescription>How the fund's capital is currently distributed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {fundData.allocations.map((allocation, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: allocation.color }}
                            ></div>
                            <span className="font-medium">{allocation.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{allocation.percentage}%</div>
                            <div className="text-sm text-gray-500">{allocation.value}</div>
                          </div>
                        </div>
                        <Progress value={allocation.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Trades */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-dark">Recent Activity</CardTitle>
                  <CardDescription>Latest trades and portfolio changes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {fundData.recentTrades.map((trade, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={trade.action === "Buy" ? "default" : "secondary"}
                            className={trade.action === "Buy" ? "bg-pump text-white" : "bg-red-500 text-white"}
                          >
                            {trade.action}
                          </Badge>
                          <div>
                            <div className="font-medium">{trade.token}</div>
                            <div className="text-sm text-gray-500">{trade.amount}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{trade.price}</div>
                          <div className="text-sm text-gray-500">{trade.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Deposit Form */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-dark">Invest in Fund</CardTitle>
                  <CardDescription>
                    Minimum deposit: {fundData.minDeposit}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Amount (SOL)</Label>
                    <Input
                      id="deposit"
                      type="number"
                      placeholder="0.1"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleDeposit}
                    className="w-full bg-bonk hover:bg-bonk-hover text-white"
                    disabled={!depositAmount}
                  >
                    Deposit SOL
                  </Button>
                  <p className="text-xs text-gray-500">
                    1% deposit fee (burns $FUND) + {fundData.fee} profit fee (only on gains)
                  </p>
                </CardContent>
              </Card>

              {/* Withdraw Form */}
              <Card className="shadow-lg border-red-200">
                <CardHeader>
                  <CardTitle className="text-dark">Withdraw Funds</CardTitle>
                  <CardDescription>
                    Your current position: 2.5 SOL
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw">Amount (SOL)</Label>
                    <Input
                      id="withdraw"
                      type="number"
                      placeholder="0.0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    disabled={!withdrawAmount}
                  >
                    Withdraw SOL
                  </Button>
                  <p className="text-xs text-gray-500">
                    1% withdrawal fee (to treasury) + {fundData.fee} of profits only
                  </p>
                </CardContent>
              </Card>

              {/* Fund Info */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-dark flex items-center">
                    <Award className="w-5 h-5 mr-2 text-bonk" />
                    Fund Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Management Fee:</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Profit Fee:</span>
                    <span className="font-medium">{fundData.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit Fee:</span>
                    <span className="font-medium">1% (burns $FUND)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Withdrawal Fee:</span>
                    <span className="font-medium">1% (to treasury)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Deposit:</span>
                    <span className="font-medium">{fundData.minDeposit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lockup Period:</span>
                    <span className="font-medium text-pump">None</span>
                  </div>
                </CardContent>
              </Card>

              {/* Fee Calculator */}
              <FeeCalculator managerFee={parseFloat(fundData.fee.replace('%', ''))} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}