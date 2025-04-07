import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Account, AccountsStore } from '../types';

// Sample accounts for initial data
const sampleAccounts: Account[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    industry: 'Technology',
    website: 'https://acme.example.com',
    phone: '(555) 123-4567',
    email: 'info@acme.example.com',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    country: 'USA',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Globex Industries',
    industry: 'Manufacturing',
    website: 'https://globex.example.com',
    phone: '(555) 987-6543',
    email: 'info@globex.example.com',
    address: '456 Market St',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    country: 'USA',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Initech LLC',
    industry: 'Finance',
    website: 'https://initech.example.com',
    phone: '(555) 456-7890',
    email: 'info@initech.example.com',
    address: '789 Park Ave',
    city: 'New York',
    state: 'NY',
    zip: '10022',
    country: 'USA',
    status: 'prospect',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Accounts Store - Manages accounts state
 */
const useAccountsStore = create<AccountsStore>((set, get) => ({
  accounts: [...sampleAccounts],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, this would fetch from an API or database
      // For now, we'll just use the sample accounts
      set({ accounts: [...sampleAccounts], loading: false });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      set({ error: 'Failed to fetch accounts', loading: false });
    }
  },

  addAccount: async (account) => {
    set({ loading: true, error: null });
    try {
      // Add timestamp
      const accountWithTimestamp = {
        ...account,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Generate ID (in a real app, this would be done by the backend)
      const newAccount = {
        id: uuidv4(),
        ...accountWithTimestamp
      };
      
      // Update local state
      set(state => ({
        accounts: [...state.accounts, newAccount],
        loading: false
      }));
      
      return newAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      set({ error: 'Failed to add account', loading: false });
      throw error;
    }
  },

  updateAccount: async (id, data) => {
    set({ loading: true, error: null });
    try {
      // Add updated timestamp
      const updates = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      // Update local state
      set(state => ({
        accounts: state.accounts.map(account => 
          account.id === id ? { ...account, ...updates } : account
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating account:', error);
      set({ error: 'Failed to update account', loading: false });
      throw error;
    }
  },

  deleteAccount: async (id) => {
    set({ loading: true, error: null });
    try {
      // Update local state
      set(state => ({
        accounts: state.accounts.filter(account => account.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting account:', error);
      set({ error: 'Failed to delete account', loading: false });
      throw error;
    }
  },

  getAccountById: (id) => {
    return get().accounts.find(account => account.id === id);
  },
}));

export default useAccountsStore;
