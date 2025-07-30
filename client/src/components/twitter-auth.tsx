import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Twitter, UserCheck, Link2, Unlink2, Loader2, Edit3, CheckCircle } from "lucide-react";
import { useState } from "react";

interface TwitterAuthProps {
  compact?: boolean;
}

export function TwitterAuth({ compact = false }: TwitterAuthProps) {
  const { user, linkTwitterManually, unlinkTwitter, isLoading } = useAuth();
  const { toast } = useToast();
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [twitterHandle, setTwitterHandle] = useState("");

  const handleLinkTwitter = async () => {
    if (!twitterHandle.trim()) {
      toast({
        title: "Handle Required",
        description: "Please enter your Twitter handle.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLinking(true);
      await linkTwitterManually(twitterHandle.trim().replace('@', ''));
      toast({
        title: "Twitter Handle Added",
        description: "Your Twitter handle has been linked to your account.",
      });
      setIsEditing(false);
      setTwitterHandle("");
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
    if (user?.twitterUsername) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Twitter className="h-4 w-4 text-blue-500" />
            @{user.twitterUsername}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isUnlinking}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            placeholder="@username"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            className="w-24"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLinkTwitter();
              } else if (e.key === 'Escape') {
                setIsEditing(false);
                setTwitterHandle("");
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleLinkTwitter}
            disabled={isLinking}
          >
            {isLinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          </Button>
        </div>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
        disabled={isLinking}
      >
        <Twitter className="h-4 w-4 mr-2" />
        Add Twitter
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
        {user?.twitterUsername ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <Twitter className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <div className="font-medium text-blue-800 dark:text-blue-200">
                  @{user.twitterUsername}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Twitter handle linked for social proof
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
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
              Remove Twitter Handle
            </Button>
          </div>
        ) : isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter-handle">Twitter Handle</Label>
              <Input
                id="twitter-handle"
                placeholder="@username"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLinkTwitter();
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                    setTwitterHandle("");
                  }
                }}
              />
              <p className="text-sm text-muted-foreground">
                Enter your Twitter handle to display social proof to potential investors.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleLinkTwitter}
                disabled={isLinking || !twitterHandle.trim()}
                className="flex-1"
              >
                {isLinking ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Add Handle
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setTwitterHandle("");
                }}
                disabled={isLinking}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Twitter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Add your Twitter handle to build trust with investors</p>
            <Button 
              onClick={() => setIsEditing(true)}
              disabled={isLinking}
              className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Add Twitter Handle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}