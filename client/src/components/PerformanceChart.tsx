import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import type { SignalAccuracy } from "@/types/trading";

export default function PerformanceChart() {
  const { data: signalAccuracy } = useQuery<SignalAccuracy[]>({
    queryKey: ["/api/signals/accuracy"],
  });

  // Mock market overview data
  const marketData = [
    { pair: "EUR/USD", price: "1.0847", change: "+0.24%", positive: true },
    { pair: "GBP/USD", price: "1.2634", change: "-0.18%", positive: false },
    { pair: "USD/JPY", price: "149.82", change: "+0.31%", positive: true },
    { pair: "AUD/USD", price: "0.6724", change: "+0.15%", positive: true },
  ];

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marketData.map((item) => (
              <div key={item.pair} className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className={`w-2 h-2 rounded-full ${
                    item.positive ? "bg-secondary" : "bg-danger"
                  }`}></span>
                  <span className="text-sm">{item.pair}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.price}</div>
                  <div className={`text-sm ${
                    item.positive ? "text-secondary" : "text-danger"
                  }`}>
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signal Accuracy */}
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Signal Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {signalAccuracy?.slice(0, 4).map((item) => (
              <div key={item.pair}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">{item.pair}</span>
                  <span className="font-semibold">{item.accuracy.toFixed(0)}%</span>
                </div>
                <div className="accuracy-bar">
                  <div 
                    className="accuracy-fill" 
                    style={{ width: `${item.accuracy}%` }}
                  ></div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Loading accuracy data...</p>
              </div>
            )}
          </div>
          <div className="mt-6 p-4 bg-secondary/10 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-secondary" />
              <span className="text-sm">Overall accuracy improved by 3.2% this month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <Card className="trading-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-primary text-sm"></i>
            </div>
            <CardTitle>AI Assistant</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-background/50 rounded-lg p-3">
              <p className="text-sm">Market volatility is increasing. Consider reducing position sizes for the next 2 hours.</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-sm">EUR/USD showing strong bullish momentum. High-confidence BUY signal generated.</p>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            Ask AI Assistant <i className="fas fa-chevron-right ml-2"></i>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
