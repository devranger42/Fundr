import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ArrowLeft, TrendingUp, Users, DollarSign, PieChart, Plus, Minus, Loader2, BarChart3 } from "lucide-react";
import { Link, useParams } from "wouter";
import FundrLogo from "@/components/fundr-logo";
import { useFund, useDeposit, useWithdraw } from "@/hooks/use-funds";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

export default function FundDetail() {
  const { id } = useParams();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  const { data: fund, isLoading, error } = useFund(id!);
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { publicKey, connected } = useWallet();
  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const { toast } = useToast();

  const handleDeposit = async () => {
    if (!isAuthenticated || !connected || !publicKey) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet and log in",
        variant: "destructive",
      });
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive", 
      });
      return;
    }

    try {
      await deposit.mutateAsync({
        fundId: id!,
        amount: parseFloat(depositAmount),
      });
      
      toast({
        title: "Deposit Successful",
        description: `Deposited ${depositAmount} SOL to the fund`,
      });
      
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit error:", error);
      toast({
        title: "Deposit Failed",
        description: "Failed to deposit. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleWithdraw = async () => {
    if (!isAuthenticated || !connected || !publicKey) {
      toast({
        title: "Authentication Required", 
        description: "Please connect your wallet and log in",
        variant: "destructive",
      });
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    try {
      await withdraw.mutateAsync({
        fundId: id!,
        amount: parseFloat(withdrawAmount),
      });
      
      toast({
        title: "Withdrawal Successful",
        description: `Withdrew ${withdrawAmount} SOL from the fund`,
      });
      
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdraw error:", error);
      toast({
        title: "Withdrawal Failed",
        description: "Failed to withdraw. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-bonk" />
          <span className="ml-2 text-gray-600">Loading fund details...</span>
        </div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-dark mb-4">Fund Not Found</h2>
          <p className="text-gray-600 mb-6">The fund you're looking for doesn't exist.</p>
          <Link href="/">
            <Button className="bg-bonk hover:bg-bonk-hover text-white">
              Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAssetsSOL = fund.totalAssets ? (fund.totalAssets / 1e9).toFixed(2) : '0.00';
  const managementFeePercent = (fund.managementFee / 100).toFixed(1);
  
  // Generate allocation colors
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Fund Header */}
      <section className="bg-gradient-to-br from-dark to-darker text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:text-bonk mr-4">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Funds
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">{fund.name}</h1>
              <p className="text-xl text-gray-300 mb-6">{fund.description}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pump">+12.5%</div>
                  <div className="text-gray-400">30D ROI</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-bonk">{totalAssetsSOL} SOL</div>
                  <div className="text-gray-400">Total Assets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{managementFeePercent}%</div>
                  <div className="text-gray-400">Management Fee</div>
                </div>
              </div>
              
              {/* Trading Terminal Button for Fund Managers */}
              {isAuthenticated && user?.id === fund.managerId && (
                <Link href={`/fund/${id}/trading`}>
                  <Button className="bg-bonk hover:bg-bonk-hover text-white">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Open Trading Terminal
                  </Button>
                </Link>
              )}
            </div>
            
            <div className="flex justify-center">
              <FundrLogo size="xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Fund Details */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Fund Allocation */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-dark">
                    <PieChart className="w-6 h-6 mr-2 text-pump" />
                    Portfolio Allocation
                  </CardTitle>
                  <CardDescription>
                    Current token distribution in this fund
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fund.allocations.length > 0 ? (
                    <div className="space-y-6">
                      {fund.allocations.map((allocation) => {
                        const color = getTokenColor(allocation.tokenSymbol);
                        const percentage = (allocation.targetPercentage / 100);
                        return (
                          <div key={allocation.id}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-8 h-8 rounded-full"
                                  style={{ backgroundColor: color }}
                                ></div>
                                <div>
                                  <div className="font-semibold text-dark">{allocation.tokenSymbol}</div>
                                  <div className="text-sm text-gray-500">{allocation.tokenMint.slice(0, 8)}...</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-dark">{percentage}%</div>
                                <div className="text-sm text-gray-500">Target</div>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-3" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No allocations set yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="shadow-lg mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-dark">
                    <TrendingUp className="w-6 h-6 mr-2 text-pump" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {fund.transactions.length > 0 ? (
                    <div className="space-y-4">
                      {fund.transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                              tx.type === 'withdraw' ? 'bg-red-100 text-red-600' : 
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {tx.type === 'deposit' ? <Plus className="w-4 h-4" /> : 
                               tx.type === 'withdraw' ? <Minus className="w-4 h-4" /> : 
                               <TrendingUp className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-medium capitalize">{tx.type}</div>
                              <div className="text-sm text-gray-500">
                                {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{(tx.amount / 1e9).toFixed(2)} SOL</div>
                            <div className="text-sm text-gray-500 capitalize">{tx.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No transactions yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Deposit/Withdraw Panel */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-dark">
                    <DollarSign className="w-5 h-5 mr-2 text-pump" />
                    Deposit Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deposit-amount">Amount (SOL)</Label>
                    <Input
                      id="deposit-amount"
                      type="number"
                      placeholder="0.0"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button 
                    onClick={handleDeposit}
                    disabled={deposit.isPending || !isAuthenticated || !connected}
                    className="w-full bg-pump hover:bg-pump/90 text-white"
                  >
                    {deposit.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Depositing...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Deposit SOL
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-dark">
                    <Users className="w-5 h-5 mr-2 text-bonk" />
                    Withdraw Funds  
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount (SOL)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="0.0"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button 
                    onClick={handleWithdraw}
                    disabled={withdraw.isPending || !isAuthenticated || !connected}
                    className="w-full bg-bonk hover:bg-bonk-hover text-white"
                  >
                    {withdraw.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Withdrawing...
                      </>
                    ) : (
                      <>
                        <Minus className="w-4 h-4 mr-2" />
                        Withdraw SOL
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Fund Stats */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-dark">Fund Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Shares</span>
                    <span className="font-bold">{fund.totalShares}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Investors</span>
                    <span className="font-bold">{fund.stakes.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className={`font-bold ${fund.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {fund.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-bold">
                      {fund.createdAt ? new Date(fund.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}