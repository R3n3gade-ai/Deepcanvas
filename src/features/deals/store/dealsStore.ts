import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Deal, DealsStore } from '../types';

// Sample deals for initial data
const sampleDeals: Deal[] = [
  {
    id: '1',
    name: 'Enterprise Software Package',
    amount: 75000,
    stage: 'proposal',
    account_id: '1', // Acme Corporation
    owner_id: '1', // John Doe
    close_date: '2023-12-31',
    probability: 60,
    description: 'Enterprise-wide software implementation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Manufacturing Equipment Upgrade',
    amount: 120000,
    stage: 'negotiation',
    account_id: '2', // Globex Industries
    owner_id: '3', // Robert Johnson
    close_date: '2023-11-15',
    probability: 75,
    description: 'Upgrade of manufacturing equipment and software',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Financial Services Package',
    amount: 45000,
    stage: 'qualified',
    account_id: '3', // Initech LLC
    owner_id: '2', // Jane Smith
    close_date: '2024-01-15',
    probability: 40,
    description: 'Financial services software and consulting',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Deals Store - Manages deals state
 */
const useDealsStore = create<DealsStore>((set, get) => ({
  deals: [...sampleDeals],
  loading: false,
  error: null,

  fetchDeals: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, this would fetch from an API or database
      // For now, we'll just use the sample deals
      set({ deals: [...sampleDeals], loading: false });
    } catch (error) {
      console.error('Error fetching deals:', error);
      set({ error: 'Failed to fetch deals', loading: false });
    }
  },

  addDeal: async (deal) => {
    set({ loading: true, error: null });
    try {
      // Add timestamp
      const dealWithTimestamp = {
        ...deal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Generate ID (in a real app, this would be done by the backend)
      const newDeal = {
        id: uuidv4(),
        ...dealWithTimestamp
      };
      
      // Update local state
      set(state => ({
        deals: [...state.deals, newDeal],
        loading: false
      }));
      
      return newDeal;
    } catch (error) {
      console.error('Error adding deal:', error);
      set({ error: 'Failed to add deal', loading: false });
      throw error;
    }
  },

  updateDeal: async (id, data) => {
    set({ loading: true, error: null });
    try {
      // Add updated timestamp
      const updates = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      // Update local state
      set(state => ({
        deals: state.deals.map(deal => 
          deal.id === id ? { ...deal, ...updates } : deal
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating deal:', error);
      set({ error: 'Failed to update deal', loading: false });
      throw error;
    }
  },

  deleteDeal: async (id) => {
    set({ loading: true, error: null });
    try {
      // Update local state
      set(state => ({
        deals: state.deals.filter(deal => deal.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting deal:', error);
      set({ error: 'Failed to delete deal', loading: false });
      throw error;
    }
  },

  getDealById: (id) => {
    return get().deals.find(deal => deal.id === id);
  },
}));

export default useDealsStore;
