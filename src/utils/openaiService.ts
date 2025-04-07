import axios from 'axios';
import { Message, ChatSettings } from '../types/chat';
import { getApiKey } from './apiHubService';

// API configuration
interface OpenAIConfig {
  apiKey?: string;
  baseUrl: string;
  model: string;
}

const OPENAI_CONFIG: OpenAIConfig = {
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o",
  // API key will be set from API Hub
};

// Load API key from API Hub
function loadApiKey(): string | null {
  return getApiKey('openai');
}

// Check if API key is set
export function isApiKeySet(): boolean {
  return !!loadApiKey();
}

// Get available models
export async function getAvailableModels(): Promise<{ id: string, name: string }[]> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    return [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
    ];
  }

  try {
    const response = await axios.get(`${OPENAI_CONFIG.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // Filter for chat models only
    const chatModels = response.data.data
      .filter((model: any) => 
        model.id.includes('gpt-4') || 
        model.id.includes('gpt-3.5-turbo'))
      .map((model: any) => ({
        id: model.id,
        name: model.id
          .replace('gpt-4-turbo', 'GPT-4 Turbo')
          .replace('gpt-4o', 'GPT-4o')
          .replace('gpt-4', 'GPT-4')
          .replace('gpt-3.5-turbo', 'GPT-3.5 Turbo')
      }));

    return chatModels;
  } catch (error) {
    console.error("Error fetching OpenAI models:", error);
    return [
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" }
    ];
  }
}

// Generate a chat response using the OpenAI API
export async function generateChatResponse(
  messages: Message[],
  settings: ChatSettings
): Promise<string> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("OpenAI API key not found. Please set it in the API Hub.");
  }

  // Format messages for the OpenAI API
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // Add system message if not already present
  if (!formattedMessages.some(msg => msg.role === 'system')) {
    formattedMessages.unshift({
      role: 'system',
      content: settings.systemPrompt || 'You are a helpful assistant.'
    });
  }

  try {
    // Make API call to OpenAI
    const response = await axios.post(
      `${OPENAI_CONFIG.baseUrl}/chat/completions`,
      {
        model: settings.model || OPENAI_CONFIG.model,
        messages: formattedMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the generated text
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating chat response:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.error.message}`);
    } else {
      throw new Error("Failed to generate response. Please try again.");
    }
  }
}

// Stream a chat response using the OpenAI API
export async function streamChatResponse(
  messages: Message[],
  settings: ChatSettings,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    onError(new Error("OpenAI API key not found. Please set it in the API Hub."));
    return;
  }

  // Format messages for the OpenAI API
  const formattedMessages = messages.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  // Add system message if not already present
  if (!formattedMessages.some(msg => msg.role === 'system')) {
    formattedMessages.unshift({
      role: 'system',
      content: settings.systemPrompt || 'You are a helpful assistant.'
    });
  }

  try {
    // Make streaming API call to OpenAI
    const response = await fetch(`${OPENAI_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model || OPENAI_CONFIG.model,
        messages: formattedMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullResponse = "";
    let buffer = "";

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk
      const chunk = decoder.decode(value);
      buffer += chunk;

      // Process complete SSE messages
      while (buffer.includes('\n\n')) {
        const messageEnd = buffer.indexOf('\n\n');
        const message = buffer.slice(0, messageEnd);
        buffer = buffer.slice(messageEnd + 2);

        if (message.startsWith('data: ')) {
          const data = message.slice(6);
          
          // Handle the "[DONE]" message
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content || '';
            
            if (content) {
              fullResponse += content;
              onChunk(fullResponse);
            }
          } catch (e) {
            console.error('Error parsing SSE message:', e);
          }
        }
      }
    }

    onComplete(fullResponse);
  } catch (error) {
    console.error("Error streaming chat response:", error);
    onError(new Error("Failed to generate streaming response. Please try again."));
  }
}
