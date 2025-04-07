import { v4 as uuidv4 } from 'uuid';
import {
  AppTemplate,
  AppProject,
  AIGenerationPrompt
} from '../types';

// Mock templates for demonstration
const mockTemplates: AppTemplate[] = [
  {
    id: "template-1",
    name: "Business Website",
    category: "website",
    thumbnail: "https://via.placeholder.com/300x200?text=Business+Website",
    description: "Professional website template for businesses with multiple pages.",
    tags: ["business", "professional", "multi-page"],
    components: []
  },
  {
    id: "template-2",
    name: "Landing Page",
    category: "landing-page",
    thumbnail: "https://via.placeholder.com/300x200?text=Landing+Page",
    description: "High-converting landing page template with call-to-action sections.",
    tags: ["landing", "conversion", "marketing"],
    components: []
  },
  {
    id: "template-3",
    name: "E-commerce Store",
    category: "app",
    thumbnail: "https://via.placeholder.com/300x200?text=E-commerce+Store",
    description: "Complete e-commerce store template with product listings and cart.",
    tags: ["ecommerce", "shop", "products"],
    components: []
  },
  {
    id: "template-4",
    name: "Dashboard",
    category: "dashboard",
    thumbnail: "https://via.placeholder.com/300x200?text=Dashboard",
    description: "Admin dashboard template with charts, tables, and analytics.",
    tags: ["dashboard", "admin", "analytics"],
    components: []
  }
];

/**
 * Service for managing app builder projects and templates
 */
class AppBuilderService {
  private initialized: boolean = false;
  private templates: AppTemplate[] = [];
  private projects: AppProject[] = [];

  /**
   * Initialize the service
   */
  initialize(): void {
    // Load templates
    this.templates = [...mockTemplates];

    // Load projects from localStorage
    const savedProjects = localStorage.getItem('deepcanvas-app-projects');
    if (savedProjects) {
      try {
        this.projects = JSON.parse(savedProjects);
      } catch (error) {
        console.error('Error loading projects:', error);
        this.projects = [];
      }
    }

    this.initialized = true;
  }

  /**
   * Save projects to localStorage
   */
  private saveProjects(): void {
    localStorage.setItem('deepcanvas-app-projects', JSON.stringify(this.projects));
  }

  /**
   * Load all templates
   */
  async loadTemplates(): Promise<AppTemplate[]> {
    if (!this.initialized) {
      this.initialize();
    }
    return this.templates;
  }

  /**
   * Load all projects
   */
  async loadProjects(): Promise<AppProject[]> {
    if (!this.initialized) {
      this.initialize();
    }
    return this.projects;
  }

  /**
   * Get a project by ID
   */
  async getProjectById(id: string): Promise<AppProject> {
    if (!this.initialized) {
      this.initialize();
    }

    const project = this.projects.find(p => p.id === id);
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }

    return project;
  }

  /**
   * Create a new project
   */
  async createProject(name: string, description: string, type: AppProject['type'], templateId?: string): Promise<string> {
    if (!this.initialized) {
      this.initialize();
    }

    const newProject: AppProject = {
      id: uuidv4(),
      name,
      description,
      thumbnail: `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`,
      lastEdited: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type,
      template: templateId,
      content: '',
      css: '',
      js: '',
      published: false
    };

    if (templateId) {
      const template = this.templates.find(t => t.id === templateId);
      if (template) {
        // In a real implementation, this would load the template content
        // For now, we'll just use a placeholder
        newProject.content = `<div class="container">
          <h1>${name}</h1>
          <p>${description}</p>
        </div>`;
        
        newProject.css = `
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          h1 {
            color: #333;
          }
          p {
            line-height: 1.6;
          }
        `;
      }
    }

    this.projects.push(newProject);
    this.saveProjects();
    return newProject.id;
  }

  /**
   * Update an existing project
   */
  async updateProject(project: AppProject): Promise<void> {
    if (!this.initialized) {
      this.initialize();
    }

    const index = this.projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
      // Update lastEdited timestamp
      project.lastEdited = new Date().toISOString();
      this.projects[index] = project;
      this.saveProjects();
    } else {
      throw new Error(`Project with ID ${project.id} not found`);
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    if (!this.initialized) {
      this.initialize();
    }

    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects.splice(index, 1);
      this.saveProjects();
    } else {
      throw new Error(`Project with ID ${id} not found`);
    }
  }

  /**
   * Generate content with AI
   */
  async generateWithAI(prompt: AIGenerationPrompt): Promise<any> {
    if (!this.initialized) {
      this.initialize();
    }

    // In a real implementation, this would call an AI service
    // For now, we'll just return a placeholder response
    return {
      html: `<div class="ai-generated">
        <h1>${prompt.title || 'AI Generated Content'}</h1>
        <p>${prompt.description || 'This content was generated based on your prompt.'}</p>
        <button class="cta-button">Learn More</button>
      </div>`,
      css: `
        .ai-generated {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          text-align: center;
        }
        .cta-button {
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }
        .cta-button:hover {
          background-color: #45a049;
        }
      `,
      js: `
        document.querySelector('.cta-button').addEventListener('click', function() {
          alert('Button clicked!');
        });
      `
    };
  }

  /**
   * Publish a project
   */
  async publishProject(id: string): Promise<string> {
    if (!this.initialized) {
      this.initialize();
    }

    const project = this.projects.find(p => p.id === id);
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }

    // In a real implementation, this would deploy the project to a hosting service
    // For now, we'll just mark it as published
    project.published = true;
    project.publishedUrl = `https://deepcanvas-app-${id}.example.com`;
    project.lastEdited = new Date().toISOString();

    // Update the project in the store
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects[index] = project;
      this.saveProjects();
    }

    return project.publishedUrl;
  }

  /**
   * Unpublish a project
   */
  async unpublishProject(id: string): Promise<void> {
    if (!this.initialized) {
      this.initialize();
    }

    const project = this.projects.find(p => p.id === id);
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }

    // In a real implementation, this would remove the project from the hosting service
    // For now, we'll just mark it as unpublished
    project.published = false;
    project.publishedUrl = undefined;
    project.lastEdited = new Date().toISOString();

    // Update the project in the store
    const index = this.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      this.projects[index] = project;
      this.saveProjects();
    }
  }

  // AI Builder specific actions
  async createAIBuilderProject(name: string, description: string, type: AppProject['type'], templateId?: string): Promise<string> {
    if (!this.initialized) {
      this.initialize();
    }

    const projectId = await this.createProject(name, description, type, templateId);

    // Fetch the new project
    const project = await this.getProjectById(projectId);

    // Set useAIBuilder flag
    const aiBuilderProject = {
      ...project,
      useAIBuilder: true
    };

    // Update the project
    await this.updateProject(aiBuilderProject);

    return projectId;
  }

  async updateAIBuilderProject(project: AppProject): Promise<void> {
    if (!this.initialized) {
      this.initialize();
    }

    // Make sure the useAIBuilder flag is set
    project.useAIBuilder = true;
    
    // Update the project
    await this.updateProject(project);
  }

  async migrateToAIBuilder(projectId: string): Promise<void> {
    if (!this.initialized) {
      this.initialize();
    }

    // Get the project
    const project = await this.getProjectById(projectId);

    // Update the project to use AI Builder
    const aiBuilderProject = {
      ...project,
      useAIBuilder: true
    };

    // Update the project
    await this.updateProject(aiBuilderProject);
  }
}

// Create and export a singleton instance
const appBuilderService = new AppBuilderService();
export default appBuilderService;
