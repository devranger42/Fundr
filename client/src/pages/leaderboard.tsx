import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import FundrLogo from "@/components/fundr-logo";

const leaderboardData: any[] = [];

export default function Leaderboard() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark to-darker text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              The Leaderboard <span className="text-pump">Never Lies</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Ranked by real, realized performance. The top spot is earned — not bought, not botted.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-pump">$0</div>
              <div className="text-gray-400">Best Fund AUM</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-bonk">0</div>
              <div className="text-gray-400">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">0</div>
              <div className="text-gray-400">Total Investors</div>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/create-fund">
              <Button className="bg-bonk hover:bg-bonk-hover text-white px-8 py-3 text-lg font-semibold">
                Claim Your Spot
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Leaderboard Table */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 bg-dark border-b border-gray-200">
              <h2 className="text-2xl font-bold text-white">Top Fund Managers</h2>
              <p className="text-gray-300">Ranked by 30-day performance</p>
            </div>
            
            {leaderboardData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Rank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Manager</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">30D ROI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">AUM</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Investors</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Win Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaderboardData.map((fund) => (
                      <tr key={fund.rank} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getRankIcon(fund.rank)}
                            <Badge className={`${getRankBadgeColor(fund.rank)} text-xs px-2 py-1`}>
                              #{fund.rank}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                              <span>{fund.manager}</span>
                              {fund.displayName && (
                                <span className="text-gray-500 ml-1 font-normal">({fund.displayName})</span>
                              )}
                              {fund.isSample && (
                                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                  Sample
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{fund.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4 text-pump" />
                            <span className="text-lg font-bold text-pump">{fund.roi}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fund.aum}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {fund.investors}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {fund.fee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className="text-xs">
                            {fund.winRate}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link href={`/fund/${fund.manager.replace('@', '')}`}>
                            <Button 
                              size="sm"
                              className="bg-bonk hover:bg-bonk-hover text-white"
                            >
                              View Fund
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No funds to rank yet</h3>
                <p className="text-gray-600 mb-6">Create a fund to start building your track record</p>
                <Link href="/create-fund">
                  <Button className="bg-bonk hover:bg-bonk-hover">
                    Create First Fund
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}