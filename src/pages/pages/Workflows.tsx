import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWorkflowStore from "../utils/workflowStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Search, Clock, Calendar, ArrowRight, Trash, Edit, Play, Copy, Sparkles } from "lucide-react";
import { AIWorkflowAssistant } from "../components/AIWorkflowAssistant";

export default function Workflows() {
  const navigate = useNavigate();
  const {
    workflows,
    fetchWorkflows,
    createWorkflow,
    deleteWorkflow,
    isLoading,
    error
  } = useWorkflowStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchWorkflows().catch((err) => {
      console.error("Error fetching workflows:", err);
      toast.error("Failed to load workflows");
    });
  }, [fetchWorkflows]);

  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    try {
      const workflowId = await createWorkflow({
        name: workflowName,
        description: workflowDescription,
      });

      setShowCreateDialog(false);
      setWorkflowName("");
      setWorkflowDescription("");

      toast.success("Workflow created successfully");

      // Navigate to the workflow builder
      navigate(`/workflow-builder?id=${workflowId}`);
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("Failed to create workflow");
    }
  };

  const handleDeleteWorkflow = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    try {
      await deleteWorkflow(id);
      toast.success(`"${name}" deleted successfully`);
    } catch (error) {
      console.error("Error deleting workflow:", error);
      toast.error(`Failed to delete "${name}"`);
    }
  };

  const handleEditWorkflow = (id: string) => {
    navigate(`/workflow-builder?id=${id}`);
  };

  const handleDuplicateWorkflow = async (id: string, name: string) => {
    try {
      const workflow = workflows.find((w) => w.id === id);
      if (!workflow) return;

      const workflowId = await createWorkflow({
        name: `${name} (Copy)`,
        description: workflow.description,
      });

      toast.success(`"${name}" duplicated successfully`);

      // Navigate to the workflow builder
      navigate(`/workflow-builder?id=${workflowId}`);
    } catch (error) {
      console.error("Error duplicating workflow:", error);
      toast.error(`Failed to duplicate "${name}"`);
    }
  };

  // Filter workflows based on search term and active tab
  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (workflow.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "recent") {
      // Show workflows created or updated in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const createdAt = new Date(workflow.createdAt);
      const updatedAt = workflow.updatedAt ? new Date(workflow.updatedAt) : null;

      return (
        matchesSearch &&
        (createdAt >= sevenDaysAgo || (updatedAt && updatedAt >= sevenDaysAgo))
      );
    }

    return matchesSearch;
  });

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-gray-500 mt-1">
            Create and manage your automated workflows
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            className="gap-1 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setShowAIAssistant(true)}
          >
            <Sparkles size={16} />
            AI-Assisted Create
          </Button>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus size={16} />
                Create Workflow
              </Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Create a new workflow to automate your tasks.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="workflow-name" className="text-sm font-medium">
                  Workflow Name
                </label>
                <Input
                  id="workflow-name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="My Awesome Workflow"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="workflow-description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Input
                  id="workflow-description"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="What does this workflow do?"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWorkflow} disabled={!workflowName.trim() || isLoading}>
                {isLoading ? "Creating..." : "Create Workflow"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search workflows..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all" className="flex items-center gap-1">
                <Calendar size={14} />
                All Workflows
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-1">
                <Clock size={14} />
                Recent
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading && workflows.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No workflows found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? `No workflows matching "${searchTerm}"`
              : "You haven't created any workflows yet"}
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-1">
            <Plus size={16} />
            Create Your First Workflow
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkflows.map((workflow) => (
            <Card key={workflow.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>
                  {new Date(workflow.createdAt).toLocaleDateString()}
                  {workflow.updatedAt && workflow.updatedAt !== workflow.createdAt && (
                    <> · Updated {new Date(workflow.updatedAt).toLocaleDateString()}</>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {workflow.description || "No description provided"}
                </p>
                <div className="mt-4 flex items-center text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="mr-2 w-2 h-2 rounded-full bg-green-500" />
                    {workflow.nodes?.length || 0} nodes
                  </div>
                  <div className="mx-2">·</div>
                  <div className="flex items-center">
                    <div className="mr-2 w-2 h-2 rounded-full bg-blue-500" />
                    {workflow.edges?.length || 0} connections
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleEditWorkflow(workflow.id)}
                  >
                    <Edit size={14} />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleDuplicateWorkflow(workflow.id, workflow.name)}
                  >
                    <Copy size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="gap-1"
                  onClick={() => handleEditWorkflow(workflow.id)}
                >
                  <Play size={14} />
                  Run
                </Button>
              </CardFooter>
            </Card>
          ))}

          {/* Create New Workflow Card */}
          <Card className="overflow-hidden border-dashed border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setShowCreateDialog(true)}>
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="rounded-full bg-white p-3 mb-4 shadow-sm">
                <Plus size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">Create New Workflow</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Build a new workflow to automate your tasks
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* AI Workflow Assistant */}
      <AIWorkflowAssistant
        isOpen={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onWorkflowCreated={(workflowId) => navigate(`/workflow-builder?id=${workflowId}`)}
      />
    </div>
  );
}
