import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { PlusCircle } from "lucide-react";
import FundrLogo from "./fundr-logo";

export default function Header() {
  const [location] = useLocation();
  
  const handleConnectWallet = () => {
    console.log('Connect Wallet clicked');
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
            
            <Button 
              onClick={handleConnectWallet}
              className="bg-bonk hover:bg-bonk-hover text-white px-6 py-2 font-medium transition-all duration-200 transform hover:scale-105"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
