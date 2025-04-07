// Agent Types and Interfaces

export enum AgentStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum AgentVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public',
}

export enum ToolType {
  API_CONNECTION = 'api_connection',
  WORKFLOW = 'workflow',
  BRAIN = 'brain',
  WEB_SEARCH = 'web_search',
  CODE_INTERPRETER = 'code_interpreter',
  FILE_OPERATION = 'file_operation',
  CUSTOM = 'custom',
}

export interface AgentTool {
  id: string;
  name: string;
  description: string;
  type: ToolType;
  config: Record<string, any>;
  // For API connections
  connectionId?: string;
  providerId?: string;
  // For workflows
  workflowId?: string;
  // For brain access
  brainId?: string;
  // For custom tools
  customCode?: string;
}

export interface AgentMemory {
  id: string;
  type: 'short_term' | 'long_term';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AgentPersonality {
  name: string;
  description: string;
  tone: string;
  traits: string[];
  systemPrompt: string;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon?: string;
  status: AgentStatus;
  visibility: AgentVisibility;
  createdAt: string;
  updatedAt: string;
  userId: string;
  teamId?: string;
  personality: AgentPersonality;
  capabilities: AgentCapability[];
  tools: AgentTool[];
  defaultModel: string;
  fallbackModel?: string;
  maxTokens: number;
  temperature: number;
  memories: AgentMemory[];
  metadata?: Record<string, any>;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  sessionId: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AgentSession {
  id: string;
  agentId: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  messages: AgentMessage[];
  metadata?: Record<string, any>;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  toolResults?: Record<string, any>;
  memories?: AgentMemory[];
  metadata?: Record<string, any>;
}

// Default templates for agent personalities
export const DEFAULT_AGENT_PERSONALITIES: AgentPersonality[] = [
  {
    name: 'Professional Assistant',
    description: 'A helpful, professional, and concise assistant',
    tone: 'professional',
    traits: ['helpful', 'professional', 'concise'],
    systemPrompt: 'You are a professional assistant. Be helpful, accurate, and concise in your responses.'
  },
  {
    name: 'Creative Collaborator',
    description: 'A creative, enthusiastic, and imaginative collaborator',
    tone: 'creative',
    traits: ['creative', 'enthusiastic', 'imaginative'],
    systemPrompt: 'You are a creative collaborator. Think outside the box and provide imaginative solutions and ideas.'
  },
  {
    name: 'Technical Expert',
    description: 'A technical, precise, and detailed expert',
    tone: 'technical',
    traits: ['technical', 'precise', 'detailed'],
    systemPrompt: 'You are a technical expert. Provide detailed, accurate, and technically sound information and solutions.'
  },
  {
    name: 'Friendly Guide',
    description: 'A friendly, approachable, and patient guide',
    tone: 'friendly',
    traits: ['friendly', 'approachable', 'patient'],
    systemPrompt: 'You are a friendly guide. Be approachable, patient, and supportive in helping users achieve their goals.'
  },
  {
    name: 'Analytical Advisor',
    description: 'An analytical, logical, and objective advisor',
    tone: 'analytical',
    traits: ['analytical', 'logical', 'objective'],
    systemPrompt: 'You are an analytical advisor. Approach problems logically, consider multiple perspectives, and provide objective analysis.'
  }
];

// Default agent capabilities
export const DEFAULT_AGENT_CAPABILITIES: AgentCapability[] = [
  {
    id: 'answer_questions',
    name: 'Answer Questions',
    description: 'Answer questions based on knowledge and context',
    examples: [
      'What is machine learning?',
      'How does photosynthesis work?',
      'Explain quantum computing'
    ]
  },
  {
    id: 'generate_content',
    name: 'Generate Content',
    description: 'Create various types of content based on prompts',
    examples: [
      'Write a blog post about sustainable energy',
      'Create a product description for a new smartphone',
      'Draft an email to schedule a meeting'
    ]
  },
  {
    id: 'analyze_data',
    name: 'Analyze Data',
    description: 'Analyze and interpret data to extract insights',
    examples: [
      'Analyze these sales figures and identify trends',
      'What insights can you extract from this customer feedback?',
      'Interpret these survey results'
    ]
  },
  {
    id: 'brainstorm_ideas',
    name: 'Brainstorm Ideas',
    description: 'Generate creative ideas and solutions',
    examples: [
      'Brainstorm marketing campaign ideas for a new product',
      'What are some team-building activities for remote teams?',
      'Generate names for a new pet food brand'
    ]
  },
  {
    id: 'summarize_content',
    name: 'Summarize Content',
    description: 'Create concise summaries of longer content',
    examples: [
      'Summarize this research paper',
      'Give me a summary of the key points in this article',
      'Condense these meeting notes into a brief summary'
    ]
  }
];

// Default agent tools
export const DEFAULT_AGENT_TOOLS: Omit<AgentTool, 'id'>[] = [
  {
    name: 'Web Search',
    description: 'Search the web for information',
    type: ToolType.WEB_SEARCH,
    config: {
      maxResults: 5,
      includeDomains: [],
      excludeDomains: []
    }
  },
  {
    name: 'Code Interpreter',
    description: 'Execute code to solve problems',
    type: ToolType.CODE_INTERPRETER,
    config: {
      languages: ['python', 'javascript'],
      timeoutSeconds: 30,
      maxOutputSize: 1000
    }
  },
  {
    name: 'Knowledge Base',
    description: 'Access information from the knowledge base',
    type: ToolType.BRAIN,
    config: {
      maxResults: 5,
      similarityThreshold: 0.7
    }
  }
];

// Helper function to create a new agent with defaults
export function createNewAgent(userId: string, name: string, description: string): Agent {
  return {
    id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    name,
    description,
    status: AgentStatus.DRAFT,
    visibility: AgentVisibility.PRIVATE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId,
    personality: DEFAULT_AGENT_PERSONALITIES[0],
    capabilities: [DEFAULT_AGENT_CAPABILITIES[0], DEFAULT_AGENT_CAPABILITIES[1]],
    tools: [],
    defaultModel: 'gpt-4o',
    maxTokens: 1000,
    temperature: 0.7,
    memories: [],
  };
}

// Helper function to create a new agent session
export function createNewAgentSession(agentId: string, userId: string): AgentSession {
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    agentId,
    userId,
    name: `Session ${new Date().toLocaleString()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
}

// Helper function to create a new agent message
export function createNewAgentMessage(
  agentId: string,
  sessionId: string,
  role: 'user' | 'agent' | 'system',
  content: string
): AgentMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    agentId,
    sessionId,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

// Helper function to create a new agent memory
export function createNewAgentMemory(
  type: 'short_term' | 'long_term',
  content: string
): AgentMemory {
  return {
    id: `memory-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type,
    content,
    timestamp: new Date().toISOString(),
  };
}
