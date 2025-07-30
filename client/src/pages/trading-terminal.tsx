import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Settings,
  Eye,
  EyeOff,
  Target,
  Wallet,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Percent
} from "lucide-react";
import { Link, useParams } from "wouter";
import Header from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useFund } from "@/hooks/use-funds";
import { JupiterService, TokenInfo, SwapQuote, TokenPrice } from "@/lib/jupiter";
import { Connection } from "@solana/web3.js";
import { PriceChart } from "@/components/trading/price-chart";
import { OrderBook } from "@/components/trading/order-book";
import { RecentTrades } from "@/components/trading/recent-trades";
import { TransactionHistory } from "@/components/trading/transaction-history";
import { PortfolioAnalytics } from "@/components/trading/portfolio-analytics";

// Popular tokens for trading
const POPULAR_TOKENS: TokenInfo[] = [
  { mint: "So11111111111111111111111111111111111111112", symbol: "SOL", name: "Solana", decimals: 9 },
  { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", name: "USD Coin", decimals: 6 },
  { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK", name: "Bonk", decimals: 5 },
  { mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", symbol: "JUP", name: "Jupiter", decimals: 6 },
  { mint: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", symbol: "RAY", name: "Raydium", decimals: 6 },
  { mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", symbol: "WIF", name: "dogwifhat", decimals: 6 },
];

export default function TradingTerminal() {
  const { id } = useParams();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const { publicKey, connected } = useWallet();
  const { toast } = useToast();
  const { data: fund, isLoading: fundLoading } = useFund(id!);

  // Trading state
  const [fromToken, setFromToken] = useState<TokenInfo>(POPULAR_TOKENS[0]);
  const [toToken, setToToken] = useState<TokenInfo>(POPULAR_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [isMarketOrder, setIsMarketOrder] = useState(true);
  const [limitPrice, setLimitPrice] = useState("");
  
  // Price data
  const [tokenPrices, setTokenPrices] = useState<{ [mint: string]: TokenPrice }>({});
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Portfolio management
  const [rebalanceMode, setRebalanceMode] = useState(false);
  const [newAllocations, setNewAllocations] = useState<{ [tokenMint: string]: number }>({});
  
  // Jupiter service
  const [jupiterService] = useState(() => 
    new JupiterService(new Connection("https://api.mainnet-beta.solana.com"))
  );

  // Fetch token prices on mount
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const tokenMints = POPULAR_TOKENS.map(token => token.mint);
        const prices = await jupiterService.getTokenPrices(tokenMints);
        setTokenPrices(prices);
      } catch (error) {
        console.error("Error fetching token prices:", error);
        // Don't show toast for price fetch errors to avoid spam
      }
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [jupiterService]);

  // Get quote when amounts change
  useEffect(() => {
    const getQuote = async () => {
      if (!fromAmount || !fromToken || !toToken || parseFloat(fromAmount) <= 0) {
        setQuote(null);
        setToAmount("");
        return;
      }

      setIsGettingQuote(true);
      try {
        const amount = parseFloat(fromAmount) * Math.pow(10, fromToken.decimals);
        const quoteResponse = await jupiterService.getSwapQuote(
          fromToken.mint,
          toToken.mint,
          Math.floor(amount),
          Math.floor(slippage * 100)
        );
        
        if (quoteResponse) {
          setQuote(quoteResponse);
          const outAmount = parseInt(quoteResponse.outAmount) / Math.pow(10, toToken.decimals);
          setToAmount(outAmount.toFixed(6));
        }
      } catch (error) {
        console.error("Error getting swap quote:", error);
        // Don't show toast for quote errors to avoid spam
        setQuote(null);
        setToAmount("");
      } finally {
        setIsGettingQuote(false);
      }
    };

    const debounce = setTimeout(getQuote, 500);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken, slippage, jupiterService, toast]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };

  const handleExecuteSwap = async () => {
    if (!quote || !publicKey || !connected) {
      toast({
        title: "Cannot Execute Swap",
        description: "Please connect your wallet and get a valid quote",
        variant: "destructive",
      });
      return;
    }

    try {
      const swapTransaction = await jupiterService.getSwapTransaction(
        quote,
        publicKey.toString()
      );
      
      if (swapTransaction) {
        // Here we would normally submit the transaction to the blockchain
        toast({
          title: "Swap Initiated",
          description: `Swapping ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
        });
      }
    } catch (error) {
      console.error("Swap error:", error);
      toast({
        title: "Swap Failed",
        description: "Failed to execute swap",
        variant: "destructive",
      });
    }
  };

  const getPriceChangeColor = (priceChangePercent: number) => {
    if (priceChangePercent > 0) return "text-green-500";
    if (priceChangePercent < 0) return "text-red-500";
    return "text-gray-500";
  };

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toExponential(3);
    if (price < 1) return price.toFixed(6);
    return price.toFixed(3);
  };

  if (fundLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-bonk" />
          <span className="ml-2 text-gray-600">Loading trading terminal...</span>
        </div>
      </div>
    );
  }

  // Debug access control
  console.log('Trading Terminal Access Check:', {
    fund: fund?.id,
    fundManagerId: fund?.managerId, 
    userId: user?.id,
    isAuthenticated,
    match: fund?.managerId === user?.id
  });

  if (!fund || !isAuthenticated || fund.managerId !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only the fund manager can access the trading terminal.</p>
          <div className="text-sm text-gray-400 mb-4">
            Debug: Fund Manager: {fund?.managerId}, User: {user?.id}
          </div>
          <Link href={`/fund/${id}`}>
            <Button className="bg-bonk hover:bg-bonk-hover text-white">
              Back to Fund Details
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Trading Header */}
      <section className="bg-gradient-to-br from-dark to-darker text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Trading Terminal</h1>
              <p className="text-gray-300">Managing {fund.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-white border-white">
                <Wallet className="w-4 h-4 mr-1" />
                Fund AUM: {((fund.totalAssets || 0) / 1e9).toFixed(2)} SOL
              </Badge>
              <Link href={`/fund/${id}`}>
                <Button variant="outline" className="text-white border-white hover:bg-white hover:text-dark">
                  Fund Overview
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Trading Panel */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-bonk" />
                    Jupiter Swap
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    Advanced
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Order Type Tabs */}
                <Tabs value={isMarketOrder ? "market" : "limit"} onValueChange={(value) => setIsMarketOrder(value === "market")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="market">Market Order</TabsTrigger>
                    <TabsTrigger value="limit">Limit Order</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* From Token */}
                <div className="space-y-2">
                  <Label>You're Selling</Label>
                  <div className="flex space-x-2">
                    <Select value={fromToken.mint} onValueChange={(value) => {
                      const token = POPULAR_TOKENS.find(t => t.mint === value);
                      if (token) setFromToken(token);
                    }}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_TOKENS.map((token) => (
                          <SelectItem key={token.mint} value={token.mint}>
                            {token.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  {tokenPrices[fromToken.mint] && (
                    <div className="text-sm text-gray-500">
                      Price: ${formatPrice(tokenPrices[fromToken.mint].price)}
                      {fromAmount && (
                        <span className="ml-2">
                          ≈ ${(parseFloat(fromAmount) * tokenPrices[fromToken.mint].price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwapTokens}
                    className="rounded-full p-2 border"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                  </Button>
                </div>

                {/* To Token */}
                <div className="space-y-2">
                  <Label>You're Buying</Label>
                  <div className="flex space-x-2">
                    <Select value={toToken.mint} onValueChange={(value) => {
                      const token = POPULAR_TOKENS.find(t => t.mint === value);
                      if (token) setToToken(token);
                    }}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_TOKENS.map((token) => (
                          <SelectItem key={token.mint} value={token.mint}>
                            {token.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={isGettingQuote ? "..." : toAmount}
                      readOnly={isMarketOrder}
                      onChange={(e) => !isMarketOrder && setToAmount(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  {tokenPrices[toToken.mint] && (
                    <div className="text-sm text-gray-500">
                      Price: ${formatPrice(tokenPrices[toToken.mint].price)}
                      {toAmount && (
                        <span className="ml-2">
                          ≈ ${(parseFloat(toAmount || "0") * tokenPrices[toToken.mint].price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <Label>Slippage Tolerance: {slippage}%</Label>
                      <Slider
                        value={[slippage]}
                        onValueChange={(value) => setSlippage(value[0])}
                        max={5}
                        min={0.1}
                        step={0.1}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0.1%</span>
                        <span>5.0%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="priority-fee">Priority Fee</Label>
                      <Switch id="priority-fee" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="versioned-tx">Versioned Transactions</Label>
                      <Switch id="versioned-tx" defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Max Accounts: 20</Label>
                      <div className="text-sm text-gray-500">
                        Higher values may find better routes but use more compute
                      </div>
                    </div>
                  </div>
                )}

                {/* Quote Information */}
                {quote && (
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Rate</span>
                      <span>1 {fromToken.symbol} = {(parseFloat(quote.outAmount) / Math.pow(10, toToken.decimals) / (parseFloat(quote.inAmount) / Math.pow(10, fromToken.decimals))).toFixed(6)} {toToken.symbol}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price Impact</span>
                      <span className={getPriceChangeColor(parseFloat(quote.priceImpactPct))}>
                        {parseFloat(quote.priceImpactPct).toFixed(3)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Minimum Received</span>
                      <span>{(parseFloat(quote.otherAmountThreshold) / Math.pow(10, toToken.decimals)).toFixed(6)} {toToken.symbol}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Network Fee</span>
                      <span>~0.000005 SOL</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Route</span>
                      <span className="text-right">
                        {quote.routePlan && quote.routePlan.length > 0 ? (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {quote.routePlan.length} hop{quote.routePlan.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          'Direct'
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((percentage) => (
                    <Button
                      key={percentage}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Simulate setting percentage of available balance
                        const mockBalance = 10; // This would come from actual wallet balance
                        const amount = (mockBalance * percentage / 100).toFixed(2);
                        setFromAmount(amount);
                      }}
                      className="text-xs"
                    >
                      {percentage}%
                    </Button>
                  ))}
                </div>

                {/* Execute Button */}
                <Button 
                  onClick={handleExecuteSwap}
                  disabled={!quote || !connected || isGettingQuote}
                  className="w-full bg-bonk hover:bg-bonk-hover text-white h-12 text-lg"
                >
                  {isGettingQuote ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Getting Quote...
                    </>
                  ) : !connected ? (
                    "Connect Wallet"
                  ) : !quote ? (
                    "Enter Amount"
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      {isMarketOrder ? "Swap" : "Place Limit Order"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Price Chart */}
          <div className="xl:col-span-5 space-y-6">
            <PriceChart 
              tokenSymbol={fromToken.symbol}
              tokenMint={fromToken.mint}
              currentPrice={tokenPrices[fromToken.mint]?.price}
            />
            
            {/* Transaction History */}
            <TransactionHistory fundId={id!} />
            
            {/* Portfolio Analytics */}
            <PortfolioAnalytics fundId={id!} />
          </div>

          {/* Market Data & Portfolio */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Order Book */}
            <OrderBook 
              tokenPair={`${fromToken.symbol}/${toToken.symbol}`}
              currentPrice={tokenPrices[fromToken.mint]?.price}
            />

            {/* Recent Trades */}
            <RecentTrades 
              tokenPair={`${fromToken.symbol}/${toToken.symbol}`}
              currentPrice={tokenPrices[fromToken.mint]?.price}
            />

            {/* Current Portfolio */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-pump" />
                    Portfolio Allocation
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRebalanceMode(!rebalanceMode)}
                  >
                    {rebalanceMode ? "Cancel" : "Rebalance"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fund.allocations.length > 0 ? (
                  <div className="space-y-4">
                    {fund.allocations.map((allocation) => {
                      const percentage = allocation.targetPercentage / 100;
                      return (
                        <div key={allocation.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-bonk rounded-full"></div>
                              <span className="font-medium">{allocation.tokenSymbol}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{percentage}%</span>
                              {rebalanceMode && (
                                <Input
                                  type="number"
                                  value={newAllocations[allocation.tokenMint] || percentage}
                                  onChange={(e) => setNewAllocations(prev => ({
                                    ...prev,
                                    [allocation.tokenMint]: parseFloat(e.target.value) || 0
                                  }))}
                                  className="w-20 h-8"
                                  min="0"
                                  max="100"
                                />
                              )}
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                    
                    {rebalanceMode && (
                      <Button className="w-full bg-pump hover:bg-pump/90 text-white mt-4">
                        <Target className="w-4 h-4 mr-2" />
                        Execute Rebalance
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No allocations set</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}