// Type definitions for workflows

// Types for workflow components and connections
export interface WorkflowComponentIO {
  id: string;
  label: string;
  type: string; // string, number, boolean, array, object
}

export interface WorkflowComponent {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  inputs: WorkflowComponentIO[];
  outputs: WorkflowComponentIO[];
}

export interface WorkflowConnection {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  components: WorkflowComponent[];
  connections: WorkflowConnection[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface WorkflowExecutionResult {
  execution_id: string;
  status: string;
  output?: Record<string, any>;
  errors?: Record<string, string>;
}