import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import type { Analytics, SignalAccuracy } from "@/types/trading";

export default function AdminAnalytics() {
  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics/overview"],
  });

  const { data: signalAccuracy } = useQuery<SignalAccuracy[]>({
    queryKey: ["/api/signals/accuracy"],
  });

  if (!analytics) {
    return null;
  }

  return (
    <div className="mb-8">
      <Card className="trading-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Business Analytics</CardTitle>
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
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {analytics.totalUsers.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-sm text-secondary">+15.3% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary">
                {analytics.activeUsers.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Active Users</div>
              <div className="text-sm text-secondary">+8.7% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {analytics.totalSignals.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Signals Generated</div>
              <div className="text-sm text-secondary">+22.1% from last month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">
                ${analytics.revenue.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              <div className="text-sm text-secondary">+18.5% from last month</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">User Engagement</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Daily Active Users</span>
                  <span className="font-semibold">
                    {Math.floor(analytics.activeUsers * 0.34).toLocaleString()}
                  </span>
                </div>
                <div className="accuracy-bar">
                  <div className="accuracy-fill" style={{ width: "78%" }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Signal Usage Rate</span>
                  <span className="font-semibold">94.2%</span>
                </div>
                <div className="accuracy-bar">
                  <div className="accuracy-fill" style={{ width: "94%" }}></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Learning Completion</span>
                  <span className="font-semibold">67.8%</span>
                </div>
                <div className="accuracy-bar">
                  <div className="bg-orange-400 h-2 rounded-full" style={{ width: "68%" }}></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Top Performing Pairs</h3>
              <div className="space-y-3">
                {signalAccuracy?.slice(0, 3).map((pair) => (
                  <div key={pair.pair} className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">{pair.pair}</span>
                      <Badge className="bg-secondary/20 text-secondary text-xs">
                        {pair.accuracy.toFixed(1)}%
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {pair.totalSignals} signals
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading performance data...
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
