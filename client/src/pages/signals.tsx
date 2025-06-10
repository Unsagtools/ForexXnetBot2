import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Clock, Target, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import type { TradingSignal } from "@/types/trading";

export default function Signals() {
  const { data: signals, isLoading } = useQuery<TradingSignal[]>({
    queryKey: ["/api/signals"],
  });

  const activeSignals = signals?.filter(s => s.status === "active") || [];
  const closedSignals = signals?.filter(s => s.status === "closed") || [];

  const getSignalIcon = (action: string) => {
    return action === "BUY" ? (
      <TrendingUp className="h-5 w-5 text-secondary" />
    ) : (
      <TrendingUp className="h-5 w-5 text-danger rotate-180" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Trading Signals</h1>
            <p className="text-muted-foreground mt-1">AI-powered forex trading recommendations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pairs</SelectItem>
                <SelectItem value="major">Major Pairs</SelectItem>
                <SelectItem value="minor">Minor Pairs</SelectItem>
                <SelectItem value="exotic">Exotic Pairs</SelectItem>
              </SelectContent>
            </Select>
            <Button className="btn-primary">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Set Alerts
            </Button>
          </div>
        </div>

        {/* Active Signals */}
        <Card className="trading-card mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <div className="live-indicator"></div>
                <span>Active Signals ({activeSignals.length})</span>
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Next update in 2h 15m
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading signals...</div>
            ) : activeSignals.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active signals at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">New signals are generated every 4 hours</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeSignals.map((signal) => (
                  <div key={signal.id} className="signal-card bg-background/50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          signal.action === "BUY" ? "bg-secondary/20" : "bg-danger/20"
                        }`}>
                          {getSignalIcon(signal.action)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{signal.pair}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(signal.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={signal.action === "BUY" ? "default" : "destructive"}
                          className={`mb-2 ${
                            signal.action === "BUY" 
                              ? "bg-secondary text-secondary-foreground" 
                              : "bg-danger text-white"
                          }`}
                        >
                          {signal.action}
                        </Badge>
                        <div className="text-sm">
                          <div className="flex items-center space-x-1">
                            <Target className="h-3 w-3" />
                            <span>{signal.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Entry</p>
                        <p className="font-semibold">{parseFloat(signal.entryPrice).toFixed(5)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Take Profit</p>
                        <p className="font-semibold text-secondary">{parseFloat(signal.takeProfitPrice).toFixed(5)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Stop Loss</p>
                        <p className="font-semibold text-danger">{parseFloat(signal.stopLossPrice).toFixed(5)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        Risk/Reward: 1:{(() => {
                          const entry = parseFloat(signal.entryPrice);
                          const tp = parseFloat(signal.takeProfitPrice);
                          const sl = parseFloat(signal.stopLossPrice);
                          const risk = Math.abs(entry - sl);
                          const reward = Math.abs(tp - entry);
                          return (reward / risk).toFixed(2);
                        })()}
                      </span>
                      <Button size="sm" className="btn-primary">
                        Copy Signal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signal History */}
        <Card className="trading-card">
          <CardHeader>
            <CardTitle>Signal History</CardTitle>
          </CardHeader>
          <CardContent>
            {closedSignals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No signal history available
              </div>
            ) : (
              <div className="space-y-4">
                {closedSignals.map((signal) => (
                  <div key={signal.id} className="flex justify-between items-center p-4 bg-background/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        signal.action === "BUY" ? "bg-secondary/20" : "bg-danger/20"
                      }`}>
                        {getSignalIcon(signal.action)}
                      </div>
                      <div>
                        <p className="font-medium">{signal.pair}</p>
                        <p className="text-sm text-muted-foreground">{signal.action} @ {parseFloat(signal.entryPrice).toFixed(5)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={signal.result === "win" ? "default" : "destructive"}
                        className={signal.result === "win" ? "bg-secondary/20 text-secondary" : "bg-danger/20 text-danger"}
                      >
                        {signal.result?.toUpperCase()}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {signal.closedAt ? new Date(signal.closedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}