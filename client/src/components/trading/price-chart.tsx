import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

interface PriceChartProps {
  tokenSymbol: string;
  tokenMint: string;
  currentPrice?: number;
}

export function PriceChart({ tokenSymbol, tokenMint, currentPrice }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<"1H" | "1D" | "7D" | "30D">("1D");
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock price data for demonstration
  useEffect(() => {
    const generateMockData = () => {
      const now = Date.now();
      const points = timeframe === "1H" ? 60 : timeframe === "1D" ? 24 : timeframe === "7D" ? 168 : 720;
      const interval = timeframe === "1H" ? 60000 : timeframe === "1D" ? 3600000 : timeframe === "7D" ? 3600000 : 3600000;
      
      const data: PricePoint[] = [];
      let price = currentPrice || 100;
      
      for (let i = points; i >= 0; i--) {
        const change = (Math.random() - 0.5) * 0.1;
        price = price * (1 + change);
        data.push({
          timestamp: now - (i * interval),
          price: price,
          volume: Math.random() * 1000000
        });
      }
      
      setPriceData(data);
      if (data.length > 1) {
        const change = ((data[data.length - 1].price - data[0].price) / data[0].price) * 100;
        setPriceChange(change);
      }
      setIsLoading(false);
    };

    setIsLoading(true);
    setTimeout(generateMockData, 500); // Simulate API delay
  }, [timeframe, currentPrice, tokenMint]);

  const formatPrice = (price: number) => {
    if (price < 0.001) return price.toExponential(3);
    if (price < 1) return price.toFixed(6);
    return price.toFixed(3);
  };

  const formatVolume = (volume: number) => {
    if (volume > 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume > 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-bonk" />
              {tokenSymbol} Price Chart
            </CardTitle>
            <CardDescription>
              Live price data and trading volume
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {(["1H", "1D", "7D", "30D"] as const).map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="text-xs"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <BarChart3 className="w-8 h-8 animate-pulse text-bonk" />
            <span className="ml-2 text-gray-600">Loading chart...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Price Info */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  ${formatPrice(priceData[priceData.length - 1]?.price || 0)}
                </div>
                <div className="text-sm text-gray-500">Current Price</div>
              </div>
              <Badge 
                variant={priceChange >= 0 ? "default" : "destructive"}
                className={priceChange >= 0 ? "bg-green-500" : "bg-red-500"}
              >
                {priceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
              </Badge>
            </div>

            {/* Mini Chart Visualization */}
            <div className="relative h-32 bg-gray-50 rounded-lg overflow-hidden">
              <svg width="100%" height="100%" className="absolute inset-0">
                {priceData.length > 1 && (
                  <>
                    {/* Price Line */}
                    <polyline
                      fill="none"
                      stroke={priceChange >= 0 ? "#10B981" : "#EF4444"}
                      strokeWidth="2"
                      points={priceData.map((point, index) => {
                        const x = (index / (priceData.length - 1)) * 100;
                        const minPrice = Math.min(...priceData.map(p => p.price));
                        const maxPrice = Math.max(...priceData.map(p => p.price));
                        const y = 90 - ((point.price - minPrice) / (maxPrice - minPrice)) * 80;
                        return `${x},${y}`;
                      }).join(" ")}
                    />
                    
                    {/* Volume Bars */}
                    {priceData.map((point, index) => {
                      const x = (index / (priceData.length - 1)) * 100;
                      const maxVolume = Math.max(...priceData.map(p => p.volume));
                      const height = (point.volume / maxVolume) * 20;
                      return (
                        <rect
                          key={index}
                          x={`${x - 0.5}%`}
                          y={`${90 - height}%`}
                          width="1%"
                          height={`${height}%`}
                          fill="#CBD5E1"
                          opacity="0.6"
                        />
                      );
                    })}
                  </>
                )}
              </svg>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">24h High</div>
                <div className="font-bold">
                  ${formatPrice(Math.max(...priceData.map(p => p.price)))}
                </div>
              </div>
              <div>
                <div className="text-gray-500">24h Low</div>
                <div className="font-bold">
                  ${formatPrice(Math.min(...priceData.map(p => p.price)))}
                </div>
              </div>
              <div>
                <div className="text-gray-500">24h Volume</div>
                <div className="font-bold">
                  ${formatVolume(priceData.reduce((sum, p) => sum + p.volume, 0))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}