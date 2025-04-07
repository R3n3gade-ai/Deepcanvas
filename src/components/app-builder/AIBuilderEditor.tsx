import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import deepCanvasAIBuilderService from '../../features/app-builder/services/deepcanvasAIBuilder';
import { AppProject } from '../../features/app-builder/types';

interface AIBuilderEditorProps {
  projectId: string;
  project: AppProject;
  onSave?: (project: AppProject) => void;
  onPublish?: () => void;
}

export function AIBuilderEditor({
  projectId,
  project,
  onSave,
  onPublish
}: AIBuilderEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash');
  const [selectedProvider, setSelectedProvider] = useState('google');
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Initialize the AI Builder project
  useEffect(() => {
    const initializeProject = async () => {
      setIsLoading(true);
      try {
        // Check if the project already exists in the AI Builder
        let aiBuilderProject = deepCanvasAIBuilderService.getAIBuilderProject(projectId);

        if (!aiBuilderProject) {
          // Create a new AI Builder project
          await deepCanvasAIBuilderService.createAIBuilderProject(project);
          aiBuilderProject = deepCanvasAIBuilderService.getAIBuilderProject(projectId);
        }

        // Initialize the WebContainer
        await deepCanvasAIBuilderService.initializeWebContainer(projectId);

        // Set the initial files
        if (aiBuilderProject.files) {
          setFiles(aiBuilderProject.files);

          // Set the active file to the first file
          const fileNames = Object.keys(aiBuilderProject.files);
          if (fileNames.length > 0) {
            setActiveFile(fileNames[0]);
          }
        }

        // Set the selected model and provider
        if (aiBuilderProject.settings) {
          setSelectedModel(aiBuilderProject.settings.defaultModel || 'gpt-4o');
          setSelectedProvider(aiBuilderProject.settings.defaultProvider || 'openai');
        }
      } catch (error) {
        console.error('Error initializing AI Builder project:', error);
        toast.error('Failed to initialize AI Builder project');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProject();
  }, [projectId, project]);

  // Handle prompt submission
  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const result = await deepCanvasAIBuilderService.generateCode(projectId, prompt, selectedModel);

      if (result.success) {
        // Update the files
        setFiles(result.files);

        // Set the active file to the first file
        const fileNames = Object.keys(result.files);
        if (fileNames.length > 0) {
          setActiveFile(fileNames[0]);
        }

        // Update the AI Builder project
        deepCanvasAIBuilderService.updateAIBuilderProject(projectId, {
          files: result.files
        });

        // Show success message
        toast.success('Code generated successfully');

        // Update the preview
        updatePreview(result.files);
      } else {
        toast.error(result.message || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update the preview
  const updatePreview = (newFiles: Record<string, string>) => {
    // Create a data URL for the preview
    const html = newFiles['index.html'] || '';
    const css = newFiles['styles.css'] || '';
    const js = newFiles['script.js'] || '';

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`;
    setPreviewUrl(dataUrl);
  };

  // Handle file selection
  const handleFileSelect = (fileName: string) => {
    setActiveFile(fileName);
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      // Update the project with the AI Builder files
      const updatedProject = {
        ...project,
        aiBuilderFiles: files,
        lastEdited: new Date().toISOString()
      };

      onSave(updatedProject);
      toast.success('Project saved successfully');
    }
  };

  // Handle publish
  const handlePublish = () => {
    if (onPublish) {
      onPublish();
    }
  };

  // Render the file content
  const renderFileContent = () => {
    if (!activeFile || !files[activeFile]) {
      return <div className="p-4 text-gray-500">No file selected</div>;
    }

    return (
      <pre className="p-4 overflow-auto h-full">
        <code>{files[activeFile]}</code>
      </pre>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-lg font-medium">DeepCanvas AI Builder</h2>
        </div>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={handlePublish}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Initializing AI Builder...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Prompt input */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center mb-2">
                <label className="mr-2 text-sm font-medium">Model:</label>
                <select
                  className="mr-4 p-1 border border-gray-300 rounded-md text-sm"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-2.0-pro">Gemini 2.0 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>


              </div>

              <div className="flex">
                <textarea
                  className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
                  placeholder="Describe what you want to build..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  disabled={isGenerating}
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={handlePromptSubmit}
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </div>

            {/* Editor and preview */}
            <div className="flex-1 flex overflow-hidden">
              {/* File explorer */}
              <div className="w-48 border-r border-gray-200 overflow-y-auto">
                <div className="p-2 font-medium text-sm border-b border-gray-200">Files</div>
                <div className="p-2">
                  {Object.keys(files).length === 0 ? (
                    <div className="text-sm text-gray-500">No files yet</div>
                  ) : (
                    <ul>
                      {Object.keys(files).map((fileName) => (
                        <li key={fileName} className="mb-1">
                          <button
                            className={`w-full text-left px-2 py-1 text-sm rounded-md ${activeFile === fileName ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
                            onClick={() => handleFileSelect(fileName)}
                          >
                            {fileName}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 overflow-hidden flex flex-col" ref={editorRef}>
                {activeFile && (
                  <div className="p-2 font-medium text-sm border-b border-gray-200">
                    {activeFile}
                  </div>
                )}
                <div className="flex-1 overflow-auto">
                  {renderFileContent()}
                </div>
              </div>

              {/* Preview */}
              <div className="w-1/2 border-l border-gray-200 flex flex-col">
                <div className="p-2 font-medium text-sm border-b border-gray-200">Preview</div>
                <div className="flex-1">
                  {previewUrl ? (
                    <iframe
                      ref={previewRef}
                      src={previewUrl}
                      className="w-full h-full border-0"
                      title="Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No preview available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
