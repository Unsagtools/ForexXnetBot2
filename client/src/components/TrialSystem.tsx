import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, TrendingUp, Target, Award, DollarSign, Activity, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TrialStatus {
  isActive: boolean;
  daysLeft: number;
  performance: {
    totalSignals: number;
    winRate: number;
    totalProfit: string;
    averagePips: number;
    bestTrade: string;
    worstTrade: string;
  };
}

export default function TrialSystem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSignal, setSelectedSignal] = useState<any>(null);

  // Get trial status
  const { data: trialStatus, isLoading: trialLoading } = useQuery<TrialStatus>({
    queryKey: ['/api/trial/status'],
  });

  // Get real signals for trial
  const { data: signals, isLoading: signalsLoading } = useQuery({
    queryKey: ['/api/signals'],
  });

  // Get signal verifications to prove authenticity
  const { data: verifications } = useQuery({
    queryKey: ['/api/trial/verifications'],
  });

  // Start trial mutation
  const startTrialMutation = useMutation({
    mutationFn: () => apiRequest('/api/trial/start', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trial/status'] });
      toast({
        title: "Trial Started!",
        description: "Your 7-day trial has begun. Track real signal performance now.",
      });
    },
  });

  // Record trial signal mutation
  const recordSignalMutation = useMutation({
    mutationFn: (data: { signalId: number; entryPrice: string }) => 
      apiRequest('/api/trial/record-signal', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trial/status'] });
      toast({
        title: "Signal Recorded",
        description: "Signal added to your trial performance tracking.",
      });
    },
  });

  const progressPercentage = trialStatus?.daysLeft ? ((7 - trialStatus.daysLeft) / 7) * 100 : 0;
  const winRateColor = trialStatus?.performance?.winRate >= 70 ? "text-green-600" : 
                      trialStatus?.performance?.winRate >= 50 ? "text-yellow-600" : "text-red-600";

  if (trialLoading || signalsLoading) {
    return <div className="flex items-center justify-center h-64">Loading trial system...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Trial Status Header */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                7-Day Authenticity Trial
              </CardTitle>
              <CardDescription className="text-base">
                Prove to yourself our signals are real and profitable
              </CardDescription>
            </div>
            {!trialStatus?.isActive && (
              <Button 
                onClick={() => startTrialMutation.mutate()}
                disabled={startTrialMutation.isPending}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {startTrialMutation.isPending ? "Starting..." : "Start Free Trial"}
              </Button>
            )}
          </div>
        </CardHeader>

        {trialStatus?.isActive && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Days Remaining: {trialStatus.daysLeft}</span>
                </div>
                <Badge variant={trialStatus.daysLeft > 3 ? "default" : "destructive"}>
                  {trialStatus.daysLeft > 0 ? "Active" : "Expired"}
                </Badge>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Trial Progress: {Math.round(progressPercentage)}% complete
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Performance Dashboard */}
      {trialStatus?.isActive && trialStatus.performance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{trialStatus.performance.totalSignals}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                <span className={`text-2xl font-bold ${winRateColor}`}>
                  {trialStatus.performance.winRate.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  ${parseFloat(trialStatus.performance.totalProfit).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Pips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">
                  {trialStatus.performance.averagePips.toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Live Signals for Trial */}
      {trialStatus?.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Live Signals - Track Your Performance
            </CardTitle>
            <CardDescription>
              These are real signals generated by our AI. Record them to track authenticity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {signals?.length > 0 ? (
                signals.map((signal: any) => (
                  <div key={signal.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="font-medium">
                          {signal.pair}
                        </Badge>
                        <Badge variant={signal.action === "BUY" ? "default" : "destructive"}>
                          {signal.action}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Confidence: {signal.confidence}%
                        </span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => recordSignalMutation.mutate({
                          signalId: signal.id,
                          entryPrice: signal.entryPrice
                        })}
                        disabled={recordSignalMutation.isPending}
                      >
                        Track Signal
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Entry: </span>
                        <span className="font-medium">{signal.entryPrice}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Take Profit: </span>
                        <span className="font-medium text-green-600">{signal.takeProfitPrice}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stop Loss: </span>
                        <span className="font-medium text-red-600">{signal.stopLossPrice}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No active signals available. New signals are generated every 4 hours.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signal Authenticity Verification */}
      {verifications && verifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Signal Verification & Authenticity
            </CardTitle>
            <CardDescription>
              Independent verification of our signal accuracy using real market data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verifications.slice(0, 5).map((verification: any) => (
                <div key={verification.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Signal #{verification.signalId}</span>
                    <Badge variant="outline">{verification.verificationSource}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">
                      {verification.accuracy}% Accurate
                    </span>
                    {verification.verified && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Why Our Signals Are Real */}
      <Card>
        <CardHeader>
          <CardTitle>Why ForexXNet Signals Are 100% Authentic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Real-Time Market Analysis
              </h4>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes live market data from multiple sources, using advanced technical indicators 
                and machine learning algorithms to generate signals.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                Transparent Performance
              </h4>
              <p className="text-sm text-muted-foreground">
                Every signal is tracked with entry/exit prices, timestamps, and profit/loss calculations. 
                No hidden results or cherry-picked data.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                Independent Verification
              </h4>
              <p className="text-sm text-muted-foreground">
                All signals are verified against real market conditions and historical data. 
                Third-party validation ensures authenticity.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-600" />
                Proven Track Record
              </h4>
              <p className="text-sm text-muted-foreground">
                Our platform has generated thousands of verified signals with documented 
                performance metrics available for review.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>7-Day Money-Back Guarantee:</strong> If you're not satisfied with the authenticity 
              and quality of our signals during your trial, we offer a full refund. We're confident 
              in our system because it delivers real, profitable results.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Call to Action */}
      {!trialStatus?.isActive && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-bold">Ready to See Real Results?</h3>
              <p className="text-muted-foreground">
                Start your 7-day trial now and experience the power of authentic, AI-generated trading signals. 
                No credit card required - just pure performance tracking.
              </p>
              <Button 
                size="lg" 
                onClick={() => startTrialMutation.mutate()}
                disabled={startTrialMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {startTrialMutation.isPending ? "Starting Trial..." : "Start 7-Day Free Trial"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}