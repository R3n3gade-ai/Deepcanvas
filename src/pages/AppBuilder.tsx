import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppBuilderStore from '../features/app-builder/store/appBuilderStore';
import { AppTemplate, AIGenerationPrompt } from '../features/app-builder/types';
import { ProjectCard } from '../components/app-builder/ProjectCard';
import { TemplateCard } from '../components/app-builder/TemplateCard';
import { CreateProjectDialog } from '../components/app-builder/CreateProjectDialog';
import { AIGenerationDialog } from '../components/app-builder/AIGenerationDialog';

export default function AppBuilder() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'templates'>('projects');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | undefined>(undefined);

  const {
    templates,
    projects,
    fetchTemplates,
    fetchProjects,
    createProject,
    createAIBuilderProject,
    updateProject,
    deleteProject,
    publishProject,
    unpublishProject,
    generateWithAI,
    isLoading,
    error
  } = useAppBuilderStore();

  // Fetch templates and projects on component mount
  useEffect(() => {
    fetchTemplates();
    fetchProjects();
  }, [fetchTemplates, fetchProjects]);

  // Filter templates based on category and search term
  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory ? template.category === selectedCategory : true;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => {
    return project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           project.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle template selection
  const handleSelectTemplate = (template: AppTemplate) => {
    setSelectedTemplate(template);
    setShowCreateDialog(true);
  };

  // Handle project creation
  const handleCreateProject = async (name: string, description: string, type: string, templateId?: string) => {
    const projectId = await createProject(
      name,
      description,
      type as 'website' | 'landing-page' | 'app' | 'dashboard',
      templateId
    );

    if (projectId) {
      navigate(`/app-builder-editor/${projectId}`);
    }
  };



  // Handle AI Builder project creation
  const handleCreateAIBuilderProject = async (name: string, description: string, type: string, templateId?: string) => {
    // Create a regular project first
    const projectId = await createProject(
      name,
      description,
      type as 'website' | 'landing-page' | 'app' | 'dashboard',
      templateId
    );

    if (projectId) {
      // Get the project
      const project = projects.find(p => p.id === projectId);

      if (project) {
        // Update the project to use AI Builder
        await updateProject({
          ...project,
          useAIBuilder: true,
          lastEdited: new Date().toISOString()
        });
      }

      navigate(`/app-builder-editor/${projectId}`);
    }
  };

  // Handle AI generation
  const handleGenerateWithAI = async (prompt: AIGenerationPrompt) => {
    const generatedContent = await generateWithAI(prompt);

    // Create a new project with the generated content
    if (generatedContent.content) {
      const projectId = await createProject(
        `AI Generated ${prompt.type.charAt(0).toUpperCase() + prompt.type.slice(1)}`,
        prompt.description,
        prompt.type
      );

      if (projectId) {
        // In a real implementation, we would update the project with the generated content
        // For now, we'll just navigate to the editor
        navigate(`/app-builder-editor/${projectId}`);
      }
    }
  };

  // Categories for filtering templates
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'website', name: 'Websites' },
    { id: 'landing-page', name: 'Landing Pages' },
    { id: 'app', name: 'Web Apps' },
    { id: 'dashboard', name: 'Dashboards' }
  ];

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">App Builder</h1>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              setSelectedTemplate(undefined);
              setShowCreateDialog(true);
            }}
          >
            Create New
          </button>

        </div>
      </div>

      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('projects')}
          >
            My Projects
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('templates')}
          >
            Templates
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={activeTab === 'projects' ? "Search your projects..." : "Search templates..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-200"
            onClick={() => setSearchTerm('')}
          >
            Clear
          </button>
        </div>
      </div>

      {activeTab === 'templates' && (
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-3 py-1 rounded-md ${selectedCategory === category.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}
                onClick={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          {error}
        </div>
      ) : activeTab === 'projects' ? (
        filteredProjects.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No projects match your search.' : 'You don\'t have any projects yet.'}
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => {
                setSelectedTemplate(undefined);
                setShowCreateDialog(true);
              }}
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={(id) => navigate(`/app-builder-editor/${id}`)}
                onDelete={deleteProject}
                onPublish={publishProject}
                onUnpublish={unpublishProject}
              />
            ))}
          </div>
        )
      ) : (
        filteredTemplates.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600">
              No templates match your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelectTemplate}
              />
            ))}
          </div>
        )
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setSelectedTemplate(undefined);
        }}
        onCreateProject={handleCreateProject}
        onCreateAIBuilderProject={handleCreateAIBuilderProject}
        selectedTemplate={selectedTemplate}
      />

      {/* AI Generation Dialog */}
      <AIGenerationDialog
        isOpen={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        onGenerate={handleGenerateWithAI}
      />
    </div>
  );
}