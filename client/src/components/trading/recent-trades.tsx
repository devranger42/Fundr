import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface Trade {
  id: string;
  price: number;
  size: number;
  side: "buy" | "sell";
  timestamp: number;
}

interface RecentTradesProps {
  tokenPair: string;
  currentPrice?: number;
}

export function RecentTrades({ tokenPair, currentPrice = 1.0 }: RecentTradesProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock trade data
  useEffect(() => {
    const generateTrades = () => {
      const newTrades: Trade[] = [];
      const now = Date.now();
      
      for (let i = 0; i < 15; i++) {
        const side = Math.random() > 0.5 ? "buy" : "sell";
        const priceVariation = (Math.random() - 0.5) * 0.002;
        const price = currentPrice * (1 + priceVariation);
        const size = Math.random() * 5000 + 100;
        
        newTrades.push({
          id: `trade-${Date.now()}-${i}`,
          price,
          size,
          side,
          timestamp: now - (i * 1000 * (Math.random() * 60)) // Random times in last hour
        });
      }
      
      setTrades(newTrades.sort((a, b) => b.timestamp - a.timestamp));
      setIsLoading(false);
    };

    setIsLoading(true);
    generateTrades();
    
    // Add new trades every 5 seconds
    const interval = setInterval(() => {
      const side = Math.random() > 0.5 ? "buy" : "sell";
      const priceVariation = (Math.random() - 0.5) * 0.002;
      const price = currentPrice * (1 + priceVariation);
      const size = Math.random() * 5000 + 100;
      
      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        price,
        size,
        side,
        timestamp: Date.now()
      };
      
      setTrades(prev => [newTrade, ...prev.slice(0, 14)]);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentPrice]);

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toExponential(4);
    if (price < 1) return price.toFixed(6);
    return price.toFixed(4);
  };

  const formatSize = (size: number) => {
    if (size > 1000000) return `${(size / 1000000).toFixed(1)}M`;
    if (size > 1000) return `${(size / 1000).toFixed(1)}K`;
    return size.toFixed(0);
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="w-5 h-5 mr-2 text-bonk" />
          Recent Trades
        </CardTitle>
        <CardDescription>
          Latest trades for {tokenPair}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Clock className="w-8 h-8 animate-pulse text-bonk" />
            <span className="ml-2 text-gray-600">Loading trades...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Column Headers */}
            <div className="grid grid-cols-4 gap-2 text-xs text-gray-500 font-medium pb-2 border-b">
              <div>Price</div>
              <div className="text-right">Size</div>
              <div className="text-right">Side</div>
              <div className="text-right">Time</div>
            </div>

            {/* Trades */}
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {trades.map((trade) => (
                <div 
                  key={trade.id} 
                  className={`grid grid-cols-4 gap-2 text-xs py-1 rounded hover:bg-gray-50 transition-colors ${
                    trade.side === "buy" ? "border-l-2 border-green-200" : "border-l-2 border-red-200"
                  }`}
                >
                  <div className={`font-mono ${trade.side === "buy" ? "text-green-600" : "text-red-600"}`}>
                    ${formatPrice(trade.price)}
                  </div>
                  <div className="text-right font-mono">
                    {formatSize(trade.size)}
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={trade.side === "buy" ? "default" : "destructive"}
                      className={`text-xs px-1 py-0 ${
                        trade.side === "buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {trade.side === "buy" ? (
                        <TrendingUp className="w-2 h-2 mr-1" />
                      ) : (
                        <TrendingDown className="w-2 h-2 mr-1" />
                      )}
                      {trade.side}
                    </Badge>
                  </div>
                  <div className="text-right text-gray-500 font-mono">
                    {formatTime(trade.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}