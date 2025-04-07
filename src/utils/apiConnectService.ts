import axios from 'axios';
import { getApiKey } from './apiHubService';

// Types for API Connect
export enum AuthType {
  API_KEY = 'api_key',
  OAUTH = 'oauth',
  OAUTH2 = 'oauth2',
  BASIC = 'basic',
  CUSTOM = 'custom',
}

export enum ConnectionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
}

export interface ApiProvider {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  category: 'ai' | 'data' | 'communication' | 'payment' | 'storage' | 'productivity' | 'crm' | 'marketing' | 'developer' | 'other';
  icon: string;
  status: 'available' | 'coming-soon' | 'beta';
  isPopular: boolean;
  isConnected: boolean;
  connectionDetails?: ConnectionDetails;
  authConfig: AuthConfig;
  actions?: ApiAction[];
  triggers?: ApiTrigger[];
  docsUrl?: string;
  websiteUrl?: string;
}

export interface AuthConfig {
  type: AuthType;
  fields?: AuthField[];
  oauthConfig?: OAuthConfig;
  instructions?: string;
  testEndpoint?: string;
  testMethod?: 'GET' | 'POST';
  testHeaders?: Record<string, string>;
  testResponseValidation?: (response: any) => boolean;
}

export interface AuthField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  validation?: (value: string) => boolean | string;
}

export interface OAuthConfig {
  authorizationUrl: string;
  tokenUrl: string;
  clientId: string;
  clientSecret?: string;
  scopes: string[];
  redirectUri: string;
  additionalParams?: Record<string, string>;
  refreshTokenUrl?: string;
}

export interface ConnectionDetails {
  id: string;
  providerId: string;
  userId: string;
  name: string;
  authType: AuthType;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
  lastUsed?: string;
  usageCount?: number;
  quotaLimit?: number;
  quotaUsed?: number;
  credentials: Record<string, any>;
  metadata?: Record<string, any>;
  error?: string;
}

export interface ApiAction {
  id: string;
  name: string;
  description: string;
  category?: string;
  inputFields: ActionField[];
  outputFields?: ActionField[];
  execute: (inputs: Record<string, any>, connection: ConnectionDetails) => Promise<any>;
}

export interface ApiTrigger {
  id: string;
  name: string;
  description: string;
  category?: string;
  type: 'webhook' | 'polling';
  inputFields: ActionField[];
  outputFields?: ActionField[];
  setupInstructions?: string;
  activate: (inputs: Record<string, any>, connection: ConnectionDetails) => Promise<any>;
  deactivate: (inputs: Record<string, any>, connection: ConnectionDetails) => Promise<any>;
}

export interface ActionField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'file' | 'select';
  required: boolean;
  default?: any;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  validation?: (value: any) => boolean | string;
  children?: ActionField[]; // For nested fields
}

// Local storage keys
const CONNECTIONS_STORAGE_KEY = 'api_connect_connections';
const OAUTH_STATE_KEY = 'api_connect_oauth_state';

// Load connections from local storage
export function loadConnections(userId: string): ConnectionDetails[] {
  try {
    const connectionsJson = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    const allConnections = connectionsJson ? JSON.parse(connectionsJson) : [];
    return allConnections.filter((conn: ConnectionDetails) => conn.userId === userId);
  } catch (error) {
    console.error('Error loading connections:', error);
    return [];
  }
}

// Save connections to local storage
export function saveConnections(connections: ConnectionDetails[]): void {
  try {
    localStorage.setItem(CONNECTIONS_STORAGE_KEY, JSON.stringify(connections));
  } catch (error) {
    console.error('Error saving connections:', error);
  }
}

// Get a connection by ID
export function getConnection(connectionId: string): ConnectionDetails | null {
  try {
    const connectionsJson = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    const connections = connectionsJson ? JSON.parse(connectionsJson) : [];
    return connections.find((conn: ConnectionDetails) => conn.id === connectionId) || null;
  } catch (error) {
    console.error('Error getting connection:', error);
    return null;
  }
}

