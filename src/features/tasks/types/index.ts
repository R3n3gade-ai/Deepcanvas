// Task feature types

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to: string; // team_member_id
  related_to_type?: 'account' | 'deal' | 'social_post';
  related_to_id?: string; // account_id, deal_id, or social_post_id
  created_at?: string;
  updated_at?: string;
  // Calendar-specific fields
  start_time?: string; // For calendar events with specific times
  end_time?: string; // For calendar events with specific times
  all_day?: boolean; // Whether the task is an all-day event
  // Social media-specific fields
  is_social_post?: boolean; // Whether this task is a social media post
  social_platform?: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  social_content?: string;
  social_image_url?: string;
  social_scheduled_time?: string;
  social_post_status?: 'draft' | 'scheduled' | 'published';
}

export interface TasksStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  
  // Methods
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: Task['status']) => Task[];
  getPendingTasksCount: () => number;
}
