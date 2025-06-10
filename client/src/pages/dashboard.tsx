import Header from "@/components/Header";
import TradingSignals from "@/components/TradingSignals";
import PerformanceChart from "@/components/PerformanceChart";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import AdminAnalytics from "@/components/AdminAnalytics";
import LearningCenter from "@/components/LearningCenter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Target, BarChart3, Bell } from "lucide-react";
import type { TradingSignal, SignalAccuracy } from "@/types/trading";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: signals, isLoading: signalsLoading } = useQuery<TradingSignal[]>({
    queryKey: ["/api/signals"],
  });

  const { data: signalAccuracy } = useQuery<SignalAccuracy[]>({
    queryKey: ["/api/signals/accuracy"],
  });

  // Calculate overall stats
  const activeSignals = signals?.filter(s => s.status === "active").length || 0;
  const overallAccuracy = signalAccuracy?.length 
    ? signalAccuracy.reduce((acc, curr) => acc + curr.accuracy, 0) / signalAccuracy.length 
    : 0;

  // Mock additional stats for demo
  const totalProfit = 2847;
  const winRate = 87.5;
  const activePairs = 8;
  const signalsToday = 5;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Overview */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Trading Dashboard</h1>
              <p className="text-muted-foreground mt-1">AI-powered forex signals and analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Signal Accuracy</div>
                <div className="text-2xl font-bold text-secondary">
                  {overallAccuracy.toFixed(1)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Active Signals</div>
                <div className="text-2xl font-bold text-primary">{activeSignals}</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stats-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Profit</p>
                    <p className="text-2xl font-bold text-secondary">+${totalProfit.toLocaleString()}</p>
                    <p className="text-sm text-secondary">+12.4% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Win Rate</p>
                    <p className="text-2xl font-bold">{winRate}%</p>
                    <p className="text-sm text-muted-foreground">156 of 178 trades</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Active Pairs</p>
                    <p className="text-2xl font-bold">{activePairs}</p>
                    <p className="text-sm text-muted-foreground">EUR/USD, GBP/USD...</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stats-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">Signals Today</p>
                    <p className="text-2xl font-bold">{signalsToday}</p>
                    <p className="text-sm text-muted-foreground">Next at 1:00 PM</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Bell className="h-6 w-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <TradingSignals />
          </div>
          <div>
            <PerformanceChart />
          </div>
        </div>

        {/* Learning Center */}
        <LearningCenter />

        {/* Subscription Plans */}
        <SubscriptionPlans />

        {/* Admin Analytics (only for admin/enterprise users) */}
        {(user?.email?.includes('admin') || user?.subscriptionTier === 'enterprise') && (
          <AdminAnalytics />
        )}
      </div>
    </div>
  );
}
