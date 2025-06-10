import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function SubscriptionPlans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const upgradeMutation = useMutation({
    mutationFn: async (tier: string) => {
      await apiRequest("POST", "/api/subscription/upgrade", { tier });
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your subscription has been upgraded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setUpgrading(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setUpgrading(null);
    },
  });

  const handleUpgrade = (tier: string) => {
    setUpgrading(tier);
    upgradeMutation.mutate(tier);
  };

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for beginners",
      features: [
        { name: "5 signals per day", included: true },
        { name: "Basic technical indicators", included: true },
        { name: "Educational content", included: true },
        { name: "AI assistant", included: false },
        { name: "Priority support", included: false },
      ],
      current: user?.subscriptionTier === "free",
      tier: "free",
    },
    {
      name: "Pro",
      price: 49,
      description: "For serious traders",
      popular: true,
      features: [
        { name: "Unlimited signals", included: true },
        { name: "All technical indicators", included: true },
        { name: "AI assistant 24/7", included: true },
        { name: "Priority signal delivery", included: true },
        { name: "Advanced analytics", included: true },
      ],
      current: user?.subscriptionTier === "pro",
      tier: "pro",
    },
    {
      name: "Enterprise",
      price: 199,
      description: "For professional firms",
      features: [
        { name: "Everything in Pro", included: true },
        { name: "API access", included: true },
        { name: "Custom integrations", included: true },
        { name: "Dedicated support", included: true },
        { name: "Team management", included: true },
      ],
      current: user?.subscriptionTier === "enterprise",
      tier: "enterprise",
    },
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">Unlock the full potential of AI-powered trading</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative ${
              plan.popular 
                ? "border-2 border-primary trading-card" 
                : "trading-card"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold mb-2">
                ${plan.price}<span className="text-lg text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground">{plan.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-secondary" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${
                      feature.included ? "" : "text-muted-foreground"
                    }`}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
              
              {plan.current ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : plan.tier === "free" ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleUpgrade("free")}
                  disabled={upgrading === "free"}
                >
                  Downgrade to Free
                </Button>
              ) : (
                <Button 
                  className={`w-full ${
                    plan.tier === "pro" 
                      ? "btn-primary" 
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                  onClick={() => handleUpgrade(plan.tier)}
                  disabled={upgrading === plan.tier}
                >
                  {upgrading === plan.tier ? "Upgrading..." : 
                   plan.tier === "pro" ? "Upgrade to Pro" : "Contact Sales"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
