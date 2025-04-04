import { create } from 'zustand';
import brain from '../brain';

export interface ApiConnection {
  id: string;
  name: string;
  service: string;
  description?: string;
  status: 'untested' | 'connected' | 'failed';
  last_tested?: string | null;
}

export interface NewApiConnection {
  name: string;
  service: string;
  description?: string;
  api_key: string;
}

export interface ApiConnectionUpdate {
  name?: string;
  service?: string;
  description?: string;
  api_key?: string;
}

interface ApiConnectionsState {
  connections: ApiConnection[];
  isLoading: boolean;
  isTesting: string | null; // ID of connection being tested, or null
  error: string | null;
  
  // Actions
  fetchConnections: () => Promise<void>;
  createConnection: (connection: NewApiConnection) => Promise<ApiConnection | null>;
  updateConnection: (id: string, data: ApiConnectionUpdate) => Promise<ApiConnection | null>;
  deleteConnection: (id: string) => Promise<boolean>;
  testConnection: (id: string) => Promise<{ status: string; message: string } | null>;
}

export const useApiConnectionsStore = create<ApiConnectionsState>((set, get) => ({
  connections: [],
  isLoading: false,
  isTesting: null,
  error: null,
  
  fetchConnections: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.list_connections();
      const data = await response.json();
      set({ connections: data, isLoading: false });
      return data;
    } catch (error) {
      console.error('Error fetching connections:', error);
      set({ error: 'Failed to load API connections', isLoading: false });
      return [];
    }
  },
  
  createConnection: async (connection: NewApiConnection) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.create_connection(connection);
      const data = await response.json();
      set(state => ({
        connections: [...state.connections, data],
        isLoading: false
      }));
      return data;
    } catch (error) {
      console.error('Error creating connection:', error);
      set({ error: 'Failed to create API connection', isLoading: false });
      return null;
    }
  },
  
  updateConnection: async (id: string, data: ApiConnectionUpdate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await brain.update_connection({ connection_id: id }, data);
      const updatedData = await response.json();
      set(state => ({
        connections: state.connections.map(conn =>
          conn.id === id ? updatedData : conn
        ),
        isLoading: false
      }));
      return updatedData;
    } catch (error) {
      console.error('Error updating connection:', error);
      set({ error: 'Failed to update API connection', isLoading: false });
      return null;
    }
  },
  
  deleteConnection: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await brain.delete_connection({ connection_id: id });
      set(state => ({
        connections: state.connections.filter(conn => conn.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      console.error('Error deleting connection:', error);
      set({ error: 'Failed to delete API connection', isLoading: false });
      return false;
    }
  },
  
  testConnection: async (id: string) => {
    set({ isTesting: id, error: null });
    try {
      const response = await brain.test_connection({ id });
      const data = await response.json();
      
      // Update connection status in the state
      set(state => ({
        connections: state.connections.map(conn =>
          conn.id === id
            ? { ...conn, status: data.status, last_tested: new Date().toISOString() }
            : conn
        ),
        isTesting: null
      }));
      
      return data;
    } catch (error) {
      console.error('Error testing connection:', error);
      set({ 
        error: 'Failed to test API connection',
        isTesting: null 
      });
      return null;
    }
  }
}));
