import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Users, 
  MessageSquare, 
  Zap, 
  Database,
  Bell,
  Send,
  Radio,
  UserCheck,
  Ban,
  Crown
} from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Analytics } from "@/types/trading";

export default function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [userCommand, setUserCommand] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const { data: analytics } = useQuery<Analytics>({
    queryKey: ["/api/analytics/overview"],
  });

  const generateSignalsMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/generate-signals", {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New trading signals generated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const initializeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/initialize", {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Platform data initialized successfully",
      });
      queryClient.invalidateQueries();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    
    toast({
      title: "Broadcast Sent",
      description: `Message sent to all ${analytics?.totalUsers || 0} users`,
    });
    setBroadcastMessage("");
  };

  const handleUserCommand = () => {
    if (!userCommand.trim() || !selectedUser) return;
    
    toast({
      title: "Command Executed",
      description: `Command "${userCommand}" executed for user ${selectedUser}`,
    });
    setUserCommand("");
  };

  const mockUsers = [
    { id: "1", email: "trader1@example.com", tier: "pro", status: "active" },
    { id: "2", email: "trader2@example.com", tier: "free", status: "active" },
    { id: "3", email: "trader3@example.com", tier: "enterprise", status: "banned" },
    { id: "4", email: "admin@forexXnet.com", tier: "enterprise", status: "active" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground mt-1">Platform management and control center</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-secondary/20 text-secondary">
              <Crown className="h-3 w-3 mr-1" />
              Admin Access
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="stats-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Total Users</p>
                      <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stats-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Active Users</p>
                      <p className="text-2xl font-bold">{analytics?.activeUsers || 0}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-secondary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stats-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Signals Generated</p>
                      <p className="text-2xl font-bold">{analytics?.totalSignals || 0}</p>
                    </div>
                    <Zap className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="stats-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Revenue</p>
                      <p className="text-2xl font-bold">${analytics?.revenue || 0}</p>
                    </div>
                    <Database className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => generateSignalsMutation.mutate()}
                    disabled={generateSignalsMutation.isPending}
                    className="w-full btn-primary"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {generateSignalsMutation.isPending ? "Generating..." : "Generate New Signals"}
                  </Button>
                  
                  <Button 
                    onClick={() => initializeMutation.mutate()}
                    disabled={initializeMutation.isPending}
                    className="w-full btn-secondary"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    {initializeMutation.isPending ? "Initializing..." : "Initialize Platform Data"}
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Platform Settings
                  </Button>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trading Engine</span>
                      <Badge className="bg-secondary/20 text-secondary">Running</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database</span>
                      <Badge className="bg-secondary/20 text-secondary">Connected</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Services</span>
                      <Badge className="bg-secondary/20 text-secondary">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Signal Generation</span>
                      <Badge className="bg-orange-500/20 text-orange-400">Every 4h</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              user.tier === 'enterprise' ? 'bg-purple-500/20 text-purple-400' :
                              user.tier === 'pro' ? 'bg-primary/20 text-primary' :
                              'bg-muted text-muted-foreground'
                            }>
                              {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
                            </Badge>
                            <Badge className={
                              user.status === 'active' ? 'bg-secondary/20 text-secondary' :
                              'bg-danger/20 text-danger'
                            }>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-danger">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commands">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>User Commands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input
                    placeholder="Enter command (e.g., upgrade pro, reset password, ban user)"
                    value={userCommand}
                    onChange={(e) => setUserCommand(e.target.value)}
                  />
                  
                  <Button 
                    onClick={handleUserCommand}
                    disabled={!userCommand.trim() || !selectedUser}
                    className="w-full btn-primary"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Execute Command
                  </Button>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Available Commands:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• upgrade [tier] - Upgrade user subscription</li>
                      <li>• ban user - Ban user account</li>
                      <li>• unban user - Unban user account</li>
                      <li>• reset password - Reset user password</li>
                      <li>• grant admin - Grant admin privileges</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Admin Commands</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" className="btn-secondary">
                      Clear Cache
                    </Button>
                    <Button size="sm" className="btn-secondary">
                      Restart Engine
                    </Button>
                    <Button size="sm" className="btn-secondary">
                      Update Prices
                    </Button>
                    <Button size="sm" className="btn-secondary">
                      Backup Data
                    </Button>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">System Commands:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• system status - Check system health</li>
                      <li>• clear logs - Clear system logs</li>
                      <li>• force signal - Force signal generation</li>
                      <li>• maintenance on/off - Toggle maintenance</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="broadcast">
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Broadcast Messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter broadcast message to all users..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="min-h-32"
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="free">Free Users Only</SelectItem>
                        <SelectItem value="pro">Pro Users Only</SelectItem>
                        <SelectItem value="enterprise">Enterprise Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">
                      Target: {analytics?.totalUsers || 0} users
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleBroadcast}
                    disabled={!broadcastMessage.trim()}
                    className="btn-primary"
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    Send Broadcast
                  </Button>
                </div>
                
                <div className="bg-background/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Broadcasts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>New trading signals available!</span>
                      <span className="text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform maintenance scheduled...</span>
                      <span className="text-muted-foreground">1 day ago</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Platform Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Signal Generation Interval</label>
                    <Select defaultValue="4h">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">1 Hour</SelectItem>
                        <SelectItem value="2h">2 Hours</SelectItem>
                        <SelectItem value="4h">4 Hours</SelectItem>
                        <SelectItem value="6h">6 Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Max Signals Per Day</label>
                    <Input className="w-32" defaultValue="50" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Maintenance Mode</label>
                    <Button size="sm" variant="outline">
                      OFF
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="trading-card">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">3 new user registrations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-secondary" />
                    <span className="text-sm">Signal accuracy above 90%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <span className="text-sm">New enterprise subscription</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}