import axios from 'axios';
import { getApiKey } from './apiHubService';
import * as unifiedAiService from './unifiedAiService';
import { AIProvider } from './unifiedAiService';

// Types for app builder
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

export interface AppProject {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  lastEdited: string;
  createdAt: string;
  type: 'website' | 'landing-page' | 'app' | 'dashboard';
  template?: string;
  content?: string; // HTML content
  css?: string; // CSS styles
  js?: string; // JavaScript code
  components?: any[]; // GrapesJS components
  assets?: string[]; // URLs of assets
  published: boolean;
  publishedUrl?: string;
  aiGenerated: boolean;
  userId: string;
}

export interface AppComponent {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  description: string;
  html: string;
  css?: string;
  js?: string;
  tags: string[];
}

// Local storage keys
const PROJECTS_STORAGE_KEY = 'app_builder_projects';
const TEMPLATES_STORAGE_KEY = 'app_builder_templates';
const COMPONENTS_STORAGE_KEY = 'app_builder_components';

// Load projects from local storage
export function loadProjects(): AppProject[] {
  try {
    const projectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
    return projectsJson ? JSON.parse(projectsJson) : [];
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

// Save projects to local storage
export function saveProjects(projects: AppProject[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
}

// Get a project by ID
export function getProject(projectId: string): AppProject | null {
  const projects = loadProjects();
  return projects.find(project => project.id === projectId) || null;
}

// Save a project
export function saveProject(project: AppProject): void {
  const projects = loadProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  
  if (existingIndex >= 0) {
    // Update existing project
    projects[existingIndex] = {
      ...projects[existingIndex],
      ...project,
      lastEdited: new Date().toISOString()
    };
  } else {
    // Add new project
    projects.push({
      ...project,
      id: project.id || `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      published: false,
      aiGenerated: project.aiGenerated || false
    });
  }
  
  saveProjects(projects);
}

// Delete a project
export function deleteProject(projectId: string): void {
  const projects = loadProjects();
  const updatedProjects = projects.filter(project => project.id !== projectId);
  saveProjects(updatedProjects);
}

// Publish a project
export function publishProject(projectId: string): string {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex >= 0) {
    // In a real app, this would upload to a hosting service
    // For now, we'll just mark it as published with a mock URL
    const publishedUrl = `https://deepcanvas-apps.example.com/${projectId}`;
    
    projects[projectIndex] = {
      ...projects[projectIndex],
      published: true,
      publishedUrl,
      lastEdited: new Date().toISOString()
    };
    
    saveProjects(projects);
    return publishedUrl;
  }
  
  throw new Error('Project not found');
}

// Load templates from local storage or initialize with defaults
export function loadTemplates(): AppTemplate[] {
  try {
    const templatesJson = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (templatesJson) {
      return JSON.parse(templatesJson);
    } else {
      // Initialize with default templates
      const defaultTemplates = getDefaultTemplates();
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(defaultTemplates));
      return defaultTemplates;
    }
  } catch (error) {
    console.error('Error loading templates:', error);
    return getDefaultTemplates();
  }
}

// Get a template by ID
export function getTemplate(templateId: string): AppTemplate | null {
  const templates = loadTemplates();
  return templates.find(template => template.id === templateId) || null;
}

// Load components from local storage or initialize with defaults
export function loadComponents(): AppComponent[] {
  try {
    const componentsJson = localStorage.getItem(COMPONENTS_STORAGE_KEY);
    if (componentsJson) {
      return JSON.parse(componentsJson);
    } else {
      // Initialize with default components
      const defaultComponents = getDefaultComponents();
      localStorage.setItem(COMPONENTS_STORAGE_KEY, JSON.stringify(defaultComponents));
      return defaultComponents;
    }
  } catch (error) {
    console.error('Error loading components:', error);
    return getDefaultComponents();
  }
}

// Generate an app using AI
export async function generateAppWithAI(
  prompt: string,
  type: 'website' | 'landing-page' | 'app' | 'dashboard',
  userId: string
): Promise<AppProject> {
  // Determine which AI provider to use
  const provider = unifiedAiService.getDefaultProviderForTask('code');
  
  // Create a system prompt for the AI
  const systemPrompt = `You are an expert web developer tasked with creating a ${type} based on the user's description.
Generate clean, responsive HTML, CSS, and minimal JavaScript for a modern ${type}.
Use Tailwind CSS classes for styling.
The output should be valid HTML that can be directly rendered in a browser.
Include appropriate meta tags, viewport settings, and responsive design.
Keep the JavaScript minimal and focused on essential functionality.
Ensure the design is modern, clean, and professional.`;

  try {
    // Generate the HTML content
    const htmlContent = await unifiedAiService.generateChatResponse(
      [
        { 
          id: 'system-1',
          role: 'system',
          content: systemPrompt,
          timestamp: new Date()
        },
        {
          id: 'user-1',
          role: 'user',
          content: `Create a ${type} with the following description: ${prompt}. 
          Please provide the complete HTML, including the CSS (in a style tag) and any necessary JavaScript (in a script tag).`,
          timestamp: new Date()
        }
      ],
      {
        model: provider === AIProvider.OPENAI ? 'gpt-4o' : 
               provider === AIProvider.ANTHROPIC ? 'claude-3-opus-20240229' : 'gemini-1.5-pro',
        temperature: 0.7,
        maxTokens: 4000,
        systemPrompt
      },
      provider
    );

    // Extract HTML, CSS, and JS from the response
    let html = htmlContent;
    let css = '';
    let js = '';

    // Create a new project
    const newProject: AppProject = {
      id: `project-${Date.now()}`,
      name: prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt,
      description: prompt,
      thumbnail: `https://via.placeholder.com/300x200?text=${encodeURIComponent(prompt.substring(0, 20))}`,
      lastEdited: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type,
      content: html,
      css,
      js,
      published: false,
      aiGenerated: true,
      userId
    };

    // Save the project
    saveProject(newProject);
    return newProject;
  } catch (error) {
    console.error('Error generating app with AI:', error);
    throw new Error('Failed to generate app. Please try again.');
  }
}

// Default templates
function getDefaultTemplates(): AppTemplate[] {
  return [
    {
      id: 'template-business',
      name: 'Business Website',
      category: 'website',
      thumbnail: 'https://via.placeholder.com/300x200?text=Business+Website',
      description: 'Professional website template for businesses with multiple pages.',
      tags: ['business', 'professional', 'corporate'],
      complexity: 'medium',
      features: ['Home page', 'About page', 'Services', 'Contact form', 'Responsive design']
    },
    {
      id: 'template-portfolio',
      name: 'Portfolio',
      category: 'website',
      thumbnail: 'https://via.placeholder.com/300x200?text=Portfolio',
      description: 'Showcase your work with this elegant portfolio template.',
      tags: ['portfolio', 'creative', 'showcase'],
      complexity: 'simple',
      features: ['Project gallery', 'About section', 'Contact information', 'Responsive design']
    },
    {
      id: 'template-landing',
      name: 'Product Landing Page',
      category: 'landing-page',
      thumbnail: 'https://via.placeholder.com/300x200?text=Landing+Page',
      description: 'High-converting landing page for product or service promotion.',
      tags: ['landing page', 'conversion', 'marketing'],
      complexity: 'simple',
      features: ['Hero section', 'Features list', 'Testimonials', 'Call to action', 'Responsive design']
    },
    {
      id: 'template-ecommerce',
      name: 'E-commerce Store',
      category: 'website',
      thumbnail: 'https://via.placeholder.com/300x200?text=E-commerce',
      description: 'Complete e-commerce website with product listings and cart.',
      tags: ['e-commerce', 'shop', 'store'],
      complexity: 'complex',
      features: ['Product catalog', 'Shopping cart', 'Checkout process', 'User accounts', 'Responsive design']
    },
    {
      id: 'template-blog',
      name: 'Blog',
      category: 'website',
      thumbnail: 'https://via.placeholder.com/300x200?text=Blog',
      description: 'Clean and readable blog template for content creators.',
      tags: ['blog', 'content', 'articles'],
      complexity: 'medium',
      features: ['Article listings', 'Categories', 'Author profiles', 'Comments section', 'Responsive design']
    },
    {
      id: 'template-dashboard',
      name: 'Admin Dashboard',
      category: 'dashboard',
      thumbnail: 'https://via.placeholder.com/300x200?text=Dashboard',
      description: 'Comprehensive admin dashboard with data visualization.',
      tags: ['dashboard', 'admin', 'analytics'],
      complexity: 'complex',
      features: ['Data charts', 'User management', 'Settings panel', 'Notifications', 'Responsive design']
    }
  ];
}

// Default components
function getDefaultComponents(): AppComponent[] {
  return [
    {
      id: 'component-hero',
      name: 'Hero Section',
      category: 'sections',
      thumbnail: 'https://via.placeholder.com/150x100?text=Hero',
      description: 'Full-width hero section with heading, subheading, and call-to-action button.',
      html: `
        <section class="bg-blue-600 text-white py-20">
          <div class="container mx-auto px-4">
            <div class="max-w-3xl mx-auto text-center">
              <h1 class="text-4xl font-bold mb-4">Welcome to Our Website</h1>
              <p class="text-xl mb-8">The best solution for your business needs</p>
              <button class="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">Get Started</button>
            </div>
          </div>
        </section>
      `,
      tags: ['hero', 'header', 'banner']
    },
    {
      id: 'component-features',
      name: 'Features Grid',
      category: 'sections',
      thumbnail: 'https://via.placeholder.com/150x100?text=Features',
      description: 'Grid layout for showcasing features or services.',
      html: `
        <section class="py-16 bg-gray-50">
          <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12">Our Features</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">Fast Performance</h3>
                <p class="text-gray-600">Lightning fast loading times and smooth performance.</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">Secure Platform</h3>
                <p class="text-gray-600">Enterprise-grade security for your peace of mind.</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-md">
                <div class="text-blue-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 class="text-xl font-semibold mb-2">Cloud Storage</h3>
                <p class="text-gray-600">Store your data safely in the cloud with easy access.</p>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ['features', 'grid', 'services']
    },
    {
      id: 'component-testimonials',
      name: 'Testimonials Slider',
      category: 'sections',
      thumbnail: 'https://via.placeholder.com/150x100?text=Testimonials',
      description: 'Customer testimonials in a carousel format.',
      html: `
        <section class="py-16 bg-white">
          <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div class="max-w-4xl mx-auto">
              <div class="bg-gray-50 p-8 rounded-lg shadow-md">
                <div class="flex items-center mb-4">
                  <img src="https://via.placeholder.com/60x60" alt="Customer" class="w-12 h-12 rounded-full mr-4">
                  <div>
                    <h4 class="font-semibold">Jane Smith</h4>
                    <p class="text-gray-600 text-sm">CEO, Company Inc.</p>
                  </div>
                </div>
                <p class="text-gray-700 italic">"This product has completely transformed our business operations. The efficiency gains alone have paid for the investment many times over."</p>
              </div>
              <div class="flex justify-center mt-6">
                <button class="w-3 h-3 rounded-full bg-blue-600 mx-1"></button>
                <button class="w-3 h-3 rounded-full bg-gray-300 mx-1"></button>
                <button class="w-3 h-3 rounded-full bg-gray-300 mx-1"></button>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ['testimonials', 'reviews', 'carousel']
    },
    {
      id: 'component-contact',
      name: 'Contact Form',
      category: 'forms',
      thumbnail: 'https://via.placeholder.com/150x100?text=Contact',
      description: 'Contact form with validation and submission handling.',
      html: `
        <section class="py-16 bg-gray-50">
          <div class="container mx-auto px-4">
            <div class="max-w-2xl mx-auto">
              <h2 class="text-3xl font-bold text-center mb-8">Contact Us</h2>
              <form class="bg-white p-8 rounded-lg shadow-md">
                <div class="mb-4">
                  <label class="block text-gray-700 font-medium mb-2" for="name">Name</label>
                  <input type="text" id="name" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Your name">
                </div>
                <div class="mb-4">
                  <label class="block text-gray-700 font-medium mb-2" for="email">Email</label>
                  <input type="email" id="email" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Your email">
                </div>
                <div class="mb-6">
                  <label class="block text-gray-700 font-medium mb-2" for="message">Message</label>
                  <textarea id="message" rows="4" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Your message"></textarea>
                </div>
                <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Send Message</button>
              </form>
            </div>
          </div>
        </section>
      `,
      tags: ['contact', 'form', 'input']
    },
    {
      id: 'component-pricing',
      name: 'Pricing Table',
      category: 'sections',
      thumbnail: 'https://via.placeholder.com/150x100?text=Pricing',
      description: 'Pricing plans comparison table.',
      html: `
        <section class="py-16 bg-white">
          <div class="container mx-auto px-4">
            <h2 class="text-3xl font-bold text-center mb-12">Pricing Plans</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div class="border rounded-lg overflow-hidden">
                <div class="bg-gray-50 p-6 text-center border-b">
                  <h3 class="text-xl font-semibold">Basic</h3>
                  <div class="text-3xl font-bold my-4">$9<span class="text-lg text-gray-600">/month</span></div>
                  <p class="text-gray-600">For individuals and small projects</p>
                </div>
                <div class="p-6">
                  <ul class="space-y-3">
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>1 User</span>
                    </li>
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>5 Projects</span>
                    </li>
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>5GB Storage</span>
                    </li>
                  </ul>
                  <button class="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</button>
                </div>
              </div>
              <div class="border rounded-lg overflow-hidden shadow-lg relative">
                <div class="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold py-1 px-3 rounded-bl">Popular</div>
                <div class="bg-gray-50 p-6 text-center border-b">
                  <h3 class="text-xl font-semibold">Pro</h3>
                  <div class="text-3xl font-bold my-4">$29<span class="text-lg text-gray-600">/month</span></div>
                  <p class="text-gray-600">For growing businesses</p>
                </div>
                <div class="p-6">
                  <ul class="space-y-3">
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>5 Users</span>
                    </li>
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>20 Projects</span>
                    </li>
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>20GB Storage</span>
                    </li>
                  </ul>
                  <button class="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</button>
                </div>
              </div>
              <div class="border rounded-lg overflow-hidden">
                <div class="bg-gray-50 p-6 text-center border-b">
                  <h3 class="text-xl font-semibold">Enterprise</h3>
                  <div class="text-3xl font-bold my-4">$99<span class="text-lg text-gray-600">/month</span></div>
                  <p class="text-gray-600">For large organizations</p>
                </div>
                <div class="p-6">
                  <ul class="space-y-3">
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>Unlimited Users</span>
                    </li>
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>Unlimited Projects</span>
                    </li>
                    <li class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span>100GB Storage</span>
                    </li>
                  </ul>
                  <button class="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Get Started</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      `,
      tags: ['pricing', 'plans', 'comparison']
    }
  ];
}