// Create a new connection
export function createConnection(connection: Omit<ConnectionDetails, 'id' | 'createdAt' | 'updatedAt'>): ConnectionDetails {
  try {
    const connections = loadAllConnections();
    
    const newConnection: ConnectionDetails = {
      ...connection,
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    connections.push(newConnection);
    saveConnections(connections);
    
    return newConnection;
  } catch (error) {
    console.error('Error creating connection:', error);
    throw new Error('Failed to create connection');
  }
}

// Update an existing connection
export function updateConnection(connectionId: string, updates: Partial<ConnectionDetails>): ConnectionDetails {
  try {
    const connections = loadAllConnections();
    const connectionIndex = connections.findIndex(conn => conn.id === connectionId);
    
    if (connectionIndex === -1) {
      throw new Error('Connection not found');
    }
    
    const updatedConnection = {
      ...connections[connectionIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    connections[connectionIndex] = updatedConnection;
    saveConnections(connections);
    
    return updatedConnection;
  } catch (error) {
    console.error('Error updating connection:', error);
    throw new Error('Failed to update connection');
  }
}

// Delete a connection
export function deleteConnection(connectionId: string): void {
  try {
    const connections = loadAllConnections();
    const updatedConnections = connections.filter(conn => conn.id !== connectionId);
    saveConnections(updatedConnections);
  } catch (error) {
    console.error('Error deleting connection:', error);
    throw new Error('Failed to delete connection');
  }
}

// Test a connection
export async function testConnection(provider: ApiProvider, credentials: Record<string, any>): Promise<boolean> {
  try {
    if (!provider.authConfig.testEndpoint) {
      // If no test endpoint is specified, assume the connection is valid
      return true;
    }
    
    const headers: Record<string, string> = {
      ...provider.authConfig.testHeaders || {},
    };
    
    // Add authorization headers based on auth type
    switch (provider.authConfig.type) {
      case AuthType.API_KEY:
        if (credentials.apiKey) {
          // Different APIs expect API keys in different places
          if (provider.id === 'google-ai') {
            // For Google AI, append the API key as a query parameter
            const url = new URL(provider.authConfig.testEndpoint);
            url.searchParams.append('key', credentials.apiKey);
            const response = await axios.get(url.toString());
            return response.status >= 200 && response.status < 300;
          } else if (provider.id === 'openai') {
            // For OpenAI, use Bearer token auth
            headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          } else if (provider.id === 'anthropic') {
            // For Anthropic, use x-api-key header
            headers['x-api-key'] = credentials.apiKey;
            headers['anthropic-version'] = '2023-06-01';
          } else {
            // Default: add as Authorization header
            headers['Authorization'] = `Bearer ${credentials.apiKey}`;
          }
        }
        break;
        
      case AuthType.OAUTH2:
        if (credentials.accessToken) {
          headers['Authorization'] = `Bearer ${credentials.accessToken}`;
        }
        break;
        
      case AuthType.BASIC:
        if (credentials.username && credentials.password) {
          const base64Credentials = btoa(`${credentials.username}:${credentials.password}`);
          headers['Authorization'] = `Basic ${base64Credentials}`;
        }
        break;
    }
    
    // Make the test request
    const method = provider.authConfig.testMethod || 'GET';
    let response;
    
    if (method === 'GET') {
      response = await axios.get(provider.authConfig.testEndpoint, { headers });
    } else {
      response = await axios.post(provider.authConfig.testEndpoint, {}, { headers });
    }
    
    // Validate the response
    if (provider.authConfig.testResponseValidation) {
      return provider.authConfig.testResponseValidation(response.data);
    }
    
    // Default validation: check if status code is 2xx
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    console.error('Error testing connection:', error);
    return false;
  }
}

// Initiate OAuth flow
export function initiateOAuth(provider: ApiProvider, redirectUri: string): string {
  try {
    if (provider.authConfig.type !== AuthType.OAUTH && provider.authConfig.type !== AuthType.OAUTH2) {
      throw new Error('Provider does not support OAuth');
    }
    
    if (!provider.authConfig.oauthConfig) {
      throw new Error('OAuth configuration missing');
    }
    
    const { authorizationUrl, clientId, scopes, additionalParams } = provider.authConfig.oauthConfig;
    
    // Generate a random state value for security
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem(OAUTH_STATE_KEY, state);
    
    // Build the authorization URL
    const url = new URL(authorizationUrl);
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('state', state);
    url.searchParams.append('scope', scopes.join(' '));
    
    // Add any additional parameters
    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  } catch (error) {
    console.error('Error initiating OAuth flow:', error);
    throw new Error('Failed to initiate OAuth flow');
  }
}

// Complete OAuth flow
export async function completeOAuth(
  provider: ApiProvider,
  code: string,
  redirectUri: string
): Promise<Record<string, any>> {
  try {
    if (provider.authConfig.type !== AuthType.OAUTH && provider.authConfig.type !== AuthType.OAUTH2) {
      throw new Error('Provider does not support OAuth');
    }
    
    if (!provider.authConfig.oauthConfig) {
      throw new Error('OAuth configuration missing');
    }
    
    const { tokenUrl, clientId, clientSecret } = provider.authConfig.oauthConfig;
    
    // Exchange the authorization code for an access token
    const response = await axios.post(tokenUrl, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });
    
    // Return the token response
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type,
      scope: response.data.scope,
      receivedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error completing OAuth flow:', error);
    throw new Error('Failed to complete OAuth flow');
  }
}

// Refresh OAuth token
export async function refreshOAuthToken(
  provider: ApiProvider,
  refreshToken: string
): Promise<Record<string, any>> {
  try {
    if (provider.authConfig.type !== AuthType.OAUTH && provider.authConfig.type !== AuthType.OAUTH2) {
      throw new Error('Provider does not support OAuth');
    }
    
    if (!provider.authConfig.oauthConfig) {
      throw new Error('OAuth configuration missing');
    }
    
    const { tokenUrl, clientId, clientSecret } = provider.authConfig.oauthConfig;
    
    // Exchange the refresh token for a new access token
    const response = await axios.post(tokenUrl, {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    
    // Return the token response
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken, // Some providers don't return a new refresh token
      expiresIn: response.data.expires_in,
      tokenType: response.data.token_type,
      scope: response.data.scope,
      receivedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error refreshing OAuth token:', error);
    throw new Error('Failed to refresh OAuth token');
  }
}

// Execute an API action
export async function executeAction(
  action: ApiAction,
  inputs: Record<string, any>,
  connectionId: string
): Promise<any> {
  try {
    const connection = getConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }
    
    // Update usage statistics
    updateConnection(connectionId, {
      lastUsed: new Date().toISOString(),
      usageCount: (connection.usageCount || 0) + 1,
      quotaUsed: (connection.quotaUsed || 0) + 1,
    });
    
    // Execute the action
    return await action.execute(inputs, connection);
  } catch (error) {
    console.error('Error executing action:', error);
    throw new Error('Failed to execute action');
  }
}

// Helper functions
function loadAllConnections(): ConnectionDetails[] {
  try {
    const connectionsJson = localStorage.getItem(CONNECTIONS_STORAGE_KEY);
    return connectionsJson ? JSON.parse(connectionsJson) : [];
  } catch (error) {
    console.error('Error loading all connections:', error);
    return [];
  }
}

// Export a proxy function for making API requests
export async function makeApiRequest(
  connectionId: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any,
  headers?: Record<string, string>
): Promise<any> {
  try {
    const connection = getConnection(connectionId);
    if (!connection) {
      throw new Error('Connection not found');
    }
    
    const requestHeaders: Record<string, string> = {
      ...headers || {},
    };
    
    // Add authorization headers based on auth type
    switch (connection.authType) {
      case AuthType.API_KEY:
        if (connection.credentials.apiKey) {
          // Different APIs expect API keys in different places
          if (connection.providerId === 'google-ai') {
            // For Google AI, append the API key as a query parameter
            const urlObj = new URL(url);
            urlObj.searchParams.append('key', connection.credentials.apiKey);
            url = urlObj.toString();
          } else if (connection.providerId === 'openai') {
            // For OpenAI, use Bearer token auth
            requestHeaders['Authorization'] = `Bearer ${connection.credentials.apiKey}`;
          } else if (connection.providerId === 'anthropic') {
            // For Anthropic, use x-api-key header
            requestHeaders['x-api-key'] = connection.credentials.apiKey;
            requestHeaders['anthropic-version'] = '2023-06-01';
          } else {
            // Default: add as Authorization header
            requestHeaders['Authorization'] = `Bearer ${connection.credentials.apiKey}`;
          }
        }
        break;
        
      case AuthType.OAUTH2:
        if (connection.credentials.accessToken) {
          requestHeaders['Authorization'] = `Bearer ${connection.credentials.accessToken}`;
        }
        break;
        
      case AuthType.BASIC:
        if (connection.credentials.username && connection.credentials.password) {
          const base64Credentials = btoa(`${connection.credentials.username}:${connection.credentials.password}`);
          requestHeaders['Authorization'] = `Basic ${base64Credentials}`;
        }
        break;
    }
    
    // Make the request
    let response;
    switch (method) {
      case 'GET':
        response = await axios.get(url, { headers: requestHeaders });
        break;
      case 'POST':
        response = await axios.post(url, data, { headers: requestHeaders });
        break;
      case 'PUT':
        response = await axios.put(url, data, { headers: requestHeaders });
        break;
      case 'DELETE':
        response = await axios.delete(url, { headers: requestHeaders });
        break;
    }
    
    // Update usage statistics
    updateConnection(connectionId, {
      lastUsed: new Date().toISOString(),
      usageCount: (connection.usageCount || 0) + 1,
      quotaUsed: (connection.quotaUsed || 0) + 1,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error making API request:', error);
    throw error;
  }
}

// Export default object
const apiConnectService = {
  loadConnections,
  getConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  testConnection,
  initiateOAuth,
  completeOAuth,
  refreshOAuthToken,
  executeAction,
  makeApiRequest,
};

export default apiConnectService;
