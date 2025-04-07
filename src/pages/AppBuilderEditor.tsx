import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAppBuilderStore from '../features/app-builder/store/appBuilderStore';
import { GrapesJSEditor } from '../components/app-builder/GrapesJSEditor';
import { AIBuilderEditor } from '../components/app-builder/AIBuilderEditor';

export default function AppBuilderEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [editorType, setEditorType] = useState<'grapesjs' | 'aibuilder'>('grapesjs');

  const {
    currentProject,
    loadProject,
    updateProject,
    updateAIBuilderProject,
    publishProject,
    migrateToAIBuilder,
    isLoading,
    error
  } = useAppBuilderStore();

  // Load project on component mount
  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    }
  }, [projectId, loadProject]);

  // Detect if the project is using AI Builder
  useEffect(() => {
    if (currentProject?.useAIBuilder) {
      setEditorType('aibuilder');
    } else {
      setEditorType('grapesjs');
    }
  }, [currentProject]);



  // Handle publish
  const handlePublish = async () => {
    if (currentProject && projectId) {
      const publishedUrl = await publishProject(projectId);
      if (publishedUrl) {
        alert(`Project published successfully! View at: ${publishedUrl}`);
      }
    }
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => navigate('/app-builder')}
          >
            Back to App Builder
          </button>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-md text-center">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Project Not Found</h2>
          <p className="text-yellow-700">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            onClick={() => navigate('/app-builder')}
          >
            Back to App Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">{currentProject?.name}</h1>
            <p className="text-sm text-gray-500">{currentProject?.description}</p>
          </div>
          <div className="flex space-x-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => navigate('/app-builder')}
            >
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {projectId && currentProject && (
          <>
            {editorType === 'grapesjs' ? (
              <div className="flex flex-col h-full">
                <div className="bg-white border-b border-gray-200 p-2 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 bg-purple-600 text-white rounded-md"
                      onClick={() => {
                        if (window.confirm('Do you want to migrate this project to DeepCanvas AI Builder? This action cannot be undone.')) {
                          // Update the project to use AI Builder
                          updateProject({
                            ...currentProject,
                            useAIBuilder: true,
                            lastEdited: new Date().toISOString()
                          });
                        }
                      }}
                    >
                      Migrate to AI Builder
                    </button>
                  </div>
                </div>
                <GrapesJSEditor
                  projectId={projectId}
                  initialContent={currentProject.content}
                  initialCss={currentProject.css}
                  onSave={(content, css) => {
                    if (currentProject) {
                      updateProject({
                        ...currentProject,
                        content,
                        css,
                        lastEdited: new Date().toISOString()
                      });
                    }
                  }}
                  onPublish={handlePublish}
                />
              </div>

            ) : (
              <AIBuilderEditor
                projectId={projectId}
                project={currentProject}
                onSave={(project) => {
                  updateAIBuilderProject(project);
                }}
                onPublish={handlePublish}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}