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
  defaultConfig?: Record<string, any>;
  icon?: string;
  color?: string;
}

export interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  inputs: WorkflowComponentIO[];
  outputs: WorkflowComponentIO[];
  config: Record<string, any>;
  icon?: string;
  color?: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  type?: string;
  animated?: boolean;
  label?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags: string[];
  ownerId: string;
}

export interface WorkflowExecutionResult {
  nodeId: string;
  status: 'success' | 'error' | 'running' | 'pending';
  data?: any;
  error?: string;
  startTime?: string;
  endTime?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  results: Record<string, WorkflowExecutionResult>;
  startTime: string;
  endTime?: string;
  input?: Record<string, any>;
}

export interface WorkflowStore {
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  executionResults: Record<string, WorkflowExecutionResult>;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWorkflows: () => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  createWorkflow: (name: string, description: string) => Promise<string>;
  updateWorkflow: (workflow: Workflow) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  executeWorkflow: (input?: Record<string, any>) => Promise<void>;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
}
