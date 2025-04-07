import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "components/Sidebar";
import { AppProvider } from "utils/AppProvider";
import { toast } from "sonner";
import axios from "axios";

// Gemini API configuration
interface GeminiConfig {
  apiKey?: string;
  baseUrl: string;
  model: string;
}

const GEMINI_CONFIG: GeminiConfig = {
  baseUrl: "https://generativelanguage.googleapis.com/v1",
  model: "gemini-1.5-pro",
  // API key will be set from local storage
};

// Local storage key for API keys
const API_KEYS_STORAGE_KEY = "studio_api_keys";

// This will be replaced with actual GrapesJS imports when integrated
declare global {
  interface Window {
    grapesjs: any;
  }
}

// Define types for the editor
interface EditorState {
  isLoading: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  projectName: string;
  projectType: "website" | "landing-page" | "app";
}

// Sample project data (in a real app, this would come from an API or database)
const SAMPLE_PROJECT = {
  id: "project-1",
  name: "My Company Website",
  description: "Official website for my business",
  type: "website" as const,
  content: `
    <header style="background-color: #f8f9fa; padding: 20px;">
      <h1 style="margin: 0; color: #333;">My Company</h1>
      <nav style="margin-top: 10px;">
        <a href="#" style="margin-right: 10px; color: #0d6efd; text-decoration: none;">Home</a>
        <a href="#" style="margin-right: 10px; color: #0d6efd; text-decoration: none;">About</a>
        <a href="#" style="margin-right: 10px; color: #0d6efd; text-decoration: none;">Services</a>
        <a href="#" style="color: #0d6efd; text-decoration: none;">Contact</a>
      </nav>
    </header>
    <main style="padding: 20px;">
      <section style="margin-bottom: 30px;">
        <h2 style="color: #333;">Welcome to My Company</h2>
        <p style="color: #666;">We provide the best services for your needs.</p>
        <button style="background-color: #0d6efd; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Learn More</button>
      </section>
      <section style="display: flex; justify-content: space-between;">
        <div style="flex: 1; margin-right: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="color: #333;">Service 1</h3>
          <p style="color: #666;">Description of service 1.</p>
        </div>
        <div style="flex: 1; margin-right: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="color: #333;">Service 2</h3>
          <p style="color: #666;">Description of service 2.</p>
        </div>
        <div style="flex: 1; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="color: #333;">Service 3</h3>
          <p style="color: #666;">Description of service 3.</p>
        </div>
      </section>
    </main>
    <footer style="background-color: #333; color: white; padding: 20px; text-align: center;">
      <p style="margin: 0;">© 2023 My Company. All rights reserved.</p>
    </footer>
  `
};

