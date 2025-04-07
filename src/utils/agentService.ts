import {
  Agent,
  AgentSession,
  AgentMessage,
  AgentMemory,
  AgentExecutionResult,
  AgentTool,
  ToolType,
  createNewAgent,
  createNewAgentSession,
  createNewAgentMessage,
  createNewAgentMemory
} from './agentTypes';
import * as unifiedAiService from './unifiedAiService';
import { generateMockResponse } from './mockAiService';
import { AIProvider } from './unifiedAiService';
import apiConnectService from './apiConnectService';
import { getProviderById } from './apiProviders';
import brainService from './brainService';
import workflowService from './workflowStore';

// Local storage keys
const AGENTS_STORAGE_KEY = 'agents_data';
const SESSIONS_STORAGE_KEY = 'agent_sessions_data';
const MESSAGES_STORAGE_KEY = 'agent_messages_data';
const MEMORIES_STORAGE_KEY = 'agent_memories_data';

// Load agents from local storage
export function loadAgents(userId: string): Agent[] {
  try {
    const agentsJson = localStorage.getItem(AGENTS_STORAGE_KEY);
    const allAgents = agentsJson ? JSON.parse(agentsJson) : [];
    return allAgents.filter((agent: Agent) => agent.userId === userId);
  } catch (error) {
    console.error('Error loading agents:', error);
    return [];
  }
}

// Save agents to local storage
export function saveAgents(agents: Agent[]): void {
  try {
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
  } catch (error) {
    console.error('Error saving agents:', error);
  }
}

// Get an agent by ID
export function getAgent(agentId: string): Agent | null {
  try {
    const agentsJson = localStorage.getItem(AGENTS_STORAGE_KEY);
    const agents = agentsJson ? JSON.parse(agentsJson) : [];
    return agents.find((agent: Agent) => agent.id === agentId) || null;
  } catch (error) {
    console.error('Error getting agent:', error);
    return null;
  }
}

// Create a new agent
export function createAgent(userId: string, name: string, description: string): Agent {
  try {
    const agents = loadAllAgents();

    const newAgent = createNewAgent(userId, name, description);

    agents.push(newAgent);
    saveAgents(agents);

    return newAgent;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw new Error('Failed to create agent');
  }
}

// Update an existing agent
export function updateAgent(agentId: string, updates: Partial<Agent>): Agent {
  try {
    const agents = loadAllAgents();
    const agentIndex = agents.findIndex(agent => agent.id === agentId);

    if (agentIndex === -1) {
      throw new Error('Agent not found');
    }

    const updatedAgent = {
      ...agents[agentIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    agents[agentIndex] = updatedAgent;
    saveAgents(agents);

    return updatedAgent;
  } catch (error) {
    console.error('Error updating agent:', error);
    throw new Error('Failed to update agent');
  }
}

// Delete an agent
export function deleteAgent(agentId: string): void {
  try {
    const agents = loadAllAgents();
    const updatedAgents = agents.filter(agent => agent.id !== agentId);
    saveAgents(updatedAgents);

    // Also delete related sessions, messages, and memories
    deleteAgentSessions(agentId);
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw new Error('Failed to delete agent');
  }
}

// Load agent sessions
export function loadAgentSessions(agentId: string, userId: string): AgentSession[] {
  try {
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY);
    const allSessions = sessionsJson ? JSON.parse(sessionsJson) : [];
    return allSessions.filter(
      (session: AgentSession) => session.agentId === agentId && session.userId === userId
    );
  } catch (error) {
    console.error('Error loading agent sessions:', error);
    return [];
  }
}

// Save agent sessions
export function saveAgentSessions(sessions: AgentSession[]): void {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Error saving agent sessions:', error);
  }
}

// Get an agent session by ID
export function getAgentSession(sessionId: string): AgentSession | null {
  try {
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY);
    const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
    return sessions.find((session: AgentSession) => session.id === sessionId) || null;
  } catch (error) {
    console.error('Error getting agent session:', error);
    return null;
  }
}

