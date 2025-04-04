import { useState } from "react";
import useWorkflowStore from "../utils/workflowStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { WorkflowExecutionResults } from "./WorkflowExecutionResults";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Play, Save, RefreshCw, Trash2, Check, X, AlertTriangle, Clock } from "lucide-react";
import React, { useState } from 'react';
import useWorkflowStore from '../utils/workflowStore';
import { toast } from 'sonner';
import { formatNodeType } from '../utils/workflowUtils';

interface WorkflowExecutionResult {
  success: boolean;
  execution_time: number;
  node_results: {
    [nodeId: string]: {
      status: 'success' | 'error' | 'skipped';
      execution_time?: number;
      output?: any;
      error?: string;
    };
  };
  overall_metrics?: {
    success_rate: number;
    total_execution_time: number;
    nodes_processed: number;
  };
}

export function WorkflowControls() {
  const { 
    currentWorkflow, 
    workflows, 
    createWorkflow, 
    saveWorkflow,
    executeWorkflow,
    fetchWorkflows, 
    loadWorkflow,
    deleteWorkflow,
    nodes,
    clearCanvas
  } = useWorkflowStore();
  
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDescription, setNewWorkflowDescription] = useState('');
  const activeWorkflowId = currentWorkflow?.id;
  const activeWorkflow = currentWorkflow;
  const [executionResults, setExecutionResults] = useState<any>(null);
  const [isExecutingWorkflow, setIsExecutingWorkflow] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('workflow');
  const [executionError, setExecutionError] = useState<string | null>(null);
  
  const handleExecuteWorkflow = async () => {
    if (!activeWorkflowId) {
      toast.error('No workflow selected');
      return;
    }
    
    if (nodes.length === 0) {
      toast.error('Workflow has no nodes');
      return;
    }
    
    setIsExecutingWorkflow(true);
    setExecutionError(null);
    toast.loading('Executing workflow...', { id: 'execute-workflow' });
    
    try {
      // Reset any previous execution statuses
      resetNodeExecutionStatus();
      
      const results = await executeWorkflow(activeWorkflowId);
      setExecutionResults(results);
      
      // Apply visual feedback to nodes
      updateNodesWithExecutionResults(results);
      
      toast.success('Workflow execution complete', { id: 'execute-workflow' });
      setActiveTab('results');
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Workflow execution failed', { id: 'execute-workflow' });
      setExecutionError(String(error));
    } finally {
      setIsExecutingWorkflow(false);
    }
  };
  
  const resetNodeExecutionStatus = () => {
    // Remove execution status classes from all nodes
    nodes.forEach(node => {
      const nodeElement = document.getElementById(node.id);
      if (nodeElement) {
        nodeElement.classList.remove(
          'node-success', 'node-error', 'node-executing', 'node-skipped'
        );
      }
    });
  };
  
  const updateNodesWithExecutionResults = (results: any) => {
    if (!results.node_results) return;
    
    // Update each node with its execution result
    Object.entries(results.node_results).forEach(([nodeId, result]: [string, any]) => {
      const nodeElement = document.getElementById(nodeId);
      if (nodeElement) {
        // Remove any existing status classes
        nodeElement.classList.remove(
          'node-success', 'node-error', 'node-executing', 'node-skipped'
        );
        
        // Add appropriate status class
        switch (result.status) {
          case 'success':
            nodeElement.classList.add('node-success');
            break;
          case 'error':
            nodeElement.classList.add('node-error');
            break;
          case 'skipped':
            nodeElement.classList.add('node-skipped');
            break;
        }
      }
    });
  };
  
  const clearExecutionResults = () => {
    setExecutionResults(null);
    resetNodeExecutionStatus();
    setActiveTab('workflow');
  };
  
  return (
    <Card className="w-full bg-white shadow-sm border">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              Workflow Controls
            </CardTitle>
            <TabsList>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="results" disabled={!executionResults}>Results</TabsTrigger>
            </TabsList>
          </div>
          <CardDescription>
            {activeTab === 'workflow' ? 
              'Create, manage and run your workflow' : 
              'View execution results and metrics'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-4">
          <TabsContent value="workflow" className="m-0 space-y-4">
            {currentWorkflow ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{currentWorkflow.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {nodes.length} nodes
                    </Badge>
                  </div>
                  {currentWorkflow.description && (
                    <p className="text-xs text-muted-foreground">{currentWorkflow.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={handleExecuteWorkflow} 
                    disabled={isExecutingWorkflow || nodes.length === 0}
                    className="w-full"
                    size="sm"
                  >
                    {isExecutingWorkflow ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-3 w-3" />
                        Run Workflow
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={clearCanvas}
                    disabled={isExecutingWorkflow || nodes.length === 0}
                    className="w-full"
                    size="sm"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Clear Canvas
                  </Button>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No workflow loaded</AlertTitle>
                <AlertDescription>
                  Create or select a workflow to continue
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="results" className="m-0 space-y-4">
            {executionResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-muted rounded-md p-2 text-center">
                    <div className="text-lg font-bold">
                      {executionResults.overall_metrics?.success_rate || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                  
                  <div className="bg-muted rounded-md p-2 text-center">
                    <div className="text-lg font-bold">
                      {executionResults.overall_metrics?.total_execution_time?.toFixed(2) || 0}s
                    </div>
                    <div className="text-xs text-muted-foreground">Total Time</div>
                  </div>
                  
                  <div className="bg-muted rounded-md p-2 text-center">
                    <div className="text-lg font-bold">
                      {executionResults.overall_metrics?.nodes_processed || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Nodes</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xs font-medium">Node Results</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {Object.entries(executionResults.node_results || {}).map(([nodeId, result]: [string, any]) => {
                      const node = nodes.find(n => n.id === nodeId);
                      const nodeType = node?.data?.type || 'unknown';
                      const nodeLabel = node?.data?.label || formatNodeType(nodeType);
                      
                      return (
                        <div key={nodeId} className="border rounded-md overflow-hidden text-xs">
                          <div className={`flex items-center justify-between px-2 py-1 border-b ${
                            result.status === 'success' ? 'bg-green-50' : 
                            result.status === 'error' ? 'bg-red-50' : 'bg-yellow-50'
                          }`}>
                            <div className="flex items-center gap-1">
                              {result.status === 'success' ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : result.status === 'error' ? (
                                <X className="h-3 w-3 text-red-500" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              )}
                              <span className="font-medium truncate max-w-[120px]">{nodeLabel}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {formatNodeType(nodeType)}
                              </Badge>
                              {result.execution_time !== undefined && (
                                <div className="flex items-center text-[10px] text-muted-foreground">
                                  <Clock className="h-2 w-2 mr-0.5" />
                                  {result.execution_time.toFixed(2)}s
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {(result.output || result.error) && (
                            <div className="p-2 text-[10px]">
                              {result.status === 'success' && result.output && (
                                <div className="space-y-1">
                                  <div className="font-medium text-[10px] text-muted-foreground">Output:</div>
                                  <div className="bg-muted p-1 rounded font-mono text-[10px] overflow-auto max-h-16">
                                    {typeof result.output === 'object' 
                                      ? JSON.stringify(result.output, null, 2)
                                      : String(result.output)}
                                  </div>
                                </div>
                              )}
                              
                              {result.status === 'error' && result.error && (
                                <div className="space-y-1">
                                  <div className="font-medium text-[10px] text-muted-foreground">Error:</div>
                                  <div className="bg-red-50 text-red-800 p-1 rounded font-mono text-[10px] overflow-auto max-h-16">
                                    {result.error}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={clearExecutionResults}>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Clear Results
                  </Button>
                </div>
              </div>
            ) : executionError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Execution Failed</AlertTitle>
                <AlertDescription className="text-xs font-mono overflow-auto max-h-40">
                  {executionError}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto opacity-50 mb-2" />
                <p className="text-sm">No execution results yet</p>
                <p className="text-xs">Run the workflow to see results</p>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
  
  const handleSave = async () => {
    if (!activeWorkflowId) {
      toast.error("No active workflow to save");
      return;
    }
    
    try {
      await saveWorkflow();
      toast.success("Workflow saved successfully");
    } catch (error) {
      console.error("Error saving workflow:", error);
      toast.error("Error saving workflow");
    }
  };
  
  const handleCreate = async () => {
    if (!newWorkflowName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }
    
    try {
      await createWorkflow({
        name: newWorkflowName, 
        description: newWorkflowDescription
      });
      setNewWorkflowName('');
      setNewWorkflowDescription('');
      toast.success("New workflow created");
      await fetchWorkflows();
    } catch (error) {
      console.error("Error creating workflow:", error);
      toast.error("Error creating workflow");
    }
  };
  
  const handleExecute = async () => {
    if (!activeWorkflowId) {
      toast.error("No active workflow to execute");
      return;
    }
    
    setIsExecutingWorkflow(true);
    setExecutionResults(null);
    setExecutionError(null);
    
    try {
      const result = await executeWorkflow(activeWorkflowId);
      setExecutionResults(result);
      
      if (result.status === 'completed') {
        toast.success("Workflow executed successfully");
      } else {
        toast.error("Workflow execution failed");
      }
    } catch (error) {
      console.error("Error executing workflow:", error);
      setExecutionError(error instanceof Error ? error.message : String(error));
      toast.error("Error executing workflow");
    } finally {
      setIsExecutingWorkflow(false);
    }
  };
  
  // Function to clear execution results
  const handleClearResults = () => {
    setExecutionResults(null);
    setExecutionError(null);
  };
  
  const handleDelete = async (workflowId: string) => {
    if (!workflowId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this workflow?");
    if (!confirmed) return;
    
    try {
      await deleteWorkflow(workflowId);
      toast.success("Workflow deleted successfully");
      await fetchWorkflows();
    } catch (error) {
      console.error("Error deleting workflow:", error);
      toast.error("Error deleting workflow");
    }
  };

  return (
    <div className="h-full w-full overflow-auto bg-white p-4">
      <Tabs defaultValue="manage">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="execute">
            Execute
            {executionResults && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-50">
                ✓
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Saved Workflows</h3>
            
            {workflows.length === 0 ? (
              <p className="text-sm text-gray-500">No workflows found. Create one to get started.</p>
            ) : (
              <div className="space-y-2">
                {workflows.map(workflow => (
                  <div 
                    key={workflow.id} 
                    className={
                      `rounded-md border p-3 ${activeWorkflowId === workflow.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`
                    }
                  >
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{workflow.name}</h4>
                        {workflow.description && (
                          <p className="text-sm text-gray-500">{workflow.description}</p>
                        )}
                        <p className="text-xs text-gray-400">Last updated: {new Date(workflow.updatedAt || workflow.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => loadWorkflow(workflow.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleDelete(workflow.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => fetchWorkflows()}
                className="w-full"
              >
                Refresh List
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4 p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">Create New Workflow</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Workflow Name</label>
                <Input
                  value={newWorkflowName}
                  onChange={(e) => setNewWorkflowName(e.target.value)}
                  placeholder="My Workflow"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <Input
                  value={newWorkflowDescription}
                  onChange={(e) => setNewWorkflowDescription(e.target.value)}
                  placeholder="Workflow description"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCreate} className="mt-2 w-full">
                Create Workflow
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="execute" className="space-y-4 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                Execute Workflow
                {activeWorkflow && `: ${activeWorkflow.name}`}
              </h3>
              {executionResults && (
                <Badge variant={executionResults.status === 'completed' ? 'outline' : 'destructive'} className="px-2 py-1">
                  {executionResults.status === 'completed' ? 'Completed' : 'Failed'}
                </Badge>
              )}
            </div>
            
            {!activeWorkflowId ? (
              <div className="rounded-md border border-amber-100 bg-amber-50 p-3 text-amber-800">
                <p className="text-sm">Select a workflow from the Manage tab to execute it.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleExecute}
                  disabled={isExecutingWorkflow}
                  className="w-full"
                  variant={executionResults ? (executionResults.status === 'completed' ? 'outline' : 'destructive') : 'default'}
                >
                  {isExecutingWorkflow ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    executionResults ? 'Execute Again' : 'Execute Workflow'
                  )}
                </Button>
                
                {executionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Execution Failed</AlertTitle>
                    <AlertDescription>{executionError}</AlertDescription>
                  </Alert>
                )}
                
                {isExecutingWorkflow && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center justify-center rounded-md bg-blue-50 px-4 py-2 text-sm text-blue-700">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>Executing workflow...</span>
                    </div>
                  </div>
                )}
                
                {executionResults && (
                  <div className="space-y-3 mt-4">
                    <Separator />
                    <WorkflowExecutionResults 
                      executionResults={executionResults} 
                      onClear={handleClearResults} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {activeWorkflowId && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {activeWorkflow?.name || "Current Workflow"}
              </h3>
              {activeWorkflow?.description && (
                <p className="text-xs text-gray-500">{activeWorkflow.description}</p>
              )}
            </div>
            <Button onClick={handleSave} size="sm">
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}