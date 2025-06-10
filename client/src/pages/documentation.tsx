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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Book, FileText, Code, Zap, Plus, Edit, Search, Globe, Shield, Database, Bot, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Documentation {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  author: string;
}

const API_DOCS = [
  {
    endpoint: "/api/auth",
    method: "POST",
    description: "User authentication and login",
    parameters: ["email", "password"],
    example: `{
  "email": "user@example.com",
  "password": "securepassword"
}`
  },
  {
    endpoint: "/api/signals",
    method: "GET",
    description: "Retrieve trading signals",
    parameters: ["limit", "pair", "status"],
    example: `{
  "signals": [
    {
      "id": 1,
      "pair": "EUR/USD",
      "action": "BUY",
      "entryPrice": "1.0850",
      "confidence": 85
    }
  ]
}`
  },
  {
    endpoint: "/api/admin/commands",
    method: "POST",
    description: "Execute admin commands",
    parameters: ["command", "parameters"],
    example: `{
  "command": "/broadcast",
  "parameters": {
    "message": "System maintenance in 1 hour"
  }
}`
  }
];

const FEATURES_GUIDE = [
  {
    title: "Trading Signals",
    icon: <TrendingUp className="h-5 w-5" />,
    description: "Advanced algorithmic trading signals for forex pairs",
    features: [
      "Real-time signal generation using technical analysis",
      "Multiple timeframe analysis (M15, H1, H4, D1)",
      "Risk management with stop-loss and take-profit levels",
      "Signal accuracy tracking and performance metrics",
      "Customizable signal filters and preferences"
    ]
  },
  {
    title: "Admin Panel",
    icon: <Shield className="h-5 w-5" />,
    description: "Comprehensive administrative controls",
    features: [
      "User management and role assignment",
      "Command system for automation",
      "Broadcast messaging to all users",
      "System monitoring and health checks",
      "Activity logging and audit trails"
    ]
  },
  {
    title: "Business Intelligence",
    icon: <Database className="h-5 w-5" />,
    description: "Analytics and business metrics",
    features: [
      "Revenue tracking and growth analytics",
      "User engagement and retention metrics",
      "Plan performance and subscription analytics",
      "Custom reporting and data exports",
      "Real-time dashboard with KPIs"
    ]
  },
  {
    title: "Automation & Bots",
    icon: <Bot className="h-5 w-5" />,
    description: "Intelligent automation systems",
    features: [
      "Telegram bot integration for notifications",
      "Automated trading signal delivery",
      "Email and SMS alert systems",
      "Webhook integrations for third-party services",
      "Custom automation workflows"
    ]
  }
];

