import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/hooks/use-wallet";
import { AuthProvider } from "@/hooks/use-auth";
import { DebugPanel } from "@/components/debug-panel";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home.tsx";
import Leaderboard from "@/pages/leaderboard";
import CreateFund from "@/pages/create-fund";
import CreateFundBlockchain from "@/pages/create-fund-blockchain";
import FundDetail from "@/pages/fund-detail";
import Profile from "@/pages/profile";
import TradingTerminal from "@/pages/trading-terminal";
import ManagerDashboard from "@/pages/manager-dashboard";
import InvestorDashboard from "@/pages/investor-dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/create-fund" component={CreateFund} />
      <Route path="/create-fund-blockchain" component={CreateFundBlockchain} />
      <Route path="/fund/:id" component={FundDetail} />
      <Route path="/fund/:id/trading" component={TradingTerminal} />
      <Route path="/manager-dashboard" component={ManagerDashboard} />
      <Route path="/investor-dashboard" component={InvestorDashboard} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <DebugPanel />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
