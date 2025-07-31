import Header from "@/components/header";
import FundCard from "@/components/fund-card";
import { Button } from "@/components/ui/button";
import FundrLogo from "@/components/fundr-logo";
import { useFunds } from "@/hooks/use-funds";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

const mockFunds: any[] = [];

export default function Home() {
  const { data: funds, isLoading, error } = useFunds();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <FundrLogo size="lg" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-white drop-shadow-lg">Prove You're the Best</span>
            <br />
            <span className="text-pump drop-shadow-lg">Trader On-Chain</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Launch a fund. Grow your following. Rise to the top.<br />
            It's not copy-trading — it's co-trading.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/create-fund">
              <Button className="bg-bonk hover:bg-bonk-hover text-white px-8 py-3 text-lg font-semibold">
                Create a Fund
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="outline" className="border-pump text-pump hover:bg-pump hover:text-black px-8 py-3 text-lg font-semibold">
                Explore Funds
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-pump">$0</div>
              <div className="text-gray-400">TVL</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-bonk">{funds?.length || 0}</div>
              <div className="text-gray-400">Active Funds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-gray-400">Unique Investors</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-bonk rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Create a Fund</h3>
              <p className="text-gray-600">Deploy a smart contract. Choose your strategy. Set your fees.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pump rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-black font-bold text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Attract Investors</h3>
              <p className="text-gray-600">Your performance is public and on-chain. Anyone can join your trades.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Earn When You Perform</h3>
              <p className="text-gray-600">Only profitable withdrawals trigger fees. You win when they win.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Co-Trading Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Not Copy-Trading. Co-Trading.</h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 leading-relaxed">
                Forget copy-pasting wallets. Fundr lets traders and investors move together — same assets, same timing, same execution.<br />
                <span className="font-semibold">No exit liquidity. No hidden trades.</span><br />
                Just transparent, on-chain alignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">The Leaderboard Never Lies</h2>
            <div className="max-w-3xl mx-auto mb-8">
              <p className="text-xl text-gray-700 leading-relaxed">
                Every fund is ranked by real, realized performance.<br />
                The top spot is earned — not bought, not botted.<br />
                <span className="font-semibold text-bonk">Compete to be the best trader on Solana.</span>
              </p>
            </div>
            <Link href="/leaderboard">
              <Button className="bg-pump hover:bg-pump-hover text-black px-8 py-3 text-lg font-semibold">
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Funds */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Active Funds</h2>
            <p className="text-gray-600 text-lg">Discover funds managed by experienced traders on Solana</p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-bonk" />
              <span className="ml-2 text-gray-600">Loading funds...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-gray-600 mb-4">Unable to load funds at the moment</p>
              <p className="text-sm text-gray-500">Please try again later</p>
            </div>
          ) : funds && funds.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {funds.map((fund) => (
                <FundCard key={fund.id} fund={fund} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No funds available</h3>
              <p className="text-gray-600 mb-6">Be the first to create a fund on Fundr!</p>
              <Link href="/create-fund">
                <Button className="bg-bonk hover:bg-bonk-hover">
                  Create First Fund
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="mb-4">
                <FundrLogo size="lg" />
              </div>
              <p className="text-gray-400 mb-4">
                Competitive on-chain fund management on Solana. 
                Prove your trading skills. Build your following. Rise to the top.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com/fundr_protocol" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-bonk transition-colors" title="Follow us on Twitter">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://discord.gg/fundr" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-bonk transition-colors" title="Join our Discord">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                  </svg>
                </a>
                <a href="https://t.me/fundr_protocol" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-bonk transition-colors" title="Join our Telegram">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/create-fund" className="hover:text-white transition-colors">Create Fund</Link></li>
                <li><Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Explore</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://docs.fundr.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Docs</a></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Fundr. All rights reserved. Built on Solana.</p>
            <p className="text-sm mt-2">Not financial advice. For entertainment purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
