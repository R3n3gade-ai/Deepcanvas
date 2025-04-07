import React from 'react';
import { GeneratedMedia } from '../../features/studio/types';

interface MediaGalleryProps {
  media: GeneratedMedia[];
  onDelete: (id: string) => void;
  onView: (media: GeneratedMedia) => void;
}

export function MediaGallery({ media, onDelete, onView }: MediaGalleryProps) {
  if (media.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-700 mb-2">No media generated yet</h3>
        <p className="text-gray-500">
          Use the form to generate images or videos with AI.
        </p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {media.map((item) => (
        <div 
          key={item.id} 
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative">
            {item.type === 'image' ? (
              <img 
                src={item.url} 
                alt={item.prompt} 
                className="w-full h-48 object-cover cursor-pointer"
                onClick={() => onView(item)}
              />
            ) : (
              <div 
                className="w-full h-48 bg-gray-100 flex items-center justify-center cursor-pointer"
                onClick={() => onView(item)}
              >
                <div className="text-center">
                  <i className="fas fa-film text-3xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-500">Video</p>
                </div>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className={`
                text-xs px-2 py-1 rounded-full 
                ${item.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}
              `}>
                {item.type}
              </span>
            </div>
          </div>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-800 line-clamp-1">{item.prompt}</h3>
                <p className="text-xs text-gray-500">
                  {item.provider} / {item.model}
                </p>
              </div>
              <button
                onClick={() => onDelete(item.id)}
                className="text-gray-400 hover:text-red-600"
                title="Delete"
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Created: {formatDate(item.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
