// API Hub Service
// This service provides functions to interact with the API Hub

// Types
export interface ApiConnection {
  id: string;
  name: string;
  provider: string;
  providerName: string;
  status: "active" | "inactive" | "error";
  lastUsed?: string;
  config: Record<string, any>;
}

// Local storage key for API connections
const API_CONNECTIONS_STORAGE_KEY = "api_connections";

// Get all connected APIs
export function getConnectedApis(): ApiConnection[] {
  try {
    const connectionsJson = localStorage.getItem(API_CONNECTIONS_STORAGE_KEY);
    return connectionsJson ? JSON.parse(connectionsJson) : [];
  } catch (error) {
    console.error("Error loading API connections:", error);
    return [];
  }
}

// Get a specific API connection by provider ID
export function getApiConnection(providerId: string): ApiConnection | null {
  const connections = getConnectedApis();
  return connections.find(conn => conn.provider === providerId) || null;
}

// Get API key for a specific provider
export function getApiKey(providerId: string): string | null {
  // First try to get from localStorage (user-provided keys)
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem(`api-key-${providerId}`);
    if (storedKey) return storedKey;
  }

  // Then try to get from API connections
  const connection = getApiConnection(providerId);
  if (connection?.config?.apiKey) return connection.config.apiKey;

  // Fall back to environment variables
  const envApiKeys: Record<string, string | undefined> = {
    'google-ai': process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    'vertex-ai': process.env.NEXT_PUBLIC_VERTEX_API_KEY,
    'openai': process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    'anthropic': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    'stability-ai': process.env.NEXT_PUBLIC_STABILITY_API_KEY,
  };

  return envApiKeys[providerId] || null;
}

// Save API connection
export function saveApiConnection(connection: ApiConnection): void {
  try {
    const connections = getConnectedApis();

    // Check if connection already exists
    const existingIndex = connections.findIndex(conn => conn.id === connection.id);

    if (existingIndex >= 0) {
      // Update existing connection
      connections[existingIndex] = {
        ...connection,
        lastUsed: new Date().toISOString()
      };
    } else {
      // Add new connection
      connections.push({
        ...connection,
        lastUsed: new Date().toISOString()
      });
    }

    // Save to local storage
    localStorage.setItem(API_CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
  } catch (error) {
    console.error("Error saving API connection:", error);
  }
}

// Delete API connection
export function deleteApiConnection(connectionId: string): void {
  try {
    const connections = getConnectedApis();
    const updatedConnections = connections.filter(conn => conn.id !== connectionId);
    localStorage.setItem(API_CONNECTIONS_STORAGE_KEY, JSON.stringify(updatedConnections));
  } catch (error) {
    console.error("Error deleting API connection:", error);
  }
}

// Update API connection status
export function updateApiConnectionStatus(connectionId: string, status: "active" | "inactive" | "error"): void {
  try {
    const connections = getConnectedApis();
    const connection = connections.find(conn => conn.id === connectionId);

    if (connection) {
      connection.status = status;
      localStorage.setItem(API_CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
    }
  } catch (error) {
    console.error("Error updating API connection status:", error);
  }
}

// Update last used timestamp for an API connection
export function updateApiConnectionLastUsed(connectionId: string): void {
  try {
    const connections = getConnectedApis();
    const connection = connections.find(conn => conn.id === connectionId);

    if (connection) {
      connection.lastUsed = new Date().toISOString();
      localStorage.setItem(API_CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
    }
  } catch (error) {
    console.error("Error updating API connection last used:", error);
  }
}

// Get all available API providers
export function getAvailableApiProviders(): any[] {
  // This would typically come from an API call
  // For now, we'll return a static list
  return [
    {
      id: "google-ai",
      name: "Google AI (Gemini)",
      description: "Access Google's Gemini models for text, chat, and image generation",
      category: "ai",
      status: "available",
      isPopular: true,
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "Integrate with GPT models, DALL-E, and other OpenAI services",
      category: "ai",
      status: "available",
      isPopular: true,
    },
    {
      id: "anthropic",
      name: "Anthropic",
      description: "Access Claude models for natural language processing",
      category: "ai",
      status: "available",
      isPopular: false,
    },
    {
      id: "stability-ai",
      name: "Stability AI",
      description: "Image generation with Stable Diffusion models",
      category: "ai",
      status: "available",
      isPopular: false,
    },
    {
      id: "vertex-ai",
      name: "Google Vertex AI",
      description: "Enterprise AI platform with custom model training",
      category: "ai",
      status: "available",
      isPopular: false,
    }
  ];
}
