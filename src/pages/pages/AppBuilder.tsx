import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "components/Sidebar";
import { AppProvider } from "utils/AppProvider";
import { toast } from "sonner";
import {
  AppTemplate,
  AppProject,
  loadTemplates,
  loadProjects,
  saveProject,
  deleteProject,
  generateAppWithAI
} from "../utils/appBuilderService";

// Categories for filtering
const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "website", name: "Websites" },
  { id: "landing-page", name: "Landing Pages" },
  { id: "app", name: "Web Apps" },
  { id: "dashboard", name: "Dashboards" }
];

// Sample templates
const SAMPLE_TEMPLATES: Template[] = [
  {
    id: "template-1",
    name: "Business Website",
    category: "website",
    thumbnail: "https://via.placeholder.com/300x200?text=Business+Website",
    description: "Professional website template for businesses with multiple pages."
  },
  {
    id: "template-2",
    name: "Portfolio",
    category: "website",
    thumbnail: "https://via.placeholder.com/300x200?text=Portfolio",
    description: "Showcase your work with this elegant portfolio template."
  },
  {
    id: "template-3",
    name: "E-commerce",
    category: "website",
    thumbnail: "https://via.placeholder.com/300x200?text=E-commerce",
    description: "Complete online store template with product listings and cart."
  },
  {
    id: "template-4",
    name: "Product Landing Page",
    category: "landing-page",
    thumbnail: "https://via.placeholder.com/300x200?text=Product+Landing",
    description: "High-conversion landing page for product launches."
  },
  {
    id: "template-5",
    name: "Mobile App",
    category: "app",
    thumbnail: "https://via.placeholder.com/300x200?text=Mobile+App",
    description: "Mobile application template with navigation and screens."
  }
];

// Sample user projects
const SAMPLE_PROJECTS: Project[] = [
  {
    id: "project-1",
    name: "My Company Website",
    description: "Official website for my business",
    thumbnail: "https://via.placeholder.com/300x200?text=My+Company",
    lastEdited: new Date(Date.now() - 3600000).toISOString(),
    type: "website"
  },
  {
    id: "project-2",
    name: "Product Launch",
    description: "Landing page for new product release",
    thumbnail: "https://via.placeholder.com/300x200?text=Product+Launch",
    lastEdited: new Date(Date.now() - 86400000).toISOString(),
    type: "landing-page"
  }
];

