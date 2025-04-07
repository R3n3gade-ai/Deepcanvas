import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { WorkflowCanvas } from '../components/workflow/WorkflowCanvas';
import { WorkflowControls } from '../components/workflow/WorkflowControls';
import { WorkflowResults } from '../components/workflow/WorkflowResults';
import useWorkflowStore from '../features/workflow/store/workflowStore';

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loadWorkflow,
    currentWorkflow,
    updateWorkflow,
    executeWorkflow,
    isLoading,
    error,
    setCurrentWorkflow,
    executionResults
  } = useWorkflowStore();

  const [showResults, setShowResults] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    // Parse workflow ID from URL query parameters
    const params = new URLSearchParams(location.search);
    const workflowId = params.get('id');

    if (workflowId) {
      // Check if the workflow exists in the store first
      const existingWorkflow = useWorkflowStore.getState().workflows.find(w => w.id === workflowId);

      if (existingWorkflow) {
        // If it exists, set it as the current workflow
        setCurrentWorkflow(existingWorkflow);
      } else {
        // Otherwise, try to load it
        loadWorkflow(workflowId);
      }
    } else {
      // Redirect to workflows page if no ID is provided
      navigate('/workflows');
    }

    // Cleanup function
    return () => {
      setCurrentWorkflow(null);
    };
  }, [location.search, loadWorkflow, navigate, setCurrentWorkflow]);

  const handleSave = async () => {
    if (currentWorkflow) {
      await updateWorkflow(currentWorkflow);
    }
  };

  const handleExecute = async () => {
    if (currentWorkflow) {
      setIsExecuting(true);
      setShowResults(true);
      await executeWorkflow();
      setIsExecuting(false);
    }
  };

  if (isLoading && !currentWorkflow) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => navigate('/workflows')}
          >
            Back to Workflows
          </button>
        </div>
      </div>
    );
  }

  if (!currentWorkflow) {
    // Create a default workflow if none is found
    const defaultWorkflow = {
      id: 'default',
      name: 'New Workflow',
      description: 'A new workflow',
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      tags: [],
      ownerId: 'user1',
    };

    // Set the default workflow as the current workflow
    setCurrentWorkflow(defaultWorkflow);

    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">{currentWorkflow?.name || 'Workflow Builder'}</h1>
            <p className="text-sm text-gray-500">{currentWorkflow?.description || 'Create and manage workflows'}</p>
          </div>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => navigate('/workflows')}
            >
              Back
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ReactFlowProvider>
          <div className="flex-1 h-full">
            <WorkflowCanvas
              workflow={currentWorkflow}
              onWorkflowChange={setCurrentWorkflow}
            />
          </div>

          <WorkflowControls
            onExecute={handleExecute}
            onSave={handleSave}
            isExecuting={isExecuting}
          />

          {showResults && (
            <WorkflowResults
              results={executionResults}
              onClose={() => setShowResults(false)}
            />
          )}
        </ReactFlowProvider>
      </div>
    </div>
  );
}