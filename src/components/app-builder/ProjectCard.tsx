import React from 'react';
import { AppProject } from '../../features/app-builder/types';

interface ProjectCardProps {
  project: AppProject;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onPublish, onUnpublish }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={project.thumbnail} 
          alt={project.name} 
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`
            text-xs px-2 py-1 rounded-full 
            ${project.type === 'website' ? 'bg-blue-100 text-blue-800' : 
              project.type === 'landing-page' ? 'bg-green-100 text-green-800' : 
              project.type === 'app' ? 'bg-purple-100 text-purple-800' : 
              'bg-orange-100 text-orange-800'}
          `}>
            {project.type.replace('-', ' ')}
          </span>
        </div>
        {project.published && (
          <div className="absolute top-2 left-2">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              Published
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1">{project.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
          <span>Created: {formatDate(project.createdAt)}</span>
          <span>Last edited: {formatDate(project.lastEdited)}</span>
        </div>
        
        <div className="flex justify-between">
          <button
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onEdit(project.id)}
          >
            Edit
          </button>
          
          <div className="flex space-x-3">
            {project.published ? (
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => onUnpublish(project.id)}
              >
                Unpublish
              </button>
            ) : (
              <button
                className="text-green-600 hover:text-green-800"
                onClick={() => onPublish(project.id)}
              >
                Publish
              </button>
            )}
            
            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => onDelete(project.id)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
