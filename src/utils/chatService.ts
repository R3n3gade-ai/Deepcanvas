import axios from 'axios';
import { Message, ChatSettings } from '../types/chat';
import { getApiKey } from './apiHubService';
import brainService from './brainService';

// API configuration
interface GeminiConfig {
  apiKey?: string;
  baseUrl: string;
  model: string;
}

const GEMINI_CONFIG: GeminiConfig = {
  baseUrl: "https://generativelanguage.googleapis.com/v1",
  model: "gemini-pro",
  // API key will be set from local storage
};

// Local storage keys
const API_KEYS_STORAGE_KEY = "studio_api_keys";
const CHAT_HISTORY_KEY = "chat_history";

// Load API key from local storage or API Hub
function loadApiKey(): string | null {
  // First, try to get the API key from the API Hub
  const apiHubKey = getApiKey('google-ai');
  if (apiHubKey) {
    return apiHubKey;
  }

  // Fallback to the old method (for backward compatibility)
  try {
    const savedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (savedKeys) {
      const parsedKeys = JSON.parse(savedKeys);
      return parsedKeys.gemini || null;
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
  return null;
}

// Save chat history to local storage
export function saveChatHistory(chatId: string, messages: Message[]): void {
  try {
    // Get existing chat history
    const chatHistoryJson = localStorage.getItem(CHAT_HISTORY_KEY);
    const chatHistory = chatHistoryJson ? JSON.parse(chatHistoryJson) : {};

    // Update with new messages
    chatHistory[chatId] = {
      messages,
      lastUpdated: new Date().toISOString(),
    };

    // Save back to local storage
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

// Load chat history from local storage
export function loadChatHistory(): Record<string, { messages: Message[], lastUpdated: string }> {
  try {
    const chatHistoryJson = localStorage.getItem(CHAT_HISTORY_KEY);
    return chatHistoryJson ? JSON.parse(chatHistoryJson) : {};
  } catch (error) {
    console.error('Error loading chat history:', error);
    return {};
  }
}

// Delete a chat from history
export function deleteChatHistory(chatId: string): void {
  try {
    const chatHistoryJson = localStorage.getItem(CHAT_HISTORY_KEY);
    if (chatHistoryJson) {
      const chatHistory = JSON.parse(chatHistoryJson);
      delete chatHistory[chatId];
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
    }
  } catch (error) {
    console.error('Error deleting chat history:', error);
  }
}

// Clear all chat history
export function clearAllChatHistory(): void {
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

// Generate a chat response using the Gemini API
export async function generateChatResponse(
  messages: Message[],
  settings: ChatSettings
): Promise<string> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please set it in the Studio settings.");
  }

  // Set the API key and model
  GEMINI_CONFIG.apiKey = apiKey;
  GEMINI_CONFIG.model = settings.model;

  // Get the user's query (last message)
  const userQuery = messages.length > 0 && messages[messages.length - 1].role === 'user'
    ? messages[messages.length - 1].content
    : undefined;

  // Get the system prompt with context from the Brain
  const systemPrompt = await generateSystemPrompt(settings, userQuery);

  // Add system message to the beginning
  const messagesWithSystem = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  // Format messages for the Gemini API
  const formattedMessages = messagesWithSystem.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    parts: [{ text: msg.content }]
  }));

  try {
    // Make API call to Gemini
    const response = await axios.post(
      `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
      {
        contents: formattedMessages,
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: settings.maxTokens,
        }
      }
    );

    // Extract the generated text
    const responseText = response.data.candidates[0].content.parts[0].text;

    // Log successful response to Brain
    if (settings.userId) {
      try {
        brainService.logActivity({
          type: 'chat',
          action: 'ai_response_generated',
          details: {
            model: settings.model,
            queryLength: userQuery?.length || 0,
            responseLength: responseText.length
          },
          userId: settings.userId
        });
      } catch (error) {
        console.error('Error logging AI response to Brain:', error);
      }
    }

    return responseText;
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate response. Please try again.");
  }
}

// Stream a chat response using the Gemini API
export async function streamChatResponse(
  messages: Message[],
  settings: ChatSettings,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    onError(new Error("Gemini API key not found. Please set it in the Studio settings."));
    return;
  }

  // Set the API key and model
  GEMINI_CONFIG.apiKey = apiKey;
  GEMINI_CONFIG.model = settings.model;

  // Get the user's query (last message)
  const userQuery = messages.length > 0 && messages[messages.length - 1].role === 'user'
    ? messages[messages.length - 1].content
    : undefined;

  // Get the system prompt with context from the Brain
  const systemPrompt = await generateSystemPrompt(settings, userQuery);

  // Add system message to the beginning
  const messagesWithSystem = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  // Format messages for the Gemini API
  const formattedMessages = messagesWithSystem.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : msg.role,
    parts: [{ text: msg.content }]
  }));

  try {
    // Make streaming API call to Gemini
    // Note: This is a simplified implementation as Gemini API doesn't directly support streaming
    // In a real implementation, you would use SSE or a similar approach

    // For now, we'll simulate streaming with small delays
    const response = await axios.post(
      `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
      {
        contents: formattedMessages,
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: settings.maxTokens,
        }
      }
    );

    const fullResponse = response.data.candidates[0].content.parts[0].text;
    let streamedText = '';

    // Simulate streaming by sending chunks of the response
    const words = fullResponse.split(' ');

    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50)); // Delay between chunks
      streamedText += (i > 0 ? ' ' : '') + words[i];
      onChunk(streamedText);
    }

    // Log successful response to Brain
    if (settings.userId) {
      try {
        brainService.logActivity({
          type: 'chat',
          action: 'ai_response_generated',
          details: {
            model: settings.model,
            queryLength: userQuery?.length || 0,
            responseLength: fullResponse.length,
            streaming: true
          },
          userId: settings.userId
        });
      } catch (error) {
        console.error('Error logging AI response to Brain:', error);
      }
    }

    onComplete(fullResponse);
  } catch (error) {
    console.error("Error streaming chat response:", error);
    onError(new Error("Failed to generate response. Please try again."));
  }
}

