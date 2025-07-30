import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './use-wallet';

interface AuthUser {
  id: string;
  walletAddress?: string | null;
  twitterId?: string | null;
  twitterUsername?: string | null;
  twitterDisplayName?: string | null;
  twitterProfileImage?: string | null;
  displayName?: string | null;
  email?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  linkTwitter: () => Promise<void>;
  unlinkTwitter: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { connected, publicKey } = useWallet();

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      
      if (connected && publicKey) {
        // Create or get user based on wallet
        const response = await fetch('/api/auth/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: publicKey })
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } else {
        // Check if user is logged in via Twitter
        const response = await fetch('/api/auth/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const linkTwitter = async () => {
    console.log('🔗 linkTwitter called', { connected, publicKey });
    
    if (!connected || !publicKey) {
      console.log('❌ Wallet not connected');
      throw new Error('Wallet must be connected to link Twitter');
    }

    try {
      console.log('📡 Making link-twitter request...');
      const response = await fetch('/api/auth/link-twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey })
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Response data:', data);
        const { redirectUrl } = data;
        console.log('🔄 Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error('Failed to initiate Twitter linking');
      }
    } catch (error) {
      console.error('Twitter linking failed:', error);
      throw error;
    }
  };



  const unlinkTwitter = async () => {
    try {
      const response = await fetch('/api/auth/unlink-twitter', {
        method: 'POST'
      });

      if (response.ok) {
        await fetchUser(); // Refresh user data
      } else {
        throw new Error('Failed to unlink Twitter');
      }
    } catch (error) {
      console.error('Twitter unlinking failed:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  // Fetch user when wallet connection changes
  useEffect(() => {
    fetchUser();
  }, [connected, publicKey]);

  // Check for Twitter auth callback parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('twitter') === 'linked') {
      // Remove the parameter from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('twitter');
      window.history.replaceState({}, '', newUrl.toString());
      
      // Refresh user data to show updated Twitter info
      setTimeout(() => fetchUser(), 500);
    }
  }, []);

  const value = {
    user,
    isLoading,
    linkTwitter,
    unlinkTwitter,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}