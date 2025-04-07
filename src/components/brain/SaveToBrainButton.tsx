import React, { useState, useEffect } from 'react';
import useBrainStore from '../../features/brain/store/brainStore';
import { BrainCollection } from '../../features/brain/types';

interface SaveToBrainButtonProps {
  // The content to save to the brain
  title: string;
  content?: string;
  url?: string;
  // Optional callback after saving
  onSaved?: () => void;
  // Button style
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SaveToBrainButton({
  title,
  content = '',
  url = '',
  onSaved,
  variant = 'primary',
  size = 'md',
  className = '',
}: SaveToBrainButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [collections, setCollections] = useState<BrainCollection[]>([]);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { fetchCollections, addDocument } = useBrainStore();

  // Load collections when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      const loadCollections = async () => {
        await fetchCollections();
        const collections = useBrainStore.getState().collections;
        setCollections(collections);
        
        // Select default collection if available
        const defaultCollection = collections.find(c => c.isDefault);
        if (defaultCollection) {
          setSelectedCollectionIds([defaultCollection.id]);
        }
      };
      
      loadCollections();
    }
  }, [isDialogOpen, fetchCollections]);

  const handleSave = async () => {
    if (selectedCollectionIds.length === 0) {
      alert('Please select at least one collection');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine content type based on what's provided
      const contentType = url ? 'url' : 'text';
      
      // Create document
      await addDocument({
        title,
        content: content || (url ? `URL: ${url}` : ''),
        contentType,
        metadata: {
          source: contentType === 'url' ? 'Web' : 'Manual Entry',
          dateAdded: new Date().toISOString(),
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          userId: 'user-123', // In a real app, get from auth
          ...(url ? { originalUrl: url } : {}),
        },
        collectionIds: selectedCollectionIds,
      });
      
      // Close dialog and call callback
      setIsDialogOpen(false);
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Error saving to brain:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Button style classes
  const buttonClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-800 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-2 text-lg',
  };

  return (
    <>
      <button
        className={`rounded-md flex items-center ${buttonClasses[variant]} ${sizeClasses[size]} ${className}`}
        onClick={() => setIsDialogOpen(true)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
          />
        </svg>
        Save to Brain
      </button>
      
      {/* Save to Brain Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Save to Brain</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={title}
                disabled
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Collections</label>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md p-2">
                {collections.length === 0 ? (
                  <p className="text-sm text-gray-500">No collections found</p>
                ) : (
                  collections.map((collection) => (
                    <div key={collection.id} className="flex items-center py-1">
                      <input
                        type="checkbox"
                        id={`collection-${collection.id}`}
                        checked={selectedCollectionIds.includes(collection.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCollectionIds([...selectedCollectionIds, collection.id]);
                          } else {
                            setSelectedCollectionIds(selectedCollectionIds.filter(id => id !== collection.id));
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`collection-${collection.id}`} className="text-sm">
                        {collection.name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Tags</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Enter tags separated by commas"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
