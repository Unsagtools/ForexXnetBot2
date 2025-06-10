import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, Download, RefreshCw, User, Shield, TrendingUp, Database, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface ActivityLog {
  id: number;
  userId: string;
  action: string;
  description: string;
  category: string;
  metadata: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function ActivityLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [page, setPage] = useState(1);

  const { data: logs = [], isLoading, refetch } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs", { 
      search: searchTerm, 
      category: selectedCategory,
      page,
      from: selectedDateRange.from?.toISOString(),
      to: selectedDateRange.to?.toISOString()
    }],
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/activity-analytics"],
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "auth": return <User className="h-4 w-4" />;
      case "admin": return <Shield className="h-4 w-4" />;
      case "trading": return <TrendingUp className="h-4 w-4" />;
      case "system": return <Database className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "auth": return "bg-blue-500";
      case "admin": return "bg-red-500";
      case "trading": return "bg-green-500";
      case "system": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getActionSeverity = (action: string) => {
    const highRisk = ["user_banned", "admin_command_executed", "system_config_changed", "data_export"];
    const mediumRisk = ["login_failed", "password_changed", "signal_generated"];
    
    if (highRisk.includes(action)) return "high";
    if (mediumRisk.includes(action)) return "medium";
    return "low";
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "medium": return <Badge variant="default">Medium</Badge>;
      case "low": return <Badge variant="secondary">Low</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const exportLogs = () => {
    // Export functionality would be implemented here
    console.log("Exporting logs...");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activity Logs</h1>
          <p className="text-muted-foreground">Monitor system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions, users, descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="auth">Authentication</SelectItem>
                    <SelectItem value="admin">Admin Actions</SelectItem>
                    <SelectItem value="trading">Trading Activities</SelectItem>
                    <SelectItem value="system">System Events</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDateRange.from ? (
                        selectedDateRange.to ? (
                          <>
                            {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                            {format(selectedDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(selectedDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={selectedDateRange.from}
                      selected={selectedDateRange}
                      onSelect={setSelectedDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedDateRange({});
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                {logs.length} activities found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">Loading activities...</TableCell>
                      </TableRow>
                    ) : logs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No activities found</TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                                {log.userId?.slice(0, 2).toUpperCase() || "SY"}
                              </div>
                              <span className="text-sm">{log.userId || "System"}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {log.action}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getCategoryColor(log.category)}`} />
                              <span className="capitalize">{log.category}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {log.description}
                          </TableCell>
                          <TableCell>
                            {getSeverityBadge(getActionSeverity(log.action))}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ipAddress}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalActivities || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics?.dailyGrowth || 0}% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.adminActions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.securityAlerts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Requires attention
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: "Authentication", count: 1247, percentage: 45, color: "bg-blue-500" },
                    { category: "Trading", count: 834, percentage: 30, color: "bg-green-500" },
                    { category: "Admin", count: 412, percentage: 15, color: "bg-red-500" },
                    { category: "System", count: 278, percentage: 10, color: "bg-purple-500" },
                  ].map((item) => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-sm font-medium">{item.category}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.count}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top User Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "User Login", count: 456, trend: "up" },
                    { action: "Signal Generated", count: 234, trend: "up" },
                    { action: "Password Changed", count: 89, trend: "down" },
                    { action: "Admin Command", count: 67, trend: "stable" },
                    { action: "Data Export", count: 23, trend: "up" },
                  ].map((item) => (
                    <div key={item.action} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-xs">{item.action}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.count}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          item.trend === "up" ? "bg-green-500" :
                          item.trend === "down" ? "bg-red-500" : "bg-gray-500"
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Security Alerts
              </CardTitle>
              <CardDescription>
                Monitor suspicious activities and security incidents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    title: "Multiple Failed Login Attempts",
                    description: "User 37061879 has 5 failed login attempts in the last hour",
                    severity: "high",
                    timestamp: "2024-06-10T05:30:00Z",
                    resolved: false
                  },
                  {
                    id: 2,
                    title: "Admin Command Execution",
                    description: "Broadcast command executed by admin user",
                    severity: "medium",
                    timestamp: "2024-06-10T05:15:00Z",
                    resolved: true
                  },
                  {
                    id: 3,
                    title: "Unusual API Access Pattern",
                    description: "High frequency API calls from IP 192.168.1.100",
                    severity: "medium",
                    timestamp: "2024-06-10T04:45:00Z",
                    resolved: false
                  }
                ].map((alert) => (
                  <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        {getSeverityBadge(alert.severity)}
                        {alert.resolved && <Badge variant="outline">Resolved</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(alert.timestamp), "MMM dd, yyyy HH:mm")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!alert.resolved && (
                        <Button size="sm" variant="outline">
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}