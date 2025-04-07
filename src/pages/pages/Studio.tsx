import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "components/Sidebar";
import { AppProvider } from "utils/AppProvider";
import { toast } from "sonner";
import axios from "axios";

// API configuration
interface ApiConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  baseUrl: string;
  models: {
    image: string[];
    video?: string[];
  };
}

// API configurations
const API_CONFIGS: Record<string, ApiConfig> = {
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
  },
  replicate: {
    name: "Replicate",
    enabled: false,
    baseUrl: "https://api.replicate.com/v1",
    models: {
      image: ["midjourney", "sdxl"],
      video: ["gen-1", "gen-2"]
    }
  }
};

// Define types for the Studio page
type GenerationType = "image" | "video";
type ApiProvider = "gemini" | "vertex" | "openai" | "stability" | "runway" | "replicate";
type ImageSize = "1024x1024" | "1792x1024" | "1024x1792" | "512x512";
type ImageStyle = "photographic" | "digital-art" | "cinematic" | "anime" | "3d-render" | "pixel-art";

// API service for image and video generation
const apiService = {
  // Get available providers
  getProviders: (type: GenerationType): ApiProvider[] => {
    return Object.entries(API_CONFIGS)
      .filter(([_, config]) => {
        if (type === "image") {
          return config.models.image && config.models.image.length > 0;
        } else {
          return config.models.video && config.models.video.length > 0;
        }
      })
      .map(([key]) => key as ApiProvider);
  },

  // Get available models for a provider
  getModels: (provider: ApiProvider, type: GenerationType): string[] => {
    const config = API_CONFIGS[provider];
    if (!config) return [];

    if (type === "image" && config.models.image) {
      return config.models.image;
    } else if (type === "video" && config.models.video) {
      return config.models.video;
    }

    return [];
  },

  // Generate image using the specified provider and model
  generateImage: async (provider: ApiProvider, model: string, prompt: string, options: any): Promise<string> => {
    // This is where you would implement the actual API call
    // For now, we'll simulate the API call with a delay

    console.log(`Generating image with ${provider} using model ${model}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Options:`, options);

    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real implementation, you would make an API call here
        // For example, with Gemini:
        /*
        try {
          const response = await axios.post(
            `${API_CONFIGS.gemini.baseUrl}/models/${model}:generateContent?key=${API_CONFIGS.gemini.apiKey}`,
            {
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: options.temperature || 0.7,
                maxOutputTokens: options.maxTokens || 1024,
              }
            }
          );

          // Process the response and return the image URL
          return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
          console.error('Error generating image:', error);
          throw error;
        }
        */

        // For now, return a placeholder image
        const placeholderImages = [
          "https://images.unsplash.com/photo-1513151233558-d860c5398176",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
          "https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc"
        ];

        resolve(`${placeholderImages[Math.floor(Math.random() * placeholderImages.length)]}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80`);
      }, 3000);
    });
  },

  // Generate video using the specified provider and model
  generateVideo: async (provider: ApiProvider, model: string, prompt: string, options: any): Promise<string> => {
    // This is where you would implement the actual API call
    // For now, we'll simulate the API call with a delay

    console.log(`Generating video with ${provider} using model ${model}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Options:`, options);

    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real implementation, you would make an API call here
        // For example, with Vertex AI:
        /*
        try {
          const response = await axios.post(
            `${API_CONFIGS.vertex.baseUrl}/projects/${projectId}/locations/us-central1/publishers/google/models/${model}:predict`,
            {
              instances: [{
                prompt: prompt,
                sampleCount: 1,
                seed: Math.floor(Math.random() * 1000000),
                dimensions: {
                  width: 1024,
                  height: 576
                }
              }],
            },
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          // Process the response and return the video URL
          return response.data.predictions[0].videoUrl;
        } catch (error) {
          console.error('Error generating video:', error);
          throw error;
        }
        */

        // For now, return a placeholder video URL
        resolve("https://example.com/placeholder-video.mp4");
      }, 5000);
    });
  }
};

interface Creation {
  id: string;
  type: GenerationType;
  prompt: string;
  provider: ApiProvider;
  model: string;
  createdAt: string;
  url: string;
  status: "completed" | "processing" | "failed";
  metadata?: {
    size?: string;
    style?: string;
    negativePrompt?: string;
    duration?: number;
    fps?: number;
    temperature?: number;
    seed?: number;
  };
}