export default function Documentation() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDocOpen, setIsCreateDocOpen] = useState(false);
  const { toast } = useToast();

  const { data: docs = [], isLoading } = useQuery<Documentation[]>({
    queryKey: ["/api/documentation"],
  });

  const createDocMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/documentation", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documentation"] });
      setIsCreateDocOpen(false);
      toast({ title: "Documentation created successfully" });
    },
  });

  const filteredDocs = docs.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const DocForm = ({ onSubmit, onCancel }: {
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      title: "",
      content: "",
      category: "user-guide",
      tags: [],
    });

    const [newTag, setNewTag] = useState("");

    const addTag = () => {
      if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
        setNewTag("");
      }
    };

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Documentation title"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user-guide">User Guide</SelectItem>
              <SelectItem value="api-reference">API Reference</SelectItem>
              <SelectItem value="admin-guide">Admin Guide</SelectItem>
              <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
              <SelectItem value="changelog">Changelog</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Documentation content (Markdown supported)"
            rows={10}
          />
        </div>
        <div>
          <Label>Tags</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button type="button" onClick={addTag}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                  <button
                    className="ml-1 text-xs"
                    onClick={() => setFormData({ 
                      ...formData, 
                      tags: formData.tags.filter((_, i) => i !== index) 
                    })}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSubmit(formData)}>Create Documentation</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Documentation Center</h1>
          <p className="text-muted-foreground">Comprehensive guides and API documentation</p>
        </div>
        <Dialog open={isCreateDocOpen} onOpenChange={setIsCreateDocOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Documentation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Documentation</DialogTitle>
              <DialogDescription>Add comprehensive documentation for users and developers</DialogDescription>
            </DialogHeader>
            <DocForm
              onSubmit={(data) => createDocMutation.mutate(data)}
              onCancel={() => setIsCreateDocOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Search & Filter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="user-guide">User Guide</SelectItem>
                  <SelectItem value="api-reference">API Reference</SelectItem>
                  <SelectItem value="admin-guide">Admin Guide</SelectItem>
                  <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                  <SelectItem value="changelog">Changelog</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Book className="h-4 w-4 mr-2" />
                Getting Started
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Code className="h-4 w-4 mr-2" />
                API Reference
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Admin Guide
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <Zap className="h-4 w-4 mr-2" />
                Troubleshooting
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="api">API Docs</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
              <TabsTrigger value="custom">Custom Docs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>ForexXnet Platform Overview</CardTitle>
                  <CardDescription>
                    A comprehensive trading signals platform with advanced analytics and automation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose max-w-none">
                    <h3>What is ForexXnet?</h3>
                    <p>
                      ForexXnet is an advanced trading signals platform that combines cutting-edge technical analysis
                      with intelligent automation to provide traders with high-quality forex trading signals.
                    </p>
                    
                    <h3>Key Components</h3>
                    <ul>
                      <li><strong>Signal Engine:</strong> Real-time technical analysis and signal generation</li>
                      <li><strong>Admin Panel:</strong> Comprehensive management and control system</li>
                      <li><strong>Business Analytics:</strong> Advanced metrics and performance tracking</li>
                      <li><strong>Automation Suite:</strong> Bots and notification systems</li>
                    </ul>

                    <h3>Getting Started</h3>
                    <ol>
                      <li>Create an account and choose a subscription plan</li>
                      <li>Configure your trading preferences and risk parameters</li>
                      <li>Start receiving real-time trading signals</li>
                      <li>Track your performance and optimize your strategy</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4">
                {FEATURES_GUIDE.map((feature, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {feature.icon}
                        {feature.title}
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Reference</CardTitle>
                  <CardDescription>RESTful API endpoints for developers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {API_DOCS.map((api, index) => (
                      <AccordionItem key={index} value={`api-${index}`}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{api.method}</Badge>
                            <code className="text-sm">{api.endpoint}</code>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <p>{api.description}</p>
                            
                            <div>
                              <h4 className="font-medium mb-2">Parameters:</h4>
                              <div className="flex flex-wrap gap-1">
                                {api.parameters.map((param, idx) => (
                                  <Badge key={idx} variant="secondary">{param}</Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Example:</h4>
                              <pre className="bg-muted p-3 rounded-md text-sm overflow-x-auto">
                                <code>{api.example}</code>
                              </pre>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guides" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Guides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="ghost" className="w-full justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Getting Started Guide</div>
                          <div className="text-sm text-muted-foreground">Learn the basics of using ForexXnet</div>
                        </div>
                      </Button>
                      <Separator />
                      <Button variant="ghost" className="w-full justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Trading Signals Tutorial</div>
                          <div className="text-sm text-muted-foreground">How to interpret and use trading signals</div>
                        </div>
                      </Button>
                      <Separator />
                      <Button variant="ghost" className="w-full justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Risk Management Best Practices</div>
                          <div className="text-sm text-muted-foreground">Essential risk management strategies</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Admin Guides</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="ghost" className="w-full justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Admin Panel Overview</div>
                          <div className="text-sm text-muted-foreground">Complete admin panel walkthrough</div>
                        </div>
                      </Button>
                      <Separator />
                      <Button variant="ghost" className="w-full justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Command System Guide</div>
                          <div className="text-sm text-muted-foreground">Using admin commands effectively</div>
                        </div>
                      </Button>
                      <Separator />
                      <Button variant="ghost" className="w-full justify-start h-auto p-4">
                        <div className="text-left">
                          <div className="font-medium">Business Analytics Dashboard</div>
                          <div className="text-sm text-muted-foreground">Understanding metrics and KPIs</div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                {isLoading ? (
                  <div>Loading documentation...</div>
                ) : filteredDocs.length === 0 ? (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Documentation Found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || selectedCategory !== "all" 
                          ? "No documentation matches your search criteria." 
                          : "Start by creating your first documentation."}
                      </p>
                      <Button onClick={() => setIsCreateDocOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Documentation
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  filteredDocs.map((doc) => (
                    <Card key={doc.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{doc.title}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="outline">{doc.category}</Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          <div dangerouslySetInnerHTML={{ __html: doc.content.substring(0, 300) + "..." }} />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-4">
                          {doc.tags?.map((tag, index) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}