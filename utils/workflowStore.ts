import { create } from 'zustand';
import brain from 'brain';
import { toast } from 'sonner';
import { Edge, Node, NodeChange, EdgeChange, Connection } from '@xyflow/react';

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

interface WorkflowState {
  workflows: Workflow[];
  isLoading: boolean;
  error: Error | null;
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  currentWorkflow: Workflow | null;

  // Fetch actions
  fetchWorkflows: () => Promise<void>;
  
  // Workflow actions
  createWorkflow: (data: { name: string; description?: string }) => Promise<string>;
  getWorkflow: (id: string) => Promise<void>;
  updateWorkflow: (id: string, data: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  executeWorkflow: (id: string) => Promise<any>;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  
  // Canvas actions
  updateNodes: (nodes: Node[]) => void;
  updateEdges: (edges: Edge[]) => void;
  addNode: (type: string, position: { x: number; y: number }, data?: any) => void;
  addEdge: (source: string, target: string, sourceHandle?: string, targetHandle?: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  clearCanvas: () => void;

  // Computed properties
  selectedNode: Node | null;
  selectedEdge: Edge | null;
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

  fetchWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.list_workflows();
      const data = await response.json();
      set({ workflows: data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching workflows:', error);
      set({ error: error as Error, isLoading: false });
    }
  },

  createWorkflow: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.create_workflow({
        name: data.name,
        description: data.description || '',
        nodes: get().nodes,
        edges: get().edges,
      });
      const workflow = await response.json();
      set((state) => ({
        workflows: [...state.workflows, workflow],
        currentWorkflow: workflow,
        isLoading: false,
      }));
      return workflow.id;
    } catch (error) {
      console.error('Error creating workflow:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  getWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.get_workflow({ workflowId: id });
      const workflow = await response.json();
      set({ currentWorkflow: workflow, isLoading: false });
    } catch (error) {
      console.error('Error getting workflow:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  updateWorkflow: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.update_workflow({
        workflowId: id,
        ...data,
      });
      const updatedWorkflow = await response.json();
      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === id ? updatedWorkflow : w
        ),
        currentWorkflow: state.currentWorkflow?.id === id ? updatedWorkflow : state.currentWorkflow,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error updating workflow:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  deleteWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await brain.delete_workflow({ workflowId: id });
      set((state) => ({
        workflows: state.workflows.filter((w) => w.id !== id),
        currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error deleting workflow:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  saveWorkflow: async () => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow) throw new Error('No workflow selected');

    set({ isLoading: true, error: null });
    try {
      const response = await brain.update_workflow({
        workflowId: currentWorkflow.id,
        nodes,
        edges,
      });
      const updatedWorkflow = await response.json();
      set((state) => ({
        workflows: state.workflows.map((w) =>
          w.id === currentWorkflow.id ? updatedWorkflow : w
        ),
        currentWorkflow: updatedWorkflow,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error saving workflow:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  loadWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.get_workflow({ workflowId: id });
      const workflow = await response.json();
      
      set({ 
        currentWorkflow: workflow,
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading workflow:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  executeWorkflow: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.execute_workflow({ workflowId: id });
      const result = await response.json();
      set({ isLoading: false });
      
      // Apply execution results to nodes
      if (result.node_results) {
        // Update node visualization state based on execution results
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
      
      return result;
    } catch (error) {
      console.error('Error executing workflow:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null });
    toast.info('Canvas cleared');
  },

  setCurrentWorkflow: (workflow) => {
    set({ currentWorkflow: workflow });
  },

  updateNodes: (nodes) => {
    set({ nodes });
  },

  updateEdges: (edges) => {
    set({ edges });
  },

  addNode: (type, position, data = {}) => {
    const newNode: Node = {
      id: `node-${Date.now().toString(36)}`,
      type,
      position,
      data: {
        ...data,
        type,
        label: data.label || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
  },

  addEdge: (source, target, sourceHandle, targetHandle) => {
    // Validate connection
    const sourceNode = get().nodes.find(node => node.id === source);
    const targetNode = get().nodes.find(node => node.id === target);
    
    if (!sourceNode || !targetNode) {
      console.error('Cannot create edge: Source or target node not found');
      return;
    }
    
    // Get handle information for edge label
    const sourceHandleLabel = sourceHandle || 'default';
    const targetHandleLabel = targetHandle || 'default';
    const edgeLabel = `${sourceHandleLabel} → ${targetHandleLabel}`;
    
    // Create new edge with proper formatting
    const newEdge: Edge = {
      id: `edge-${source}-${target}-${Date.now().toString(36)}`,
      source,
      target,
      sourceHandle,
      targetHandle,
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
      edge => 
        edge.source === source && 
        edge.target === target && 
        edge.sourceHandle === sourceHandle && 
        edge.targetHandle === targetHandle
    );
    
    if (isDuplicate) {
      console.warn('Duplicate edge detected, not adding');
      return;
    }

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    console.log('Edge added successfully:', newEdge);
    
    // Show success toast with connection details
    toast.success(`Nodes connected: ${sourceHandleLabel} → ${targetHandleLabel}`, {
      duration: 2000
    });
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data } : node
      ),
    }));
  },
  
  updateNode: (nodeId, updatedNode) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === nodeId ? updatedNode : node
      ),
    }));
  },

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
    
    // Show feedback about removed connections if there were any
    if (connectedEdges.length > 0) {
      toast.info(`Removed ${connectedEdges.length} connected edge${connectedEdges.length > 1 ? 's' : ''}`);
    }
  },

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
      toast.info(`Connection removed: ${sourceHandleId} → ${targetHandleId}`, {
        duration: 2000
      });
    }
  },

  selectNode: (nodeId) => {
    set({ selectedNodeId: nodeId, selectedEdgeId: null });
  },

  selectEdge: (edgeId) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: null });
  },

  clearCanvas: () => {
    set({ nodes: [], edges: [], selectedNodeId: null, selectedEdgeId: null });
  },

  // Computed properties
  get selectedNode() {
    const { nodes, selectedNodeId } = get();
    return selectedNodeId ? nodes.find(node => node.id === selectedNodeId) || null : null;
  },

  get selectedEdge() {
    const { edges, selectedEdgeId } = get();
    return selectedEdgeId ? edges.find(edge => edge.id === selectedEdgeId) || null : null;
  },
}));

export { useWorkflowStore };
export default useWorkflowStore;