// Create a new agent session
export function createAgentSession(agentId: string, userId: string): AgentSession {
  try {
    const sessions = loadAllAgentSessions();

    const newSession = createNewAgentSession(agentId, userId);

    sessions.push(newSession);
    saveAgentSessions(sessions);

    return newSession;
  } catch (error) {
    console.error('Error creating agent session:', error);
    throw new Error('Failed to create agent session');
  }
}

// Update an agent session
export function updateAgentSession(sessionId: string, updates: Partial<AgentSession>): AgentSession {
  try {
    const sessions = loadAllAgentSessions();
    const sessionIndex = sessions.findIndex(session => session.id === sessionId);

    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...sessions[sessionIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    sessions[sessionIndex] = updatedSession;
    saveAgentSessions(sessions);

    return updatedSession;
  } catch (error) {
    console.error('Error updating agent session:', error);
    throw new Error('Failed to update agent session');
  }
}

// Delete an agent session
export function deleteAgentSession(sessionId: string): void {
  try {
    const sessions = loadAllAgentSessions();
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    saveAgentSessions(updatedSessions);

    // Also delete related messages
    deleteSessionMessages(sessionId);
  } catch (error) {
    console.error('Error deleting agent session:', error);
    throw new Error('Failed to delete agent session');
  }
}

// Delete all sessions for an agent
export function deleteAgentSessions(agentId: string): void {
  try {
    const sessions = loadAllAgentSessions();
    const agentSessions = sessions.filter(session => session.agentId === agentId);

    // Delete messages for each session
    agentSessions.forEach(session => {
      deleteSessionMessages(session.id);
    });

    // Delete the sessions
    const updatedSessions = sessions.filter(session => session.agentId !== agentId);
    saveAgentSessions(updatedSessions);
  } catch (error) {
    console.error('Error deleting agent sessions:', error);
    throw new Error('Failed to delete agent sessions');
  }
}

// Load agent messages
export function loadAgentMessages(sessionId: string): AgentMessage[] {
  try {
    const messagesJson = localStorage.getItem(MESSAGES_STORAGE_KEY);
    const allMessages = messagesJson ? JSON.parse(messagesJson) : [];
    return allMessages.filter(
      (message: AgentMessage) => message.sessionId === sessionId
    );
  } catch (error) {
    console.error('Error loading agent messages:', error);
    return [];
  }
}

// Save agent messages
export function saveAgentMessages(messages: AgentMessage[]): void {
  try {
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving agent messages:', error);
  }
}

// Add a message to a session
export function addAgentMessage(
  agentId: string,
  sessionId: string,
  role: 'user' | 'agent' | 'system',
  content: string
): AgentMessage {
  try {
    const messages = loadAllAgentMessages();

    const newMessage = createNewAgentMessage(agentId, sessionId, role, content);

    messages.push(newMessage);
    saveAgentMessages(messages);

    return newMessage;
  } catch (error) {
    console.error('Error adding agent message:', error);
    throw new Error('Failed to add agent message');
  }
}

// Delete all messages for a session
export function deleteSessionMessages(sessionId: string): void {
  try {
    const messages = loadAllAgentMessages();
    const updatedMessages = messages.filter(message => message.sessionId !== sessionId);
    saveAgentMessages(updatedMessages);
  } catch (error) {
    console.error('Error deleting session messages:', error);
    throw new Error('Failed to delete session messages');
  }
}

// Load agent memories
export function loadAgentMemories(agentId: string): AgentMemory[] {
  try {
    const memoriesJson = localStorage.getItem(MEMORIES_STORAGE_KEY);
    const allMemories = memoriesJson ? JSON.parse(memoriesJson) : [];
    return allMemories.filter(
      (memory: AgentMemory & { agentId: string }) => memory.agentId === agentId
    );
  } catch (error) {
    console.error('Error loading agent memories:', error);
    return [];
  }
}

// Save agent memories
export function saveAgentMemories(memories: (AgentMemory & { agentId: string })[]): void {
  try {
    localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories));
  } catch (error) {
    console.error('Error saving agent memories:', error);
  }
}

