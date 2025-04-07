export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  brainContext?: string; // Context from the Brain used for this message
}

export interface ChatSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  streamResponse: boolean;
  enableRAG: boolean;
  useKnowledgeBase?: boolean;
  userId?: string;
  systemPrompt?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  lastUpdated: Date;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
}

export interface ChatAction {
  type: string;
  name: string;
  description: string;
  icon: string;
  handler: () => void;
}
