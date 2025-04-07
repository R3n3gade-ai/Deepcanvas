import { Task } from './types';
import firestoreService from './firestoreService';

// Collection name for tasks in Firestore
const TASKS_COLLECTION = 'tasks';

// Sample tasks for initializing the collection
const sampleTasks: Omit<Task, 'id'>[] = [
  {
    title: 'Product demo scheduled',
    description: 'Scheduled demo to show product features',
    due_date: '2025-03-20',
    status: 'pending',
    priority: 'high',
    assigned_to: '1', // Assuming team member ID 1 exists
    related_to_type: 'account',
    related_to_id: '1', // Assuming account ID 1 exists
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    title: 'Follow up with client',
    description: 'Send follow-up email after initial meeting',
    due_date: '2025-03-22',
    status: 'pending',
    priority: 'medium',
    assigned_to: '2', // Assuming team member ID 2 exists
    related_to_type: 'deal',
    related_to_id: '2', // Assuming deal ID 2 exists
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    title: 'Prepare proposal draft',
    description: 'Create initial proposal for client review',
    due_date: '2025-03-25',
    status: 'in_progress',
    priority: 'high',
    assigned_to: '1', // Assuming team member ID 1 exists
    related_to_type: 'deal',
    related_to_id: '1', // Assuming deal ID 1 exists
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    title: 'Quarterly review meeting',
    description: 'Internal review of Q1 performance',
    due_date: '2025-03-30',
    status: 'pending',
    priority: 'medium',
    assigned_to: '3', // Assuming team member ID 3 exists
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Check if tasks data exists in Firestore
 * @returns Promise<boolean> - true if data exists, false otherwise
 */
export async function checkTasksData(): Promise<boolean> {
  try {
    const tasksCollection = firestoreService.getCollection(TASKS_COLLECTION);
    const querySnapshot = await firestoreService.getAllDocs(tasksCollection);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking tasks data:', error);
    return false;
  }
}

/**
 * Initialize the tasks collection in Firestore if it's empty
 */
export async function initializeTasksData(): Promise<void> {
  try {
    // Check if tasks collection already has data
    const hasData = await checkTasksData();
    if (hasData) {
      console.log('Tasks collection already has data. Skipping initialization.');
      return;
    }

    // console.log('Initializing tasks collection with sample data...');

    // // Add sample tasks to Firestore
    // await Promise.all(
    //   sampleTasks.map(async (task, index) => {
    //     // Use index + 1 for predictable IDs in dev
    //     const taskId = (index + 1).toString();
    //     await firestoreService.setDocument(TASKS_COLLECTION, taskId, task);
    //     console.log(`Added task ${taskId}`);
    //   })
    // );

    console.log('Successfully initialized tasks data.');
  } catch (error) {
    console.error('Error initializing tasks data:', error);
    throw error;
  }
}
