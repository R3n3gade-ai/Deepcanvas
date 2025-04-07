import { v4 as uuidv4 } from 'uuid';
import { AppProject } from '../types';

/**
 * DeepCanvas AI Builder Service
 *
 * This service provides a custom no-code AI app building experience
 * integrated directly into DeepCanvas, using Google's Gemini API.
 */
class DeepCanvasAIBuilderService {
  private initialized: boolean = false;
  private projectsMap: Map<string, any> = new Map(); // Maps DeepCanvas project IDs to AI Builder projects
  private webContainerInstances: Map<string, any> = new Map(); // Maps project IDs to WebContainer instances
  private geminiApiKey: string = 'AIzaSyBjBOqVwIHLdKdAduUO9mxzAgn6czyWMqA'; // Default Gemini API key

  /**
   * Initialize the DeepCanvas AI Builder service
   */
  initialize(): void {
    // Load any saved project mappings from localStorage
    const savedMappings = localStorage.getItem('deepcanvas-ai-builder-projects');
    if (savedMappings) {
      try {
        const mappings = JSON.parse(savedMappings);
        this.projectsMap = new Map(Object.entries(mappings));
      } catch (error) {
        console.error('Error loading AI Builder project mappings:', error);
      }
    }

    this.initialized = true;
  }

  /**
   * Check if the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create a new AI Builder project
   * @param project The DeepCanvas project to create an AI Builder project for
   * @returns The project ID
   */
  async createAIBuilderProject(project: AppProject): Promise<string> {
    if (!this.initialized) {
      this.initialize();
    }

    // Generate a unique ID for the AI Builder project
    const aiBuilderProjectId = uuidv4();

    // Create a new AI Builder project configuration
    const aiBuilderProject = {
      id: aiBuilderProjectId,
      name: project.name,
      description: project.description,
      type: project.type,
      createdAt: new Date().toISOString(),
      files: {},
      settings: {
        defaultModel: 'gpt-4o',
        defaultProvider: 'openai'
      }
    };

    // Store the mapping between DeepCanvas project ID and AI Builder project
    this.projectsMap.set(project.id, aiBuilderProject);

    // Save the mappings to localStorage
    this.saveMappings();

    return project.id;
  }

  /**
   * Get an AI Builder project
   * @param projectId The DeepCanvas project ID
   * @returns The AI Builder project configuration
   */
  getAIBuilderProject(projectId: string): any | null {
    if (!this.initialized) {
      this.initialize();
    }

    // Check if we have a mapping for this project
    return this.projectsMap.get(projectId) || null;
  }

  /**
   * Update an AI Builder project
   * @param projectId The DeepCanvas project ID
   * @param updates The updates to apply to the AI Builder project
   */
  updateAIBuilderProject(projectId: string, updates: any): void {
    if (!this.initialized) {
      this.initialize();
    }

    const aiBuilderProject = this.projectsMap.get(projectId);
    if (!aiBuilderProject) {
      throw new Error(`AI Builder project with ID ${projectId} not found`);
    }

    // Update the AI Builder project
    const updatedProject = {
      ...aiBuilderProject,
      ...updates,
      lastEdited: new Date().toISOString()
    };

    // Store the updated project
    this.projectsMap.set(projectId, updatedProject);

    // Save the mappings to localStorage
    this.saveMappings();
  }

  /**
   * Delete an AI Builder project
   * @param projectId The DeepCanvas project ID
   */
  deleteAIBuilderProject(projectId: string): void {
    if (!this.initialized) {
      this.initialize();
    }

    // Delete the WebContainer instance if it exists
    if (this.webContainerInstances.has(projectId)) {
      // Clean up the WebContainer instance
      this.webContainerInstances.delete(projectId);
    }

    // Delete the project mapping
    this.projectsMap.delete(projectId);

    // Save the mappings to localStorage
    this.saveMappings();
  }

