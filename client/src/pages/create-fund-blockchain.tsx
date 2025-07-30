import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Trash2,
  DollarSign,
  Target,
  Settings,
  Cog
} from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import { useFundrProgram } from "@/hooks/use-fundr-program";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AllocationTarget {
  id: string;
  tokenSymbol: string;
  targetPercentage: number;
}

export default function CreateFundBlockchain() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { createFund, connected } = useFundrProgram();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    managementFee: 1,    // 1%
    performanceFee: 20,  // 20%
    minDeposit: 1,       // 1 SOL
    fundMode: "manual"   // manual or auto
  });
  
  const [allocations, setAllocations] = useState<AllocationTarget[]>([
    { id: "1", tokenSymbol: "SOL", targetPercentage: 50 },
    { id: "2", tokenSymbol: "USDC", targetPercentage: 30 },
    { id: "3", tokenSymbol: "BONK", targetPercentage: 20 }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPercentage = allocations.reduce((sum, alloc) => sum + alloc.targetPercentage, 0);
  const isValidAllocation = totalPercentage === 100;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAllocation = () => {
    const newId = (allocations.length + 1).toString();
    setAllocations(prev => [
      ...prev,
      { id: newId, tokenSymbol: "", targetPercentage: 0 }
    ]);
  };

  const removeAllocation = (id: string) => {
    if (allocations.length > 1) {
      setAllocations(prev => prev.filter(alloc => alloc.id !== id));
    }
  };

  const updateAllocation = (id: string, field: string, value: string | number) => {
    setAllocations(prev =>
      prev.map(alloc =>
        alloc.id === id ? { ...alloc, [field]: value } : alloc
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a fund",
        variant: "destructive",
      });
      return;
    }

    if (!isValidAllocation) {
      toast({
        title: "Invalid Allocation",
        description: "Total allocation must equal 100%",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create fund on blockchain
      const result = await createFund(
        formData.name,
        formData.description,
        formData.managementFee * 100, // Convert to basis points
        formData.performanceFee * 100, // Convert to basis points
        formData.minDeposit,
        formData.fundMode
      );

      console.log('Fund creation result:', result);

      // Step 2: Save fund to database
      const fundData = {
        publicKey: result.fundAddress.toString(),
        managerId: user?.id || '', // Use the current user's ID
        name: formData.name,
        description: formData.description,
        managementFee: formData.managementFee * 100, // Convert to basis points for database
        fundMode: formData.fundMode,
        totalAssets: 0,
        totalShares: 0,
        isActive: true
      };

      // Save to database via API
      const response = await fetch('/api/funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fundData),
      });

      if (!response.ok) {
        throw new Error('Failed to save fund to database');
      }

      const savedFund = await response.json();
      console.log('Fund saved to database:', savedFund);

      toast({
        title: "Fund Created Successfully!",
        description: `Fund "${formData.name}" has been deployed to the blockchain and saved`,
      });
      
      // Redirect to manager dashboard
      setLocation('/manager-dashboard');
    } catch (error: any) {
      console.error('Fund creation failed:', error);
      toast({
        title: "Fund Creation Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-dark mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please connect your wallet to create a fund.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark mb-2">Create Fund on Blockchain</h1>
          <p className="text-gray-600">Deploy your fund smart contract to Solana devnet</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-bonk" />
                Fund Information
              </CardTitle>
              <CardDescription>
                Basic details about your fund
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Fund Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., DeFi Alpha Fund"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="minDeposit">Minimum Deposit (SOL)</Label>
                  <Input
                    id="minDeposit"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.minDeposit}
                    onChange={(e) => handleInputChange('minDeposit', parseFloat(e.target.value))}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your investment strategy and approach"
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Fee Structure */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-pump" />
                Fee Structure
              </CardTitle>
              <CardDescription>
                Set your management and performance fees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Management Fee: {formData.managementFee}% annually</Label>
                  <div className="mt-2">
                    <Slider
                      value={[formData.managementFee]}
                      onValueChange={(value) => handleInputChange('managementFee', value[0])}
                      max={5}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Charged on total assets under management
                  </p>
                </div>
                
                <div>
                  <Label>Performance Fee: {formData.performanceFee}%</Label>
                  <div className="mt-2">
                    <Slider
                      value={[formData.performanceFee]}
                      onValueChange={(value) => handleInputChange('performanceFee', value[0])}
                      max={30}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Charged only on profits above high water mark
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fund Mode Selection */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cog className="w-5 h-5 mr-2 text-pump" />
                Fund Mode
              </CardTitle>
              <CardDescription>
                Choose how deposits and withdrawals are handled
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={formData.fundMode}
                onValueChange={(value) => handleInputChange('fundMode', value)}
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="manual" id="manual" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="manual" className="text-base font-medium cursor-pointer">
                      Manual Allocation Mode
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      All deposits accumulate as SOL. You manually allocate tokens using the trading terminal. 
                      Withdrawals require sufficient SOL balance in the fund.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Best for:</strong> Active trading, discretionary strategies, hands-on management
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="auto" id="auto" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="auto" className="text-base font-medium cursor-pointer">
                      Auto Allocation Mode
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Deposits automatically buy tokens matching current allocation. Withdrawals automatically 
                      sell tokens proportionally and return SOL.
                    </p>
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Best for:</strong> Index funds, passive strategies, set-and-forget management
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Allocation Strategy */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-bonk" />
                  Target Allocation
                </div>
                <Badge variant={isValidAllocation ? "default" : "destructive"}>
                  Total: {totalPercentage}%
                </Badge>
              </CardTitle>
              <CardDescription>
                Define your initial token allocation strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {allocations.map((allocation) => (
                <div key={allocation.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder="Token Symbol (e.g., SOL)"
                      value={allocation.tokenSymbol}
                      onChange={(e) => updateAllocation(allocation.id, 'tokenSymbol', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={allocation.targetPercentage}
                        onChange={(e) => updateAllocation(allocation.id, 'targetPercentage', parseInt(e.target.value) || 0)}
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeAllocation(allocation.id)}
                    disabled={allocations.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addAllocation}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Token
              </Button>
              
              {!isValidAllocation && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Total allocation must equal 100%</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-between items-center pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/manager-dashboard')}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !isValidAllocation || !connected}
              className="bg-bonk hover:bg-bonk-hover text-white px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying to Blockchain...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Fund on Blockchain
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}