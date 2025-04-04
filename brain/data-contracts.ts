/** ApiConnectionCreate */
export interface ApiConnectionCreate {
  /** Name */
  name: string;
  /** Service */
  service: string;
  /** Description */
  description?: string | null;
  /** Api Key */
  api_key: string;
}

/** ApiConnectionResponse */
export interface ApiConnectionResponse {
  /** Name */
  name: string;
  /** Service */
  service: string;
  /** Description */
  description?: string | null;
  /** Id */
  id: string;
  /**
   * Status
   * @default "untested"
   */
  status?: string;
  /** Last Tested */
  last_tested?: string | null;
}

/** ApiConnectionTest */
export interface ApiConnectionTest {
  /** Id */
  id: string;
}

/** ApiConnectionTestResponse */
export interface ApiConnectionTestResponse {
  /** Id */
  id: string;
  /** Status */
  status: string;
  /** Message */
  message: string;
}

/** ApiConnectionUpdate */
export interface ApiConnectionUpdate {
  /** Name */
  name?: string | null;
  /** Service */
  service?: string | null;
  /** Description */
  description?: string | null;
  /** Api Key */
  api_key?: string | null;
}

/** ChatRequest */
export interface ChatRequest {
  /** Messages */
  messages: Message[];
  /**
   * Temperature
   * @default 0.7
   */
  temperature?: number | null;
  /**
   * Max Output Tokens
   * @default 800
   */
  max_output_tokens?: number | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** Message */
export interface Message {
  /** Role */
  role: string;
  /** Content */
  content: string;
}

/** SchemaGenerationRequest */
export interface SchemaGenerationRequest {
  /** Collections */
  collections?: string[] | null;
  /**
   * Depth
   * @default 3
   */
  depth?: number;
  /**
   * Sample Limit
   * @default 10
   */
  sample_limit?: number;
}

/** SchemaGenerationResponse */
export interface SchemaGenerationResponse {
  /** Status */
  status: string;
  /** Schema Data */
  schema_data: Record<string, any>;
  /** Message */
  message: string;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** Workflow */
export interface Workflow {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Nodes */
  nodes?: WorkflowNode[];
  /** Edges */
  edges?: WorkflowEdge[];
  /** Createdat */
  createdAt?: string;
  /** Updatedat */
  updatedAt?: string | null;
  /** Createdby */
  createdBy?: string | null;
}

/** WorkflowCreate */
export interface WorkflowCreate {
  /** Name */
  name: string;
  /** Description */
  description?: string | null;
  /** Nodes */
  nodes?: WorkflowNode[];
  /** Edges */
  edges?: WorkflowEdge[];
}

/** WorkflowEdge */
export interface WorkflowEdge {
  /** Id */
  id: string;
  /** Source */
  source: string;
  /** Target */
  target: string;
  /** Sourcehandle */
  sourceHandle?: string | null;
  /** Targethandle */
  targetHandle?: string | null;
}

/** WorkflowExecuteInput */
export interface WorkflowExecuteInput {
  /** Workflowid */
  workflowId: string;
  /** Input */
  input?: Record<string, any>;
}

/** WorkflowExecuteResult */
export interface WorkflowExecuteResult {
  /** Executionid */
  executionId: string;
  /** Status */
  status: string;
  /** Output */
  output?: Record<string, any> | null;
  /** Errors */
  errors?: Record<string, string> | null;
  /** Starttime */
  startTime?: string;
  /** Endtime */
  endTime?: string | null;
  /** Metrics */
  metrics?: Record<string, any> | null;
  /** Noderesults */
  nodeResults?: Record<string, any> | null;
}

/** WorkflowNode */
export interface WorkflowNode {
  /** Id */
  id: string;
  /** Type */
  type: string;
  /** Position */
  position: Record<string, number>;
  data?: WorkflowNodeData;
}

/** WorkflowNodeData */
export interface WorkflowNodeData {
  /** Label */
  label?: string | null;
  /** Type */
  type?: string | null;
  /** Inputs */
  inputs?: Record<string, any>[] | null;
  /** Outputs */
  outputs?: Record<string, any>[] | null;
  [key: string]: any;
}

/** WorkflowUpdate */
export interface WorkflowUpdate {
  /** Name */
  name?: string | null;
  /** Description */
  description?: string | null;
  /** Nodes */
  nodes?: WorkflowNode[] | null;
  /** Edges */
  edges?: WorkflowEdge[] | null;
}

export type CheckHealthData = HealthResponse;

export type GenerateSchemaData = SchemaGenerationResponse;

export type GenerateSchemaError = HTTPValidationError;

/** Response Get Structure Diagram */
export type GetStructureDiagramData = Record<string, any>;

/** Response Get Schema */
export type GetSchemaData = Record<string, any>;

export type ChatWithGeminiData = any;

export type ChatWithGeminiError = HTTPValidationError;

/** Response List Connections */
export type ListConnectionsData = ApiConnectionResponse[];

export type CreateConnectionData = ApiConnectionResponse;

export type CreateConnectionError = HTTPValidationError;

export interface GetConnectionParams {
  /** Connection Id */
  connectionId: string;
}

export type GetConnectionData = ApiConnectionResponse;

export type GetConnectionError = HTTPValidationError;

export interface UpdateConnectionParams {
  /** Connection Id */
  connectionId: string;
}

export type UpdateConnectionData = ApiConnectionResponse;

export type UpdateConnectionError = HTTPValidationError;

export interface DeleteConnectionParams {
  /** Connection Id */
  connectionId: string;
}

export type DeleteConnectionData = any;

export type DeleteConnectionError = HTTPValidationError;

export type TestConnectionData = ApiConnectionTestResponse;

export type TestConnectionError = HTTPValidationError;

/** Response List Workflows */
export type ListWorkflowsData = Workflow[];

export type CreateWorkflowData = Workflow;

export type CreateWorkflowError = HTTPValidationError;

export interface GetWorkflowParams {
  /** Workflow Id */
  workflowId: string;
}

export type GetWorkflowData = Workflow;

export type GetWorkflowError = HTTPValidationError;

export interface UpdateWorkflowParams {
  /** Workflow Id */
  workflowId: string;
}

export type UpdateWorkflowData = Workflow;

export type UpdateWorkflowError = HTTPValidationError;

export interface DeleteWorkflowParams {
  /** Workflow Id */
  workflowId: string;
}

export type DeleteWorkflowData = any;

export type DeleteWorkflowError = HTTPValidationError;

export type ExecuteWorkflowData = WorkflowExecuteResult;

export type ExecuteWorkflowError = HTTPValidationError;
