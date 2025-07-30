import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Layers } from "lucide-react";

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface OrderBookProps {
  tokenPair: string;
  currentPrice?: number;
}

export function OrderBook({ tokenPair, currentPrice = 1.0 }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookEntry[]>([]);
  const [asks, setAsks] = useState<OrderBookEntry[]>([]);
  const [spread, setSpread] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock order book data
  useEffect(() => {
    const generateOrderBook = () => {
      const bidOrders: OrderBookEntry[] = [];
      const askOrders: OrderBookEntry[] = [];
      
      let bidTotal = 0;
      let askTotal = 0;
      
      // Generate bids (below current price)
      for (let i = 0; i < 8; i++) {
        const price = currentPrice * (1 - (i + 1) * 0.001);
        const size = Math.random() * 10000 + 1000;
        bidTotal += size;
        bidOrders.push({
          price,
          size,
          total: bidTotal
        });
      }
      
      // Generate asks (above current price)
      for (let i = 0; i < 8; i++) {
        const price = currentPrice * (1 + (i + 1) * 0.001);
        const size = Math.random() * 10000 + 1000;
        askTotal += size;
        askOrders.push({
          price,
          size,
          total: askTotal
        });
      }
      
      setBids(bidOrders);
      setAsks(askOrders.reverse()); // Reverse so lowest ask is at top
      
      if (bidOrders.length > 0 && askOrders.length > 0) {
        const currentSpread = ((askOrders[askOrders.length - 1].price - bidOrders[0].price) / bidOrders[0].price) * 100;
        setSpread(currentSpread);
      }
      
      setIsLoading(false);
    };

    setIsLoading(true);
    generateOrderBook();
    
    // Update order book every 3 seconds
    const interval = setInterval(generateOrderBook, 3000);
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

  const maxBidTotal = Math.max(...bids.map(b => b.total));
  const maxAskTotal = Math.max(...asks.map(a => a.total));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Layers className="w-5 h-5 mr-2 text-pump" />
          Order Book
        </CardTitle>
        <CardDescription>
          {tokenPair} • Spread: {spread.toFixed(3)}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Layers className="w-8 h-8 animate-pulse text-pump" />
            <span className="ml-2 text-gray-600">Loading order book...</span>
          </div>
        ) : (
          <div className="space-y-1">
            {/* Column Headers */}
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 font-medium pb-2 border-b">
              <div>Price</div>
              <div className="text-right">Size</div>
              <div className="text-right">Total</div>
            </div>

            {/* Asks (Sell Orders) */}
            <div className="space-y-1">
              {asks.slice(0, 6).map((ask, index) => (
                <div key={`ask-${index}`} className="relative">
                  <div className="grid grid-cols-3 gap-2 text-xs py-1 relative z-10">
                    <div className="text-red-600 font-mono">
                      ${formatPrice(ask.price)}
                    </div>
                    <div className="text-right font-mono">
                      {formatSize(ask.size)}
                    </div>
                    <div className="text-right font-mono text-gray-600">
                      {formatSize(ask.total)}
                    </div>
                  </div>
                  <div 
                    className="absolute inset-0 bg-red-50 rounded"
                    style={{ 
                      width: `${(ask.total / maxAskTotal) * 100}%`,
                      right: 0,
                      marginLeft: 'auto'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Current Price */}
            <div className="flex items-center justify-center py-3 border-y border-gray-200">
              <Badge variant="outline" className="text-sm">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                ${formatPrice(currentPrice)}
              </Badge>
            </div>

            {/* Bids (Buy Orders) */}
            <div className="space-y-1">
              {bids.slice(0, 6).map((bid, index) => (
                <div key={`bid-${index}`} className="relative">
                  <div className="grid grid-cols-3 gap-2 text-xs py-1 relative z-10">
                    <div className="text-green-600 font-mono">
                      ${formatPrice(bid.price)}
                    </div>
                    <div className="text-right font-mono">
                      {formatSize(bid.size)}
                    </div>
                    <div className="text-right font-mono text-gray-600">
                      {formatSize(bid.total)}
                    </div>
                  </div>
                  <div 
                    className="absolute inset-0 bg-green-50 rounded"
                    style={{ 
                      width: `${(bid.total / maxBidTotal) * 100}%`,
                      right: 0,
                      marginLeft: 'auto'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}