// Sample creations for demo purposes
const SAMPLE_CREATIONS: Creation[] = [
  {
    id: "img-1",
    type: "image",
    prompt: "A futuristic city with flying cars and neon lights",
    provider: "gemini",
    model: "gemini-pro-vision",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    url: "https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    status: "completed",
    metadata: {
      size: "1024x1024",
      style: "photographic",
      temperature: 0.7,
      seed: 123456
    }
  },
  {
    id: "img-2",
    type: "image",
    prompt: "A serene mountain landscape with a lake at sunset",
    provider: "vertex",
    model: "imagegeneration@005",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1024&q=80",
    status: "completed",
    metadata: {
      size: "1792x1024",
      style: "cinematic",
      temperature: 0.8,
      seed: 789012
    }
  },
  {
    id: "vid-1",
    type: "video",
    prompt: "A timelapse of a blooming flower",
    provider: "vertex",
    model: "videomaker@001",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    url: "https://example.com/video1.mp4",
    status: "completed",
    metadata: {
      duration: 10,
      fps: 30,
      seed: 345678
    }
  }
];

// API key management
interface ApiKeyState {
  gemini?: string;
  vertex?: string;
  openai?: string;
  stability?: string;
  runway?: string;
  replicate?: string;
}

// Local storage key for API keys
const API_KEYS_STORAGE_KEY = "studio_api_keys";

