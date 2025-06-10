import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, TrendingUp, Users, Target, DollarSign, BarChart3 } from "lucide-react";
import Header from "@/components/Header";
import type { Analytics, SignalAccuracy } from "@/types/trading";

export default function Analytics() {
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: signalAccuracy } = useQuery<SignalAccuracy[]>({
    queryKey: ["/api/signals/accuracy"],
  });

  if (!analytics) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Business Analytics</h1>
            <p className="text-muted-foreground mt-1">Platform performance and user insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select defaultValue="7days">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="3months">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
            <Button className="btn-primary">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-primary">{analytics.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-secondary">+15.3% from last month</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Users</p>
                  <p className="text-3xl font-bold text-secondary">{analytics.activeUsers.toLocaleString()}</p>
                  <p className="text-sm text-secondary">+8.7% from last month</p>
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
                  <p className="text-muted-foreground text-sm">Signals Generated</p>
                  <p className="text-3xl font-bold text-purple-400">{analytics.totalSignals.toLocaleString()}</p>
                  <p className="text-sm text-secondary">+22.1% from last month</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-orange-400">${analytics.revenue.toLocaleString()}</p>
                  <p className="text-sm text-secondary">+18.5% from last month</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Engagement */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Daily Active Users</span>
                    <span className="font-semibold">{Math.floor(analytics.activeUsers * 0.34).toLocaleString()}</span>
                  </div>
                  <div className="accuracy-bar">
                    <div className="accuracy-fill" style={{ width: "78%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Signal Usage Rate</span>
                    <span className="font-semibold">94.2%</span>
                  </div>
                  <div className="accuracy-bar">
                    <div className="accuracy-fill" style={{ width: "94%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Learning Completion</span>
                    <span className="font-semibold">67.8%</span>
                  </div>
                  <div className="accuracy-bar">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: "68%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Subscription Conversion</span>
                    <span className="font-semibold">23.4%</span>
                  </div>
                  <div className="accuracy-bar">
                    <div className="bg-purple-400 h-2 rounded-full" style={{ width: "23%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Performing Pairs */}
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Signal Performance by Pair</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {signalAccuracy?.slice(0, 6).map((pair) => (
                  <div key={pair.pair} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium">{pair.pair}</span>
                        <p className="text-xs text-muted-foreground">{pair.totalSignals} signals</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        pair.accuracy >= 80 ? 'text-secondary' : 
                        pair.accuracy >= 70 ? 'text-orange-400' : 'text-danger'
                      }`}>
                        {pair.accuracy.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading performance data...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Breakdown */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-secondary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Free Users</h3>
                <p className="text-2xl font-bold text-muted-foreground">
                  {Math.floor(analytics.totalUsers * 0.65).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">65% of total users</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Pro Users</h3>
                <p className="text-2xl font-bold text-primary">
                  {Math.floor(analytics.totalUsers * 0.28).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">28% of total users</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">Enterprise</h3>
                <p className="text-2xl font-bold text-purple-400">
                  {Math.floor(analytics.totalUsers * 0.07).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">7% of total users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}