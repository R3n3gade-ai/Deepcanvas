// Types for the studio feature

export type ApiProvider = 'gemini' | 'vertex' | 'openai' | 'stability' | 'runway';
export type MediaType = 'image' | 'video';
export type ImageSize = '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
export type ImageStyle = 'photographic' | 'digital-art' | 'cinematic' | 'anime' | 'painting' | 'sketch';

export interface ApiConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  baseUrl: string;
  models: {
    image: string[];
    video?: string[];
  };
}

export interface ApiKeyState {
  [key: string]: string;
}

export interface GenerationOptions {
  prompt: string;
  negativePrompt?: string;
  imageSize?: ImageSize;
  imageStyle?: ImageStyle;
  videoDuration?: number;
  videoFps?: number;
  temperature?: number;
  seed?: number | null;
}

export interface GeneratedMedia {
  id: string;
  type: MediaType;
  url: string;
  prompt: string;
  provider: ApiProvider;
  model: string;
  createdAt: string;
  options: GenerationOptions;
}

export interface StudioStore {
  // API state
  apiConfigs: Record<ApiProvider, ApiConfig>;
  apiKeys: ApiKeyState;
  availableProviders: ApiProvider[];
  selectedProvider: ApiProvider;
  availableModels: string[];
  selectedModel: string;
  
  // Media state
  generatedMedia: GeneratedMedia[];
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  setApiKey: (provider: ApiProvider, key: string) => void;
  removeApiKey: (provider: ApiProvider) => void;
  selectProvider: (provider: ApiProvider) => void;
  selectModel: (model: string) => void;
  generateMedia: (type: MediaType, options: GenerationOptions) => Promise<GeneratedMedia | null>;
  deleteMedia: (id: string) => void;
}
