import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { PlusCircle, Info, Rocket, Loader2 } from "lucide-react";
import FundrLogo from "@/components/fundr-logo";
import { useCreateFund } from "@/hooks/use-funds";
import { useAuth } from "@/hooks/use-auth";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

export default function CreateFund() {
  const [fundName, setFundName] = useState("");
  const [description, setDescription] = useState("");
  const [profitFee, setProfitFee] = useState([2.5]);
  const [minDeposit, setMinDeposit] = useState("0.1");
  const [fundMode, setFundMode] = useState("manual");
  const [jupiterStrictList, setJupiterStrictList] = useState(false);
  
  const { user, isLoading: authLoading } = useAuth();
  const { publicKey, connected } = useWallet();
  const createFund = useCreateFund();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const isAuthenticated = !!user;

  const handleCreateFund = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a fund",
        variant: "destructive",
      });
      return;
    }

    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create a fund",
        variant: "destructive",
      });
      return;
    }

    if (!fundName.trim() || !description.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const fundData = {
        name: fundName.trim(),
        description: description.trim(),
        managementFee: 100, // 1% platform fee
        performanceFee: Math.round(profitFee[0] * 100), // Convert to basis points
        minDeposit: Math.round(parseFloat(minDeposit) * 1000000000), // Convert SOL to lamports
        fundMode: fundMode as "manual" | "auto",
        jupiterStrictList,
        publicKey: publicKey.toString(),
        managerId: user.id,
      };

      console.log('Creating fund with data:', fundData);
      const response = await createFund.mutateAsync(fundData);

      toast({
        title: "Fund Created!",
        description: `${fundName} has been successfully created`,
      });

      // Redirect to the new fund's detail page
      if (response && typeof response === 'object' && 'id' in response) {
        setLocation(`/fund/${response.id}`);
      } else {
        setLocation('/manage');
      }
    } catch (error) {
      console.error("Error creating fund:", error);
      toast({
        title: "Error",
        description: "Failed to create fund. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-dark to-darker text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Rocket className="w-12 h-12 text-pump mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">
              Prove Your <span className="text-pump">Trading Skills</span>
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Launch a fund. Attract investors. Earn when you perform.<br />
            Show the world you're the best trader on Solana.
          </p>
        </div>
      </section>
      {/* Create Fund Form */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-dark">Fund Setup</CardTitle>
                  <CardDescription>
                    Create your competitive fund and start building your trading reputation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fund-name">Fund Name</Label>
                    <Input
                      id="fund-name"
                      placeholder="e.g., Solana Alpha Fund"
                      value={fundName}
                      onChange={(e) => setFundName(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your investment strategy, experience, and what makes your fund unique..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profit-fee">
                      Profit Fee: {profitFee[0]}%
                    </Label>
                    <div className="px-2">
                      <Slider
                        id="profit-fee"
                        min={0}
                        max={20}
                        step={0.5}
                        value={profitFee}
                        onValueChange={setProfitFee}
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Fee taken only when investors make profits (0-20%)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-deposit">Minimum Deposit (SOL)</Label>
                    <Input
                      id="min-deposit"
                      type="number"
                      placeholder="0.1"
                      value={minDeposit}
                      onChange={(e) => setMinDeposit(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>

                  {/* Fund Mode Selection */}
                  <div className="space-y-3">
                    <Label>Fund Allocation Mode</Label>
                    <RadioGroup value={fundMode} onValueChange={setFundMode}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="manual" id="manual" />
                        <Label htmlFor="manual" className="cursor-pointer">
                          <div>
                            <div className="font-medium">Manual Allocation</div>
                            <div className="text-sm text-gray-600">
                              Deposits accumulate as SOL for discretionary trading
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="auto" id="auto" />
                        <Label htmlFor="auto" className="cursor-pointer">
                          <div>
                            <div className="font-medium">Auto Allocation</div>
                            <div className="text-sm text-gray-600">
                              Deposits automatically buy tokens per current ratios
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Jupiter Strict List */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="strict-list">Jupiter Strict List</Label>
                      <div className="text-sm text-gray-600">
                        Restrict trading to verified tokens only (recommended)
                      </div>
                    </div>
                    <Switch
                      id="strict-list"
                      checked={jupiterStrictList}
                      onCheckedChange={setJupiterStrictList}
                    />
                  </div>

                  <Button 
                    onClick={handleCreateFund}
                    disabled={createFund.isPending || !isAuthenticated || !connected || !fundName || !description}
                    className="w-full bg-bonk hover:bg-bonk-hover text-white py-3 font-semibold text-lg disabled:opacity-50"
                  >
                    {createFund.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Fund...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Create Fund
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-dark flex items-center">
                    <Info className="w-5 h-5 mr-2 text-pump" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-dark mb-1">1. Create Fund</h4>
                    <p className="text-gray-600">Set your fund name, strategy, and profit fee (0-20%)</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-dark mb-1">2. Receive Deposits</h4>
                    <p className="text-gray-600">Investors deposit SOL into your fund contract</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-dark mb-1">3. Allocate Capital</h4>
                    <p className="text-gray-600">Use Jupiter to swap into your chosen tokens</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-dark mb-1">4. Earn Fees</h4>
                    <p className="text-gray-600">Take profit fees only when investors gain value</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-pump/10 border-pump/20">
                <CardHeader>
                  <CardTitle className="text-lg text-dark">Trust & Safety</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-pump rounded-full mt-2"></div>
                    <p className="text-gray-700">100% noncustodial - funds stay on-chain</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-pump rounded-full mt-2"></div>
                    <p className="text-gray-700">Investors can withdraw anytime</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-pump rounded-full mt-2"></div>
                    <p className="text-gray-700">All transactions are transparent</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-pump rounded-full mt-2"></div>
                    <p className="text-gray-700">No lockups or minimum terms</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-dark">Platform Fees</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit Fee:</span>
                    <span className="font-semibold">1% (buy/burn)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Withdrawal Fee:</span>
                    <span className="font-semibold">1% (treasury)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Profit Fee:</span>
                    <span className="font-semibold text-bonk">{profitFee[0]}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Deposit fees burn $FUND tokens, withdrawal fees fund platform operations
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}