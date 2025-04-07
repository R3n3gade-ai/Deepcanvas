import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import useWorkflowStore from "../utils/workflowStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { isWorkflowValid } from "../utils/workflowUtils";
import { toast } from "sonner";
import { Save, Play, Trash, Download, Upload, Plus, FileJson, Undo, Redo, Loader2 } from "lucide-react";

export function WorkflowControls() {
  const { fitView } = useReactFlow();
  const {
    nodes,
    edges,
    clearCanvas,
    saveWorkflow,
    createWorkflow,
    executeWorkflow,
    currentWorkflow,
    isLoading,
    isExecuting,
    executionResults
  } = useWorkflowStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState(currentWorkflow?.name || "");
  const [workflowDescription, setWorkflowDescription] = useState(currentWorkflow?.description || "");

  const handleSave = async () => {
    if (!workflowName.trim()) {
      toast.error("Workflow name is required");
      return;
    }

    try {
      if (currentWorkflow) {
        await saveWorkflow();
        toast.success("Workflow saved successfully");
      } else {
        await createWorkflow({
          name: workflowName,
          description: workflowDescription,
        });
        toast.success("Workflow created successfully");
      }

      setShowSaveDialog(false);
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error("Failed to save workflow");
    }
  };

  const handleExecute = async () => {
    if (!currentWorkflow) {
      toast.error("Please save the workflow before executing");
      setShowSaveDialog(true);
      return;
    }

    // Validate workflow
    const validation = isWorkflowValid(nodes);
    if (!validation.valid) {
      toast.error("Invalid workflow", {
        description: validation.message,
      });
      return;
    }

    try {
      await executeWorkflow(currentWorkflow.id);
      toast.success("Workflow execution started");
    } catch (error) {
      console.error("Error executing workflow:", error);
      toast.error("Failed to execute workflow");
    }
  };

  const handleClear = () => {
    if (nodes.length === 0 && edges.length === 0) {
      toast.info("Canvas is already empty");
      return;
    }

    const confirmed = window.confirm("Are you sure you want to clear the canvas? This will remove all nodes and connections.");
    if (confirmed) {
      clearCanvas();
      toast.success("Canvas cleared");
    }
  };

  const handleExport = () => {
    if (nodes.length === 0) {
      toast.error("Nothing to export");
      return;
    }

    const workflowData = {
      nodes,
      edges,
      metadata: {
        name: currentWorkflow?.name || "Exported Workflow",
        description: currentWorkflow?.description || "",
        exportedAt: new Date().toISOString(),
      },
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportName = `${workflowData.metadata.name.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportName);
    linkElement.click();

    toast.success("Workflow exported successfully");
  };

  const handleExecute = async () => {
    if (nodes.length === 0) {
      toast.error("Cannot execute an empty workflow");
      return;
    }

    // Check if workflow is valid
    const { valid, message } = isWorkflowValid(nodes, edges);
    if (!valid) {
      toast.error("Invalid workflow", {
        description: message || "Please check your workflow configuration"
      });
      return;
    }

    try {
      // Execute the workflow
      await executeWorkflow();

      // Fit the view to show all nodes
      setTimeout(() => fitView({ padding: 0.2 }), 100);
    } catch (error) {
      console.error("Error executing workflow:", error);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);

        if (!importedData.nodes || !Array.isArray(importedData.nodes)) {
          throw new Error("Invalid workflow format: missing nodes array");
        }

        if (!importedData.edges || !Array.isArray(importedData.edges)) {
          throw new Error("Invalid workflow format: missing edges array");
        }

        // Clear current canvas
        clearCanvas();

        // Import nodes and edges
        useWorkflowStore.setState({
          nodes: importedData.nodes,
          edges: importedData.edges,
        });

        // Set workflow name and description if available
        if (importedData.metadata?.name) {
          setWorkflowName(importedData.metadata.name);
        }

        if (importedData.metadata?.description) {
          setWorkflowDescription(importedData.metadata.description);
        }

        // Fit view to imported workflow
        setTimeout(() => {
          fitView({ padding: 0.2 });
        }, 100);

        toast.success("Workflow imported successfully");
      } catch (error) {
        console.error("Error importing workflow:", error);
        toast.error("Failed to import workflow", {
          description: error instanceof Error ? error.message : "Invalid workflow file",
        });
      }
    };

    reader.readAsText(file);

    // Reset the input
    event.target.value = "";
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm">
      {/* Save Workflow */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={isLoading}
          >
            <Save size={16} />
            {currentWorkflow ? "Save" : "Save As"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentWorkflow ? "Save Workflow" : "Save New Workflow"}</DialogTitle>
            <DialogDescription>
              {currentWorkflow
                ? "Update your workflow with the current canvas state."
                : "Save your workflow to access it later."}
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
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder="What does this workflow do?"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!workflowName.trim() || isLoading}>
              {isLoading ? "Saving..." : "Save Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execute Workflow */}
      <Button
        variant="default"
        size="sm"
        className="gap-1"
        onClick={handleExecute}
        disabled={isLoading || isExecuting || nodes.length === 0}
      >
        {isExecuting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Play size={16} />
            Execute
          </>
        )}
      </Button>

      {/* Clear Canvas */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={handleClear}
        disabled={isLoading || (nodes.length === 0 && edges.length === 0)}
      >
        <Trash size={16} />
        Clear
      </Button>

      {/* Export Workflow */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={handleExport}
        disabled={isLoading || nodes.length === 0}
      >
        <Download size={16} />
        Export
      </Button>

      {/* Import Workflow */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => document.getElementById("import-workflow")?.click()}
        disabled={isLoading}
      >
        <Upload size={16} />
        Import
        <input
          id="import-workflow"
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </Button>

      {/* Workflow Status */}
      {isLoading && (
        <div className="text-sm text-blue-600 animate-pulse">
          Processing...
        </div>
      )}

      {executionResults && (
        <div className={`text-sm ${executionResults.success ? "text-green-600" : "text-red-600"}`}>
          {executionResults.success ? "Execution successful" : "Execution completed with errors"}
        </div>
      )}
    </div>
  );
}
