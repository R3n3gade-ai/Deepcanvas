import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NotFoundProps {
  title?: string;
  description?: string;
}

export default function NotFound({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist."
}: NotFoundProps) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-gray-600 text-center mb-6 max-w-md">
            {description}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
