import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import { useFundrProgram } from "@/hooks/use-fundr-program";
import { useToast } from "@/hooks/use-toast";
import { PublicKey } from "@solana/web3.js";

interface DepositWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "deposit" | "withdraw";
  fundName: string;
  fundId: string;
  currentShares?: number;
  sharePrice?: number;
}

export function DepositWithdrawModal({
  isOpen,
  onClose,
  type,
  fundName,
  fundId,
  currentShares = 0,
  sharePrice = 0.00008 // mock share price in SOL
}: DepositWithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { connected, publicKey } = useWallet();
  const walletBalance = useWalletBalance();
  const { depositToFund, withdrawFromFund, connected: programConnected } = useFundrProgram();
  const { toast } = useToast();

  const solAmount = parseFloat(amount) || 0;
  const shares = sharePrice > 0 ? solAmount / sharePrice : 0;
  const maxWithdrawable = currentShares * sharePrice;
  
  // Platform fees
  const platformFee = solAmount * 0.01; // 1% platform fee
  const netAmount = type === "deposit" ? solAmount - platformFee : solAmount;

  const handleTransaction = async () => {
    if (!connected || !publicKey || !programConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet and wait for program initialization",
        variant: "destructive",
      });
      return;
    }

    if (type === "deposit" && solAmount > walletBalance.sol) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough SOL in your wallet",
        variant: "destructive",
      });
      return;
    }

    if (type === "withdraw" && solAmount > maxWithdrawable) {
      toast({
        title: "Insufficient Shares",
        description: "You don't have enough shares to withdraw this amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const fundPubkey = new PublicKey(fundId);
      let signature: string;

      if (type === "deposit") {
        signature = await depositToFund(fundPubkey, solAmount);
        toast({
          title: "Deposit Successful",
          description: `Deposited ${solAmount} SOL to ${fundName}`,
        });
      } else {
        // Convert shares for withdrawal (shares = amount / sharePrice)
        const sharesToWithdraw = solAmount / sharePrice;
        signature = await withdrawFromFund(fundPubkey, sharesToWithdraw);
        toast({
          title: "Withdrawal Successful", 
          description: `Withdrawn ${solAmount} SOL from ${fundName}`,
        });
      }

      console.log(`Transaction signature: ${signature}`);
      onClose();
      setAmount("");
    } catch (error: any) {
      console.error(`${type} transaction failed:`, error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isValidAmount = solAmount > 0 && (
    type === "deposit" ? solAmount <= walletBalance.sol : solAmount <= maxWithdrawable
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {type === "deposit" ? (
              <ArrowUpRight className="w-5 h-5 mr-2 text-pump" />
            ) : (
              <ArrowDownRight className="w-5 h-5 mr-2 text-bonk" />
            )}
            {type === "deposit" ? "Deposit to" : "Withdraw from"} {fundName}
          </DialogTitle>
          <DialogDescription>
            {type === "deposit" 
              ? "Add SOL to this fund and receive shares based on current NAV"
              : "Withdraw your investment by redeeming shares. Tokens are automatically sold proportionally and you receive SOL."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Wallet Balance */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {type === "deposit" ? "Available Balance" : "Withdrawable"}
                </span>
              </div>
              <div className="text-right">
                <div className="font-bold">
                  {type === "deposit" 
                    ? `${walletBalance.sol.toFixed(3)} SOL`
                    : `${maxWithdrawable.toFixed(3)} SOL`
                  }
                </div>
                {type === "withdraw" && (
                  <div className="text-xs text-gray-500">
                    {(currentShares / 1e6).toFixed(2)}M shares
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (SOL)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
                step="0.001"
                min="0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-sm text-gray-500">SOL</span>
              </div>
            </div>
            
            {/* Quick Amount Buttons */}
            <div className="flex space-x-2">
              {[25, 50, 75, 100].map((percentage) => (
                <Button
                  key={percentage}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const maxAmount = type === "deposit" ? walletBalance.sol : maxWithdrawable;
                    const amount = (maxAmount * percentage / 100).toFixed(3);
                    setAmount(amount);
                  }}
                  className="flex-1 text-xs"
                >
                  {percentage}%
                </Button>
              ))}
            </div>
          </div>

          {/* Transaction Details */}
          {solAmount > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amount</span>
                  <span className="font-mono">{solAmount.toFixed(6)} SOL</span>
                </div>
                
                {type === "deposit" && (
                  <>
                    <div className="flex justify-between">
                      <span>Platform Fee (1%)</span>
                      <span className="font-mono text-red-600">-{platformFee.toFixed(6)} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Investment</span>
                      <span className="font-mono font-bold">{netAmount.toFixed(6)} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shares Received</span>
                      <span className="font-mono">{(shares / 1e6).toFixed(2)}M</span>
                    </div>
                  </>
                )}
                
                {type === "withdraw" && (
                  <>
                    <div className="flex justify-between">
                      <span>Shares Redeemed</span>
                      <span className="font-mono">{(shares / 1e6).toFixed(2)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Withdrawal Fee (1%)</span>
                      <span className="font-mono text-red-600">-{platformFee.toFixed(6)} SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Received</span>
                      <span className="font-mono font-bold">{netAmount.toFixed(6)} SOL</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>Share Price</span>
                  <span>{sharePrice.toFixed(8)} SOL</span>
                </div>
              </div>
            </Card>
          )}

          {/* Warnings */}
          {solAmount > 0 && !isValidAmount && (
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">
                  {type === "deposit" 
                    ? "Amount exceeds available wallet balance"
                    : "Amount exceeds withdrawable balance"
                  }
                </span>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransaction}
              disabled={!isValidAmount || isProcessing || !connected}
              className={`flex-1 ${type === "deposit" ? "bg-pump hover:bg-pump-hover" : "bg-bonk hover:bg-bonk-hover"} text-white`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {type === "deposit" ? (
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-2" />
                  )}
                  {type === "deposit" ? "Deposit" : "Withdraw"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}