import React from 'react';
import { GeneratedMedia } from '../../features/studio/types';

interface MediaViewerProps {
  media: GeneratedMedia | null;
  onClose: () => void;
}

export function MediaViewer({ media, onClose }: MediaViewerProps) {
  if (!media) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium">Media Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3">
              {media.type === 'image' ? (
                <img 
                  src={media.url} 
                  alt={media.prompt} 
                  className="w-full h-auto rounded-lg shadow-sm"
                />
              ) : (
                <video 
                  src={media.url} 
                  controls 
                  className="w-full h-auto rounded-lg shadow-sm"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            <div className="md:w-1/3">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Prompt</h4>
                <p className="text-gray-800">{media.prompt}</p>
              </div>
              
              {media.options.negativePrompt && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Negative Prompt</h4>
                  <p className="text-gray-800">{media.options.negativePrompt}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Provider / Model</h4>
                <p className="text-gray-800">
                  {media.provider} / {media.model}
                </p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Created</h4>
                <p className="text-gray-800">{formatDate(media.createdAt)}</p>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-1">Settings</h4>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  {media.type === 'image' && (
                    <>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Size:</span>
                        <span className="text-gray-800">{media.options.imageSize || '1024x1024'}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Style:</span>
                        <span className="text-gray-800">{media.options.imageStyle || 'photographic'}</span>
                      </div>
                    </>
                  )}
                  
                  {media.type === 'video' && (
                    <>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Duration:</span>
                        <span className="text-gray-800">{media.options.videoDuration || 5}s</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">FPS:</span>
                        <span className="text-gray-800">{media.options.videoFps || 30}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="text-gray-800">{media.options.temperature || 0.7}</span>
                  </div>
                  
                  {media.options.seed !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seed:</span>
                      <span className="text-gray-800">{media.options.seed}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
