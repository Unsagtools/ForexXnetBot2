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
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Edit, Eye, Github, Globe, Star, Clock, Users, Code, Bot, Brain, TrendingUp, Database, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Project {
  id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

const PREDEFINED_PROJECTS = [
  {
    name: "Synalitica AI",
    description: "Advanced AI-powered analytics platform for comprehensive data insights and predictive modeling. Features machine learning algorithms, natural language processing, and automated report generation.",
    category: "ai",
    status: "in-progress",
    technologies: ["Python", "TensorFlow", "React", "FastAPI", "PostgreSQL", "Redis"],
    priority: 5,
    githubUrl: "https://github.com/forexXnet/synalitica-ai",
    features: [
      "Machine Learning Pipeline",
      "Natural Language Processing",
      "Predictive Analytics",
      "Real-time Data Processing",
      "Custom AI Models",
      "Automated Reporting"
    ]
  },
  {
    name: "N3tBot",
    description: "Intelligent networking bot for automated social media management, content distribution, and community engagement across multiple platforms.",
    category: "bot",
    status: "pending",
    technologies: ["Node.js", "TypeScript", "Discord.js", "Telegram Bot API", "MongoDB", "Redis"],
    priority: 4,
    githubUrl: "https://github.com/forexXnet/n3tbot",
    features: [
      "Multi-platform Support",
      "Automated Content Posting",
      "Community Management",
      "Analytics Dashboard",
      "Custom Commands",
      "Webhook Integration"
    ]
  },
  {
    name: "ForexXnet Analytics Suite",
    description: "Comprehensive analytics platform for trading performance tracking, market analysis, and portfolio optimization with advanced charting capabilities.",
    category: "analytics",
    status: "completed",
    technologies: ["React", "D3.js", "Node.js", "PostgreSQL", "Redis", "WebSocket"],
    priority: 5,
    liveUrl: "https://analytics.forexXnet.com",
    features: [
      "Real-time Market Data",
      "Performance Tracking",
      "Risk Assessment",
      "Portfolio Optimization",
      "Custom Indicators",
      "Export Capabilities"
    ]
  },
  {
    name: "TradingBot Pro",
    description: "Automated trading bot with advanced algorithms for forex market execution, risk management, and strategy optimization.",
    category: "trading",
    status: "on-hold",
    technologies: ["Python", "MetaTrader API", "Redis", "PostgreSQL", "Docker"],
    priority: 3,
    features: [
      "Algorithmic Trading",
      "Risk Management",
      "Strategy Backtesting",
      "Multi-broker Support",
      "Real-time Monitoring",
      "Performance Analytics"
    ]
  }
];

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/projects", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsCreateProjectOpen(false);
      toast({ title: "Project created successfully" });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/projects/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditingProject(null);
      toast({ title: "Project updated successfully" });
    },
  });

  const filteredProjects = [...projects, ...PREDEFINED_PROJECTS].filter((project) => {
    const matchesCategory = selectedCategory === "all" || project.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      case "on-hold": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in-progress": return "default";
      case "pending": return "secondary";
      case "on-hold": return "outline";
      default: return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ai": return <Brain className="h-5 w-5" />;
      case "bot": return <Bot className="h-5 w-5" />;
      case "trading": return <TrendingUp className="h-5 w-5" />;
      case "analytics": return <Database className="h-5 w-5" />;
      default: return <Code className="h-5 w-5" />;
    }
  };

  const getPriorityStars = (priority: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < priority ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  const ProjectForm = ({ project, onSubmit, onCancel }: {
    project?: Project;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: project?.name || "",
      description: project?.description || "",
      category: project?.category || "ai",
      status: project?.status || "pending",
      technologies: project?.technologies || [],
      priority: project?.priority || 1,
      githubUrl: project?.githubUrl || "",
      liveUrl: project?.liveUrl || "",
      startDate: project?.startDate ? new Date(project.startDate) : new Date(),
      endDate: project?.endDate ? new Date(project.endDate) : undefined,
    });

    const [newTech, setNewTech] = useState("");

    const addTechnology = () => {
      if (newTech.trim() && !formData.technologies.includes(newTech.trim())) {
        setFormData({ ...formData, technologies: [...formData.technologies, newTech.trim()] });
        setNewTech("");
      }
    };

    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Project name"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ai">AI & Machine Learning</SelectItem>
                <SelectItem value="bot">Bots & Automation</SelectItem>
                <SelectItem value="trading">Trading Systems</SelectItem>
                <SelectItem value="analytics">Analytics & Data</SelectItem>
                <SelectItem value="web">Web Applications</SelectItem>
                <SelectItem value="mobile">Mobile Apps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Project description and objectives"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority (1-5)</Label>
            <Select value={formData.priority.toString()} onValueChange={(value) => setFormData({ ...formData, priority: parseInt(value) })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Low</SelectItem>
                <SelectItem value="2">2 - Below Average</SelectItem>
                <SelectItem value="3">3 - Average</SelectItem>
                <SelectItem value="4">4 - High</SelectItem>
                <SelectItem value="5">5 - Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => setFormData({ ...formData, startDate: date || new Date() })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              placeholder="https://github.com/username/repo"
            />
          </div>
          <div>
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input
              id="liveUrl"
              value={formData.liveUrl}
              onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              placeholder="https://project.com"
            />
          </div>
        </div>

        <div>
          <Label>Technologies</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="Add technology"
                onKeyPress={(e) => e.key === "Enter" && addTechnology()}
              />
              <Button type="button" onClick={addTechnology}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {formData.technologies.map((tech, index) => (
                <Badge key={index} variant="secondary">
                  {tech}
                  <button
                    className="ml-1 text-xs"
                    onClick={() => setFormData({ 
                      ...formData, 
                      technologies: formData.technologies.filter((_, i) => i !== index) 
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
          <Button onClick={() => onSubmit(formData)}>
            {project ? "Update" : "Create"} Project
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
          <h1 className="text-3xl font-bold">Projects Portfolio</h1>
          <p className="text-muted-foreground">Manage and track project development progress</p>
        </div>
        <Dialog open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new project to your portfolio</DialogDescription>
            </DialogHeader>
            <ProjectForm
              onSubmit={(data) => createProjectMutation.mutate(data)}
              onCancel={() => setIsCreateProjectOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="ai">AI & Machine Learning</SelectItem>
            <SelectItem value="bot">Bots & Automation</SelectItem>
            <SelectItem value="trading">Trading Systems</SelectItem>
            <SelectItem value="analytics">Analytics & Data</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div>Loading projects...</div>
            ) : (
              filteredProjects.map((project, index) => (
                <Card key={project.id || index} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(project.category)}
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1">
                        {getPriorityStars(project.priority)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(project.status)}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(project.status)}`} />
                        {project.status.replace("-", " ")}
                      </Badge>
                      <Badge variant="outline">{project.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {project.technologies?.slice(0, 3).map((tech, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies?.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{project.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {project.status === "in-progress" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>65%</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <Button variant="outline" size="sm">
                            <Github className="h-4 w-4" />
                          </Button>
                        )}
                        {project.liveUrl && (
                          <Button variant="outline" size="sm">
                            <Globe className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewingProject(project as Project)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {project.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingProject(project as Project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>Chronological view of project milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {filteredProjects.map((project, index) => (
                  <div key={project.id || index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(project.status)}`} />
                      {index < filteredProjects.length - 1 && (
                        <div className="w-0.5 h-16 bg-muted mt-2" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{project.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Started: {project.startDate ? format(new Date(project.startDate), "MMM dd, yyyy") : "Not set"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {["pending", "in-progress", "completed", "on-hold"].map((status) => (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                    {status.replace("-", " ").toUpperCase()}
                    <Badge variant="outline" className="ml-auto">
                      {filteredProjects.filter(p => p.status === status).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredProjects
                    .filter(project => project.status === status)
                    .map((project, index) => (
                      <Card key={project.id || index} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(project.category)}
                            <span className="font-medium text-sm">{project.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {project.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {getPriorityStars(project.priority).slice(0, 3)}
                            </div>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Project Detail Dialog */}
      {viewingProject && (
        <Dialog open onOpenChange={() => setViewingProject(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getCategoryIcon(viewingProject.category)}
                {viewingProject.name}
              </DialogTitle>
              <DialogDescription>
                {viewingProject.category} • {viewingProject.status}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{viewingProject.description}</p>
              </div>
              
              {(viewingProject as any).features && (
                <div>
                  <h4 className="font-semibold mb-2">Key Features</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(viewingProject as any).features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Technologies</h4>
                <div className="flex flex-wrap gap-2">
                  {viewingProject.technologies?.map((tech, index) => (
                    <Badge key={index} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Priority</h4>
                  <div className="flex gap-1">
                    {getPriorityStars(viewingProject.priority)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Status</h4>
                  <Badge variant={getStatusBadgeVariant(viewingProject.status)}>
                    <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(viewingProject.status)}`} />
                    {viewingProject.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>

              {(viewingProject.githubUrl || viewingProject.liveUrl) && (
                <div className="flex gap-2">
                  {viewingProject.githubUrl && (
                    <Button variant="outline" asChild>
                      <a href={viewingProject.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        View Source
                      </a>
                    </Button>
                  )}
                  {viewingProject.liveUrl && (
                    <Button variant="outline" asChild>
                      <a href={viewingProject.liveUrl} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
              <DialogDescription>Update project details and status</DialogDescription>
            </DialogHeader>
            <ProjectForm
              project={editingProject}
              onSubmit={(data) => updateProjectMutation.mutate({ id: editingProject.id, ...data })}
              onCancel={() => setEditingProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}