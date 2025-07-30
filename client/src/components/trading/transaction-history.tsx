import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  History, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ArrowUpDown,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  signature: string;
  type: "swap" | "deposit" | "withdraw" | "rebalance";
  fromToken: string;
  toToken?: string;
  fromAmount: number;
  toAmount?: number;
  status: "confirmed" | "failed" | "pending";
  timestamp: number;
  priceImpact?: number;
  fee: number;
}

interface TransactionHistoryProps {
  fundId: string;
}

export function TransactionHistory({ fundId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "swap" | "deposit" | "withdraw" | "rebalance">("all");
  const { toast } = useToast();

  // Generate mock transaction data
  useEffect(() => {
    const generateTransactions = () => {
      const txTypes: Transaction["type"][] = ["swap", "deposit", "withdraw", "rebalance"];
      const tokens = ["SOL", "USDC", "BONK", "JUP", "RAY"];
      const statuses: Transaction["status"][] = ["confirmed", "confirmed", "confirmed", "failed", "pending"];
      
      const mockTransactions: Transaction[] = [];
      
      for (let i = 0; i < 20; i++) {
        const type = txTypes[Math.floor(Math.random() * txTypes.length)];
        const fromToken = tokens[Math.floor(Math.random() * tokens.length)];
        const toToken = type === "swap" ? tokens.find(t => t !== fromToken) : undefined;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        mockTransactions.push({
          id: `tx-${i}`,
          signature: `${Math.random().toString(36).substr(2, 9)}...${Math.random().toString(36).substr(2, 4)}`,
          type,
          fromToken,
          toToken,
          fromAmount: Math.random() * 1000 + 10,
          toAmount: type === "swap" ? Math.random() * 1000 + 10 : undefined,
          status,
          timestamp: Date.now() - (i * 1000 * 60 * Math.random() * 60), // Random times in last few hours
          priceImpact: type === "swap" ? Math.random() * 2 : undefined,
          fee: Math.random() * 0.01 + 0.000005
        });
      }
      
      setTransactions(mockTransactions.sort((a, b) => b.timestamp - a.timestamp));
      setIsLoading(false);
    };

    generateTransactions();
  }, [fundId]);

  const filteredTransactions = transactions.filter(tx => 
    filter === "all" || tx.type === filter
  );

  const copySignature = (signature: string) => {
    navigator.clipboard.writeText(signature);
    toast({
      title: "Copied",
      description: "Transaction signature copied to clipboard",
    });
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "failed":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const formatAmount = (amount: number) => {
    if (amount < 0.001) return amount.toExponential(3);
    if (amount < 1) return amount.toFixed(6);
    return amount.toFixed(3);
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2 text-bonk" />
              Transaction History
            </CardTitle>
            <CardDescription>
              Recent fund management transactions
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {(["all", "swap", "deposit", "withdraw", "rebalance"] as const).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="text-xs capitalize"
              >
                {filterType}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <History className="w-8 h-8 animate-pulse text-bonk" />
            <span className="ml-2 text-gray-600">Loading transactions...</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(tx.status)}
                      <div>
                        <div className="font-medium capitalize flex items-center">
                          {tx.type}
                          {tx.type === "swap" && <ArrowUpDown className="w-3 h-3 ml-1" />}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(tx.timestamp)}
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {tx.type === "swap" ? "From:" : "Amount:"}
                      </span>
                      <span className="font-mono">
                        {formatAmount(tx.fromAmount)} {tx.fromToken}
                      </span>
                    </div>
                    
                    {tx.toAmount && tx.toToken && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">To:</span>
                        <span className="font-mono">
                          {formatAmount(tx.toAmount)} {tx.toToken}
                        </span>
                      </div>
                    )}
                    
                    {tx.priceImpact && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price Impact:</span>
                        <span className={`font-mono ${tx.priceImpact > 1 ? "text-red-600" : "text-gray-900"}`}>
                          {tx.priceImpact.toFixed(3)}%
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee:</span>
                      <span className="font-mono">
                        {formatAmount(tx.fee)} SOL
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Signature:</span>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {tx.signature}
                        </code>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copySignature(tx.signature)}
                          className="p-1 h-6 w-6"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://solscan.io/tx/${tx.signature}`, "_blank")}
                          className="p-1 h-6 w-6"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}