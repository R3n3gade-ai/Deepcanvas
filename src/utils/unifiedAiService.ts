import { Message, ChatSettings } from '../types/chat';
import * as geminiService from './chatService';
import * as openaiService from './openaiService';
import * as anthropicService from './anthropicService';
import * as stabilityAiService from './stabilityAiService';
import { getApiKey } from './apiHubService';

// Enum for AI providers
export enum AIProvider {
  GEMINI = 'google-ai',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  STABILITY_AI = 'stability-ai',
  VERTEX_AI = 'vertex-ai'
}

// Check if a provider's API key is set
export function isProviderApiKeySet(provider: AIProvider): boolean {
  switch (provider) {
    case AIProvider.GEMINI:
      return geminiService.isApiKeySet();
    case AIProvider.OPENAI:
      return openaiService.isApiKeySet();
    case AIProvider.ANTHROPIC:
      return anthropicService.isApiKeySet();
    case AIProvider.STABILITY_AI:
      return stabilityAiService.isApiKeySet();
    case AIProvider.VERTEX_AI:
      return !!getApiKey('vertex-ai');
    default:
      return false;
  }
}

// Get available models for a provider
export async function getAvailableModels(provider: AIProvider): Promise<{ id: string, name: string }[]> {
  switch (provider) {
    case AIProvider.GEMINI:
      return geminiService.getAvailableModels();
    case AIProvider.OPENAI:
      return openaiService.getAvailableModels();
    case AIProvider.ANTHROPIC:
      return anthropicService.getAvailableModels();
    case AIProvider.STABILITY_AI:
      return stabilityAiService.getAvailableEngines();
    case AIProvider.VERTEX_AI:
      // Placeholder for Vertex AI models
      return [
        { id: "text-bison", name: "Text Bison" },
        { id: "chat-bison", name: "Chat Bison" },
        { id: "gemini-pro", name: "Gemini Pro (Vertex)" }
      ];
    default:
      return [];
  }
}

// Generate a chat response using the specified provider
export async function generateChatResponse(
  messages: Message[],
  settings: ChatSettings,
  provider: AIProvider
): Promise<string> {
  switch (provider) {
    case AIProvider.GEMINI:
      return geminiService.generateChatResponse(messages, settings);
    case AIProvider.OPENAI:
      return openaiService.generateChatResponse(messages, settings);
    case AIProvider.ANTHROPIC:
      return anthropicService.generateChatResponse(messages, settings);
    default:
      throw new Error(`Provider ${provider} does not support chat responses.`);
  }
}

// Stream a chat response using the specified provider
export async function streamChatResponse(
  messages: Message[],
  settings: ChatSettings,
  provider: AIProvider,
  onChunk: (chunk: string) => void,
  onComplete: (fullResponse: string) => void,
  onError: (error: Error) => void
): Promise<void> {
  switch (provider) {
    case AIProvider.GEMINI:
      return geminiService.streamChatResponse(messages, settings, onChunk, onComplete, onError);
    case AIProvider.OPENAI:
      return openaiService.streamChatResponse(messages, settings, onChunk, onComplete, onError);
    case AIProvider.ANTHROPIC:
      return anthropicService.streamChatResponse(messages, settings, onChunk, onComplete, onError);
    default:
      onError(new Error(`Provider ${provider} does not support streaming chat responses.`));
  }
}

// Generate an image using Stability AI
export async function generateImage(
  prompt: string,
  options: stabilityAiService.ImageGenerationOptions
): Promise<string[]> {
  return stabilityAiService.generateImage({
    prompt,
    ...options
  });
}

// Generate an image from another image using Stability AI
export async function generateImageFromImage(
  options: stabilityAiService.ImageToImageOptions
): Promise<string[]> {
  return stabilityAiService.generateImageFromImage(options);
}

// Upscale an image using Stability AI
export async function upscaleImage(
  options: stabilityAiService.UpscaleOptions
): Promise<string> {
  return stabilityAiService.upscaleImage(options);
}

// Get the default provider for a specific AI task
export function getDefaultProviderForTask(task: 'chat' | 'image' | 'audio' | 'code'): AIProvider {
  switch (task) {
    case 'chat':
      // Check which providers are available and return the first one
      if (isProviderApiKeySet(AIProvider.GEMINI)) return AIProvider.GEMINI;
      if (isProviderApiKeySet(AIProvider.OPENAI)) return AIProvider.OPENAI;
      if (isProviderApiKeySet(AIProvider.ANTHROPIC)) return AIProvider.ANTHROPIC;
      return AIProvider.GEMINI; // Default to Gemini
    
    case 'image':
      if (isProviderApiKeySet(AIProvider.STABILITY_AI)) return AIProvider.STABILITY_AI;
      if (isProviderApiKeySet(AIProvider.OPENAI)) return AIProvider.OPENAI;
      return AIProvider.STABILITY_AI; // Default to Stability AI
    
    case 'code':
      if (isProviderApiKeySet(AIProvider.OPENAI)) return AIProvider.OPENAI;
      if (isProviderApiKeySet(AIProvider.ANTHROPIC)) return AIProvider.ANTHROPIC;
      if (isProviderApiKeySet(AIProvider.GEMINI)) return AIProvider.GEMINI;
      return AIProvider.OPENAI; // Default to OpenAI
    
    case 'audio':
      if (isProviderApiKeySet(AIProvider.OPENAI)) return AIProvider.OPENAI;
      return AIProvider.OPENAI; // Default to OpenAI
    
    default:
      return AIProvider.GEMINI;
  }
}
