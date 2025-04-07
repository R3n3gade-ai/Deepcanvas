import React, { useState } from 'react';
import { AIGenerationPrompt } from '../../features/app-builder/types';

interface AIGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: AIGenerationPrompt) => void;
}

export function AIGenerationDialog({ 
  isOpen, 
  onClose, 
  onGenerate 
}: AIGenerationDialogProps) {
  const [type, setType] = useState<'website' | 'landing-page' | 'app' | 'dashboard'>('website');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [style, setStyle] = useState('');
  const [colorScheme, setColorScheme] = useState('');
  const [references, setReferences] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const prompt: AIGenerationPrompt = {
        type,
        description,
        features: features.split(',').map(f => f.trim()).filter(f => f),
        style: style || undefined,
        colorScheme: colorScheme || undefined,
        references: references.split(',').map(r => r.trim()).filter(r => r),
      };
      
      await onGenerate(prompt);
      onClose();
    } catch (error) {
      console.error('Error generating with AI:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generate with AI</h2>
          <div className="flex items-center">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mr-2">
              Powered by Gemini
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Project Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              required
            >
              <option value="website">Website</option>
              <option value="landing-page">Landing Page</option>
              <option value="app">Web App</option>
              <option value="dashboard">Dashboard</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want to create in detail"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "A professional website for a law firm that specializes in corporate law"
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Features (comma-separated)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="About page, Services, Contact form, etc."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Style</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Modern, Minimalist, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color Scheme</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={colorScheme}
                onChange={(e) => setColorScheme(e.target.value)}
                placeholder="Blue and white, Earth tones, etc."
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Reference URLs (comma-separated)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              placeholder="https://example.com, https://another-site.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Websites that have a similar style to what you want
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
              disabled={isSubmitting || !description.trim()}
            >
              {isSubmitting ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
