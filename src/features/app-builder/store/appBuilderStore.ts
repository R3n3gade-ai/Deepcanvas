import { create } from 'zustand';
import {
  AppTemplate,
  AppProject,
  AIGenerationPrompt,
  AppBuilderStore
} from '../types';
import appBuilderService from '../services/appBuilderService';

// Create the store
const useAppBuilderStore = create<AppBuilderStore>((set, get) => ({
  templates: [],
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // Fetch all templates
  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await appBuilderService.loadTemplates();
      set({ templates, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch templates', isLoading: false });
    }
  },

  // Fetch all projects
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await appBuilderService.loadProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch projects', isLoading: false });
    }
  },

  // Load a specific project
  loadProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const project = await appBuilderService.getProjectById(id);
      if (project) {
        set({ currentProject: project, isLoading: false });
      } else {
        set({ error: 'Project not found', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to load project', isLoading: false });
    }
  },

  // Create a new project
  createProject: async (name: string, description: string, type: AppProject['type'], templateId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const projectId = await appBuilderService.createProject(name, description, type, templateId);

      // Refresh projects
      const projects = await appBuilderService.loadProjects();
      set({ projects, isLoading: false });

      return projectId;
    } catch (error) {
      set({ error: 'Failed to create project', isLoading: false });
      return '';
    }
  },

  // Update an existing project
  updateProject: async (project: AppProject) => {
    set({ isLoading: true, error: null });
    try {
      await appBuilderService.updateProject(project);

      // Update the project in the store
      set(state => ({
        projects: state.projects.map(p => p.id === project.id ? project : p),
        currentProject: state.currentProject?.id === project.id ? project : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update project', isLoading: false });
    }
  },

  // Delete a project
  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await appBuilderService.deleteProject(id);

      // Remove the project from the store
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete project', isLoading: false });
    }
  },

  // Generate project with AI
  generateWithAI: async (prompt: AIGenerationPrompt) => {
    set({ isLoading: true, error: null });
    try {
      const generatedContent = await appBuilderService.generateWithAI(prompt);
      set({ isLoading: false });
      return generatedContent;
    } catch (error) {
      set({ error: 'Failed to generate with AI', isLoading: false });
      return {};
    }
  },

  // Publish a project
  publishProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const publishedUrl = await appBuilderService.publishProject(id);

      // Update the project in the store
      set(state => {
        const updatedProjects = state.projects.map(p => {
          if (p.id === id) {
            return { ...p, published: true, publishedUrl };
          }
          return p;
        });

        const updatedCurrentProject = state.currentProject?.id === id
          ? { ...state.currentProject, published: true, publishedUrl }
          : state.currentProject;

        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          isLoading: false,
        };
      });

      return publishedUrl;
    } catch (error) {
      set({ error: 'Failed to publish project', isLoading: false });
      return '';
    }
  },

  // Unpublish a project
  unpublishProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await appBuilderService.unpublishProject(id);

      // Update the project in the store
      set(state => {
        const updatedProjects = state.projects.map(p => {
          if (p.id === id) {
            const { publishedUrl, ...rest } = p;
            return { ...rest, published: false };
          }
          return p;
        });

        let updatedCurrentProject = state.currentProject;
        if (state.currentProject?.id === id) {
          const { publishedUrl, ...rest } = state.currentProject;
          updatedCurrentProject = { ...rest, published: false };
        }

        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: 'Failed to unpublish project', isLoading: false });
    }
  },

  // AI Builder specific actions
  createAIBuilderProject: async (name: string, description: string, type: AppProject['type'], templateId?: string) => {
    set({ isLoading: true, error: null });
    try {
      const projectId = await appBuilderService.createProject(name, description, type, templateId);

      // Fetch the new project
      const project = await appBuilderService.getProjectById(projectId);

      // Set useAIBuilder flag
      const aiBuilderProject = {
        ...project,
        useAIBuilder: true
      };

      // Update the project
      await appBuilderService.updateProject(aiBuilderProject);

      // Update the store
      set(state => ({
        projects: [...state.projects, aiBuilderProject],
        isLoading: false
      }));

      return projectId;
    } catch (error) {
      set({ error: 'Failed to create AI Builder project', isLoading: false });
      throw error;
    }
  },

  updateAIBuilderProject: async (project: AppProject) => {
    set({ isLoading: true, error: null });
    try {
      await appBuilderService.updateProject(project);

      // Update the project in the store
      set(state => {
        const updatedProjects = state.projects.map(p => {
          if (p.id === project.id) {
            return project;
          }
          return p;
        });

        return {
          projects: updatedProjects,
          currentProject: project.id === state.currentProject?.id ? project : state.currentProject,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to update AI Builder project', isLoading: false });
      throw error;
    }
  },

  migrateToAIBuilder: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Get the project
      const project = await appBuilderService.getProjectById(projectId);

      // Update the project to use AI Builder
      const aiBuilderProject = {
        ...project,
        useAIBuilder: true
      };

      // Update the project
      await appBuilderService.updateProject(aiBuilderProject);

      // Update the store
      set(state => {
        const updatedProjects = state.projects.map(p => {
          if (p.id === projectId) {
            return aiBuilderProject;
          }
          return p;
        });

        return {
          projects: updatedProjects,
          currentProject: projectId === state.currentProject?.id ? aiBuilderProject : state.currentProject,
          isLoading: false
        };
      });
    } catch (error) {
      set({ error: 'Failed to migrate project to AI Builder', isLoading: false });
      throw error;
    }
  },
}));

export default useAppBuilderStore;
