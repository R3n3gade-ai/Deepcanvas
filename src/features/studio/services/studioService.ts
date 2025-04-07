import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { 
  ApiProvider, 
  ApiConfig, 
  ApiKeyState, 
  MediaType, 
  GenerationOptions, 
  GeneratedMedia 
} from '../types';

// API configurations
const API_CONFIGS: Record<ApiProvider, ApiConfig> = {
  gemini: {
    name: "Google Gemini",
    enabled: false, // Will be enabled when API key is added
    baseUrl: "https://generativelanguage.googleapis.com/v1",
    models: {
      image: ["gemini-pro-vision", "gemini-1.5-pro-vision"],
    }
  },
  vertex: {
    name: "Google Vertex AI",
    enabled: false, // Will be enabled when API key is added
    baseUrl: "https://us-central1-aiplatform.googleapis.com/v1",
    models: {
      image: ["imagegeneration@005", "imagegeneration@006"],
      video: ["videomaker@001"]
    }
  },
  openai: {
    name: "OpenAI",
    enabled: false,
    baseUrl: "https://api.openai.com/v1",
    models: {
      image: ["dall-e-3", "dall-e-2"],
    }
  },
  stability: {
    name: "Stability AI",
    enabled: false,
    baseUrl: "https://api.stability.ai/v1",
    models: {
      image: ["stable-diffusion-3", "stable-diffusion-xl"],
    }
  },
  runway: {
    name: "Runway",
    enabled: false,
    baseUrl: "https://api.runwayml.com/v1",
    models: {
      video: ["gen-2", "gen-3"]
    }
  }
};

// Storage key for API keys
const API_KEYS_STORAGE_KEY = 'deepcanvas-studio-api-keys';

// Mock generated media for demonstration
const mockGeneratedMedia: GeneratedMedia[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://via.placeholder.com/1024x1024?text=AI+Generated+Image+1',
    prompt: 'A futuristic city with flying cars and neon lights',
    provider: 'openai',
    model: 'dall-e-3',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    options: {
      prompt: 'A futuristic city with flying cars and neon lights',
      imageSize: '1024x1024',
      imageStyle: 'photographic',
      temperature: 0.7,
    }
  },
  {
    id: '2',
    type: 'image',
    url: 'https://via.placeholder.com/1024x1024?text=AI+Generated+Image+2',
    prompt: 'A serene landscape with mountains and a lake at sunset',
    provider: 'stability',
    model: 'stable-diffusion-xl',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    options: {
      prompt: 'A serene landscape with mountains and a lake at sunset',
      imageSize: '1024x1024',
      imageStyle: 'painting',
      temperature: 0.5,
    }
  },
  {
    id: '3',
    type: 'video',
    url: 'https://example.com/mock-video.mp4',
    prompt: 'A timelapse of a blooming flower',
    provider: 'runway',
    model: 'gen-2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    options: {
      prompt: 'A timelapse of a blooming flower',
      videoDuration: 5,
      videoFps: 30,
      temperature: 0.8,
    }
  }
];

class StudioService {
  private apiConfigs: Record<ApiProvider, ApiConfig>;
  private apiKeys: ApiKeyState = {};
  private generatedMedia: GeneratedMedia[] = [];
  private initialized: boolean = false;

  constructor() {
    this.apiConfigs = { ...API_CONFIGS };
    this.generatedMedia = [...mockGeneratedMedia];
  }

  // Initialize the service
  initialize(): void {
    // Load API keys from local storage
    const savedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (savedKeys) {
      try {
        this.apiKeys = JSON.parse(savedKeys) as ApiKeyState;
        
        // Update API configs with keys
        Object.keys(this.apiKeys).forEach(provider => {
          if (this.apiConfigs[provider as ApiProvider]) {
            this.apiConfigs[provider as ApiProvider].enabled = true;
            this.apiConfigs[provider as ApiProvider].apiKey = this.apiKeys[provider];
          }
        });
      } catch (error) {
        console.error('Error loading API keys:', error);
      }
    }
    
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Get API configurations
  getApiConfigs(): Record<ApiProvider, ApiConfig> {
    if (!this.initialized) {
      this.initialize();
    }
    return this.apiConfigs;
  }

  // Get available providers
  getAvailableProviders(): ApiProvider[] {
    if (!this.initialized) {
      this.initialize();
    }
    return Object.keys(this.apiConfigs).filter(
      provider => this.apiConfigs[provider as ApiProvider].enabled
    ) as ApiProvider[];
  }

  // Get available models for a provider and media type
  getAvailableModels(provider: ApiProvider, type: MediaType): string[] {
    if (!this.initialized) {
      this.initialize();
    }
    
    const config = this.apiConfigs[provider];
    if (!config || !config.enabled) {
      return [];
    }
    
    if (type === 'image' && config.models.image) {
      return config.models.image;
    } else if (type === 'video' && config.models.video) {
      return config.models.video;
    }
    
    return [];
  }

  // Set API key for a provider
  setApiKey(provider: ApiProvider, key: string): void {
    if (!this.initialized) {
      this.initialize();
    }
    
    this.apiKeys[provider] = key;
    this.apiConfigs[provider].enabled = true;
    this.apiConfigs[provider].apiKey = key;
    
    // Save to local storage
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(this.apiKeys));
  }

  // Remove API key for a provider
  removeApiKey(provider: ApiProvider): void {
    if (!this.initialized) {
      this.initialize();
    }
    
    delete this.apiKeys[provider];
    this.apiConfigs[provider].enabled = false;
    this.apiConfigs[provider].apiKey = undefined;
    
    // Save to local storage
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(this.apiKeys));
  }

  // Get all generated media
  getGeneratedMedia(): GeneratedMedia[] {
    if (!this.initialized) {
      this.initialize();
    }
    return this.generatedMedia;
  }

  // Generate media (image or video)
  async generateMedia(
    type: MediaType,
    provider: ApiProvider,
    model: string,
    options: GenerationOptions
  ): Promise<GeneratedMedia> {
    if (!this.initialized) {
      this.initialize();
    }
    
    // Check if provider is enabled
    if (!this.apiConfigs[provider].enabled) {
      throw new Error(`Provider ${provider} is not enabled. Please add an API key.`);
    }
    
    // Check if model is available
    const availableModels = this.getAvailableModels(provider, type);
    if (!availableModels.includes(model)) {
      throw new Error(`Model ${model} is not available for provider ${provider} and type ${type}.`);
    }
    
    // In a real implementation, this would make an API call to the provider
    // For now, we'll simulate the API call
    
    console.log(`Generating ${type} with ${provider} using model ${model}`);
    console.log(`Prompt: ${options.prompt}`);
    console.log(`Options:`, options);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a new generated media item
    const newMedia: GeneratedMedia = {
      id: uuidv4(),
      type,
      url: type === 'image' 
        ? `https://via.placeholder.com/${options.imageSize || '1024x1024'}?text=${encodeURIComponent(options.prompt.substring(0, 20))}` 
        : 'https://example.com/mock-video.mp4',
      prompt: options.prompt,
      provider,
      model,
      createdAt: new Date().toISOString(),
      options,
    };
    
    // Add to generated media
    this.generatedMedia.unshift(newMedia);
    
    return newMedia;
  }

  // Delete generated media
  deleteMedia(id: string): void {
    if (!this.initialized) {
      this.initialize();
    }
    
    this.generatedMedia = this.generatedMedia.filter(media => media.id !== id);
  }
}

// Create and export a singleton instance
const studioService = new StudioService();
export default studioService;
