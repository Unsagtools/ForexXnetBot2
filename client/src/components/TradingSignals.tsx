import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TradingSignal } from "@/types/trading";

export default function TradingSignals() {
  const { data: signals, isLoading } = useQuery<TradingSignal[]>({
    queryKey: ["/api/signals"],
  });

  if (isLoading) {
    return (
      <Card className="trading-card">
        <CardHeader>
          <CardTitle>Live Trading Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeSignals = signals?.filter(s => s.status === "active").slice(0, 5) || [];

  return (
    <Card className="trading-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Live Trading Signals</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="live-indicator"></span>
            <span className="text-sm text-muted-foreground">Updated 2m ago</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeSignals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active signals at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">New signals are generated every 4 hours</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeSignals.map((signal) => (
              <div key={signal.id} className="signal-card">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      signal.action === "BUY" ? "bg-secondary/20" : "bg-danger/20"
                    }`}>
                      <span className={`font-semibold text-sm ${
                        signal.action === "BUY" ? "text-secondary" : "text-danger"
                      }`}>
                        {signal.pair.split('/')[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{signal.pair}</h3>
                      <p className="text-sm text-muted-foreground">
                        {signal.pair.replace('/', ' / ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={signal.action === "BUY" ? "default" : "destructive"} className={
                      signal.action === "BUY" 
                        ? "bg-secondary text-secondary-foreground" 
                        : "bg-danger text-white"
                    }>
                      {signal.action}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      Confidence: {signal.confidence}%
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Entry Price</p>
                    <p className="font-semibold">{parseFloat(signal.entryPrice).toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Take Profit</p>
                    <p className="font-semibold text-secondary">
                      {parseFloat(signal.takeProfitPrice).toFixed(5)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stop Loss</p>
                    <p className="font-semibold text-danger">
                      {parseFloat(signal.stopLossPrice).toFixed(5)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Risk/Reward</p>
                    <p className="font-semibold">
                      {(() => {
                        const entry = parseFloat(signal.entryPrice);
                        const tp = parseFloat(signal.takeProfitPrice);
                        const sl = parseFloat(signal.stopLossPrice);
                        const risk = Math.abs(entry - sl);
                        const reward = Math.abs(tp - entry);
                        return `1:${(reward / risk).toFixed(2)}`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
