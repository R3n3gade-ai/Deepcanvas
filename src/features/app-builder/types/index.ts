// Types for the app builder feature

export interface AppTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
  tags: string[];
  complexity: 'simple' | 'medium' | 'complex';
  features: string[];
  previewUrl?: string;
}

// Plasmic specific types
export interface PlasmicComponent {
  id: string;
  name: string;
  type: string;
  props: Record<string, any>;
  children?: PlasmicComponent[];
  styles?: Record<string, any>;
}

export interface PlasmicPage {
  id: string;
  name: string;
  path: string;
  rootComponent: PlasmicComponent;
  meta?: Record<string, any>;
}

export interface AppProject {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  lastEdited: string;
  createdAt: string;
  type: 'website' | 'landing-page' | 'app' | 'dashboard';
  template?: string;
  // Legacy fields for backward compatibility
  content?: string; // HTML content
  css?: string; // CSS styles
  js?: string; // JavaScript code
  assets?: AppAsset[];
  pages?: AppPage[];
  // AI Builder specific fields
  useAIBuilder?: boolean;
  aiBuilderFiles?: Record<string, string>;
  published?: boolean;
  publishedUrl?: string;
}

export interface AppAsset {
  id: string;
  name: string;
  type: 'image' | 'font' | 'icon' | 'video' | 'audio' | 'document';
  url: string;
  size?: number;
  dimensions?: { width: number; height: number };
}

export interface AppPage {
  id: string;
  name: string;
  path: string;
  content: string;
  isHome?: boolean;
}

export interface AppComponent {
  id: string;
  name: string;
  category: string;
  thumbnail?: string;
  html: string;
  css?: string;
  js?: string;
  editable?: boolean;
}

export interface AIGenerationPrompt {
  type: 'website' | 'landing-page' | 'app' | 'dashboard';
  description: string;
  features?: string[];
  style?: string;
  colorScheme?: string;
  references?: string[];
}

export interface AppBuilderStore {
  templates: AppTemplate[];
  projects: AppProject[];
  currentProject: AppProject | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTemplates: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  createProject: (name: string, description: string, type: AppProject['type'], templateId?: string) => Promise<string>;
  updateProject: (project: AppProject) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  generateWithAI: (prompt: AIGenerationPrompt) => Promise<Partial<AppProject>>;
  publishProject: (id: string) => Promise<string>;
  unpublishProject: (id: string) => Promise<void>;

  // AI Builder specific actions
  createAIBuilderProject: (name: string, description: string, type: AppProject['type'], templateId?: string) => Promise<string>;
  updateAIBuilderProject: (project: AppProject) => Promise<void>;
  migrateToAIBuilder: (projectId: string) => Promise<void>;
}
