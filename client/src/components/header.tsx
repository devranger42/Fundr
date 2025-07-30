import { Button } from "@/components/ui/button";

export default function Header() {
  const handleConnectWallet = () => {
    console.log('Connect Wallet clicked');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-dark">Fundr</h1>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#" 
              className="text-gray-700 hover:text-bonk transition-colors duration-200 font-medium"
            >
              Leaderboard
            </a>
          </nav>
          
          {/* Connect Wallet Button */}
          <Button 
            onClick={handleConnectWallet}
            className="bg-bonk hover:bg-bonk-hover text-white px-6 py-2 font-medium transition-all duration-200 transform hover:scale-105"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}