// Add a memory to an agent
export function addAgentMemory(
  agentId: string,
  type: 'short_term' | 'long_term',
  content: string
): AgentMemory {
  try {
    const memories = loadAllAgentMemories();

    const newMemory = {
      ...createNewAgentMemory(type, content),
      agentId
    };

    memories.push(newMemory);
    saveAgentMemories(memories);

    // Update the agent with the new memory
    const agent = getAgent(agentId);
    if (agent) {
      const updatedMemories = [...agent.memories, newMemory];
      updateAgent(agentId, { memories: updatedMemories });
    }

    return newMemory;
  } catch (error) {
    console.error('Error adding agent memory:', error);
    throw new Error('Failed to add agent memory');
  }
}

// Execute an agent with a user message
export async function executeAgent(
  agentId: string,
  sessionId: string,
  userMessage: string
): Promise<AgentExecutionResult> {
  try {
    // Get the agent
    const agent = getAgent(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Get the session
    let session = getAgentSession(sessionId);
    if (!session) {
      session = createAgentSession(agentId, agent.userId);
    }

    // Add the user message to the session
    const userMsg = addAgentMessage(agentId, sessionId, 'user', userMessage);

    // Prepare the context for the agent
    const context = await prepareAgentContext(agent, session, userMessage);

    // Determine which AI provider to use
    const provider = unifiedAiService.getDefaultProviderForTask('chat');

    // Prepare the messages for the AI
    const messages = prepareMessagesForAI(agent, session, context);

    // Generate the agent response
    let response;

    // For local development, use mock responses
    if (process.env.NODE_ENV === 'development' || !provider) {
      response = await generateMockResponse(messages);
    } else {
      response = await unifiedAiService.generateChatResponse(
        messages,
        {
          model: agent.defaultModel,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          systemPrompt: agent.personality.systemPrompt
        },
        provider
      );
    }

    // Process the response to extract tool calls and actions
    const { processedResponse, toolResults } = await processAgentResponse(agent, response);

    // Add the agent response to the session
    const agentMsg = addAgentMessage(agentId, sessionId, 'agent', processedResponse);

    // Create a memory from this interaction
    const memory = addAgentMemory(
      agentId,
      'short_term',
      `User: ${userMessage}\nAgent: ${processedResponse}`
    );

    return {
      success: true,
      output: processedResponse,
      toolResults,
      memories: [memory],
    };
  } catch (error) {
    console.error('Error executing agent:', error);

    // Add an error message to the session
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    addAgentMessage(agentId, sessionId, 'system', `Error: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Prepare context for the agent
async function prepareAgentContext(
  agent: Agent,
  session: AgentSession,
  userMessage: string
): Promise<string> {
  let context = '';

  // Add agent personality
  context += `You are ${agent.personality.name}. ${agent.personality.description}\n\n`;

  // Add agent capabilities
  if (agent.capabilities.length > 0) {
    context += 'Your capabilities include:\n';
    agent.capabilities.forEach(capability => {
      context += `- ${capability.name}: ${capability.description}\n`;
    });
    context += '\n';
  }

  // Add agent tools
  if (agent.tools.length > 0) {
    context += 'You have access to the following tools:\n';
    agent.tools.forEach(tool => {
      context += `- ${tool.name}: ${tool.description}\n`;
    });
    context += '\n';
  }

  // Add relevant memories
  const relevantMemories = await retrieveRelevantMemories(agent, userMessage);
  if (relevantMemories.length > 0) {
    context += 'Relevant information from your memory:\n';
    relevantMemories.forEach(memory => {
      context += `- ${memory.content}\n`;
    });
    context += '\n';
  }

  // Add relevant knowledge from the brain
  if (agent.tools.some(tool => tool.type === ToolType.BRAIN)) {
    const brainTool = agent.tools.find(tool => tool.type === ToolType.BRAIN);
    if (brainTool && brainTool.brainId) {
      const relevantKnowledge = await retrieveFromBrain(brainTool.brainId, userMessage);
      if (relevantKnowledge) {
        context += 'Relevant information from your knowledge base:\n';
        context += relevantKnowledge + '\n\n';
      }
    }
  }

  return context;
}

// Retrieve relevant memories for the agent
async function retrieveRelevantMemories(agent: Agent, query: string): Promise<AgentMemory[]> {
  // In a real implementation, this would use semantic search
  // For now, we'll just return the most recent memories
  return agent.memories.slice(-3);
}

// Retrieve information from the brain
async function retrieveFromBrain(brainId: string, query: string): Promise<string | null> {
  try {
    // This is a simplified implementation
    // In a real app, you would use the brain service to retrieve information
    return null;
  } catch (error) {
    console.error('Error retrieving from brain:', error);
    return null;
  }
}

// Prepare messages for the AI
function prepareMessagesForAI(
  agent: Agent,
  session: AgentSession,
  context: string
): unifiedAiService.ChatMessage[] {
  const messages: unifiedAiService.ChatMessage[] = [];

  // Add system message with context
  messages.push({
    id: 'system-1',
    role: 'system',
    content: agent.personality.systemPrompt + '\n\n' + context,
    timestamp: new Date()
  });

  // Add conversation history (last 10 messages)
  const sessionMessages = loadAgentMessages(session.id);
  const recentMessages = sessionMessages.slice(-10);

  recentMessages.forEach(msg => {
    messages.push({
      id: msg.id,
      role: msg.role === 'agent' ? 'assistant' : msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    });
  });

  return messages;
}

// Process the agent response to extract tool calls and actions
async function processAgentResponse(
  agent: Agent,
  response: string
): Promise<{ processedResponse: string; toolResults: Record<string, any> }> {
  // This is a simplified implementation
  // In a real app, you would parse the response to extract tool calls
  // and execute them

  const toolResults: Record<string, any> = {};

  // For now, we'll just return the response as is
  return {
    processedResponse: response,
    toolResults
  };
}

// Helper functions
function loadAllAgents(): Agent[] {
  try {
    const agentsJson = localStorage.getItem(AGENTS_STORAGE_KEY);
    return agentsJson ? JSON.parse(agentsJson) : [];
  } catch (error) {
    console.error('Error loading all agents:', error);
    return [];
  }
}

function loadAllAgentSessions(): AgentSession[] {
  try {
    const sessionsJson = localStorage.getItem(SESSIONS_STORAGE_KEY);
    return sessionsJson ? JSON.parse(sessionsJson) : [];
  } catch (error) {
    console.error('Error loading all agent sessions:', error);
    return [];
  }
}

function loadAllAgentMessages(): AgentMessage[] {
  try {
    const messagesJson = localStorage.getItem(MESSAGES_STORAGE_KEY);
    return messagesJson ? JSON.parse(messagesJson) : [];
  } catch (error) {
    console.error('Error loading all agent messages:', error);
    return [];
  }
}

function loadAllAgentMemories(): (AgentMemory & { agentId: string })[] {
  try {
    const memoriesJson = localStorage.getItem(MEMORIES_STORAGE_KEY);
    return memoriesJson ? JSON.parse(memoriesJson) : [];
  } catch (error) {
    console.error('Error loading all agent memories:', error);
    return [];
  }
}

// Export default object
const agentService = {
  loadAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  loadAgentSessions,
  getAgentSession,
  createAgentSession,
  updateAgentSession,
  deleteAgentSession,
  loadAgentMessages,
  addAgentMessage,
  loadAgentMemories,
  addAgentMemory,
  executeAgent
};

export default agentService;
