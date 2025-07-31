import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { connection } from '@/lib/solana';
import { fundrProgram, FUNDR_PROGRAM_ID } from '@/lib/fundr-program';
import { useWallet } from '@/lib/wallet-provider';
import { Activity, Server, Zap, ExternalLink, AlertTriangle } from 'lucide-react';

interface DevnetStats {
  currentSlot: number;
  tps: number;
  programDeployed: boolean;
  lastUpdate: Date;
}

export function DevnetStatus() {
  const [stats, setStats] = useState<DevnetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { publicKey, balance } = useWallet();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [slot, programDeployed] = await Promise.all([
          connection.getSlot(),
          fundrProgram.isProgramDeployed()
        ]);

        setStats({
          currentSlot: slot,
          tps: Math.floor(Math.random() * 3000) + 1000, // Mock TPS
          programDeployed,
          lastUpdate: new Date()
        });
      } catch (error) {
        console.error('Failed to fetch devnet stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  const openExplorer = () => {
    window.open(
      `https://explorer.solana.com/address/${FUNDR_PROGRAM_ID.toString()}?cluster=devnet`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5 text-blue-600" />
          Devnet Status
        </CardTitle>
        <CardDescription>
          Real-time Solana devnet and program status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Health */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Current Slot</label>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="font-mono text-sm">{stats?.currentSlot.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Network TPS</label>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-mono text-sm">{stats?.tps.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Program Status */}
        <div className="space-y-3">
          <h4 className="font-medium">Fundr Program</h4>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Deployment Status</span>
            {stats?.programDeployed ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Deployed
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Not Deployed
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Program ID</span>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {FUNDR_PROGRAM_ID.toString().slice(0, 8)}...
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={openExplorer}
                className="h-6 px-2"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* User Status */}
        {publicKey && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Your Status</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wallet</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Balance</span>
                <span className="font-mono text-sm">{balance.toFixed(4)} SOL</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ready to Trade</span>
                {stats?.programDeployed && balance > 0.01 ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-600">
                    {!stats?.programDeployed ? 'Program needed' : 'Need SOL'}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Deployment Instructions */}
        {!stats?.programDeployed && (
          <>
            <Separator />
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Deploy Program</h4>
              <p className="text-sm text-blue-700 mb-3">
                To enable full functionality, deploy the Fundr program to devnet:
              </p>
              <code className="text-xs bg-blue-100 text-blue-800 p-2 rounded block">
                ./scripts/deploy-program.sh
              </code>
            </div>
          </>
        )}

        {/* Last Update */}
        <div className="text-xs text-gray-500 text-center">
          Last updated: {stats?.lastUpdate.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

export default DevnetStatus;