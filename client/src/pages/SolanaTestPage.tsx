import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/lib/wallet-provider';
import { fundrProgram, FundMode } from '@/lib/fundr-program';
import WalletConnector from '@/components/WalletConnector';
import DevnetStatus from '@/components/DevnetStatus';
import { Coins, TrendingUp, Settings, Zap } from 'lucide-react';
import BN from 'bn.js';

export default function SolanaTestPage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fundData, setFundData] = useState({
    name: 'Test Fund',
    description: 'A test fund for devnet testing',
    managementFee: 100, // 1%
    performanceFee: 2000, // 20%
    minDeposit: 0.1, // 0.1 SOL
  });
  const [depositAmount, setDepositAmount] = useState('1.0');

  const handleCreateFund = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const transaction = await fundrProgram.initializeFund(publicKey, {
        ...fundData,
        fundMode: FundMode.Manual
      });

      const signature = await sendTransaction(transaction);
      
      toast({
        title: "Fund Created!",
        description: `Fund created successfully. Transaction: ${signature.slice(0, 8)}...`,
      });
    } catch (error) {
      console.error('Fund creation failed:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // For testing, use manager's fund PDA
      const [fundPDA] = fundrProgram.getFundPDA(publicKey);
      const transaction = await fundrProgram.deposit(publicKey, fundPDA, amount);

      const signature = await sendTransaction(transaction);
      
      toast({
        title: "Deposit Successful!",
        description: `Deposited ${amount} SOL. Transaction: ${signature.slice(0, 8)}...`,
      });
    } catch (error) {
      console.error('Deposit failed:', error);
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestWithdraw = async () => {
    if (!connected || !publicKey) return;

    setLoading(true);
    try {
      const [fundPDA] = fundrProgram.getFundPDA(publicKey);
      const sharesToRedeem = new BN(1000000); // Test amount

      const transaction = await fundrProgram.withdraw(publicKey, fundPDA, sharesToRedeem);
      const signature = await sendTransaction(transaction);
      
      toast({
        title: "Withdrawal Successful!",
        description: `Redeemed shares. Transaction: ${signature.slice(0, 8)}...`,
      });
    } catch (error) {
      console.error('Withdraw failed:', error);
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Solana Devnet Testing</h1>
        <p className="text-gray-600">Test Fundr smart contract operations on devnet</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet & Status */}
        <div className="space-y-6">
          <WalletConnector />
          <DevnetStatus />
        </div>

        {/* Fund Operations */}
        <div className="space-y-6">
          {/* Create Fund */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Create Test Fund
              </CardTitle>
              <CardDescription>
                Initialize a new fund on the Solana blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fundName">Fund Name</Label>
                  <Input
                    id="fundName"
                    value={fundData.name}
                    onChange={(e) => setFundData({...fundData, name: e.target.value})}
                    placeholder="Enter fund name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minDeposit">Min Deposit (SOL)</Label>
                  <Input
                    id="minDeposit"
                    type="number"
                    step="0.1"
                    value={fundData.minDeposit}
                    onChange={(e) => setFundData({...fundData, minDeposit: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={fundData.description}
                  onChange={(e) => setFundData({...fundData, description: e.target.value})}
                  placeholder="Fund description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mgmtFee">Management Fee (bps)</Label>
                  <Input
                    id="mgmtFee"
                    type="number"
                    value={fundData.managementFee}
                    onChange={(e) => setFundData({...fundData, managementFee: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="perfFee">Performance Fee (bps)</Label>
                  <Input
                    id="perfFee"
                    type="number"
                    value={fundData.performanceFee}
                    onChange={(e) => setFundData({...fundData, performanceFee: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <Button 
                onClick={handleCreateFund}
                disabled={!connected || loading}
                className="w-full"
              >
                {loading ? "Creating..." : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Create Fund
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Fund Operations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Fund Operations
              </CardTitle>
              <CardDescription>
                Test deposit, withdrawal, and other fund operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount (SOL)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  step="0.1"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount to deposit"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleDeposit}
                  disabled={!connected || loading}
                  variant="outline"
                >
                  {loading ? "Processing..." : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Deposit
                    </>
                  )}
                </Button>

                <Button 
                  onClick={handleTestWithdraw}
                  disabled={!connected || loading}
                  variant="outline"
                >
                  {loading ? "Processing..." : "Test Withdraw"}
                </Button>
              </div>

              <Separator />

              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Note:</strong> These operations test the smart contract integration.</p>
                <p>• Create a fund first, then test deposits/withdrawals</p>
                <p>• All operations use devnet SOL (no real value)</p>
                <p>• Check transaction signatures on Solana Explorer</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}