// Process file for RAG (Retrieval Augmented Generation)
export async function processFileForRAG(file: File): Promise<string> {
  // This is a placeholder for actual RAG processing
  // In a real implementation, you would:
  // 1. Extract text from the file
  // 2. Generate embeddings
  // 3. Store in a vector database
  // 4. Return a confirmation or file ID

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`File "${file.name}" processed for RAG`);
    }, 1000);
  });
}

// Generate a system prompt based on the user's data and context
export async function generateSystemPrompt(settings: ChatSettings, userQuery?: string): Promise<string> {
  let systemPrompt = "You are DeepCanvas AI, an intelligent assistant for business professionals. ";
  systemPrompt += "You provide helpful, accurate, and concise responses. ";

  // Add context about the current date and time
  const now = new Date();
  systemPrompt += `\n\nCurrent date and time: ${now.toLocaleString()}`;

  // Check if RAG is enabled
  const enableRAG = settings.useKnowledgeBase !== false;

  if (enableRAG) {
    systemPrompt += "\n\nYou have access to the user's documents and data, which you can reference in your responses. ";
    systemPrompt += "When answering questions about their data, cite the specific documents or sources you're using.";

    // Add knowledge from the Brain if available
    if (userQuery) {
      try {
        // Use a mock user ID for now - in a real app, get this from authentication
        const userId = settings.userId || "user-123";

        // Get relevant knowledge from the Brain
        const brainContext = await brainService.generateContext(userId, userQuery, 5);

        if (brainContext) {
          systemPrompt += `\n\n${brainContext}`;

          // Log this search to the Brain for future reference
          brainService.logActivity({
            type: 'search',
            action: 'knowledge_search',
            details: {
              query: userQuery,
              resultsFound: brainContext.length > 0
            },
            userId
          });
        }
      } catch (error) {
        console.error('Error getting knowledge from Brain:', error);
      }
    }
  }

  return systemPrompt;
}

// Export a function to check if the API key is set
export function isApiKeySet(): boolean {
  return !!loadApiKey();
}

// Get available models based on connected APIs
export function getAvailableModels(): { id: string, name: string, provider: string }[] {
  const models = [
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google-ai' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'google-ai' },
  ];

  // Check if we have OpenAI API key
  const openAiKey = getApiKey('openai');
  if (openAiKey) {
    models.push(
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai' }
    );
  }

  // Check if we have Anthropic API key
  const anthropicKey = getApiKey('anthropic');
  if (anthropicKey) {
    models.push(
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' }
    );
  }

  return models;
}