  /**
   * Initialize a WebContainer for a project
   * @param projectId The DeepCanvas project ID
   */
  async initializeWebContainer(projectId: string): Promise<any> {
    if (!this.initialized) {
      this.initialize();
    }

    const aiBuilderProject = this.projectsMap.get(projectId);
    if (!aiBuilderProject) {
      throw new Error(`AI Builder project with ID ${projectId} not found`);
    }

    try {
      // In a real implementation, we would initialize a WebContainer instance here
      // For now, we'll just create a placeholder
      const webContainerInstance = {
        id: projectId,
        status: 'initialized',
        createdAt: new Date().toISOString()
      };

      // Store the WebContainer instance
      this.webContainerInstances.set(projectId, webContainerInstance);

      return webContainerInstance;
    } catch (error) {
      console.error('Error initializing WebContainer:', error);
      throw error;
    }
  }

  /**
   * Generate code using AI
   * @param projectId The DeepCanvas project ID
   * @param prompt The prompt to send to the AI
   */
  async generateCode(projectId: string, prompt: string, model: string = 'gemini-2.0-flash'): Promise<any> {
    if (!this.initialized) {
      this.initialize();
    }

    const aiBuilderProject = this.projectsMap.get(projectId);
    if (!aiBuilderProject) {
      throw new Error(`AI Builder project with ID ${projectId} not found`);
    }

    try {
      // Create a more specific prompt for generating code
      const enhancedPrompt = `
        Generate a web application based on the following description:
        ${prompt}

        Please provide the following files:
        1. index.html - The main HTML file
        2. styles.css - The CSS styles
        3. script.js - The JavaScript code

        Make sure the code is clean, well-structured, and follows best practices.
        The application should be responsive and user-friendly.
      `;

      // Call the Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: enhancedPrompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Parse the response to extract the generated code
      // This is a simplified implementation - in a real app, you would need to parse the response more carefully
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Extract the files from the generated text
      const files = this.extractFilesFromGeneratedText(generatedText);

      return {
        success: true,
        message: 'Code generated successfully',
        files
      };
    } catch (error) {
      console.error('Error generating code:', error);
      return {
        success: false,
        message: `Error generating code: ${error.message}`,
        files: {
          'index.html': '<!DOCTYPE html><html><head><title>Error</title></head><body><h1>Error Generating Code</h1><p>There was an error generating the code. Please try again.</p></body></html>',
          'styles.css': 'body { font-family: Arial, sans-serif; color: red; }',
          'script.js': 'console.error("Error generating code");'
        }
      };
    }
  }

  /**
   * Extract files from the generated text
   * @param generatedText The text generated by the AI
   */
  private extractFilesFromGeneratedText(generatedText: string): Record<string, string> {
    const files: Record<string, string> = {};

    // Default files in case extraction fails
    const defaultFiles = {
      'index.html': '<!DOCTYPE html><html><head><title>Generated App</title></head><body><h1>Hello, World!</h1></body></html>',
      'styles.css': 'body { font-family: Arial, sans-serif; }',
      'script.js': 'console.log("Hello, World!");'
    };

    try {
      // Look for code blocks in the generated text
      const htmlMatch = generatedText.match(/```html[\s\S]*?```/);
      const cssMatch = generatedText.match(/```css[\s\S]*?```/);
      const jsMatch = generatedText.match(/```javascript[\s\S]*?```/) || generatedText.match(/```js[\s\S]*?```/);

      // Extract the content from the code blocks
      if (htmlMatch) {
        files['index.html'] = htmlMatch[0].replace(/```html\n?/, '').replace(/```$/, '').trim();
      } else {
        files['index.html'] = defaultFiles['index.html'];
      }

      if (cssMatch) {
        files['styles.css'] = cssMatch[0].replace(/```css\n?/, '').replace(/```$/, '').trim();
      } else {
        files['styles.css'] = defaultFiles['styles.css'];
      }

      if (jsMatch) {
        files['script.js'] = jsMatch[0].replace(/```(javascript|js)\n?/, '').replace(/```$/, '').trim();
      } else {
        files['script.js'] = defaultFiles['script.js'];
      }

      return files;
    } catch (error) {
      console.error('Error extracting files from generated text:', error);
      return defaultFiles;
    }
  }

  /**
   * Save the project mappings to localStorage
   */
  private saveMappings(): void {
    const mappings = Object.fromEntries(this.projectsMap);
    localStorage.setItem('deepcanvas-ai-builder-projects', JSON.stringify(mappings));
  }
}

// Create and export a singleton instance
const deepCanvasAIBuilderService = new DeepCanvasAIBuilderService();
export default deepCanvasAIBuilderService;
