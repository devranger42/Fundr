import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Shield, 
  Zap, 
  Users, 
  TrendingUp,
  Globe,
  Lock,
  Activity
} from "lucide-react";

export default function Whitepaper() {
  const handleDownload = () => {
    // In a real implementation, this would download the PDF version
    window.open('/WHITEPAPER.md', '_blank');
  };

  const sections = [
    {
      title: "Introduction",
      description: "Overview of decentralized fund management and Fundr's mission",
      icon: <Globe className="w-5 h-5" />
    },
    {
      title: "Technical Architecture", 
      description: "Smart contract design, Solana integration, and Jupiter DEX aggregation",
      icon: <Zap className="w-5 h-5" />
    },
    {
      title: "Fund Management System",
      description: "Manual/Auto allocation modes, trading terminal, and portfolio tools",
      icon: <Activity className="w-5 h-5" />
    },
    {
      title: "Platform Economics",
      description: "2/20 fee structure, revenue distribution, and economic incentives",
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      title: "Security & Risk Management",
      description: "Smart contract audits, operational security, and user protection",
      icon: <Shield className="w-5 h-5" />
    },
    {
      title: "Tokenomics",
      description: "$FUND token utility, distribution, and deflationary mechanisms",
      icon: <Lock className="w-5 h-5" />
    },
    {
      title: "Governance",
      description: "DAO structure, voting process, and community participation",
      icon: <Users className="w-5 h-5" />
    }
  ];

  const keyStats = [
    { label: "Total Token Supply", value: "1B $FUND", color: "text-pump" },
    { label: "Platform Fees", value: "2% Annual", color: "text-bonk" },
    { label: "Performance Fee Cap", value: "20% Max", color: "text-purple-600" },
    { label: "Target TPS", value: "65,000+", color: "text-blue-600" }
  ];

  const benefits = [
    {
      title: "Non-Custodial",
      description: "Maintain full control of your assets through smart contracts",
      icon: <Lock className="w-6 h-6 text-pump" />
    },
    {
      title: "Transparent",
      description: "All trades and allocations recorded on-chain for full visibility",
      icon: <Shield className="w-6 h-6 text-bonk" />
    },
    {
      title: "Professional Tools",
      description: "Institutional-grade trading terminal with Jupiter integration",
      icon: <Activity className="w-6 h-6 text-purple-600" />
    },
    {
      title: "Global Access",
      description: "Permissionless participation regardless of geography",
      icon: <Globe className="w-6 h-6 text-blue-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark to-darker text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-pump/20 text-pump border-pump/30">
              Version 1.0 • July 30, 2025
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fundr Protocol <span className="text-pump">Whitepaper</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Comprehensive documentation of Fundr's decentralized fund management protocol, 
              technical architecture, and economic model built on Solana.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleDownload}
                className="bg-pump hover:bg-pump-hover text-white"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Whitepaper
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-dark"
                onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <FileText className="w-5 h-5 mr-2" />
                Read Online
              </Button>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {keyStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark mb-4">Protocol Overview</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Fundr revolutionizes cryptocurrency fund management by combining DeFi transparency 
              with professional-grade portfolio management tools on Solana.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-dark mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </Card>
            ))}
          </div>

          {/* Abstract */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-6 h-6 mr-2 text-pump" />
                Abstract
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Fundr is a decentralized, non-custodial fund management protocol built on Solana that 
                democratizes access to professional cryptocurrency portfolio management. The platform enables 
                anyone to create investment funds or invest in manager-operated funds while maintaining complete 
                transparency and blockchain-based security. Through integration with Jupiter's DEX aggregator 
                and automated rebalancing mechanisms, Fundr provides institutional-grade fund management tools 
                for the decentralized finance ecosystem.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark mb-8 text-center">Document Structure</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {sections.map((section, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                      {section.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-dark mb-2">
                        {index + 1}. {section.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{section.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-dark mb-8 text-center">Key Innovations</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-pump">
                  <Zap className="w-6 h-6 mr-2" />
                  Advanced Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Smart Contracts</span>
                  <span className="font-medium">Anchor Framework</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DEX Integration</span>
                  <span className="font-medium">Jupiter Aggregator</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Speed</span>
                  <span className="font-medium">Sub-second Settlement</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gas Costs</span>
                  <span className="font-medium">Sub-penny Fees</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-bonk">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  Economic Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Management Fee</span>
                  <span className="font-medium">2% Annual Equivalent</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Performance Fee</span>
                  <span className="font-medium">0-20% on Profits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee Distribution</span>
                  <span className="font-medium">50% Token Burn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Governance Token</span>
                  <span className="font-medium">$FUND Utility</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-600">
                  <Shield className="w-6 h-6 mr-2" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Asset Custody</span>
                  <span className="font-medium">Non-Custodial</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Smart Contract Audits</span>
                  <span className="font-medium">Multi-Stage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Token Verification</span>
                  <span className="font-medium">Jupiter Strict List</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Controls</span>
                  <span className="font-medium">Circuit Breakers</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pump/10 to-bonk/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-dark mb-4">Ready to Explore Fundr?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the future of decentralized fund management with professional-grade tools 
            and complete transparency.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleDownload}
              className="bg-pump hover:bg-pump-hover text-white"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Full Whitepaper
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