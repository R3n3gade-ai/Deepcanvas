import { create } from 'zustand';
import { Workflow, WorkflowExecutionResult, WorkflowStore } from '../types';

// Mock data for demonstration
const mockWorkflows: Workflow[] = [
  {
    id: '1',
    name: 'Data Processing Workflow',
    description: 'A workflow that processes data from various sources',
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: true,
    tags: ['data', 'processing'],
    ownerId: 'user1',
  },
  {
    id: '2',
    name: 'Customer Onboarding',
    description: 'Automate the customer onboarding process',
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPublic: false,
    tags: ['customer', 'onboarding'],
    ownerId: 'user1',
  },
];

// Create the store
const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  workflows: mockWorkflows,
  currentWorkflow: null,
  executionResults: {},
  isLoading: false,
  error: null,

  // Fetch all workflows
  fetchWorkflows: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ workflows: mockWorkflows, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch workflows', isLoading: false });
    }
  },

  // Load a specific workflow
  loadWorkflow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const workflow = mockWorkflows.find(w => w.id === id);
      if (workflow) {
        set({ currentWorkflow: workflow, isLoading: false });
      } else {
        set({ error: 'Workflow not found', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load workflow', isLoading: false });
    }
  },

  // Create a new workflow
  createWorkflow: async (name: string, description: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const newWorkflow: Workflow = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        description,
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: false,
        tags: [],
        ownerId: 'user1',
      };
      set(state => ({
        workflows: [...state.workflows, newWorkflow],
        currentWorkflow: newWorkflow,
        isLoading: false,
      }));
      return newWorkflow.id;
    } catch (error) {
      set({ error: 'Failed to create workflow', isLoading: false });
      return '';
    }
  },

  // Update an existing workflow
  updateWorkflow: async (workflow: Workflow) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set(state => ({
        workflows: state.workflows.map(w => (w.id === workflow.id ? workflow : w)),
        currentWorkflow: workflow,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update workflow', isLoading: false });
    }
  },

  // Delete a workflow
  deleteWorkflow: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      set(state => ({
        workflows: state.workflows.filter(w => w.id !== id),
        currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete workflow', isLoading: false });
    }
  },

  // Execute a workflow
  executeWorkflow: async (input?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate execution results
      const results: Record<string, WorkflowExecutionResult> = {};
      const workflow = get().currentWorkflow;

      if (workflow) {
        workflow.nodes.forEach(node => {
          results[node.id] = {
            nodeId: node.id,
            status: 'success',
            data: { result: 'Sample output for ' + node.data.label },
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
          };
        });
      }

      set({ executionResults: results, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to execute workflow', isLoading: false });
    }
  },

  // Set the current workflow
  setCurrentWorkflow: (workflow: Workflow | null) => {
    set({ currentWorkflow: workflow });
  },
}));

export default useWorkflowStore;
