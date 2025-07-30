import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";

interface FeeCalculatorProps {
  managerFee: number;
}

export default function FeeCalculator({ managerFee }: FeeCalculatorProps) {
  const [depositAmount, setDepositAmount] = useState("10");
  const [finalValue, setFinalValue] = useState("14");

  const deposit = parseFloat(depositAmount) || 0;
  const final = parseFloat(finalValue) || 0;
  
  // Deposit calculations
  const depositFee = deposit * 0.01; // 1% burns $FUND
  const amountIntoFund = deposit - depositFee;
  
  // Withdrawal calculations (only if profitable)
  const profit = Math.max(0, final - deposit);
  const isProfit = profit > 0;
  const withdrawalFee = final * 0.01; // 1% to treasury
  const managerPerformanceFee = isProfit ? profit * (managerFee / 100) : 0;
  const userReceives = final - withdrawalFee - managerPerformanceFee;
  const totalReturn = userReceives - deposit;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-dark flex items-center">
          <Calculator className="w-5 h-5 mr-2 text-bonk" />
          Fee Calculator
        </CardTitle>
        <CardDescription>
          See exactly how fees work with your investment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deposit-calc">Deposit Amount (SOL)</Label>
            <Input
              id="deposit-calc"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="final-calc">Final Value (SOL)</Label>
            <Input
              id="final-calc"
              type="number"
              value={finalValue}
              onChange={(e) => setFinalValue(e.target.value)}
              className="border-gray-300"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-dark">Deposit Flow:</h4>
          <div className="flex items-center justify-between text-sm">
            <span>Initial Deposit:</span>
            <span className="font-bold">{deposit.toFixed(2)} SOL</span>
          </div>
          <div className="flex items-center justify-between text-sm text-red-600">
            <span>- Deposit Fee (burns $FUND):</span>
            <span className="font-bold">-{depositFee.toFixed(3)} SOL</span>
          </div>
          <div className="flex items-center justify-between text-sm border-t pt-2">
            <span className="text-pump font-medium">Amount Into Fund:</span>
            <span className="font-bold text-pump">{amountIntoFund.toFixed(3)} SOL</span>
          </div>
        </div>

        <div className="flex items-center justify-center py-2">
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <span className="mx-2 text-sm text-gray-500">Fund grows over time</span>
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-dark">Withdrawal Flow:</h4>
          <div className="flex items-center justify-between text-sm">
            <span>Fund Value:</span>
            <span className="font-bold">{final.toFixed(2)} SOL</span>
          </div>
          {isProfit && (
            <div className="flex items-center justify-between text-sm text-pump">
              <span>Profit Made:</span>
              <span className="font-bold">+{profit.toFixed(2)} SOL</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-red-600">
            <span>- Withdrawal Fee (to treasury):</span>
            <span className="font-bold">-{withdrawalFee.toFixed(3)} SOL</span>
          </div>
          {managerPerformanceFee > 0 && (
            <div className="flex items-center justify-between text-sm text-orange-600">
              <span>- Manager Fee ({managerFee}% of profit):</span>
              <span className="font-bold">-{managerPerformanceFee.toFixed(3)} SOL</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm border-t pt-2">
            <span className="text-pump font-medium">You Receive:</span>
            <span className="font-bold text-pump">{userReceives.toFixed(3)} SOL</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className={`font-medium ${totalReturn >= 0 ? 'text-pump' : 'text-red-600'}`}>
              Net Profit/Loss:
            </span>
            <span className={`font-bold ${totalReturn >= 0 ? 'text-pump' : 'text-red-600'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(3)} SOL
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}