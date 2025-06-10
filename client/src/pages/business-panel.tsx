import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, TrendingUp, Package, Plus, Edit, Eye, BarChart3, Crown, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface BusinessPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  billingCycle: string;
  features: string[];
  maxSignals: number;
  maxUsers: number;
  isActive: boolean;
  createdAt: string;
}

interface BusinessAnalytics {
  totalRevenue: number;
  monthlyGrowth: number;
  activeSubscriptions: number;
  planDistribution: { [key: string]: number };
  churnRate: number;
}

export default function BusinessPanel() {
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BusinessPlan | null>(null);
  const { toast } = useToast();

  const { data: plans = [], isLoading: plansLoading } = useQuery<BusinessPlan[]>({
    queryKey: ["/api/business/plans"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<BusinessAnalytics>({
    queryKey: ["/api/business/analytics"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<any[]>({
    queryKey: ["/api/business/users"],
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/business/plans", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/plans"] });
      setIsCreatePlanOpen(false);
      toast({ title: "Business plan created successfully" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/business/plans/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/plans"] });
      setEditingPlan(null);
      toast({ title: "Business plan updated successfully" });
    },
  });

  const togglePlanStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      apiRequest(`/api/business/plans/${id}/status`, "PUT", { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business/plans"] });
      toast({ title: "Plan status updated" });
    },
  });

  const PlanForm = ({ plan, onSubmit, onCancel }: {
    plan?: BusinessPlan;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: plan?.name || "",
      description: plan?.description || "",
      price: plan?.price || "",
      currency: plan?.currency || "USD",
      billingCycle: plan?.billingCycle || "monthly",
      features: plan?.features || [],
      maxSignals: plan?.maxSignals || 0,
      maxUsers: plan?.maxUsers || 0,
      isActive: plan?.isActive ?? true,
    });

    const [newFeature, setNewFeature] = useState("");

    const addFeature = () => {
      if (newFeature.trim()) {
        setFormData({ ...formData, features: [...formData.features, newFeature.trim()] });
        setNewFeature("");
      }
    };

    const removeFeature = (index: number) => {
      setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
    };

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Basic, Pro, Enterprise"
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="29.99"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Plan description and benefits"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select value={formData.billingCycle} onValueChange={(value) => setFormData({ ...formData, billingCycle: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label>Active</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxSignals">Max Signals</Label>
            <Input
              id="maxSignals"
              type="number"
              value={formData.maxSignals}
              onChange={(e) => setFormData({ ...formData, maxSignals: parseInt(e.target.value) || 0 })}
              placeholder="100"
            />
          </div>
          <div>
            <Label htmlFor="maxUsers">Max Users</Label>
            <Input
              id="maxUsers"
              type="number"
              value={formData.maxUsers}
              onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
              placeholder="5"
            />
          </div>
        </div>

        <div>
          <Label>Features</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature"
                onKeyPress={(e) => e.key === "Enter" && addFeature()}
              />
              <Button type="button" onClick={addFeature}>Add</Button>
            </div>
            <div className="space-y-1">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFeature(index)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => onSubmit(formData)}>
            {plan ? "Update" : "Create"} Plan
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Management Panel</h1>
          <p className="text-muted-foreground">Manage plans, users, and business analytics</p>
        </div>
        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Business Plan</DialogTitle>
              <DialogDescription>Add a new subscription plan for users</DialogDescription>
            </DialogHeader>
            <PlanForm
              onSubmit={(data) => createPlanMutation.mutate(data)}
              onCancel={() => setIsCreatePlanOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Business Analytics</TabsTrigger>
          <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">Business Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${analytics?.totalRevenue?.toLocaleString() || "0"}</div>
                <p className="text-xs text-muted-foreground">
                  +{analytics?.monthlyGrowth || 0}% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.activeSubscriptions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Across all plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{analytics?.monthlyGrowth || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Monthly growth
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.churnRate || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  User retention
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Current subscription plan breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.planDistribution && Object.entries(analytics.planDistribution).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span>{plan}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(count as number / analytics.activeSubscriptions) * 100} className="w-20" />
                    <span className="text-sm text-muted-foreground">{count}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4">
            {plansLoading ? (
              <div>Loading plans...</div>
            ) : (
              plans.map((plan) => (
                <Card key={plan.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold">{plan.name}</h3>
                          <Badge variant={plan.isActive ? "default" : "secondary"}>
                            {plan.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{plan.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium">
                            {plan.currency} {plan.price}/{plan.billingCycle}
                          </span>
                          <span>Max Signals: {plan.maxSignals}</span>
                          <span>Max Users: {plan.maxUsers}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {plan.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Switch
                          checked={plan.isActive}
                          onCheckedChange={(checked) => 
                            togglePlanStatusMutation.mutate({ id: plan.id, isActive: checked })
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user subscriptions and access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>Loading users...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No users found</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {user.firstName?.[0] || user.email[0].toUpperCase()}
                            </div>
                            <span>{user.firstName || user.email.split('@')[0]}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {user.subscriptionTier || "Free"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">Active</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>Configure business parameters and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input defaultValue="ForexXnet" />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input defaultValue="support@forexXnet.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" defaultValue="0" />
                </div>
              </div>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingPlan && (
        <Dialog open onOpenChange={() => setEditingPlan(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Business Plan</DialogTitle>
              <DialogDescription>Modify the selected subscription plan</DialogDescription>
            </DialogHeader>
            <PlanForm
              plan={editingPlan}
              onSubmit={(data) => updatePlanMutation.mutate({ id: editingPlan.id, ...data })}
              onCancel={() => setEditingPlan(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}