import React from 'react';
import { AppTemplate } from '../../features/app-builder/types';

interface TemplateCardProps {
  template: AppTemplate;
  onSelect: (template: AppTemplate) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect(template)}
    >
      <div className="relative">
        <img 
          src={template.thumbnail} 
          alt={template.name} 
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`
            text-xs px-2 py-1 rounded-full 
            ${template.category === 'website' ? 'bg-blue-100 text-blue-800' : 
              template.category === 'landing-page' ? 'bg-green-100 text-green-800' : 
              template.category === 'app' ? 'bg-purple-100 text-purple-800' : 
              'bg-orange-100 text-orange-800'}
          `}>
            {template.category.replace('-', ' ')}
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className={`
            text-xs px-2 py-1 rounded-full 
            ${template.complexity === 'simple' ? 'bg-green-100 text-green-800' : 
              template.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'}
          `}>
            {template.complexity}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1">{template.name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
        
        <div className="mb-3">
          <h4 className="text-xs font-medium text-gray-500 mb-1">Features:</h4>
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 3).map((feature, index) => (
              <span 
                key={index}
                className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full"
              >
                {feature}
              </span>
            ))}
            {template.features.length > 3 && (
              <span className="text-xs text-gray-500">
                +{template.features.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            className="w-full px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