function AppBuilderContent() {
  // Navigation
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState<AppProject[]>([]);
  const [templates, setTemplates] = useState<AppTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<"projects" | "templates">("projects");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIAssistModal, setShowAIAssistModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectType, setNewProjectType] = useState<AppProject["type"]>("website");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // AI-assisted creation state
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load projects and templates on mount
  useEffect(() => {
    setProjects(loadProjects());
    setTemplates(loadTemplates());
  }, []);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  // Load API key from local storage
  useEffect(() => {
    const savedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        if (parsedKeys.gemini) {
          GEMINI_CONFIG.apiKey = parsedKeys.gemini;
        }
      } catch (error) {
        console.error('Error parsing saved API keys:', error);
      }
    }
  }, []);

  // Create new project
  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    const newProject: AppProject = {
      id: `project-${Date.now()}`,
      name: newProjectName,
      description: newProjectDescription,
      thumbnail: "https://via.placeholder.com/300x200?text=New+Project",
      lastEdited: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: newProjectType,
      content: generatedContent || undefined,
      published: false,
      aiGenerated: false,
      userId: 'user-123' // In a real app, this would be the actual user ID
    };

    // Save the project using our service
    saveProject(newProject);

    // Update local state
    setProjects([newProject, ...projects]);
    setShowCreateModal(false);
    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectType("website");
    setSelectedTemplate(null);
    setGeneratedContent(null);

    toast.success("Project created successfully");

    // Navigate to the editor
    navigate(`/app-builder/editor/${newProject.id}`);
  };

  // Generate content with AI
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a description of what you want to create");
      return;
    }

    setIsGenerating(true);

    try {
      // Use our app builder service to generate the app
      const newProject = await generateAppWithAI(
        aiPrompt,
        newProjectType,
        'user-123' // In a real app, this would be the actual user ID
      );

      // Store the generated content
      setGeneratedContent(newProject.content || '');

      // Update the projects list
      setProjects([newProject, ...projects]);

      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content with AI:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this project?");
    if (confirmed) {
      // Delete from service
      deleteProject(id);

      // Update local state
      setProjects(projects.filter(project => project.id !== id));
      toast.success("Project deleted successfully");
    }
  };

  // Filter projects by type
  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter(project => project.type === selectedCategory);

  // Filter templates by category
  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter(template => template.category === selectedCategory);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">App Builder</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAIAssistModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md flex items-center"
              >
                <SparklesIcon className="h-5 w-5 mr-1" />
                AI-Assisted Create
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Create New
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "projects"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  <FolderIcon className="h-5 w-5 inline mr-2" />
                  My Projects
                </button>
                <button
                  onClick={() => setActiveTab("templates")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "templates"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  <TemplateIcon className="h-5 w-5 inline mr-2" />
                  Templates
                </button>
              </nav>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedCategory === "all"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedCategory("website")}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedCategory === "website"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Websites
              </button>
              <button
                onClick={() => setSelectedCategory("landing-page")}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedCategory === "landing-page"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Landing Pages
              </button>
              <button
                onClick={() => setSelectedCategory("app")}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedCategory === "app"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                Apps
              </button>
            </div>
          </div>

          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div>
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <FolderIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {selectedCategory === "all"
                      ? "You haven't created any projects yet."
                      : `You don't have any ${selectedCategory} projects.`}
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md inline-flex items-center"
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Create Your First Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((project) => (
                    <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="h-48 bg-gray-100">
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{project.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            project.type === "website"
                              ? "bg-blue-100 text-blue-800"
                              : project.type === "landing-page"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                          }`}>
                            {project.type === "landing-page" ? "Landing Page" : project.type.charAt(0).toUpperCase() + project.type.slice(1)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">{project.description}</p>

                        <div className="text-xs text-gray-500 mb-3">
                          Last edited: {new Date(project.lastEdited).toLocaleDateString()}
                        </div>

                        <div className="flex justify-between">
                          <button
                            className="text-blue-600 hover:text-blue-900 text-sm"
                            onClick={() => {
                              // Navigate to the editor page
                              navigate(`/app-builder/editor/${project.id}`);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && (
            <div>
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                    <TemplateIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No templates found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    No templates available for the selected category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                      <div className="h-48 bg-gray-100">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            template.category === "website"
                              ? "bg-blue-100 text-blue-800"
                              : template.category === "landing-page"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800"
                          }`}>
                            {template.category === "landing-page" ? "Landing Page" : template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 mb-3">{template.description}</p>

                        <div className="flex justify-between">
                          <button
                            className="text-blue-600 hover:text-blue-900 text-sm"
                            onClick={() => {
                              // Preview template
                              toast.info(`Previewing ${template.name} template`);
                            }}
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => {
                              setShowCreateModal(true);
                              setSelectedTemplate(template.id);
                              setNewProjectType(template.category as AppProject["type"]);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm"
                          >
                            Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Create Project Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Create New Project</h2>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedTemplate(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Project form content remains the same */}
              </div>
            </div>
          )}

          {/* AI-Assisted Project Creation Modal */}
          {showAIAssistModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold flex items-center">
                      <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
                      AI-Assisted Project Creation
                    </h2>
                    <button
                      onClick={() => {
                        setShowAIAssistModal(false);
                        setAiPrompt("");
                        setGeneratedContent(null);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                        placeholder="My Awesome Website"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                      <select
                        value={newProjectType}
                        onChange={(e) => setNewProjectType(e.target.value as AppProject["type"])}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        <option value="website">Website</option>
                        <option value="landing-page">Landing Page</option>
                        <option value="app">App</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Describe what you want to create
                        <span className="text-purple-600">*</span>
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={4}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                        placeholder={`Describe the ${newProjectType} you want to create. For example: "A professional website for a law firm with a modern design, contact form, and about us section."`}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Be as specific as possible about the content, style, and functionality you want.
                      </p>
                    </div>

                    {generatedContent && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
                        <div className="flex items-center text-green-800 text-sm font-medium mb-2">
                          <SparklesIcon className="h-4 w-4 mr-1" />
                          Content generated successfully!
                        </div>
                        <p className="text-sm text-green-700">
                          Your content has been generated and is ready to use. Click "Create Project" to continue.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowAIAssistModal(false);
                      setAiPrompt("");
                      setGeneratedContent(null);
                    }}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  {!generatedContent ? (
                    <button
                      onClick={generateWithAI}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className={`${isGenerating || !aiPrompt.trim() ? "bg-purple-300 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"} text-white px-4 py-2 rounded-md flex items-center`}
                    >
                      {isGenerating ? (
                        <>
                          <LoadingIcon className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          Generate Content
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleCreateProject();
                        setShowAIAssistModal(false);
                      }}
                      disabled={!newProjectName.trim()}
                      className={`${!newProjectName.trim() ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"} text-white px-4 py-2 rounded-md`}
                    >
                      Create Project
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                        placeholder="My Awesome Website"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                      <textarea
                        value={newProjectDescription}
                        onChange={(e) => setNewProjectDescription(e.target.value)}
                        rows={3}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                        placeholder="Describe your project"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                      <select
                        value={newProjectType}
                        onChange={(e) => setNewProjectType(e.target.value as AppProject["type"])}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full"
                      >
                        <option value="website">Website</option>
                        <option value="landing-page">Landing Page</option>
                        <option value="app">App</option>
                      </select>
                    </div>

                    {selectedTemplate && (
                      <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                        <div className="flex items-center">
                          <TemplateIcon className="h-5 w-5 text-blue-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-blue-800">
                              Using Template: {templates.find(t => t.id === selectedTemplate)?.name}
                            </div>
                            <div className="text-xs text-blue-600">
                              This project will be pre-populated with the selected template.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedTemplate(null);
                    }}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                    className={`${
                      !newProjectName.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white px-4 py-2 rounded-md`}
                  >
                    Create Project
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Coming Soon Notice */}
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-start">
              <InfoIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Visual Editor Coming Soon</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  We're working on integrating GrapesJS, a powerful open-source web builder framework, to provide you with a full visual editing experience. Stay tuned for updates!
                </p>
                <a
                  href="https://grapesjs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                >
                  Learn more about GrapesJS →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Icon components
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function FolderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
    </svg>
  );
}

function TemplateIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
    </svg>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

export default function AppBuilder() {
  return (
    <AppProvider>
      <AppBuilderContent />
    </AppProvider>
  );
}
