import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { WorkflowCanvas } from "../components/WorkflowCanvas";
import { WorkflowResults } from "../components/WorkflowResults";
import useWorkflowStore from "../utils/workflowStore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loadWorkflow,
    currentWorkflow,
    isLoading,
    error,
    setCurrentWorkflow,
    executionResults
  } = useWorkflowStore();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Parse workflow ID from URL query parameters
    const params = new URLSearchParams(location.search);
    const workflowId = params.get("id");

    if (workflowId) {
      // Load existing workflow
      loadWorkflow(workflowId)
        .then(() => {
          setIsInitializing(false);
        })
        .catch((err) => {
          console.error("Error loading workflow:", err);
          toast.error("Failed to load workflow");
          setIsInitializing(false);
        });
    } else {
      // Start with a new workflow
      setCurrentWorkflow(null);
      setIsInitializing(false);
    }

    // Cleanup function
    return () => {
      // Reset workflow state when leaving the page
      setCurrentWorkflow(null);
    };
  }, [location.search, loadWorkflow, setCurrentWorkflow]);

  const handleBack = () => {
    navigate("/workflows");
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold mb-2">Loading Workflow</h2>
          <p className="text-gray-500">Please wait while we load your workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="mr-4"
            onClick={handleBack}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Workflows
          </Button>

          <div>
            <h1 className="text-xl font-semibold">
              {currentWorkflow ? currentWorkflow.name : "New Workflow"}
            </h1>
            {currentWorkflow?.description && (
              <p className="text-sm text-gray-500">{currentWorkflow.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1">
          <WorkflowCanvas />
        </div>

        {executionResults && (
          <div className="p-4">
            <WorkflowResults />
          </div>
        )}
      </div>
    </div>
  );
}
