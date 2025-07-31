import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFundrProgram } from "@/hooks/use-fundr-program";
import { useWallet } from "@/lib/wallet-provider";
import { useAuth } from "@/hooks/use-auth";
import { 
  Bug, 
  CheckCircle, 
  XCircle,
  Wifi,
  User,
  Coins
} from "lucide-react";

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { connected: walletConnected, publicKey } = useWallet();
  const { connected: programConnected, fundrService, isInitialized } = useFundrProgram();
  const { user } = useAuth();

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  const testFundCreation = async () => {
    if (!fundrService) {
      console.error('FundrService not available');
      return;
    }

    try {
      console.log('Testing fund creation...');
      const result = await fundrService.createFund(
        'Test Fund',
        'Test Description',
        100, // 1%
        2000, // 20%
        1 // 1 SOL
      );
      console.log('Test fund creation result:', result);
    } catch (error) {
      console.error('Test fund creation failed:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <Bug className="w-4 h-4 mr-2" />
              Debug Panel
            </CardTitle>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Wallet Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Wallet</span>
            </div>
            <Badge variant={walletConnected ? "default" : "destructive"}>
              {walletConnected ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {walletConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          {/* Program Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4" />
              <span className="text-sm">Program</span>
            </div>
            <Badge variant={programConnected ? "default" : "destructive"}>
              {programConnected ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {programConnected ? 'Ready' : 'Not Ready'}
            </Badge>
          </div>

          {/* Auth Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="text-sm">Auth</span>
            </div>
            <Badge variant={user ? "default" : "secondary"}>
              {user ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {user ? 'Authenticated' : 'Guest'}
            </Badge>
          </div>

          {/* Details */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Wallet: {publicKey ? `${publicKey.toString().slice(0, 8)}...` : 'None'}</div>
            <div>Initialized: {isInitialized ? 'Yes' : 'No'}</div>
            <div>Service: {fundrService ? 'Available' : 'Unavailable'}</div>
          </div>

          {/* Test Button */}
          <Button
            onClick={testFundCreation}
            size="sm"
            className="w-full"
            disabled={!programConnected}
          >
            Test Fund Creation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}