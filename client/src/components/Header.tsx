import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { TrendingUp, Bell } from "lucide-react";

export default function Header() {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ForexXnet</span>
              <span className="bg-secondary/20 text-secondary text-xs px-2 py-1 rounded-full">AI Powered</span>
            </div>
            <nav className="hidden md:flex space-x-6 ml-8">
              <a href="/dashboard" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
              <a href="/signals" className="text-muted-foreground hover:text-primary transition-colors">Signals</a>
              <a href="/learning" className="text-muted-foreground hover:text-primary transition-colors">Learning</a>
              <a href="/analytics" className="text-muted-foreground hover:text-primary transition-colors">Analytics</a>
              <a href="/projects" className="text-muted-foreground hover:text-primary transition-colors">Projects</a>
              <a href="/documentation" className="text-muted-foreground hover:text-primary transition-colors">Docs</a>
              {(user?.email?.includes('admin') || user?.subscriptionTier === 'enterprise') && (
                <>
                  <a href="/admin" className="text-purple-400 hover:text-purple-300 transition-colors">Admin</a>
                  <a href="/admin/commands" className="text-purple-400 hover:text-purple-300 transition-colors">Commands</a>
                  <a href="/admin/business" className="text-purple-400 hover:text-purple-300 transition-colors">Business</a>
                  <a href="/admin/activity" className="text-purple-400 hover:text-purple-300 transition-colors">Activity</a>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-background px-3 py-2 rounded-lg">
              <span className="live-indicator"></span>
              <span className="text-sm">Live</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="p-2 hover:bg-background rounded-lg">
                <Bell className="h-4 w-4 text-muted-foreground" />
              </Button>
              <div className="flex items-center space-x-2">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="User Avatar" 
                    className="w-8 h-8 rounded-full object-cover" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {user?.firstName?.[0] || user?.email?.[0] || 'U'}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium">
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  user?.subscriptionTier === 'pro' 
                    ? 'bg-primary/20 text-primary' 
                    : user?.subscriptionTier === 'enterprise'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {user?.subscriptionTier?.charAt(0).toUpperCase() + user?.subscriptionTier?.slice(1) || 'Free'}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
