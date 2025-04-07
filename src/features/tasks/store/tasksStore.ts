import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, TasksStore } from '../types';

// Sample tasks for initial data
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Product demo scheduled',
    description: 'Scheduled demo to show product features',
    due_date: '2023-12-20',
    status: 'pending',
    priority: 'high',
    assigned_to: '1',
    related_to_type: 'account',
    related_to_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Follow up with client',
    description: 'Send follow-up email after initial meeting',
    due_date: '2023-12-22',
    status: 'pending',
    priority: 'medium',
    assigned_to: '2',
    related_to_type: 'deal',
    related_to_id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Prepare proposal draft',
    description: 'Create initial proposal for client review',
    due_date: '2023-12-25',
    status: 'in_progress',
    priority: 'high',
    assigned_to: '1',
    related_to_type: 'deal',
    related_to_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Quarterly review meeting',
    description: 'Internal review of Q1 performance',
    due_date: '2023-12-30',
    status: 'pending',
    priority: 'medium',
    assigned_to: '3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Tasks Store - Manages tasks state
 */
const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: [...sampleTasks],
  loading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, this would fetch from an API or database
      // For now, we'll just use the sample tasks
      set({ tasks: [...sampleTasks], loading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ error: 'Failed to fetch tasks', loading: false });
    }
  },

  addTask: async (task) => {
    set({ loading: true, error: null });
    try {
      // Add timestamp
      const taskWithTimestamp = {
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Generate ID (in a real app, this would be done by the backend)
      const newTask = {
        id: uuidv4(),
        ...taskWithTimestamp
      };
      
      // Update local state
      set(state => ({
        tasks: [...state.tasks, newTask],
        loading: false
      }));
      
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      set({ error: 'Failed to add task', loading: false });
      throw error;
    }
  },

  updateTask: async (id, taskData) => {
    set({ loading: true, error: null });
    try {
      // Add updated timestamp
      const updates = {
        ...taskData,
        updated_at: new Date().toISOString(),
      };
      
      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: 'Failed to update task', loading: false });
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ loading: true, error: null });
    try {
      // Update local state
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: 'Failed to delete task', loading: false });
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
}));

export default useTasksStore;
