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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Terminal, Plus, Edit, Trash2, Send, Users, Settings, Broadcast, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AdminCommand {
  id: number;
  command: string;
  description: string;
  category: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCommands() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCommand, setEditingCommand] = useState<AdminCommand | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const { toast } = useToast();

  const { data: commands = [], isLoading } = useQuery({
    queryKey: ["/api/admin/commands"],
  });

  const createCommandMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/admin/commands", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commands"] });
      setIsCreateDialogOpen(false);
      toast({ title: "Command created successfully" });
    },
  });

  const updateCommandMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/admin/commands/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commands"] });
      setEditingCommand(null);
      toast({ title: "Command updated successfully" });
    },
  });

  const deleteCommandMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/commands/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commands"] });
      toast({ title: "Command deleted successfully" });
    },
  });

  const broadcastMutation = useMutation({
    mutationFn: (message: string) => apiRequest("/api/admin/broadcast", "POST", { message }),
    onSuccess: () => {
      setBroadcastMessage("");
      toast({ title: "Broadcast sent successfully" });
    },
  });

  const executeCommandMutation = useMutation({
    mutationFn: (commandId: number) => apiRequest(`/api/admin/commands/${commandId}/execute`, "POST"),
    onSuccess: () => {
      toast({ title: "Command executed successfully" });
    },
  });

  const filteredCommands = commands.filter((cmd: AdminCommand) => 
    selectedCategory === "all" || cmd.category === selectedCategory
  );

  const CategoryIcon = ({ category }: { category: string }) => {
    switch (category) {
      case "user": return <Users className="h-4 w-4" />;
      case "admin": return <Shield className="h-4 w-4" />;
      case "broadcast": return <Broadcast className="h-4 w-4" />;
      case "system": return <Settings className="h-4 w-4" />;
      default: return <Terminal className="h-4 w-4" />;
    }
  };

  const CommandForm = ({ command, onSubmit, onCancel }: {
    command?: AdminCommand;
    onSubmit: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      command: command?.command || "",
      description: command?.description || "",
      category: command?.category || "user",
      permissions: command?.permissions || [],
      isActive: command?.isActive ?? true,
    });

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="command">Command</Label>
          <Input
            id="command"
            value={formData.command}
            onChange={(e) => setFormData({ ...formData, command: e.target.value })}
            placeholder="/help, /ban, /broadcast"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What does this command do?"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User Commands</SelectItem>
              <SelectItem value="admin">Admin Commands</SelectItem>
              <SelectItem value="broadcast">Broadcast Commands</SelectItem>
              <SelectItem value="system">System Commands</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onSubmit(formData)}>
            {command ? "Update" : "Create"} Command
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
          <h1 className="text-3xl font-bold">Admin Commands Center</h1>
          <p className="text-muted-foreground">Manage system commands and broadcast messages</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Command
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Command</DialogTitle>
              <DialogDescription>Add a new administrative command to the system</DialogDescription>
            </DialogHeader>
            <CommandForm
              onSubmit={(data) => createCommandMutation.mutate(data)}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="commands" className="space-y-4">
        <TabsList>
          <TabsTrigger value="commands">Commands Management</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast Center</TabsTrigger>
          <TabsTrigger value="logs">Command Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="commands" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filter Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="user">User Commands</SelectItem>
                  <SelectItem value="admin">Admin Commands</SelectItem>
                  <SelectItem value="broadcast">Broadcast Commands</SelectItem>
                  <SelectItem value="system">System Commands</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {isLoading ? (
              <div>Loading commands...</div>
            ) : (
              filteredCommands.map((command: AdminCommand) => (
                <Card key={command.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={command.category} />
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm">{command.command}</code>
                            <Badge variant={command.isActive ? "default" : "secondary"}>
                              {command.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <Badge variant="outline">{command.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{command.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => executeCommandMutation.mutate(command.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCommand(command)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Command</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the command "{command.command}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteCommandMutation.mutate(command.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Broadcast Message</CardTitle>
              <CardDescription>Send a message to all active users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your broadcast message..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={() => broadcastMutation.mutate(broadcastMessage)}
                disabled={!broadcastMessage.trim()}
              >
                <Broadcast className="h-4 w-4 mr-2" />
                Send Broadcast
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Command Execution Logs</CardTitle>
              <CardDescription>Recent command executions and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Command logs will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingCommand && (
        <Dialog open onOpenChange={() => setEditingCommand(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Command</DialogTitle>
              <DialogDescription>Modify the selected command</DialogDescription>
            </DialogHeader>
            <CommandForm
              command={editingCommand}
              onSubmit={(data) => updateCommandMutation.mutate({ id: editingCommand.id, ...data })}
              onCancel={() => setEditingCommand(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}