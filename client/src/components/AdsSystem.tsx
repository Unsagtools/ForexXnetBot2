import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Eye, MousePointer, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Ad {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  adType: string;
  position: string;
  isActive: boolean;
  impressions: number;
  clicks: number;
  budget?: number;
  costPerClick?: number;
  targetAudience: string[];
  priority: number;
  createdAt: string;
}

export default function AdsSystem() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    adType: 'banner',
    position: 'header',
    isActive: true,
    budget: 0,
    costPerClick: 0,
    targetAudience: '',
    priority: 1
  });
  const { toast } = useToast();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['/api/ads'],
  });

  const createAdMutation = useMutation({
    mutationFn: async (adData: any) => {
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adData,
          targetAudience: adData.targetAudience.split(',').map((t: string) => t.trim()).filter(Boolean)
        }),
      });
      if (!response.ok) throw new Error('Failed to create ad');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      setDialogOpen(false);
      setNewAd({
        title: '',
        description: '',
        imageUrl: '',
        targetUrl: '',
        adType: 'banner',
        position: 'header',
        isActive: true,
        budget: 0,
        costPerClick: 0,
        targetAudience: '',
        priority: 1
      });
      toast({
        title: "Success",
        description: "Advertisement created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create advertisement",
        variant: "destructive",
      });
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/ads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update ad');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast({
        title: "Success",
        description: "Advertisement updated successfully",
      });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/ads/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete ad');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ads'] });
      toast({
        title: "Success",
        description: "Advertisement deleted successfully",
      });
    },
  });

  const handleCreateAd = () => {
    createAdMutation.mutate(newAd);
  };

  const handleToggleAd = (ad: Ad) => {
    updateAdMutation.mutate({
      id: ad.id,
      data: { isActive: !ad.isActive }
    });
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';
  };

  const totalImpressions = ads.reduce((sum: number, ad: Ad) => sum + ad.impressions, 0);
  const totalClicks = ads.reduce((sum: number, ad: Ad) => sum + ad.clicks, 0);
  const totalRevenue = ads.reduce((sum: number, ad: Ad) => sum + (ad.clicks * (ad.costPerClick || 0)), 0);

  if (isLoading) {
    return <div className="p-6">Loading ads system...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ads Management System</h1>
          <p className="text-muted-foreground">Manage advertisements and track performance</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Advertisement</DialogTitle>
              <DialogDescription>
                Create a new advertisement for your platform
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAd.title}
                  onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                  placeholder="Ad title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input
                  id="targetUrl"
                  value={newAd.targetUrl}
                  onChange={(e) => setNewAd({ ...newAd, targetUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adType">Ad Type</Label>
                <Select value={newAd.adType} onValueChange={(value) => setNewAd({ ...newAd, adType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="popup">Popup</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={newAd.position} onValueChange={(value) => setNewAd({ ...newAd, position: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="footer">Footer</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newAd.budget}
                  onChange={(e) => setNewAd({ ...newAd, budget: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerClick">Cost Per Click ($)</Label>
                <Input
                  id="costPerClick"
                  type="number"
                  step="0.01"
                  value={newAd.costPerClick}
                  onChange={(e) => setNewAd({ ...newAd, costPerClick: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAd.description}
                  onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                  placeholder="Ad description"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="targetAudience">Target Audience (comma separated)</Label>
                <Input
                  id="targetAudience"
                  value={newAd.targetAudience}
                  onChange={(e) => setNewAd({ ...newAd, targetAudience: e.target.value })}
                  placeholder="traders, investors, beginners"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateAd} disabled={createAdMutation.isPending}>
                {createAdMutation.isPending ? 'Creating...' : 'Create Ad'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateCTR(totalClicks, totalImpressions)}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Advertisements</CardTitle>
          <CardDescription>Manage and monitor your advertisements</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad: Ad) => (
                <TableRow key={ad.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{ad.title}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {ad.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{ad.adType}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ad.position}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ad.isActive}
                        onCheckedChange={() => handleToggleAd(ad)}
                      />
                      <span className="text-sm">
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{ad.impressions.toLocaleString()}</TableCell>
                  <TableCell>{ad.clicks.toLocaleString()}</TableCell>
                  <TableCell>{calculateCTR(ad.clicks, ad.impressions)}%</TableCell>
                  <TableCell>${(ad.clicks * (ad.costPerClick || 0)).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAdMutation.mutate(ad.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}