function AppBuilderEditorContent() {
  // Get project ID from URL
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Editor state
  const [editorState, setEditorState] = useState<EditorState>({
    isLoading: true,
    isSaving: false,
    hasChanges: false,
    projectName: "",
    projectType: "website",
  });

  // AI state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);

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

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch(`/api/projects/${projectId}`);
        // const project = await response.json();

        // Using sample data for now
        const project = SAMPLE_PROJECT;

        setEditorState(prev => ({
          ...prev,
          isLoading: false,
          projectName: project.name,
          projectType: project.type,
        }));

        // Initialize GrapesJS after project data is loaded
        initEditor(project.content);
      } catch (error) {
        console.error("Error loading project:", error);
        toast.error("Failed to load project");
        setEditorState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadProject();

    // Cleanup function
    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
      }
    };
  }, [projectId]);

  // Initialize GrapesJS editor
  const initEditor = (content: string) => {
    // Check if GrapesJS is loaded
    if (!window.grapesjs) {
      console.warn("GrapesJS not loaded. Using placeholder editor.");
      return;
    }

    // Initialize GrapesJS
    editorInstance.current = window.grapesjs.init({
      container: editorRef.current,
      fromElement: false,
      height: '100%',
      width: 'auto',
      storageManager: false,
      panels: { defaults: [] },
      deviceManager: {
        devices: [
          {
            name: 'Desktop',
            width: '',
          },
          {
            name: 'Tablet',
            width: '768px',
            widthMedia: '992px',
          },
          {
            name: 'Mobile',
            width: '320px',
            widthMedia: '480px',
          },
        ]
      },
      plugins: ['gjs-preset-webpage'],
      pluginsOpts: {
        'gjs-preset-webpage': {
          // options for the preset
        }
      },
    });

    // Load content
    editorInstance.current.setComponents(content);

    // Set up change tracking
    editorInstance.current.on('change:changesCount', () => {
      setEditorState(prev => ({ ...prev, hasChanges: true }));
    });
  };

  // Save project
  const handleSave = async () => {
    if (!editorInstance.current) {
      toast.error("Editor not initialized");
      return;
    }

    setEditorState(prev => ({ ...prev, isSaving: true }));

    try {
      // Get HTML content
      const html = editorInstance.current.getHtml();
      const css = editorInstance.current.getCss();

      // In a real app, this would be an API call
      // await fetch(`/api/projects/${projectId}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ html, css }),
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setEditorState(prev => ({ ...prev, isSaving: false, hasChanges: false }));
      toast.success("Project saved successfully");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
      setEditorState(prev => ({ ...prev, isSaving: false }));
    }
  };

  // Preview project
  const handlePreview = () => {
    if (!editorInstance.current) {
      toast.error("Editor not initialized");
      return;
    }

    const html = editorInstance.current.getHtml();
    const css = editorInstance.current.getCss();

    // Create a new window with the HTML and CSS
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${editorState.projectName} - Preview</title>
            <style>${css}</style>
          </head>
          <body>${html}</body>
        </html>
      `);
      previewWindow.document.close();
    } else {
      toast.error("Unable to open preview window. Please check your popup blocker settings.");
    }
  };

  // Generate content with AI
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a description of what you want to create");
      return;
    }

    if (!GEMINI_CONFIG.apiKey) {
      toast.error("Please set your Gemini API key in the Studio settings");
      return;
    }

    setIsGenerating(true);

    try {
      // Get current HTML content
      const currentHtml = editorInstance.current ? editorInstance.current.getHtml() : '';

      // Prepare the prompt based on project type and current content
      let fullPrompt = `I have a ${editorState.projectType} with the following HTML content:\n\n${currentHtml}\n\n`;
      fullPrompt += `Based on this request: "${aiPrompt}", please provide HTML code to ${currentHtml ? 'modify the existing content' : 'create new content'}.`;
      fullPrompt += `\n\nPlease provide only the HTML code without any markdown formatting or explanations.`;

      // Make API call to Gemini
      const response = await axios.post(
        `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
        {
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        }
      );

      // Extract the generated HTML
      const generatedHtml = response.data.candidates[0].content.parts[0].text;

      // Clean up the HTML (remove markdown code blocks if present)
      const cleanHtml = generatedHtml.replace(/```html|```/g, '').trim();

      setAiSuggestion(cleanHtml);
      toast.success("Content generated successfully!");
    } catch (error) {
      console.error("Error generating content with AI:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply AI suggestion to editor
  const applyAiSuggestion = () => {
    if (!editorInstance.current || !aiSuggestion) {
      toast.error("Editor not initialized or no AI suggestion available");
      return;
    }

    // Set the HTML content in the editor
    editorInstance.current.setComponents(aiSuggestion);

    // Clear the AI suggestion and close the panel
    setAiSuggestion(null);
    setAiPrompt("");
    setShowAIPanel(false);

    // Mark as having changes
    setEditorState(prev => ({ ...prev, hasChanges: true }));

    toast.success("AI suggestion applied successfully!");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/app-builder')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold">{editorState.projectName || "Untitled Project"}</h1>
              <div className="text-sm text-gray-500 flex items-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  editorState.projectType === "website"
                    ? "bg-blue-100 text-blue-800"
                    : editorState.projectType === "landing-page"
                      ? "bg-green-100 text-green-800"
                      : "bg-purple-100 text-purple-800"
                }`}>
                  {editorState.projectType === "landing-page" ? "Landing Page" : editorState.projectType.charAt(0).toUpperCase() + editorState.projectType.slice(1)}
                </span>
                {editorState.hasChanges && (
                  <span className="ml-2 text-orange-500">• Unsaved changes</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`${showAIPanel ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-white text-gray-700 border-gray-300'} border py-2 px-4 rounded-md hover:bg-purple-50`}
              disabled={editorState.isLoading}
            >
              <SparklesIcon className="h-5 w-5 inline mr-1" />
              AI Assistant
            </button>
            <button
              onClick={handlePreview}
              className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
              disabled={editorState.isLoading}
            >
              <EyeIcon className="h-5 w-5 inline mr-1" />
              Preview
            </button>
            <button
              onClick={handleSave}
              className={`${
                editorState.isSaving || !editorState.hasChanges
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white py-2 px-4 rounded-md flex items-center`}
              disabled={editorState.isSaving || !editorState.hasChanges}
            >
              {editorState.isSaving ? (
                <>
                  <LoadingIcon className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="h-5 w-5 mr-2" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Content */}
        {editorState.isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LoadingIcon className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <h2 className="text-xl font-semibold mb-2">Loading Editor</h2>
              <p className="text-gray-500">Please wait while we load your project...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex">
            {/* AI Panel */}
            {showAIPanel && (
              <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium flex items-center">
                    <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                    AI Assistant
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Describe what you want to create or modify, and the AI will generate HTML for you.
                  </p>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      What would you like to create or modify?
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g., Add a contact form with name, email, and message fields"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="mb-4">
                    <button
                      onClick={generateWithAI}
                      disabled={isGenerating || !aiPrompt.trim() || !GEMINI_CONFIG.apiKey}
                      className={`w-full ${isGenerating || !aiPrompt.trim() || !GEMINI_CONFIG.apiKey ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'} text-white py-2 px-4 rounded-md flex items-center justify-center`}
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
                  </div>

                  {!GEMINI_CONFIG.apiKey && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                      <div className="text-sm text-yellow-800">
                        <InfoIcon className="h-4 w-4 inline mr-1" />
                        Please set your Gemini API key in the Studio settings to use the AI assistant.
                      </div>
                    </div>
                  )}

                  {aiSuggestion && (
                    <div className="flex-1 flex flex-col">
                      <div className="mb-2 flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700">Generated Content</h4>
                        <button
                          onClick={applyAiSuggestion}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Apply Changes
                        </button>
                      </div>
                      <div className="flex-1 border border-gray-200 rounded-md p-2 overflow-auto bg-gray-50">
                        <pre className="text-xs text-gray-800 whitespace-pre-wrap">{aiSuggestion}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GrapesJS will be initialized here */}
            <div ref={editorRef} className="flex-1">
              {/* Placeholder content when GrapesJS is not available */}
              {!window.grapesjs && (
                <div className="h-full flex flex-col">
                  <div className="bg-gray-100 border-b border-gray-200 p-2 flex justify-between">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">Desktop</button>
                      <button className="px-3 py-1 bg-gray-50 border border-gray-300 rounded text-sm">Tablet</button>
                      <button className="px-3 py-1 bg-gray-50 border border-gray-300 rounded text-sm">Mobile</button>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-gray-50 border border-gray-300 rounded text-sm">Components</button>
                      <button className="px-3 py-1 bg-gray-50 border border-gray-300 rounded text-sm">Styles</button>
                      <button className="px-3 py-1 bg-gray-50 border border-gray-300 rounded text-sm">Layers</button>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    <div className="mx-auto max-w-4xl bg-white shadow-sm border border-gray-200 min-h-full">
                      <div dangerouslySetInnerHTML={{ __html: SAMPLE_PROJECT.content }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GrapesJS Not Loaded Notice */}
        {!window.grapesjs && !editorState.isLoading && (
          <div className="fixed bottom-0 left-0 right-0 bg-yellow-50 p-4 border-t border-yellow-200">
            <div className="flex items-start max-w-7xl mx-auto">
              <InfoIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">GrapesJS Not Loaded</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  This is a placeholder editor. To enable the full visual editor, GrapesJS needs to be integrated.
                  You can add the following script tags to your HTML:
                </p>
                <pre className="mt-2 p-2 bg-gray-800 text-gray-200 rounded text-xs overflow-x-auto">
                  {`<link rel="stylesheet" href="https://unpkg.com/grapesjs/dist/css/grapes.min.css">
<script src="https://unpkg.com/grapesjs"></script>
<script src="https://unpkg.com/grapesjs-preset-webpage"></script>`}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Icon components
function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
    </svg>
  );
}

function SaveIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zm6.905 9.97a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72V18a.75.75 0 001.5 0v-4.19l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" clipRule="evenodd" />
      <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
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

export default function AppBuilderEditor() {
  return (
    <AppProvider>
      <AppBuilderEditorContent />
    </AppProvider>
  );
}
