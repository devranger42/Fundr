import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useWallet, requestDevnetAirdrop } from '@/lib/wallet-provider';
import { Wallet, Power, Coins, AlertCircle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fundrProgram } from '@/lib/fundr-program';

export function WalletConnector() {
  const { wallet, publicKey, connected, connecting, balance, connect, disconnect } = useWallet();
  const [requesting, setRequesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [programStatus, setProgramStatus] = useState<'checking' | 'deployed' | 'not-deployed'>('checking');
  const { toast } = useToast();

  // Check program deployment status
  useState(() => {
    fundrProgram.isProgramDeployed().then(deployed => {
      setProgramStatus(deployed ? 'deployed' : 'not-deployed');
    });
  });

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to devnet wallet",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Wallet has been disconnected",
      });
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const handleAirdrop = async () => {
    if (!publicKey) return;
    
    setRequesting(true);
    try {
      const signature = await requestDevnetAirdrop(publicKey);
      toast({
        title: "Airdrop Successful",
        description: `Received 2 SOL! Transaction: ${signature.slice(0, 8)}...`,
      });
    } catch (error) {
      toast({
        title: "Airdrop Failed", 
        description: "Rate limited or network error. Try the Solana faucet manually.",
        variant: "destructive",
      });
    } finally {
      setRequesting(false);
    }
  };

  const copyAddress = async () => {
    if (!publicKey) return;
    
    try {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Solana Wallet
        </CardTitle>
        <CardDescription>
          Connect your wallet to interact with Solana funds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <Button 
            onClick={handleConnect} 
            disabled={connecting}
            className="w-full"
          >
            {connecting ? (
              "Connecting..."
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Wallet Status */}
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Connected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-700"
              >
                <Power className="h-4 w-4" />
              </Button>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-2 py-1 bg-gray-100 rounded text-xs">
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAddress}
                  className="h-8 w-8 p-0"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Balance</label>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">
                  {balance.toFixed(4)} SOL
                </span>
                {balance < 0.1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAirdrop}
                    disabled={requesting}
                  >
                    {requesting ? (
                      "Requesting..."
                    ) : (
                      <>
                        <Coins className="mr-1 h-3 w-3" />
                        Airdrop
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            {/* Network & Program Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Network</span>
                <Badge variant="secondary">Devnet</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fundr Program</span>
                <div className="flex items-center gap-2">
                  {programStatus === 'checking' && (
                    <Badge variant="outline">Checking...</Badge>
                  )}
                  {programStatus === 'deployed' && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Deployed
                    </Badge>
                  )}
                  {programStatus === 'not-deployed' && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Deployed
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Capabilities */}
            {programStatus === 'deployed' && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-800 font-medium">Ready for Fund Operations</p>
                <p className="text-xs text-green-600 mt-1">
                  Create funds, deposit, withdraw, and rebalance
                </p>
              </div>
            )}

            {programStatus === 'not-deployed' && (
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">Program Not Deployed</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Using mock operations for testing. Deploy to enable real transactions.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default WalletConnector;