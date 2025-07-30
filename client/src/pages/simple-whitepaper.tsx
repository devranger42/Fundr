import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, ExternalLink, FileText } from "lucide-react";

export default function SimpleWhitepaper() {
  const handleDownload = () => {
    // Create a simple text version for download
    const content = `
FUNDR PROTOCOL OVERVIEW
Version 1.0 • July 30, 2025

WHAT IS FUNDR?
Fundr is a decentralized platform on Solana where anyone can create or invest in cryptocurrency funds. Fund managers can trade tokens using Jupiter swaps, while investors can deposit SOL and withdraw anytime.

HOW IT WORKS
1. Create Fund: Anyone can become a fund manager and create a fund
2. Deposit SOL: Investors deposit SOL into funds they want to invest in
3. Manager Trades: Fund managers use Jupiter integration to swap tokens
4. Withdraw Anytime: Investors can withdraw their share anytime as SOL

FUND MODES
Manual Allocation: Deposits stay as SOL, managers trade manually
Auto Allocation: Deposits automatically buy tokens per current allocations
Both modes: Withdrawals sell tokens proportionally and return SOL

FEES
Platform: 1% on deposits + 1% on withdrawals (applies to all funds)
Manager Performance: 0-20% on profits only (varies by fund)
Platform Index Funds: No manager performance fees (0%)

FUND TYPES
User Funds: Created by any user, manager sets strategy
Platform Index Funds: Managed by Fundr, automated rebalancing, no manager fees (Coming Soon)

TECHNOLOGY
Built on Solana blockchain
Smart contracts using Anchor framework
Jupiter integration for token swaps
Non-custodial - users control their funds
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fundr-overview.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark to-darker text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-pump/20 text-pump border-pump/30">
              Version 1.0 • July 30, 2025
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fundr Protocol <span className="text-pump">Overview</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Simple decentralized fund management on Solana
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleDownload}
                className="bg-pump hover:bg-pump-hover text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Overview
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-dark"
                onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <FileText className="w-5 h-5 mr-2" />
                Read Below
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="overview" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* What is Fundr */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What is Fundr?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Fundr is a decentralized platform on Solana where anyone can create or invest in cryptocurrency funds. 
                Fund managers can trade tokens using Jupiter swaps, while investors can deposit SOL and withdraw anytime.
              </p>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How it Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li><strong>Create Fund:</strong> Anyone can become a fund manager and create a fund</li>
                <li><strong>Deposit SOL:</strong> Investors deposit SOL into funds they want to invest in</li>
                <li><strong>Manager Trades:</strong> Fund managers use Jupiter integration to swap tokens</li>
                <li><strong>Withdraw Anytime:</strong> Investors can withdraw their share anytime as SOL</li>
              </ol>
            </CardContent>
          </Card>

          {/* Fund Modes */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Fund Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Manual Allocation</h4>
                  <p className="text-sm text-gray-700">Deposits stay as SOL, managers trade manually</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Auto Allocation</h4>
                  <p className="text-sm text-gray-700">Deposits automatically buy tokens per current allocations</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <strong>Both modes:</strong> Withdrawals sell tokens proportionally and return SOL
              </p>
            </CardContent>
          </Card>

          {/* Fees */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li><strong>Platform:</strong> 1% on deposits + 1% on withdrawals</li>
                <li><strong>Manager Performance:</strong> 0-20% on profits only (varies by fund)</li>
                <li><strong>Platform Index Funds:</strong> 0% fees</li>
              </ul>
            </CardContent>
          </Card>

          {/* Fund Types */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Fund Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">User Funds</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Created by any user</li>
                    <li>• Manager sets strategy</li>
                    <li>• Performance fees: 0-20%</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Platform Index Funds</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Managed by Fundr</li>
                    <li>• Automated rebalancing</li>
                    <li>• No manager fees (0%)</li>
                    <li>• Platform fees still apply</li>
                    <li>• <span className="text-yellow-600 font-medium">Coming Soon</span></li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li>• Built on Solana blockchain</li>
                <li>• Smart contracts using Anchor framework</li>
                <li>• Jupiter integration for token swaps</li>
                <li>• Non-custodial - users control their funds</li>
              </ul>
            </CardContent>
          </Card>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pump/10 to-bonk/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Explore Fundr?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Simple, transparent fund management on Solana
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleDownload}
              className="bg-pump hover:bg-pump-hover text-white"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Overview
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Explore Platform
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}