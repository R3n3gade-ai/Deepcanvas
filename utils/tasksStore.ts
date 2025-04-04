import { create } from 'zustand';
import { Task } from './types';
import firestoreService from './firestoreService';

// Collection name for tasks in Firestore
const TASKS_COLLECTION = 'tasks';

// State interface
interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  
  // Methods
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: Task['status']) => Task[];
  getPendingTasksCount: () => number;
  setupRealtimeSync: () => () => void; // Returns unsubscribe function
}

/**
 * Tasks Store - Manages tasks with Firestore integration
 */
export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      const tasksCollection = firestoreService.getCollection<Task>(TASKS_COLLECTION);
      const querySnapshot = await firestoreService.getDocs(tasksCollection);
      
      if (querySnapshot.empty) {
        console.log('No tasks found in Firestore');
        // We'll initialize tasks separately
        set({ tasks: [], loading: false });
        return;
      }
      
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      set({ tasks, loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ error: error as Error, loading: false });
    }
  },

  addTask: async (task) => {
    try {
      // Add timestamp
      const taskWithTimestamp = {
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Add to Firestore
      const docRef = await firestoreService.addDocument(TASKS_COLLECTION, taskWithTimestamp);
      
      // Create the complete task with generated ID
      const newTask = {
        id: docRef.id,
        ...taskWithTimestamp
      };
      
      // Update local state
      set(state => ({
        tasks: [...state.tasks, newTask]
      }));
      
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      set({ error: error as Error });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    try {
      // Add updated timestamp
      const updates = {
        ...taskData,
        updated_at: new Date().toISOString(),
      };
      
      // Update in Firestore
      await firestoreService.updateDocument(TASKS_COLLECTION, id, updates);
      
      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: error as Error });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      // Delete from Firestore
      await firestoreService.deleteDocument(TASKS_COLLECTION, id);
      
      // Update local state
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: error as Error });
      throw error;
    }
  },

  getTaskById: (id) => {
    return get().tasks.find(task => task.id === id);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter(task => task.status === status);
  },

  getPendingTasksCount: () => {
    return get().tasks.filter(task => task.status === 'pending').length;
  },

  setupRealtimeSync: () => {
    // Set up real-time listener
    const unsubscribe = firestoreService.subscribeToCollection<Task>(
      TASKS_COLLECTION,
      (tasks) => {
        set({ tasks, loading: false });
      },
      (error) => {
        console.error('Error in tasks real-time sync:', error);
        set({ error: error as Error, loading: false });
      }
    );
    
    return unsubscribe;
  }
}));
