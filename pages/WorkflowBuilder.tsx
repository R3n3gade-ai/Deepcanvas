import React, { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { NodePanel } from '../components/NodePanel';
import { WorkflowCanvas } from '../components/WorkflowCanvas';
import { WorkflowControls } from '../components/WorkflowControls';
import { NodePropertiesPanel } from '../components/NodePropertiesPanel';
import { Sidebar } from '../components/Sidebar';
import { ReactFlowProvider } from '@xyflow/react';
import useWorkflowStore from '../utils/workflowStore';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { HelpCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function WorkflowBuilder() {
  const { fetchWorkflows, isLoading, error, loadWorkflow, currentWorkflow } = useWorkflowStore();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract current workflow name and ID
  const currentWorkflowName = currentWorkflow?.name;
  const currentWorkflowId = currentWorkflow?.id;

  useEffect(() => {
    fetchWorkflows().catch(err => {
      console.error('Error fetching workflows:', err);
      toast.error('Failed to load workflows');
    });
    
    // Check if we have a workflow ID in the URL query params
    const workflowId = searchParams.get('id');
    
    if (workflowId) {
      loadWorkflow(workflowId).catch(err => {
        console.error('Error loading workflow:', err);
        toast.error('Failed to load workflow');
        navigate('/workflows');
      });
    }
  }, [fetchWorkflows, searchParams, loadWorkflow, navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 py-3 px-6 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight">
              {currentWorkflowName || "Workflow Builder"}
            </h1>
            {currentWorkflowId && (
              <p className="text-xs text-gray-500 mt-0.5">
                ID: {currentWorkflowId}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <h3 className="font-medium">Workflow Builder Help</h3>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Getting Started</h4>
                    <ul className="text-sm text-gray-500 space-y-1 list-disc pl-4">
                      <li>Drag nodes from the left panel to the canvas</li>
                      <li>Connect nodes by dragging from one handle to another</li>
                      <li>Select a node to edit its properties</li>
                      <li>Create at least one Input and one Output node</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Working with Nodes</h4>
                    <ul className="text-sm text-gray-500 space-y-1 list-disc pl-4">
                      <li>Blue dots are input handles</li>
                      <li>Purple dots are output handles</li>
                      <li>Delete a node by selecting it and pressing delete</li>
                      <li>Rearrange nodes by dragging them</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Saving & Executing</h4>
                    <ul className="text-sm text-gray-500 space-y-1 list-disc pl-4">
                      <li>Use the panel on the right to save your workflow</li>
                      <li>Execute your workflow to test it</li>
                      <li>View execution results node-by-node</li>
                    </ul>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Node Selection */}
          <div className="w-64 border-r border-gray-200 bg-white overflow-y-auto">
            <NodePanel />
          </div>
          
          {/* Main Canvas Area */}
          <div className="flex-1 relative">
            <ReactFlowProvider>
              <WorkflowCanvas />
            </ReactFlowProvider>
          </div>
          
          {/* Right Panel - Controls & Properties */}
          <div className="w-72 border-l border-gray-200 bg-white overflow-y-auto flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <WorkflowControls />
            </div>
            <div className="border-t border-gray-200">
              <NodePropertiesPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}