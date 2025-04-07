import React, { useState, useEffect } from 'react';
import { BrainCollection } from '../../features/brain/types';
import useBrainStore from '../../features/brain/store/brainStore';

interface CollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: BrainCollection;
}

export function CollectionDialog({ isOpen, onClose, collection }: CollectionDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('folder');
  const [color, setColor] = useState('#3b82f6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addCollection, updateCollection } = useBrainStore();

  // Set initial values when editing an existing collection
  useEffect(() => {
    if (collection) {
      setName(collection.name);
      setDescription(collection.description);
      setIcon(collection.icon || 'folder');
      setColor(collection.color || '#3b82f6');
    } else {
      // Reset form for new collection
      setName('');
      setDescription('');
      setIcon('folder');
      setColor('#3b82f6');
    }
  }, [collection, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (collection) {
        // Update existing collection
        await updateCollection({
          ...collection,
          name,
          description,
          icon,
          color,
        });
      } else {
        // Create new collection
        await addCollection({
          name,
          description,
          documentIds: [],
          userId: 'user-123', // In a real app, get from auth
          icon,
          color,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving collection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available icons
  const icons = [
    'folder', 'brain', 'sparkles', 'file-text', 'image', 'film', 
    'music', 'link', 'globe', 'tag', 'calendar', 'clock'
  ];
  
  // Available colors
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6b7280', // gray
    '#000000', // black
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {collection ? 'Edit Collection' : 'Create Collection'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
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
              placeholder="Collection description"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  className={`p-2 rounded-md ${icon === iconName ? 'bg-gray-100 ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                  onClick={() => setIcon(iconName)}
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    {/* This would be an actual icon in a real implementation */}
                    <span className="text-xs">{iconName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex space-x-2">
              {colors.map((colorValue) => (
                <button
                  key={colorValue}
                  type="button"
                  className={`w-8 h-8 rounded-full ${color === colorValue ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  style={{ backgroundColor: colorValue }}
                  onClick={() => setColor(colorValue)}
                />
              ))}
            </div>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
