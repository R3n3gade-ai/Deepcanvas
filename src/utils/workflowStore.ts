import { create } from 'zustand';
import { toast } from 'sonner';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowState,
  WorkflowExecutionResult
} from './workflowTypes';
import { generateId, validateConnection } from './workflowUtils';
import { executeWorkflow } from './workflowExecutionService';

// API base URL
const API_BASE_URL = '/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [],
  isLoading: false,
  error: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  currentWorkflow: null,
  executionResults: null,

  // Fetch workflows from API
  fetchWorkflows: async () => {
    set({ isLoading: true, error: null });

    try {
      const workflows = await apiCall<Workflow[]>('/workflows');
      set({ workflows, isLoading: false });
    } catch (error) {
      console.error('Error fetching workflows:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  // Create a new workflow
  createWorkflow: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const workflow = await apiCall<Workflow>('/workflows', 'POST', {
        name: data.name,
        description: data.description || '',
        nodes: get().nodes,
        edges: get().edges,
      });

      set((state) => ({
        workflows: [...state.workflows, workflow],
        currentWorkflow: workflow,
        isLoading: false,
      }));

      toast.success('Workflow created successfully');
      return workflow.id;
    } catch (error) {
      console.error('Error creating workflow:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to create workflow');
      throw error;
    }
  },

  // Get a workflow by ID
  getWorkflow: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const workflow = await apiCall<Workflow>(`/workflows/${id}`);
      set({ currentWorkflow: workflow, isLoading: false });
    } catch (error) {
      console.error('Error getting workflow:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to load workflow');
      throw error;
    }
  },

  // Update a workflow
  updateWorkflow: async (id, data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedWorkflow = await apiCall<Workflow>(`/workflows/${id}`, 'PUT', data);

      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id ? updatedWorkflow : w
        ),
        currentWorkflow: state.currentWorkflow?.id === id
          ? updatedWorkflow
          : state.currentWorkflow,
        isLoading: false,
      }));

      toast.success('Workflow updated successfully');
    } catch (error) {
      console.error('Error updating workflow:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to update workflow');
      throw error;
    }
  },

  // Delete a workflow
  deleteWorkflow: async (id) => {
    set({ isLoading: true, error: null });

    try {
      await apiCall(`/workflows/${id}`, 'DELETE');

      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
        currentWorkflow: state.currentWorkflow?.id === id
          ? null
          : state.currentWorkflow,
        isLoading: false,
      }));

      toast.success('Workflow deleted successfully');
    } catch (error) {
      console.error('Error deleting workflow:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to delete workflow');
      throw error;
    }
  },

  // Save the current workflow
  saveWorkflow: async () => {
    const { currentWorkflow, nodes, edges } = get();

    if (!currentWorkflow) {
      throw new Error('No workflow selected');
    }

    set({ isLoading: true, error: null });

    try {
      const updatedWorkflow = await apiCall<Workflow>(
        `/workflows/${currentWorkflow.id}`,
        'PUT',
        { nodes, edges }
      );

      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === currentWorkflow.id ? updatedWorkflow : w
        ),
        currentWorkflow: updatedWorkflow,
        isLoading: false,
      }));

      toast.success('Workflow saved successfully');
    } catch (error) {
      console.error('Error saving workflow:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to save workflow');
      throw error;
    }
  },

  // Load a workflow
  loadWorkflow: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const workflow = await apiCall<Workflow>(`/workflows/${id}`);

      set({
        currentWorkflow: workflow,
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        isLoading: false,
        selectedNodeId: null,
        selectedEdgeId: null,
        executionResults: null
      });

      toast.success(`Loaded workflow: ${workflow.name}`);
    } catch (error) {
      console.error('Error loading workflow:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to load workflow');
      throw error;
    }
  },

  // Execute a workflow
  executeWorkflow: async (id, inputs) => {
    set({ isLoading: true, error: null });

    try {
      const result = await apiCall<WorkflowExecutionResult>(
        `/workflows/execute`,
        'POST',
        { workflowId: id, inputs }
      );

      set({ isLoading: false, executionResults: result });

      // Apply execution results to nodes
      if (result.node_results) {
        const updatedNodes = get().nodes.map(node => {
          const nodeResult = result.node_results[node.id];

          if (nodeResult) {
            return {
              ...node,
              data: {
                ...node.data,
                executionResult: nodeResult
              }
            };
          }

          return node;
        });

        set({ nodes: updatedNodes });
      }

      if (result.success) {
        toast.success('Workflow executed successfully');
      } else {
        toast.error('Workflow execution completed with errors');
      }

      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      set({ error: error as Error, isLoading: false });
      toast.error('Failed to execute workflow');
      throw error;
    }
  },

  // Set the current workflow
  setCurrentWorkflow: (workflow) => {
    set({
      currentWorkflow: workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNodeId: null,
      selectedEdgeId: null,
      executionResults: null
    });
  },

  // Update nodes
  updateNodes: (nodes) => {
    set({ nodes });
  },

  // Update edges
  updateEdges: (edges) => {
    set({ edges });
  },

  // Add a new node
  addNode: (type, position, data = {}) => {
    const newNode: WorkflowNode = {
      id: generateId('node'),
      type,
      position,
      data: {
        ...data,
        type,
        label: data.label || type.charAt(0).toUpperCase() + type.slice(1),
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));

    toast.success(`Added ${type} node`);
  },

  // Add a new edge
  addEdge: (source, target, sourceHandle, targetHandle) => {
    // Validate connection
    const sourceNode = get().nodes.find(node => node.id === source);
    const targetNode = get().nodes.find(node => node.id === target);

    const validation = validateConnection(
      sourceNode,
      targetNode,
      sourceHandle,
      targetHandle
    );

    if (!validation.valid) {
      toast.error('Invalid connection', {
        description: validation.message || 'Cannot connect these nodes'
      });
      return;
    }

    // Get handle information for edge label
    const sourceHandleLabel = sourceHandle || 'default';
    const targetHandleLabel = targetHandle || 'default';
    const edgeLabel = `${sourceHandleLabel} → ${targetHandleLabel}`;

    // Create new edge
    const newEdge: WorkflowEdge = {
      id: generateId('edge'),
      source,
      target,
      sourceHandle: sourceHandle || undefined,
      targetHandle: targetHandle || undefined,
      type: 'default',
      animated: true,
      style: {
        stroke: '#555',
        strokeWidth: 2,
        transition: 'stroke 0.3s, stroke-width 0.3s',
      },
      data: {
        sourceHandleId: sourceHandle,
        targetHandleId: targetHandle,
        label: edgeLabel
      }
    };

    // Check for duplicate edges
    const isDuplicate = get().edges.some(
      edge => edge.source === source &&
             edge.target === target &&
             edge.sourceHandle === sourceHandle &&
             edge.targetHandle === targetHandle
    );

    if (isDuplicate) {
      toast.warning('Duplicate connection', {
        description: 'This connection already exists'
      });
      return;
    }

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    toast.success('Nodes connected', {
      description: `${sourceHandleLabel} → ${targetHandleLabel}`
    });
  },

  // Update node data
  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data } : node
      ),
    }));
  },

  // Remove a node
  removeNode: (nodeId) => {
    // Get connected edges before removing the node
    const connectedEdges = get().edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );

    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));

    // Show feedback about removed connections
    if (connectedEdges.length > 0) {
      toast.info(`Removed ${connectedEdges.length} connected ${
        connectedEdges.length > 1 ? 'edges' : 'edge'
      }`);
    }

    toast.success('Node removed');
  },

  // Remove an edge
  removeEdge: (edgeId) => {
    const edgeToRemove = get().edges.find(edge => edge.id === edgeId);

    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
    }));

    // Show feedback about the removed connection
    if (edgeToRemove) {
      const sourceHandleId = edgeToRemove.sourceHandle || 'default';
      const targetHandleId = edgeToRemove.targetHandle || 'default';

      toast.info(`Connection removed: ${sourceHandleId} → ${targetHandleId}`);
    }
  },

  // Select a node
  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId, selectedEdgeId: null });
  },

  // Select an edge
  selectEdge: (edgeId) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: null });
  },

  // Clear the canvas
  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      executionResults: null
    });

    toast.info('Canvas cleared');
  },

  // Execute the current workflow
  executeWorkflow: async () => {
    const { currentWorkflow } = get();

    if (!currentWorkflow) {
      toast.error('No workflow to execute');
      return;
    }

    // Set loading state
    set({ isExecuting: true, executionResults: null });

    try {
      // Execute the workflow
      const results = await executeWorkflow(currentWorkflow);

      // Update state with results
      set({
        executionResults: results,
        isExecuting: false
      });

      // Show success or error message
      if (results.success) {
        toast.success('Workflow executed successfully');
      } else {
        toast.error('Workflow execution failed', {
          description: results.error || 'Unknown error'
        });
      }

      return results;
    } catch (error) {
      console.error('Error executing workflow:', error);

      // Update state with error
      set({
        executionResults: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          executedNodes: {}
        },
        isExecuting: false
      });

      toast.error('Workflow execution failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  // Computed properties
  get selectedNode() {
    const { nodes, selectedNodeId } = get();
    return selectedNodeId
      ? nodes.find(node => node.id === selectedNodeId) || null
      : null;
  },

  get selectedEdge() {
    const { edges, selectedEdgeId } = get();
    return selectedEdgeId
      ? edges.find(edge => edge.id === selectedEdgeId) || null
      : null;
  },
}));

export { useWorkflowStore };
export default useWorkflowStore;
