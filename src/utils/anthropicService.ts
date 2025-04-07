import axios from 'axios';
import { Message, ChatSettings } from '../types/chat';
import { getApiKey } from './apiHubService';

// API configuration
interface AnthropicConfig {
  apiKey?: string;
  baseUrl: string;
  model: string;
}

const ANTHROPIC_CONFIG: AnthropicConfig = {
  baseUrl: "https://api.anthropic.com/v1",
  model: "claude-3-opus-20240229",
  // API key will be set from API Hub
};

// Load API key from API Hub
function loadApiKey(): string | null {
  return getApiKey('anthropic');
}

// Check if API key is set
export function isApiKeySet(): boolean {
  return !!loadApiKey();
}

// Get available models
export function getAvailableModels(): { id: string, name: string }[] {
  return [
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus" },
    { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet" },
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku" },
    { id: "claude-2.1", name: "Claude 2.1" },
    { id: "claude-2.0", name: "Claude 2.0" },
    { id: "claude-instant-1.2", name: "Claude Instant" }
  ];
}

// Generate a chat response using the Anthropic API
export async function generateChatResponse(
  messages: Message[],
  settings: ChatSettings
): Promise<string> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("Anthropic API key not found. Please set it in the API Hub.");
  }

  // Format messages for the Anthropic API
  const formattedMessages = messages.map(msg => {
    if (msg.role === 'system') {
      return { role: 'system', content: msg.content };
    } else if (msg.role === 'user') {
      return { role: 'user', content: msg.content };
    } else {
      return { role: 'assistant', content: msg.content };
    }
  });

  // Add system message if not already present
  if (!formattedMessages.some(msg => msg.role === 'system')) {
    formattedMessages.unshift({
      role: 'system',
      content: settings.systemPrompt || 'You are Claude, a helpful AI assistant.'
    });
  }

  try {
    // Make API call to Anthropic
    const response = await axios.post(
      `${ANTHROPIC_CONFIG.baseUrl}/messages`,
      {
        model: settings.model || ANTHROPIC_CONFIG.model,
        messages: formattedMessages,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        system: formattedMessages[0].content // Anthropic requires system message to be separate
      },
      {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the generated text
    return response.data.content[0].text;
  } catch (error) {
    console.error("Error generating chat response:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.error.message}`);
    } else {
      throw new Error("Failed to generate response. Please try again.");
    }
  }
}

// Stream a chat response using the Anthropic API
export async function streamChatResponse(
  messages: Message[],
  settings: ChatSettings,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    onError(new Error("Anthropic API key not found. Please set it in the API Hub."));
    return;
  }

  // Format messages for the Anthropic API
  const formattedMessages = messages.map(msg => {
    if (msg.role === 'system') {
      return { role: 'system', content: msg.content };
    } else if (msg.role === 'user') {
      return { role: 'user', content: msg.content };
    } else {
      return { role: 'assistant', content: msg.content };
    }
  });

  // Extract system message if present
  let systemMessage = settings.systemPrompt || 'You are Claude, a helpful AI assistant.';
  if (formattedMessages.length > 0 && formattedMessages[0].role === 'system') {
    systemMessage = formattedMessages[0].content;
    formattedMessages.shift();
  }

  try {
    // Make streaming API call to Anthropic
    const response = await fetch(`${ANTHROPIC_CONFIG.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model || ANTHROPIC_CONFIG.model,
        messages: formattedMessages,
        max_tokens: settings.maxTokens,
        temperature: settings.temperature,
        system: systemMessage,
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
            const content = parsed.delta?.text || '';
            
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
