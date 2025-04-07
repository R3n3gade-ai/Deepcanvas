export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  created_at: string;
  updated_at: string;
  settings: ChatSettings;
  context: SessionContext;
}

export interface ChatSettings {
  model: 'gemini-pro' | 'gemini-pro-vision';
  temperature: number;
  maxTokens: number;
  customInstructions?: string;
  enableRAG: boolean;
  streamResponse: boolean;
}

export interface SessionContext {
  userHistory: UserActivityLog[];
  activeProjects?: string[];
  recentDocuments?: string[];
  workflowContext?: string[];
}