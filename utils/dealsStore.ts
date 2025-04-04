import { create } from 'zustand';
import { User } from 'firebase/auth';
import { Deal } from './types';
import firestoreService from './firestoreService';
import { logCreateActivity, logUpdateActivity, logDeleteActivity } from './activityTracking';

// Collection name for deals in Firestore
const DEALS_COLLECTION = 'deals';

interface DealsState {
  deals: Deal[];
  loading: boolean;
  error: Error | null;
  fetchDeals: () => Promise<void>;
  createDeal: (deal: Omit<Deal, 'id'>, user?: User) => Promise<Deal>;
  updateDeal: (id: string, updates: Partial<Deal>, user?: User) => Promise<void>;
  deleteDeal: (id: string, user?: User) => Promise<void>;
  setupRealtimeSync: () => () => void; // Returns unsubscribe function
}

export const useDealsStore = create<DealsState>((set, get) => ({
  deals: [],
  loading: false,
  error: null,

  fetchDeals: async () => {
    set({ loading: true, error: null });
    try {
      // Check if there's data in Firestore
      const dealsCollection = firestoreService.getCollection<Deal>(DEALS_COLLECTION);
      const querySnapshot = await firestoreService.getDocs(dealsCollection);
      // Map the documents to Deal objects
      const deals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Deal[];

      set({ deals, loading: false });

      // if (querySnapshot.empty) {
      //   // If no data exists, seed with mock data
      //   console.log('No deals found in Firestore, seeding with mock data');

      //   // Use Promise.all to create all deals in parallel
      //   await Promise.all(
      //     mockDeals.map(async (deal) => {
      //       await firestoreService.setDocument(DEALS_COLLECTION, deal.id, {
      //         ...deal,
      //         created_at: new Date().toISOString(),
      //         updated_at: new Date().toISOString()
      //       });
      //     })
      //   );

      //   // Set the mock data
      //   set({ deals: mockDeals, loading: false });
      // } else {
      //   // Map the documents to Deal objects
      //   const deals = querySnapshot.docs.map(doc => ({
      //     id: doc.id,
      //     ...doc.data()
      //   })) as Deal[];

      //   set({ deals, loading: false });
      // }
    } catch (error) {
      console.error('Error fetching deals:', error);
      set({ error: error as Error, loading: false });
    }
  },

  createDeal: async (dealData, user) => {
    set({ loading: true, error: null });
    try {
      // Add timestamp fields
      const now = new Date().toISOString();
      const newDealData = {
        ...dealData,
        created_at: now,
        updated_at: now
      };

      // Add a new document with auto-generated ID
      const id = await firestoreService.addDocument(DEALS_COLLECTION, newDealData);

      // Create the complete deal object with ID
      const newDeal = { id, ...newDealData } as Deal;

      // Update local state optimistically
      set(state => ({
        deals: [...state.deals, newDeal],
        loading: false
      }));

      // Log the activity if user is provided
      if (user) {
        await logCreateActivity(user, DEALS_COLLECTION, id, {
          name: newDeal.name,
          amount: newDeal.amount,
          stage: newDeal.stage,
          account_id: newDeal.account_id,
          action: "deal_created"
        });
      }

      return newDeal;
    } catch (error) {
      console.error('Error creating deal:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  },

  updateDeal: async (id, updates, user) => {
    set({ loading: true, error: null });
    try {
      // Get the current deal for activity logging
      const currentDeal = get().deals.find(d => d.id === id);

      // Add updated timestamp
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update the document in Firestore
      await firestoreService.updateDocument(DEALS_COLLECTION, id, updateData);

      // Update local state optimistically
      set(state => ({
        deals: state.deals.map(deal =>
          deal.id === id ? { ...deal, ...updateData } : deal
        ),
        loading: false
      }));

      // Log the activity if user is provided
      if (user && currentDeal) {
        // Prepare activity details
        const activityDetails: Record<string, any> = {
          name: currentDeal.name,
          amount: currentDeal.amount
        };

        // Check if this is a stage change and add contextual details if it is
        if (updates.stage && updates.stage !== currentDeal.stage) {
          activityDetails.action = "stage_change";
          activityDetails.previous_stage = currentDeal.stage;
          activityDetails.new_stage = updates.stage;
        }

        await logUpdateActivity(user, DEALS_COLLECTION, id, activityDetails);
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  },

  deleteDeal: async (id, user) => {
    set({ loading: true, error: null });
    try {
      // Get deal info before deleting for activity log
      const dealToDelete = get().deals.find(deal => deal.id === id);

      // Delete the document from Firestore
      await firestoreService.deleteDocument(DEALS_COLLECTION, id);

      // Update local state optimistically
      set(state => ({
        deals: state.deals.filter(deal => deal.id !== id),
        loading: false
      }));

      // Log the activity if user is provided
      if (user && dealToDelete) {
        await logDeleteActivity(user, DEALS_COLLECTION, id, {
          name: dealToDelete.name,
          stage: dealToDelete.stage,
          amount: dealToDelete.amount,
          account_id: dealToDelete.account_id,
          action: "deal_deleted"
        });
      }
    } catch (error) {
      console.error('Error deleting deal:', error);
      set({ error: error as Error, loading: false });
      throw error;
    }
  },

  setupRealtimeSync: () => {
    // Set up a real-time listener for the deals collection
    const unsubscribe = firestoreService.subscribeToCollection<Deal>(
      DEALS_COLLECTION,
      (deals) => {
        // Update the store with the new data
        set({ deals: deals as Deal[], loading: false });
      },
      (error) => {
        console.error('Error in deals collection listener:', error);
        set({ error: error as Error, loading: false });
      }
    );

    return unsubscribe;
  }
}));
