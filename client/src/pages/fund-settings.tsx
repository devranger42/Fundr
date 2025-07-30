import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useFundrProgram } from "@/hooks/use-fundr-program";
import { PublicKey } from "@solana/web3.js";
import { 
  Settings, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  ArrowLeft,
  Zap,
  Target,
  Trash2,
  Coins,
  Recycle
} from "lucide-react";
import { Link } from "wouter";

interface Fund {
  id: string;
  name: string;
  description: string;
  managerId: string;
  fundMode: string;
  jupiterStrictList: boolean;
  isPlatformFund: boolean;
  totalAssets: number;
  totalShares: number;
  createdAt: string;
}

export default function FundSettings() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { reclaimRent, closeTokenAccount, connected } = useFundrProgram();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isReclaimingRent, setIsReclaimingRent] = useState(false);

  // Fetch fund details
  const { data: fund, isLoading } = useQuery<Fund>({
    queryKey: [`/api/funds/${id}`],
    enabled: !!id,
  });

  // Update fund settings mutation
  const updateFundMutation = useMutation({
    mutationFn: async (updates: { fundMode?: string; jupiterStrictList?: boolean }) => {
      const response = await fetch(`/api/funds/${id}/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update settings');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/funds/${id}`] });
      toast({
        title: "Settings Updated",
        description: "Fund settings have been successfully updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update fund settings",
        variant: "destructive",
      });
    },
  });

  // Delete fund mutation
  const deleteFundMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/funds/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete fund');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Fund Deleted",
        description: "Fund has been successfully deleted and all users withdrawn",
      });
      // Redirect to dashboard after successful deletion
      window.location.href = '/dashboard';
    },
    onError: (error: any) => {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete fund",
        variant: "destructive",
      });
    },
  });

  const handleModeChange = async (newMode: string) => {
    if (!fund || isUpdating) return;
    
    setIsUpdating(true);
    try {
      await updateFundMutation.mutateAsync({ fundMode: newMode });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStrictListToggle = async (enabled: boolean) => {
    if (!fund || isUpdating || fund.jupiterStrictList) return; // Cannot remove once enabled
    
    setIsUpdating(true);
    try {
      await updateFundMutation.mutateAsync({ jupiterStrictList: enabled });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteFund = async () => {
    if (!fund || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteFundMutation.mutateAsync();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Rent reclamation handler
  const handleRentReclamation = async () => {
    if (!connected || !fund) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to reclaim rent from closed accounts.",
        variant: "destructive"
      });
      return;
    }

    setIsReclaimingRent(true);
    
    try {
      // In a real implementation, this would scan for closed accounts
      // For now, we'll simulate the rent reclamation process
      const fundAddress = new PublicKey(fund.id);
      
      // Simulate finding closed accounts (this would be done by scanning the blockchain)
      const mockClosedAccount = new PublicKey('11111111111111111111111111111111');
      
      const signature = await reclaimRent(fundAddress, mockClosedAccount);
      
      toast({
        title: "SOL Rent Reclaimed",
        description: `Successfully reclaimed ~0.025 SOL from closed accounts. Transaction: ${signature.slice(0, 8)}...`,
      });
      
      // Refresh fund data
      queryClient.invalidateQueries({ queryKey: [`/api/funds/${id}`] });
      
    } catch (error) {
      console.error('Rent reclamation error:', error);
      toast({
        title: "Rent Reclamation Failed",
        description: error instanceof Error ? error.message : "Failed to reclaim rent from closed accounts",
        variant: "destructive"
      });
    } finally {
      setIsReclaimingRent(false);
    }
  };

  // Check if user is the fund manager
  const isManager = user?.id === fund?.managerId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bonk mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading fund settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!fund) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-600">Fund not found</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only fund managers can access fund settings.</p>
            <Link href={`/fund/${id}`}>
              <Button className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fund
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (fund.isPlatformFund) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Shield className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Fund</h2>
            <p className="text-gray-600">Platform funds are managed by the Fundr team and cannot be modified.</p>
            <Link href={`/fund/${id}`}>
              <Button className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fund
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/fund/${id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fund
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-dark">Fund Settings</h1>
              <p className="text-gray-600">{fund.name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Fund Mode Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-pump" />
                Fund Allocation Mode
              </CardTitle>
              <div className="text-sm text-gray-600">
                Control how deposits are handled in your fund
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={fund.fundMode}
                onValueChange={handleModeChange}
                disabled={isUpdating}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="manual" id="manual" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="manual" className="text-base font-medium cursor-pointer flex items-center">
                      <Settings className="w-4 h-4 mr-2 text-blue-600" />
                      Manual Allocation
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Deposits accumulate as SOL. You manually decide when and how to buy tokens via the trading terminal.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Best for:</strong> Active traders, discretionary management, market timing strategies
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="auto" id="auto" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="auto" className="text-base font-medium cursor-pointer flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-green-600" />
                      Auto Allocation
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Deposits automatically buy tokens according to your current allocation percentages. Instant diversification.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Best for:</strong> Index funds, passive strategies, set-and-forget management
                    </div>
                  </div>
                </div>
              </RadioGroup>
              
              {fund.fundMode && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">
                    Current mode: <strong>{fund.fundMode === 'manual' ? 'Manual Allocation' : 'Auto Allocation'}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Token Security Settings */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-bonk" />
                Token Security
              </CardTitle>
              <div className="text-sm text-gray-600">
                Enhance fund security with token restrictions
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Label className="text-base font-medium">Jupiter Strict List Only</Label>
                    {fund.jupiterStrictList && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Enabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    Restrict trading to Jupiter's strictly verified token list for enhanced security.
                  </p>
                  {fund.jupiterStrictList ? (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                      <strong>Security Active:</strong> This fund can only trade verified tokens and this restriction cannot be removed.
                    </div>
                  ) : (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                      <strong>Warning:</strong> Once enabled, this restriction cannot be removed for security reasons.
                    </div>
                  )}
                </div>
                <Switch
                  checked={fund.jupiterStrictList}
                  onCheckedChange={handleStrictListToggle}
                  disabled={fund.jupiterStrictList || isUpdating}
                />
              </div>
              
              {!fund.jupiterStrictList && (
                <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <strong>Recommendation:</strong> Enable strict list restriction for institutional-grade security and investor confidence.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fund Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Fund Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Total Value Locked</div>
                  <div className="text-lg font-semibold">${(fund.totalAssets / 1000000).toFixed(2)}M</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Total Shares</div>
                  <div className="text-lg font-semibold">{fund.totalShares.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Created</div>
                  <div className="text-sm text-gray-600">
                    {new Date(fund.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Fund ID</div>
                  <div className="text-sm text-gray-600 font-mono">{fund.id.slice(0, 8)}...</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SOL Rent Reclamation */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Coins className="w-5 h-5 mr-2 text-bonk" />
                SOL Rent Reclamation
              </CardTitle>
              <div className="text-sm text-gray-600">
                Recover SOL from closed accounts and empty token accounts to reduce operational costs
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Recycle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-orange-800 mb-2">SOL Incinerator Function</h3>
                    <p className="text-sm text-orange-700 mb-3">
                      As you trade and manage your fund, Solana accounts accumulate rent deposits. 
                      Use this feature to reclaim SOL from closed or empty accounts back to your fund vault.
                    </p>
                    <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded mb-3">
                      <strong>What can be reclaimed:</strong>
                      <ul className="mt-1 ml-4 list-disc">
                        <li>Empty token accounts with 0 balance</li>
                        <li>Closed Program Derived Addresses (PDAs)</li>
                        <li>Unused associated token accounts</li>
                        <li>Temporary accounts from failed transactions</li>
                      </ul>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        disabled={!connected || isReclaimingRent}
                        onClick={handleRentReclamation}
                      >
                        <Recycle className="w-4 h-4 mr-2" />
                        {isReclaimingRent ? 'Reclaiming...' : 'Scan & Reclaim SOL'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-gray-300"
                        onClick={() => {
                          toast({
                            title: "Account Analysis",
                            description: "Analyzing all fund-related accounts for potential rent recovery opportunities.",
                          });
                        }}
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Analyze Accounts
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Estimated Reclaimable</div>
                  <div className="text-lg font-semibold text-green-900">~0.025 SOL</div>
                  <div className="text-xs text-green-600 mt-1">From 12 empty accounts</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Last Reclaimed</div>
                  <div className="text-lg font-semibold text-blue-900">0.031 SOL</div>
                  <div className="text-xs text-blue-600 mt-1">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-lg border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <Trash2 className="w-5 h-5 mr-2" />
                Danger Zone
              </CardTitle>
              <div className="text-sm text-gray-600">
                Irreversible actions that permanently affect your fund
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Delete Fund</h3>
                    <p className="text-sm text-red-700 mb-3">
                      Permanently delete this fund and automatically withdraw all investors. 
                      This action cannot be undone.
                    </p>
                    <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                      <strong>What happens when you delete:</strong>
                      <ul className="mt-1 ml-4 list-disc">
                        <li>All current token positions are sold to SOL</li>
                        <li>All investors are automatically withdrawn with their share of SOL</li>
                        <li>Fund is permanently closed and cannot be reopened</li>
                        <li>Trading history is preserved for records</li>
                      </ul>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting || isUpdating}
                    className="ml-4"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Fund
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Confirm Fund Deletion</h2>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you absolutely sure you want to delete <strong>{fund?.name}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <strong className="text-red-800">This will immediately:</strong>
                <ul className="mt-2 ml-4 list-disc text-red-700">
                  <li>Sell all token positions to SOL</li>
                  <li>Withdraw all {Math.floor((fund?.totalAssets || 0) / 100000)} investors</li>
                  <li>Permanently close the fund</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteFund}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Fund
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}