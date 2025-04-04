import { create } from 'zustand';
import { serverTimestamp } from 'firebase/firestore';
import { Activity } from './types';
import firestoreService from './firestoreService';
import { ActivityLog, ACTIVITIES_COLLECTION } from './activityTracking';

// Collection name for activities in Firestore
// Imported from activityTracking.ts

// State interface
interface ActivitiesState {
  activities: ActivityLog[];
  loading: boolean;
  error: Error | null;
  
  // Methods
  fetchActivities: () => Promise<void>;
  addActivity: (activity: Omit<ActivityLog, 'id'>) => Promise<string>;
  updateActivity: (id: string, activityData: Partial<ActivityLog>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  getActivityById: (id: string) => ActivityLog | undefined;
  getActivitiesByType: (type: ActivityLog['type']) => ActivityLog[];
  getRecentActivities: (limit?: number) => ActivityLog[];
  getActivitiesByCollection: (collectionName: string, limit?: number) => ActivityLog[];
  setupRealtimeSync: () => () => void; // Returns unsubscribe function
}

/**
 * Activities Store - Manages activities with Firestore integration
 */
export const useActivitiesStore = create<ActivitiesState>((set, get) => ({
  activities: [],
  loading: false,
  error: null,

  fetchActivities: async () => {
    set({ loading: true, error: null });
    try {
      const activitiesCollection = firestoreService.getCollection<ActivityLog>(ACTIVITIES_COLLECTION);
      const querySnapshot = await firestoreService.getDocs(activitiesCollection);
      
      if (querySnapshot.empty) {
        console.log('No activities found in Firestore, seeding with sample data');
        await initializeActivitiesData();
        
        // Fetch the initialized data
        const freshSnapshot = await firestoreService.getDocs(activitiesCollection);
        const activities = freshSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ActivityLog[];
        
        set({ activities, loading: false });
        return;
      }
      
      const activities = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[];
      
      set({ activities, loading: false });
    } catch (error) {
      console.error('Error fetching activities:', error);
      set({ error: error as Error, loading: false });
    }
  },

  addActivity: async (activity: Omit<ActivityLog, 'id'>): Promise<string> => {
    try {
      // Ensure we have timestamp data
      const timestamp = new Date().toISOString();
      const activityWithTimestamp = {
        ...activity,
        timestamp: activity.timestamp || timestamp,
        timestampRaw: activity.timestampRaw || serverTimestamp()
      };
      
      // Add to Firestore
      const id = await firestoreService.addDocument(ACTIVITIES_COLLECTION, activityWithTimestamp);
      
      // If successful, update local state
      const newActivity = { id, ...activityWithTimestamp } as ActivityLog;
      set(state => ({
        ...state,
        activities: [newActivity, ...state.activities]
      }));
      
      return id;
    } catch (error) {
      console.error('Error adding activity:', error);
      set({ error: error as Error });
      throw error;
    }
  },

  updateActivity: async (id: string, activityData: Partial<ActivityLog>): Promise<void> => {
    try {
      // Update in Firestore
      await firestoreService.updateDocument(ACTIVITIES_COLLECTION, id, activityData);
      
      // Update local state
      set(state => ({
        activities: state.activities.map(activity => 
          activity.id === id ? { ...activity, ...activityData } : activity
        )
      }));
    } catch (error) {
      console.error('Error updating activity:', error);
      set({ error: error as Error });
      throw error;
    }
  },

  deleteActivity: async (id) => {
    try {
      // Delete from Firestore
      await firestoreService.deleteDocument(ACTIVITIES_COLLECTION, id);
      
      // Update local state
      set(state => ({
        activities: state.activities.filter(activity => activity.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting activity:', error);
      set({ error: error as Error });
      throw error;
    }
  },

  getActivityById: (id) => {
    return get().activities.find(activity => activity.id === id);
  },

  getActivitiesByType: (type) => {
    return get().activities.filter(activity => activity.type === type);
  },

  getRecentActivities: (limit = 5): ActivityLog[] => {
    const { activities } = get();
    return [...activities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },
  
  getActivitiesByCollection: (collectionName: string, limit = 10): ActivityLog[] => {
    const { activities } = get();
    return [...activities]
      .filter(activity => activity.collectionName === collectionName)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },

  setupRealtimeSync: () => {
    set({ loading: true });
    
    // Set up real-time listener
    const unsubscribe = firestoreService.subscribeToCollection<ActivityLog>(
      ACTIVITIES_COLLECTION,
      (activities) => {
        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        set({ activities, loading: false });
      },
      (error) => {
        console.error('Error in activities real-time sync:', error);
        set({ error: error as Error, loading: false });
      }
    );
    
    return unsubscribe;
  }
}));
