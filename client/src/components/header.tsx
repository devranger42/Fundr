import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { PlusCircle, LogOut } from "lucide-react";
import FundrLogo from "./fundr-logo";
import WalletModal from "./wallet-modal";
import { TwitterAuth } from "./twitter-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const { connected, publicKey, disconnect } = useWallet();
  const { user } = useAuth();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  
  const handleConnectWallet = () => {
    setWalletModalOpen(true);
  };

  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <FundrLogo size="md" />
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/"
              className={`font-medium transition-colors duration-200 ${
                isActive('/') ? 'text-bonk' : 'text-gray-700 hover:text-bonk'
              }`}
            >
              Funds
            </Link>
            <Link 
              href="/leaderboard"
              className={`font-medium transition-colors duration-200 ${
                isActive('/leaderboard') ? 'text-bonk' : 'text-gray-700 hover:text-bonk'
              }`}
            >
              Leaderboard
            </Link>
            <Link 
              href="/create-fund"
              className={`font-medium transition-colors duration-200 ${
                isActive('/create-fund') ? 'text-bonk' : 'text-gray-700 hover:text-bonk'
              }`}
            >
              Create Fund
            </Link>
            <Link 
              href="/profile"
              className={`font-medium transition-colors duration-200 ${
                isActive('/profile') ? 'text-bonk' : 'text-gray-700 hover:text-bonk'
              }`}
            >
              Profile
            </Link>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/create-fund">
              <Button 
                variant="outline"
                className="border-bonk text-bonk hover:bg-bonk hover:text-white hidden sm:flex items-center"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Fund
              </Button>
            </Link>
            
            {/* Twitter Auth - compact mode */}
            {connected && <TwitterAuth compact />}
            
            {connected ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {publicKey && formatPublicKey(publicKey)}
                  </div>
                  <div className="text-gray-500">
                    Connected {user?.twitterUsername && `• @${user.twitterUsername}`}
                  </div>
                </div>
                <Button 
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleConnectWallet}
                className="bg-bonk hover:bg-bonk-hover text-white px-6 py-2 font-medium transition-all duration-200 transform hover:scale-105"
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <WalletModal 
        open={walletModalOpen} 
        onClose={() => setWalletModalOpen(false)} 
      />
    </header>
  );
}
