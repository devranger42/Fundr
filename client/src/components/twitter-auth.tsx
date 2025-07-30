import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Twitter, UserCheck, Link2, Unlink2, Loader2 } from "lucide-react";
import { useState } from "react";

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
      setIsLinking(true);
      await linkTwitter();
    } catch (error) {
      toast({
        title: "Twitter Linking Failed",
        description: "Please connect your wallet first and try again.",
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
        title: "Twitter Unlinked",
        description: "Your Twitter account has been disconnected.",
      });
    } catch (error) {
      toast({
        title: "Failed to Unlink",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUnlinking(false);
    }
  };

  if (isLoading) {
    return compact ? (
      <Button variant="outline" size="sm" disabled>
        <Twitter className="h-4 w-4" />
      </Button>
    ) : null;
  }

  if (compact) {
    // Compact version for header
    if (user?.twitterId) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4 text-green-500" />
            @{user.twitterUsername}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnlinkTwitter}
            disabled={isUnlinking}
          >
            <Unlink2 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleLinkTwitter}
        disabled={isLinking}
      >
        {isLinking ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Twitter className="h-4 w-4 mr-2" />
        )}
        {isLinking ? 'Linking...' : 'Connect Twitter'}
      </Button>
    );
  }

  // Full card version
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Twitter className="h-5 w-5" />
          Twitter Connection
        </CardTitle>
        <CardDescription>
          Link your Twitter account to show social proof and build trust with investors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {user?.twitterId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
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
                  className="h-10 w-10 rounded-full ml-auto"
                />
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleUnlinkTwitter}
              disabled={isUnlinking}
              className="w-full"
            >
              <Unlink2 className="h-4 w-4 mr-2" />
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