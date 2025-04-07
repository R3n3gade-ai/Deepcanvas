export interface UserActivityContext {
  recentActivities: ActivityLog[];
  currentWorkflow?: string;
  openDocuments: string[];
  projectContext: string[];
  userPreferences: Record<string, any>;
}

export interface ActivityLog extends Record<string, any> {
  timestamp: string;
  type: 'chat' | 'workflow' | 'development' | 'crm' | 'task';
  action: string;
  details: Record<string, any>;
}