import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, Users, BarChart3, BookOpen } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ForexXnet</span>
              <span className="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-full">AI Powered</span>
            </div>
            <Button onClick={handleLogin} className="btn-primary">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            AI-Powered Trading Signals
            <span className="text-primary block mt-2">That Actually Work</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get hyper-accurate forex trading signals powered by advanced AI algorithms. Join thousands of traders achieving consistent profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleLogin} size="lg" className="btn-primary text-lg px-8 py-4">
              Start Trading Now
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              View Live Signals
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">94.2%</div>
              <div className="text-muted-foreground">Signal Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">12K+</div>
              <div className="text-muted-foreground">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">45M+</div>
              <div className="text-muted-foreground">Signals Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">$2.8M+</div>
              <div className="text-muted-foreground">Profits Generated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Trade Successfully</h2>
            <p className="text-xl text-muted-foreground">Comprehensive tools and insights for professional forex trading</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Trading Signals</h3>
                <p className="text-muted-foreground">Advanced algorithms analyze multiple indicators to generate high-accuracy trading signals in real-time.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Technical Analysis</h3>
                <p className="text-muted-foreground">Comprehensive technical indicators including MA, EMA, RSI, MACD and custom AI-trained strategies.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Risk Management</h3>
                <p className="text-muted-foreground">Built-in risk management with optimal entry, take profit, and stop loss calculations.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Learning Center</h3>
                <p className="text-muted-foreground">Interactive courses and AI tutors to help you master forex trading from beginner to advanced.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real-time Updates</h3>
                <p className="text-muted-foreground">Get instant notifications for new signals, market changes, and important trading opportunities.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community Support</h3>
                <p className="text-muted-foreground">Join a thriving community of traders and get support from our expert team 24/7.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Trading?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of successful traders using AI-powered signals to achieve consistent profits.
          </p>
          <Button onClick={handleLogin} size="lg" className="btn-primary text-lg px-8 py-4">
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">ForexXnet</span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI-powered forex trading signals and education platform for traders worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Trading Signals</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Learning Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Access</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors">
                  <i className="fab fa-telegram"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/20 transition-colors">
                  <i className="fab fa-discord"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ForexXnet. Powered by N3tBot & Synalitica AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
