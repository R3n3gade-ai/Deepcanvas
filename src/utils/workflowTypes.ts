// Type definitions for workflows

// Types for workflow components and connections
export interface WorkflowComponentIO {
  id: string;
  label: string;
  type: string; // string, number, boolean, array, object
  optional?: boolean;
}

export interface ConfigField {
  id: string;
  label: string;
  type: string; // text, textarea, number, select, checkbox, json, code, connection
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  language?: string;
  connectionType?: string;
  showIf?: { field: string; value: any };
}

export interface NodeTypeDefinition {
  category: string;
  description: string;
  inputs: WorkflowComponentIO[];
  outputs: WorkflowComponentIO[];
  configFields: ConfigField[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WorkflowExecutionResult {
  execution_id: string;
  status: string;
  node_results: Record<string, NodeExecutionResult>;
  overall_metrics?: Record<string, any>;
  execution_time: number;
  success: boolean;
}

export interface NodeExecutionResult {
  status: string; // 'success', 'error', 'skipped'
  execution_time?: number;
  output?: any;
  error?: string;
}

// Types for workflow store
export interface WorkflowState {
  workflows: Workflow[];
  isLoading: boolean;
  error: Error | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  currentWorkflow: Workflow | null;
  executionResults: WorkflowExecutionResult | null;
  
  // Fetch actions
  fetchWorkflows: () => Promise<void>;
  
  // Workflow actions
  createWorkflow: (data: { name: string; description?: string }) => Promise<string>;
  getWorkflow: (id: string) => Promise<void>;
  updateWorkflow: (id: string, data: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  saveWorkflow: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  executeWorkflow: (id: string, inputs?: Record<string, any>) => Promise<WorkflowExecutionResult>;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  
  // Canvas actions
  updateNodes: (nodes: WorkflowNode[]) => void;
  updateEdges: (edges: WorkflowEdge[]) => void;
  addNode: (type: string, position: { x: number; y: number }, data?: any) => void;
  addEdge: (source: string, target: string, sourceHandle?: string, targetHandle?: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  clearCanvas: () => void;
  
  // Computed properties
  selectedNode: WorkflowNode | null;
  selectedEdge: WorkflowEdge | null;
}
