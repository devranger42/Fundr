import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';

// Declare global wallet objects for TypeScript
declare global {
  interface Window {
    solana?: any;
    phantom?: {
      solana?: any;
    };
    solflare?: any;
    backpack?: any;
    glow?: any;
    slope?: any;
  }
}

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

const wallets = [
  {
    name: 'Phantom',
    icon: '👻',
    description: 'The trusted crypto wallet for Solana',
    downloadUrl: 'https://phantom.app/'
  },
  {
    name: 'Solflare',
    icon: '☀️',
    description: 'Solflare is a secure Solana wallet',
    downloadUrl: 'https://solflare.com/'
  },
  {
    name: 'Backpack',
    icon: '🎒',
    description: 'A home for your xNFTs',
    downloadUrl: 'https://backpack.app/'
  },
  {
    name: 'Glow',
    icon: '✨',
    description: 'Glow Wallet for Solana',
    downloadUrl: 'https://glow.app/'
  },
  {
    name: 'Slope',
    icon: '📐',
    description: 'Slope Wallet for Solana',
    downloadUrl: 'https://slope.finance/'
  }
];

export default function WalletModal({ open, onClose }: WalletModalProps) {
  const { connect, connecting } = useWallet();
  const { toast } = useToast();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  const handleConnect = async (walletName: string) => {
    try {
      setConnectingWallet(walletName);
      await connect(walletName);
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${walletName}`,
      });
      onClose();
    } catch (error) {
      console.error('Wallet connection error:', error);
      let errorMessage = "Failed to connect wallet";
      
      if (error instanceof Error) {
        if (error.message.includes('base58') || error.message.includes('Invalid')) {
          errorMessage = "Wallet connection issue. Try disconnecting and reconnecting your wallet.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setConnectingWallet(null);
    }
  };

  const isWalletInstalled = (walletName: string) => {
    switch (walletName.toLowerCase()) {
      case 'phantom':
        return window.solana?.isPhantom || window.phantom?.solana?.isPhantom;
      case 'solflare':
        return window.solflare?.isSolflare;
      case 'backpack':
        return window.backpack?.isBackpack;
      case 'glow':
        return window.glow?.isGlow;
      case 'slope':
        return window.slope?.isSlope;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Fundr
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {wallets.map((wallet) => {
            const installed = isWalletInstalled(wallet.name);
            const isConnecting = connectingWallet === wallet.name;
            
            return (
              <div key={wallet.name} className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex items-center justify-between hover:bg-gray-50"
                  onClick={() => installed ? handleConnect(wallet.name) : window.open(wallet.downloadUrl, '_blank')}
                  disabled={connecting}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-gray-500">{wallet.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {isConnecting ? (
                      <div className="w-5 h-5 border-2 border-bonk border-t-transparent rounded-full animate-spin"></div>
                    ) : installed ? (
                      <span className="text-sm bg-pump text-black px-2 py-1 rounded">Connect</span>
                    ) : (
                      <span className="text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded">Install</span>
                    )}
                  </div>
                </Button>
              </div>
            );
          })}
        </div>
        
        <div className="text-center text-sm text-gray-500 mt-4">
          New to Solana wallets? <a href="https://docs.solana.com/wallet-guide" target="_blank" rel="noopener noreferrer" className="text-bonk hover:underline">Learn more</a>
        </div>
      </DialogContent>
    </Dialog>
  );
}