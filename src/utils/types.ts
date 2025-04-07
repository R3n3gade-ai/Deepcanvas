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
  social_platform?: 'twitter' | 'facebook' | 'instagram' | 'linkedin'; // Social media platform
  social_content?: string; // Content of the social media post
  social_image_url?: string; // URL of the image to include in the post
  social_scheduled_time?: string; // Scheduled time for the post
  social_post_status?: 'draft' | 'scheduled' | 'posted' | 'failed'; // Status of the social media post
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  position?: string;
  email: string;
  phone?: string;
  department?: string;
  joined_date?: string;
  status?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamPerformance {
  id: string;
  team_member_id: string;
  year: number;
  quarter: number;
  quota: number;
  forecast_amount: number;
  percent_to_goal: number;
}

export interface Account {
  id: string;
  name: string;
  industry: string;
  website?: string;
  employees?: number;
  annual_revenue?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Deal {
  id: string;
  name: string;
  account_id: string;
  stage: string;
  amount: number;
  close_date: string;
  probability: number;
  description: string;
  status: string;
  team_member_id: string;
  owner_id: string;
  region?: string;
  lead_source?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'note' | 'email' | 'call' | 'meeting' | 'task' | 'other';
  created_by: string; // team_member_id
  related_to_type?: 'account' | 'deal' | 'task';
  related_to_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Firebase Activity Log - matches activities collection in Firestore
export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  account_id?: string;
  lead_status?: string;
  lead_source?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO string format of date
  timestampRaw?: any; // Firestore Timestamp
  type: 'create' | 'update' | 'delete' | 'view';
  documentRef: string; // ID of the affected document
  collectionName: string; // Collection the document belongs to
  userId: string; // User ID who performed the action
  userName: string; // Display name of the user
  details?: Record<string, any>; // Additional context with document data
}