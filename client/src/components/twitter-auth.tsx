import { useState } from 'react';
import { Twitter, Unlink2, Loader2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface TwitterAuthProps {
  compact?: boolean;
}

export function TwitterAuth({ compact = false }: TwitterAuthProps) {
  const { user, linkTwitter, unlinkTwitter, isLoading } = useAuth();
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const handleLinkTwitter = async () => {
    try {
      console.log('🎯 TwitterAuth: handleLinkTwitter called');
      setIsLinking(true);
      console.log('🎯 TwitterAuth: calling linkTwitter...');
      await linkTwitter();
      console.log('🎯 TwitterAuth: linkTwitter completed');
    } catch (error) {
      console.error('🎯 TwitterAuth: linking error:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to Twitter: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkTwitter = async () => {
    try {
      setIsUnlinking(true);
      await unlinkTwitter();
      toast({
        title: "Twitter Disconnected",
        description: "Your Twitter account has been disconnected.",
      });
    } catch (error) {
      console.error('Twitter unlinking error:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect Twitter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {user?.twitterId ? (
          <div className="flex items-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-green-600">@{user.twitterUsername}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnlinkTwitter}
              disabled={isUnlinking}
            >
              <Unlink2 className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleLinkTwitter}
            disabled={isLinking}
          >
            {isLinking ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Twitter className="h-3 w-3 mr-1" />
            )}
            Twitter
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Twitter className="h-5 w-5" />
          Twitter Authentication
        </CardTitle>
        <CardDescription>
          Connect your Twitter account to show social proof and build trust with investors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user?.twitterId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <div className="font-medium text-green-800 dark:text-green-200">
                  Connected as @{user.twitterUsername}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  {user.twitterDisplayName}
                </div>
              </div>
              {user.twitterProfileImage && (
                <img 
                  src={user.twitterProfileImage} 
                  alt="Twitter Profile" 
                  className="h-10 w-10 rounded-full"
                />
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleUnlinkTwitter}
              disabled={isUnlinking}
              className="w-full"
            >
              {isUnlinking ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlink2 className="h-4 w-4 mr-2" />
              )}
              Disconnect Twitter
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <Twitter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Connect your Twitter to build trust with investors</p>
            <Button 
              onClick={handleLinkTwitter}
              disabled={isLinking}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            >
              {isLinking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Twitter className="w-4 h-4 mr-2" />
                  Connect Twitter Account
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}