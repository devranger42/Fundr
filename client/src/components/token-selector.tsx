import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ChevronDown, ExternalLink } from "lucide-react";

interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

interface TokenSelectorProps {
  value: string;
  onChange: (token: Token | string) => void;
  placeholder?: string;
  className?: string;
}

export function TokenSelector({ value, onChange, placeholder = "Search token or paste address", className }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Popular tokens to show first
  const popularTokens = [
    'SOL', 'USDC', 'USDT', 'BONK', 'WIF', 'POPCAT', 'JUP', 'RAY', 'ORCA', 'MNGO'
  ];

  // Load Jupiter token list
  useEffect(() => {
    const loadTokens = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://token.jup.ag/all');
        const tokenList = await response.json();
        setTokens(tokenList);
      } catch (error) {
        console.error('Failed to load token list:', error);
        // Fallback to basic Solana tokens
        setTokens([
          {
            address: 'So11111111111111111111111111111111111111112',
            symbol: 'SOL',
            name: 'Solana',
            decimals: 9,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
          },
          {
            address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            symbol: 'USDC',
            name: 'USD Coin',
            decimals: 6,
            logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadTokens();
  }, []);

  // Filter tokens based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show popular tokens first when no search
      const popular = tokens.filter(token => popularTokens.includes(token.symbol));
      const others = tokens.filter(token => !popularTokens.includes(token.symbol)).slice(0, 50);
      setFilteredTokens([...popular, ...others]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = tokens.filter(token => {
      return (
        token.symbol.toLowerCase().includes(term) ||
        token.name.toLowerCase().includes(term) ||
        token.address.toLowerCase().includes(term)
      );
    }).slice(0, 100); // Limit results

    // Sort by relevance
    filtered.sort((a, b) => {
      const aSymbolMatch = a.symbol.toLowerCase().startsWith(term);
      const bSymbolMatch = b.symbol.toLowerCase().startsWith(term);
      
      if (aSymbolMatch && !bSymbolMatch) return -1;
      if (!aSymbolMatch && bSymbolMatch) return 1;
      
      return a.symbol.localeCompare(b.symbol);
    });

    setFilteredTokens(filtered);
  }, [searchTerm, tokens]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTokenSelect = (token: Token) => {
    setSearchTerm(token.symbol);
    setIsOpen(false);
    onChange(token);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // If user is typing an address, pass it directly
    if (newValue.length > 40 && newValue.match(/^[A-Za-z0-9]+$/)) {
      onChange(newValue);
    }
  };

  const isValidAddress = (address: string) => {
    return address.length >= 32 && address.match(/^[A-Za-z0-9]+$/);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-80">
          <ScrollArea className="h-full">
            <div className="p-2">
              {loading ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  Loading tokens...
                </div>
              ) : filteredTokens.length > 0 ? (
                <div className="space-y-1">
                  {filteredTokens.map((token) => (
                    <div
                      key={token.address}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleTokenSelect(token)}
                    >
                      {token.logoURI && (
                        <img
                          src={token.logoURI}
                          alt={token.symbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{token.symbol}</span>
                          {popularTokens.includes(token.symbol) && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{token.name}</div>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {token.address.slice(0, 4)}...{token.address.slice(-4)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm && isValidAddress(searchTerm) ? (
                <div className="p-3 text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Using custom contract address
                  </div>
                  <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {searchTerm}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                    onClick={() => window.open(`https://solscan.io/token/${searchTerm}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View on Solscan
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  {searchTerm ? 'No tokens found' : 'Start typing to search'}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}