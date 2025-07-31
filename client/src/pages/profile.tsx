import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TwitterAuth } from "@/components/twitter-auth";
import { Button } from "@/components/ui/button";
import { Wallet, User, Settings, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import Header from "@/components/header";

export default function Profile() {
  const { user, isLoading, refreshUser } = useAuth();
  const { connected, publicKey, disconnect } = useWallet();
  const { toast } = useToast();

  // Handle Twitter authentication success/error from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const twitterStatus = urlParams.get('twitter');
    
    if (twitterStatus === 'success') {
      toast({
        title: "Twitter Connected!",
        description: "Your Twitter account has been successfully linked to your profile.",
        variant: "default",
      });
      // Refresh user data to show updated connection
      refreshUser();
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (twitterStatus === 'error') {
      const reason = urlParams.get('reason') || 'unknown';
      toast({
        title: "Twitter Connection Failed",
        description: `Failed to connect Twitter: ${reason}. Please try again.`,
        variant: "destructive",
      });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, refreshUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bonk mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your wallet and social connections</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Wallet Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Connection
              </CardTitle>
              <CardDescription>
                Your Solana wallet for fund deposits and withdrawals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connected && publicKey ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-800 dark:text-green-200">
                          Connected
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400 font-mono">
                          {formatPublicKey(publicKey)}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={disconnect}
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No wallet connected</p>
                  <Button className="bg-bonk hover:bg-bonk-hover text-white">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Twitter Authentication */}
          <TwitterAuth />

          {/* User Information */}
          {user && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your account details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-600">User ID</label>
                    <p className="text-gray-900 font-mono text-sm">{user.id}</p>
                  </div>
                  
                  {user.displayName && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Display Name</label>
                      <p className="text-gray-900">{user.displayName}</p>
                    </div>
                  )}

                  {user.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  )}

                  {user.walletAddress && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Wallet Address</label>
                      <p className="text-gray-900 font-mono text-sm">{user.walletAddress}</p>
                    </div>
                  )}

                  {user.twitterUsername && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Twitter</label>
                      <p className="text-gray-900">@{user.twitterUsername}</p>
                    </div>
                  )}

                  {user.createdAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Member Since</label>
                      <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connection Status Summary */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Connection Status
              </CardTitle>
              <CardDescription>
                Overview of your authentication and connection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge 
                  variant={connected ? "default" : "secondary"}
                  className={connected ? "bg-green-500" : "bg-gray-400"}
                >
                  Wallet: {connected ? "Connected" : "Disconnected"}
                </Badge>
                <Badge 
                  variant={user?.twitterId ? "default" : "secondary"}
                  className={user?.twitterId ? "bg-blue-500" : "bg-gray-400"}
                >
                  Twitter: {user?.twitterId ? "Linked" : "Not Linked"}
                </Badge>
                <Badge 
                  variant={connected && user?.twitterId ? "default" : "secondary"}
                  className={connected && user?.twitterId ? "bg-bonk" : "bg-gray-400"}
                >
                  Full Profile: {connected && user?.twitterId ? "Complete" : "Incomplete"}
                </Badge>
              </div>
              
              {(!connected || !user?.twitterId) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Tip:</strong> Connect both your wallet and Twitter for the best experience and increased trust from potential investors.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}