import { create } from 'zustand';
import { User } from 'firebase/auth';
import { Account } from './types';
import firestoreService from './firestoreService';
import { initializeAccountsData, checkAccountsData } from './initAccountsData';
import { logCreateActivity, logUpdateActivity, logDeleteActivity } from './activityTracking';

// Collection name for accounts in Firestore
const ACCOUNTS_COLLECTION = 'accounts';

interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error: Error | null;
  fetchAccounts: () => Promise<void>;
  getAccountById: (id: string) => Account | undefined;
  createAccount: (account: Omit<Account, 'id' | 'created_at' | 'updated_at'>, user?: User) => Promise<Account>;
  updateAccount: (id: string, updatedFields: Partial<Account>, user?: User) => Promise<void>;
  deleteAccount: (id: string, user?: User) => Promise<void>;
  setupRealtimeSync: () => () => void; // Returns unsubscribe function
}

// Accounts store with Firestore integration
export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async () => {
    set({ loading: true, error: null });
    try {
      // Check if there's data in Firestore
      const accountsCollection = firestoreService.getCollection<Account>(ACCOUNTS_COLLECTION);
      const querySnapshot = await firestoreService.getDocs(accountsCollection);

      // Map the documents to Account objects
      const accounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Account[];

      set({ accounts, loading: false });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      set({ error: error as Error, loading: false });
    }
  },

  // Setup real-time sync with Firestore (similar to dealsStore)
  setupRealtimeSync: () => {
    // Set up a real-time listener for the accounts collection
    const unsubscribe = firestoreService.subscribeToCollection<Account>(
      ACCOUNTS_COLLECTION,
      (accounts) => {
        // Update the store with the new data
        set({ accounts: accounts as Account[], loading: false });
      },
      (error) => {
        console.error('Error in accounts collection listener:', error);
        set({ error: error as Error, loading: false });
      }
    );

    return unsubscribe;
  },

  getAccountById: (id) => {
    return get().accounts.find(account => account.id === id);
  },

  createAccount: async (account, user) => {
    set({ loading: true, error: null });
    try {
      // Add timestamp fields
      const now = new Date().toISOString();
      const newAccountData = {
        ...account,
        created_at: now,
        updated_at: now
      };

      // Log data before submission
      console.log('Creating account with data:', JSON.stringify(newAccountData, null, 2));

      // Add document to Firestore with auto-generated ID
      const id = await firestoreService.addDocument(ACCOUNTS_COLLECTION, newAccountData);

      // Create the complete account object with ID
      const newAccount = { id, ...newAccountData } as Account;

      // Update local state optimistically
      set(state => ({
        accounts: [...state.accounts, newAccount],
        loading: false
      }));

      // Log the activity if user is provided
      if (user) {
        await logCreateActivity(user, ACCOUNTS_COLLECTION, id, {
          name: newAccount.name,
          industry: newAccount.industry,
          website: newAccount.website
        });
      }

      return newAccount;
    } catch (error) {
      console.error('Error creating account:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  },

  updateAccount: async (id, updatedFields, user) => {
    set({ loading: true, error: null });
    try {
      // Add updated timestamp
      const updateData = {
        ...updatedFields,
        updated_at: new Date().toISOString()
      };

      // Update the document in Firestore
      await firestoreService.updateDocument(ACCOUNTS_COLLECTION, id, updateData);

      // Update local state optimistically
      set(state => ({
        accounts: state.accounts.map(account =>
          account.id === id ? { ...account, ...updateData } : account
        ),
        loading: false
      }));

      // Log the activity if user is provided
      if (user) {
        const previousData = get().accounts.find(a => a.id === id);
        await logUpdateActivity(user, ACCOUNTS_COLLECTION, id, {
          ...updateData,
          previous_name: previousData?.name,
          previous_industry: previousData?.industry
        });
      }
    } catch (error) {
      console.error('Error updating account:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  },

  deleteAccount: async (id, user) => {
    set({ loading: true, error: null });
    try {
      // Get account info before deleting for activity log
      const accountToDelete = get().accounts.find(account => account.id === id);

      // Delete the document from Firestore
      await firestoreService.deleteDocument(ACCOUNTS_COLLECTION, id);

      // Update local state optimistically
      set(state => ({
        accounts: state.accounts.filter(account => account.id !== id),
        loading: false
      }));

      // Log the activity if user is provided
      if (user && accountToDelete) {
        await logDeleteActivity(user, ACCOUNTS_COLLECTION, id, {
          name: accountToDelete.name,
          industry: accountToDelete.industry,
          website: accountToDelete.website
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  },
}));
