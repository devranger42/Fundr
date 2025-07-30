import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Plus,
  Eye,
  Target,
  Activity,
  Wallet,
  PieChart
} from "lucide-react";
import { Link } from "wouter";
import Header from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { useFunds } from "@/hooks/use-funds";
import { useWalletBalance } from "@/hooks/use-wallet-balance";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { data: allFunds, isLoading: fundsLoading } = useFunds();
  const walletBalance = useWalletBalance();

  // Filter funds managed by current user
  const managedFunds = allFunds?.filter(fund => fund.managerId === user?.id) || [];

  // Calculate aggregate metrics
  const totalAUM = managedFunds.reduce((sum, fund) => sum + (fund.totalAssets || 0), 0);
  const totalInvestors = managedFunds.reduce((sum, fund) => sum + (fund as any).stakes?.length || 0, 0);
  const avgPerformance = managedFunds.length > 0 
    ? managedFunds.reduce((sum, fund) => sum + 12.5, 0) / managedFunds.length 
    : 0; // Mock performance

  const formatCurrency = (amount: number, decimals = 2) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(decimals)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(decimals)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(decimals)}K`;
    return `$${amount.toFixed(decimals)}`;
  };

  const formatSOL = (lamports: number) => {
    return (lamports / 1e9).toFixed(3);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-dark mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the manager dashboard.</p>
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
              <h1 className="text-4xl font-bold mb-2">Fund Manager Dashboard</h1>
              <p className="text-gray-300">Manage your funds and track performance</p>
            </div>
            <Link href="/create-fund">
              <Button className="bg-bonk hover:bg-bonk-hover text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create New Fund
              </Button>
            </Link>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-bonk" />
                <Badge variant="outline" className="text-white border-white">
                  Total AUM
                </Badge>
              </div>
              <div className="text-3xl font-bold">{formatSOL(totalAUM)} SOL</div>
              <div className="text-sm text-gray-300">
                ≈ {formatCurrency(totalAUM * 100 / 1e9)} USD
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-8 h-8 text-pump" />
                <Badge variant="outline" className="text-white border-white">
                  Avg Performance
                </Badge>
              </div>
              <div className="text-3xl font-bold text-pump">+{avgPerformance.toFixed(1)}%</div>
              <div className="text-sm text-gray-300">30-day average</div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-bonk" />
                <Badge variant="outline" className="text-white border-white">
                  Investors
                </Badge>
              </div>
              <div className="text-3xl font-bold">{totalInvestors}</div>
              <div className="text-sm text-gray-300">across {managedFunds.length} funds</div>
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
        <Tabs defaultValue="funds" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="funds">My Funds</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* My Funds Tab */}
          <TabsContent value="funds" className="space-y-6">
            {fundsLoading ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 animate-pulse text-bonk mx-auto mb-4" />
                <p className="text-gray-600">Loading your funds...</p>
              </div>
            ) : managedFunds.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {managedFunds.map((fund) => (
                  <Card key={fund.id} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{fund.name}</CardTitle>
                        <Badge variant={fund.isActive ? "default" : "secondary"}>
                          {fund.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {fund.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">AUM</div>
                          <div className="font-bold">
                            {formatSOL(fund.totalAssets || 0)} SOL
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Investors</div>
                          <div className="font-bold">{(fund as any).stakes?.length || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Performance</div>
                          <div className="font-bold text-pump">+12.5%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Management Fee</div>
                          <div className="font-bold">{(fund.managementFee / 100).toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      {/* Top Allocations */}
                      {fund.allocations.length > 0 && (
                        <div>
                          <div className="text-sm text-gray-500 mb-2">Top Allocations</div>
                          <div className="space-y-1">
                            {fund.allocations.slice(0, 3).map((allocation) => (
                              <div key={allocation.id} className="flex items-center justify-between text-xs">
                                <span>{allocation.tokenSymbol}</span>
                                <span>{(allocation.targetPercentage / 100).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2">
                        <Link href={`/fund/${fund.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/fund/${fund.id}/trading`} className="flex-1">
                          <Button size="sm" className="w-full bg-bonk hover:bg-bonk-hover text-white">
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Trade
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
                  <h3 className="text-xl font-bold text-dark mb-2">No Funds Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Create your first fund to start managing investments
                  </p>
                  <Link href="/create-fund">
                    <Button className="bg-bonk hover:bg-bonk-hover text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Fund
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Wallet Holdings */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-bonk" />
                    Wallet Holdings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {walletBalance.isLoading ? (
                    <div className="text-center py-8">
                      <Wallet className="w-8 h-8 animate-pulse text-bonk mx-auto mb-2" />
                      <p className="text-gray-600">Loading balances...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* SOL Balance */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">SOL</span>
                          </div>
                          <div>
                            <div className="font-medium">Solana</div>
                            <div className="text-sm text-gray-500">SOL</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{walletBalance.sol.toFixed(3)}</div>
                          <div className="text-sm text-gray-500">
                            {formatCurrency(walletBalance.sol * 100)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Token Balances */}
                      {walletBalance.tokens.map((token) => (
                        <div key={token.mint} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-bonk rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">
                                {token.symbol.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{token.symbol}</div>
                              <div className="text-sm text-gray-500">
                                {token.mint.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              {token.uiAmount.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(token.valueUSD || 0)}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {walletBalance.tokens.length === 0 && walletBalance.sol === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No tokens found in wallet
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Fund Performance Summary */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-pump" />
                    Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {managedFunds.slice(0, 5).map((fund) => (
                      <div key={fund.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{fund.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatSOL(fund.totalAssets || 0)} SOL
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-pump">+12.5%</div>
                          <div className="text-sm text-gray-500">30d</div>
                        </div>
                      </div>
                    ))}
                    
                    {managedFunds.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No funds to display
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-dark mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">
                  Detailed performance analytics and insights coming soon
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-dark mb-2">Manager Settings</h3>
                <p className="text-gray-600">
                  Fund management preferences and configuration options
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}