function StudioContent() {
  // State for the Studio page
  const [activeTab, setActiveTab] = useState<GenerationType>("image");
  const [creations, setCreations] = useState<Creation[]>(SAMPLE_CREATIONS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGallery, setShowGallery] = useState(true);
  const [showApiSettings, setShowApiSettings] = useState(false);

  // API state
  const [apiKeys, setApiKeys] = useState<ApiKeyState>({});
  const [availableProviders, setAvailableProviders] = useState<ApiProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider>("gemini");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Form state
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [imageSize, setImageSize] = useState<ImageSize>("1024x1024");
  const [imageStyle, setImageStyle] = useState<ImageStyle>("photographic");
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoFps, setVideoFps] = useState(30);
  const [temperature, setTemperature] = useState(0.7);
  const [seed, setSeed] = useState<number | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load API keys from local storage
  useEffect(() => {
    const savedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys) as ApiKeyState;
        setApiKeys(parsedKeys);

        // Update API configs with the saved keys
        Object.entries(parsedKeys).forEach(([provider, key]) => {
          if (key && provider in API_CONFIGS) {
            API_CONFIGS[provider as ApiProvider].apiKey = key;
            API_CONFIGS[provider as ApiProvider].enabled = true;
          }
        });
      } catch (error) {
        console.error('Error parsing saved API keys:', error);
      }
    }
  }, []);

  // Update available providers and models when the active tab changes
  useEffect(() => {
    const providers = apiService.getProviders(activeTab);
    setAvailableProviders(providers);

    // Set default provider
    if (providers.length > 0) {
      // Prefer Gemini or Vertex if available
      const preferredProvider = providers.find(p => p === 'gemini' || p === 'vertex') || providers[0];
      setSelectedProvider(preferredProvider);
    }
  }, [activeTab]);

  // Update available models when the selected provider changes
  useEffect(() => {
    if (selectedProvider) {
      const models = apiService.getModels(selectedProvider, activeTab);
      setAvailableModels(models);

      // Set default model
      if (models.length > 0) {
        setSelectedModel(models[0]);
      }
    }
  }, [selectedProvider, activeTab]);

  // Save API keys to local storage
  const saveApiKeys = (keys: ApiKeyState) => {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    setApiKeys(keys);

    // Update API configs with the new keys
    Object.entries(keys).forEach(([provider, key]) => {
      if (key && provider in API_CONFIGS) {
        API_CONFIGS[provider as ApiProvider].apiKey = key;
        API_CONFIGS[provider as ApiProvider].enabled = true;
      }
    });

    // Update available providers
    setAvailableProviders(apiService.getProviders(activeTab));
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!selectedProvider || !selectedModel) {
      toast.error("Please select a provider and model");
      return;
    }

    // Check if API key is set
    if (!API_CONFIGS[selectedProvider].apiKey) {
      toast.error(`Please set your ${API_CONFIGS[selectedProvider].name} API key in settings`);
      setShowApiSettings(true);
      return;
    }

    setIsGenerating(true);

    try {
      // Create a new creation with status "processing"
      const creationId = `${activeTab}-${Date.now()}`;
      const newCreation: Creation = {
        id: creationId,
        type: activeTab,
        prompt,
        provider: selectedProvider,
        model: selectedModel,
        createdAt: new Date().toISOString(),
        url: "", // Will be updated when generation completes
        status: "processing",
        metadata: {
          ...(activeTab === "image" ? {
            size: imageSize,
            style: imageStyle,
            negativePrompt
          } : {
            duration: videoDuration,
            fps: videoFps
          }),
          temperature,
          seed: seed || Math.floor(Math.random() * 1000000)
        }
      };

      // Add the processing creation to the list
      setCreations([newCreation, ...creations]);

      // Generate the content
      let url = "";
      if (activeTab === "image") {
        url = await apiService.generateImage(
          selectedProvider,
          selectedModel,
          prompt,
          {
            negativePrompt,
            size: imageSize,
            style: imageStyle,
            temperature,
            seed: newCreation.metadata?.seed
          }
        );
      } else {
        url = await apiService.generateVideo(
          selectedProvider,
          selectedModel,
          prompt,
          {
            duration: videoDuration,
            fps: videoFps,
            temperature,
            seed: newCreation.metadata?.seed
          }
        );
      }

      // Update the creation with the generated content
      const updatedCreation: Creation = {
        ...newCreation,
        url,
        status: "completed"
      };

      // Update the creations list
      setCreations(prevCreations =>
        prevCreations.map(creation =>
          creation.id === creationId ? updatedCreation : creation
        )
      );

      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} generated successfully!`);
    } catch (error) {
      console.error(`Error generating ${activeTab}:`, error);

      // Update the creation with error status
      setCreations(prevCreations =>
        prevCreations.map(creation =>
          creation.id === `${activeTab}-${Date.now()}` ? {
            ...creation,
            status: "failed"
          } : creation
        )
      );

      toast.error(`Failed to generate ${activeTab}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle file upload logic here
    toast.success(`File "${file.name}" uploaded successfully!`);
  };

  // Handle deletion
  const handleDelete = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this creation?");
    if (confirmed) {
      setCreations(creations.filter(creation => creation.id !== id));
      toast.success("Creation deleted successfully");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">AI Studio</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowApiSettings(true)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
              >
                <SettingsIcon className="h-5 w-5 inline mr-1" />
                API Settings
              </button>
              <button
                onClick={() => setShowGallery(!showGallery)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
              >
                {showGallery ? "Hide Gallery" : "Show Gallery"}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
              >
                <UploadIcon className="h-5 w-5 inline mr-1" />
                Upload
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,video/*"
              />
            </div>
          </div>

          {/* API Settings Modal */}
          {showApiSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">API Settings</h2>
                    <button
                      onClick={() => setShowApiSettings(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <p className="text-gray-600 mb-4">
                    Enter your API keys for the services you want to use. Your keys are stored locally in your browser and are never sent to our servers.
                  </p>

                  <div className="space-y-4">
                    {Object.entries(API_CONFIGS).map(([provider, config]) => (
                      <div key={provider} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{config.name}</h3>
                            <p className="text-sm text-gray-500">
                              {config.models.image && `${config.models.image.length} image model${config.models.image.length > 1 ? 's' : ''}`}
                              {config.models.image && config.models.video && ', '}
                              {config.models.video && `${config.models.video.length} video model${config.models.video.length > 1 ? 's' : ''}`}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {config.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>

                        <div className="mt-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                          <div className="flex">
                            <input
                              type="password"
                              value={apiKeys[provider as ApiProvider] || ''}
                              onChange={(e) => {
                                const newKeys = { ...apiKeys, [provider]: e.target.value };
                                setApiKeys(newKeys);
                              }}
                              placeholder={`Enter your ${config.name} API key`}
                              className="border border-gray-300 rounded-l-md px-3 py-2 flex-1"
                            />
                            <button
                              onClick={() => {
                                const newKeys = { ...apiKeys };
                                if (apiKeys[provider as ApiProvider]) {
                                  delete newKeys[provider as ApiProvider];
                                  API_CONFIGS[provider as ApiProvider].enabled = false;
                                  API_CONFIGS[provider as ApiProvider].apiKey = undefined;
                                }
                                saveApiKeys(newKeys);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-r-md"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowApiSettings(false)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      saveApiKeys(apiKeys);
                      setShowApiSettings(false);
                      toast.success('API settings saved');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("image")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "image"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  <ImageIcon className="h-5 w-5 inline mr-2" />
                  Image Generation
                </button>
                <button
                  onClick={() => setActiveTab("video")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "video"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  <VideoIcon className="h-5 w-5 inline mr-2" />
                  Video Generation
                </button>
              </nav>
            </div>
          </div>

          {/* Generation Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">
              {activeTab === "image" ? "Generate Images" : "Generate Videos"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  placeholder={activeTab === "image"
                    ? "Describe the image you want to generate..."
                    : "Describe the video you want to generate..."}
                />
              </div>

              {activeTab === "image" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Negative Prompt (Optional)</label>
                    <textarea
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      rows={2}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      placeholder="Describe what you don't want in the image..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => setSelectedProvider(e.target.value as ApiProvider)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        {availableProviders.map((provider) => (
                          <option key={provider} value={provider}>
                            {API_CONFIGS[provider].name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        {availableModels.map((model) => (
                          <option key={model} value={model}>
                            {model}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                      <select
                        value={imageSize}
                        onChange={(e) => setImageSize(e.target.value as ImageSize)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        <option value="1024x1024">1024x1024 (Square)</option>
                        <option value="1792x1024">1792x1024 (Landscape)</option>
                        <option value="1024x1792">1024x1792 (Portrait)</option>
                        <option value="512x512">512x512 (Small)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                      <select
                        value={imageStyle}
                        onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        <option value="photographic">Photographic</option>
                        <option value="digital-art">Digital Art</option>
                        <option value="cinematic">Cinematic</option>
                        <option value="anime">Anime</option>
                        <option value="3d-render">3D Render</option>
                        <option value="pixel-art">Pixel Art</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "video" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => setSelectedProvider(e.target.value as ApiProvider)}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    >
                      {availableProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {API_CONFIGS[provider].name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    >
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                    <input
                      type="number"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                      min={1}
                      max={30}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">FPS</label>
                    <select
                      value={videoFps}
                      onChange={(e) => setVideoFps(parseInt(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-2 w-full"
                    >
                      <option value={24}>24 FPS</option>
                      <option value={30}>30 FPS</option>
                      <option value={60}>60 FPS</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Advanced Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature: {temperature.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Precise</span>
                      <span>Creative</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seed (Optional)</label>
                    <div className="flex">
                      <input
                        type="number"
                        value={seed || ''}
                        onChange={(e) => {
                          const value = e.target.value === '' ? null : parseInt(e.target.value);
                          setSeed(value);
                        }}
                        placeholder="Random"
                        className="border border-gray-300 rounded-l-md px-3 py-2 flex-1"
                      />
                      <button
                        onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-r-md"
                        title="Generate random seed"
                      >
                        <RefreshIcon className="h-5 w-5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use the same seed to get consistent results</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || !selectedModel}
                  className={`${
                    isGenerating || !prompt.trim() || !selectedModel
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-2 px-4 rounded-md flex items-center`}
                >
                  {isGenerating ? (
                    <>
                      <LoadingIcon className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      Generate {activeTab === "image" ? "Image" : "Video"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Gallery */}
          {showGallery && (
            <div>
              <h2 className="text-lg font-medium mb-4">Your Creations</h2>

              {creations.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <SparklesIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No creations yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Start generating images and videos to build your gallery.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {creations.map((creation) => (
                    <div key={creation.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      {creation.type === "image" ? (
                        <div className="h-48 bg-gray-100">
                          <img
                            src={creation.url}
                            alt={creation.prompt}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-48 bg-gray-800 flex items-center justify-center">
                          <VideoIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            creation.type === "image"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}>
                            {creation.type === "image" ? "Image" : "Video"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(creation.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">{creation.prompt}</p>

                        <div className="text-xs text-gray-500 mb-3">
                          <span className="font-medium">Model:</span> {creation.model}
                          {creation.type === "image" && creation.metadata?.size && (
                            <span className="ml-2">
                              <span className="font-medium">Size:</span> {creation.metadata.size}
                            </span>
                          )}
                          {creation.type === "video" && creation.metadata?.duration && (
                            <span className="ml-2">
                              <span className="font-medium">Duration:</span> {creation.metadata.duration}s
                            </span>
                          )}
                        </div>

                        <div className="flex justify-between">
                          <button
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => handleDelete(creation.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Icon components
function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
    </svg>
  );
}

function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
  );
}

export default function Studio() {
  return (
    <AppProvider>
      <StudioContent />
    </AppProvider>
  );
}
