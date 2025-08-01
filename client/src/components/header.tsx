import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { PlusCircle, LogOut } from "lucide-react";
import FundrLogo from "./fundr-logo";
import WalletModal from "./wallet-modal";
import { TwitterAuth } from "./twitter-auth";
import { useWallet } from "@/lib/wallet-provider";
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
              <div className="cursor-pointer hover:opacity-80 transition-opacity flex items-center space-x-2">
                <FundrLogo size="sm" />
                <span className="font-bold text-xl text-gray-900">Fundr</span>
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link 
              href="/"
              className={`font-medium text-sm transition-colors duration-200 ${
                isActive('/') ? 'text-bonk' : 'text-gray-700 hover:text-bonk'
              }`}
            >
              Explore
            </Link>
            <Link 
              href="/leaderboard"
              className={`font-medium text-sm transition-colors duration-200 ${
                isActive('/leaderboard') ? 'text-bonk' : 'text-gray-700 hover:text-bonk'
              }`}
            >
              Leaderboard
            </Link>

            <Link 
              href="/manager-dashboard"
              className={`font-medium text-sm transition-colors duration-200 ${
                isActive('/manager-dashboard') ? 'text-bonk' : 'text-gray-700 hover:text-bonk'
              }`}
            >
              Manage
            </Link>
            <Link 
              href="/whitepaper"
              className={`font-medium text-sm transition-colors duration-200 ${
                isActive('/whitepaper') ? 'text-bonk' : 'text-gray-700 hover:text-bonk'
              }`}
            >
              Docs
            </Link>
          </nav>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Link href="/create-fund-blockchain">
              <Button 
                variant="outline"
                size="sm"
                className="border-bonk text-bonk hover:bg-bonk hover:text-white hidden sm:flex items-center text-xs"
              >
                <PlusCircle className="w-3 h-3 mr-1" />
                Create
              </Button>
            </Link>
            
            {connected ? (
              <div className="flex items-center space-x-2">
                <TwitterAuth compact />
                <div className="text-xs">
                  <div className="font-medium text-gray-900">
                    {publicKey && formatPublicKey(publicKey.toString())}
                  </div>
                </div>
                <Button 
                  onClick={disconnect}
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 px-2"
                >
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <Button 
                onClick={handleConnectWallet}
                size="sm"
                className="bg-bonk hover:bg-bonk-hover text-white font-medium text-xs"
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
