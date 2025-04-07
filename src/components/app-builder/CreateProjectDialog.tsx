import React, { useState } from 'react';
import { AppTemplate } from '../../features/app-builder/types';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, description: string, type: string, templateId?: string) => void;
  onCreateAIBuilderProject?: (name: string, description: string, type: string, templateId?: string) => void;
  selectedTemplate?: AppTemplate;
}

export function CreateProjectDialog({
  isOpen,
  onClose,
  onCreateProject,
  onCreateAIBuilderProject,
  selectedTemplate
}: CreateProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // Always use 'app' as the type
  const type = selectedTemplate?.category || 'app';
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Always use AI Builder by default

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Always use AI Builder if available
      if (onCreateAIBuilderProject) {
        await onCreateAIBuilderProject(
          name,
          description,
          type as 'website' | 'landing-page' | 'app' | 'dashboard',
          selectedTemplate?.id
        );
      } else {
        // Fallback to regular project creation if AI Builder is not available
        await onCreateProject(
          name,
          description,
          type as 'website' | 'landing-page' | 'app' | 'dashboard',
          selectedTemplate?.id
        );
      }

      // Reset form and close dialog
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {selectedTemplate ? `Create Project from Template` : 'Create New Project'}
        </h2>

        {selectedTemplate && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md flex items-center">
            <img
              src={selectedTemplate.thumbnail}
              alt={selectedTemplate.name}
              className="w-16 h-16 object-cover rounded-md mr-3"
            />
            <div>
              <h3 className="font-medium">{selectedTemplate.name}</h3>
              <p className="text-sm text-gray-600">{selectedTemplate.category.replace('-', ' ')}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project"
            />
          </div>

          {/* Project type is now fixed to 'app' */}



          <div className="mb-4">
            <p className="text-sm text-blue-600 font-medium">
              Your project will be created using DeepCanvas AI Builder powered by Google Gemini.
            </p>
            <p className="mt-1 text-sm text-gray-500">
              DeepCanvas AI Builder allows you to build applications with natural language prompts, fully integrated with DeepCanvas.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
