import React, { useState } from 'react';
import { BrainDocument, BrainCollection } from '../../features/brain/types';
import useBrainStore from '../../features/brain/store/brainStore';

interface AddKnowledgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collections: BrainCollection[];
}

export function AddKnowledgeDialog({ isOpen, onClose, collections }: AddKnowledgeDialogProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'url'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addDocument } = useBrainStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create document based on active tab
      let newDocument: Omit<BrainDocument, 'id'>;
      
      if (activeTab === 'text') {
        newDocument = {
          title,
          content,
          contentType: 'text',
          metadata: {
            source: 'Manual Entry',
            dateAdded: new Date().toISOString(),
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            userId: 'user-123', // In a real app, get from auth
          },
          collectionIds: selectedCollectionIds,
        };
      } else if (activeTab === 'url') {
        newDocument = {
          title: title || url,
          content: `URL: ${url}`,
          contentType: 'url',
          metadata: {
            source: 'Web',
            dateAdded: new Date().toISOString(),
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            userId: 'user-123', // In a real app, get from auth
            originalUrl: url,
          },
          collectionIds: selectedCollectionIds,
        };
      } else {
        // File upload - in a real app, this would handle file uploads
        newDocument = {
          title,
          content: 'File content would be extracted here',
          contentType: 'pdf', // Assuming PDF for this example
          metadata: {
            source: 'Uploaded File',
            dateAdded: new Date().toISOString(),
            tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            userId: 'user-123', // In a real app, get from auth
            originalFileName: 'example.pdf',
          },
          collectionIds: selectedCollectionIds,
        };
      }
      
      await addDocument(newDocument);
      
      // Reset form and close dialog
      setTitle('');
      setContent('');
      setUrl('');
      setSelectedCollectionIds([]);
      setTags('');
      onClose();
    } catch (error) {
      console.error('Error adding knowledge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Add Knowledge</h2>
        
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'text' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('text')}
            >
              Text
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'file' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('file')}
            >
              File
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === 'url' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('url')}
            >
              URL
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
              required={activeTab !== 'url'}
            />
          </div>
          
          {activeTab === 'text' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the content"
                required
              />
            </div>
          )}
          
          {activeTab === 'file' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                <input
                  type="file"
                  className="hidden"
                  id="file-upload"
                  // In a real app, handle file upload
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-800"
                >
                  Click to upload or drag and drop
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Supports PDF, DOCX, TXT, JPG, PNG, MP3, MP4 (max 50MB)
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'url' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Collections</label>
            <div className="grid grid-cols-2 gap-2">
              {collections.map((collection) => (
                <div key={collection.id} className="flex items-center">
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
              ))}
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
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add to Brain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
