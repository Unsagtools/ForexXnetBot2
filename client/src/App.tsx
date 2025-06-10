import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/dashboard";
import Landing from "./pages/landing";
import NotFound from "./pages/not-found";
import Signals from "./pages/signals";
import Learning from "./pages/learning";
import Analytics from "./pages/analytics";
import AdminPanel from "./pages/admin-panel";
import AdminCommands from "./pages/admin-commands";
import BusinessPanel from "./pages/business-panel";
import Documentation from "./pages/documentation";
import Projects from "./pages/projects";
import ActivityLogs from "./pages/activity-logs";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/signals" component={Signals} />
          <Route path="/learning" component={Learning} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/admin/commands" component={AdminCommands} />
          <Route path="/admin/business" component={BusinessPanel} />
          <Route path="/admin/activity" component={ActivityLogs} />
          <Route path="/documentation" component={Documentation} />
          <Route path="/projects" component={Projects} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
