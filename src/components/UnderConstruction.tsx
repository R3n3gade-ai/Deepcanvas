import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface UnderConstructionProps {
  title?: string;
  description?: string;
}

export default function UnderConstruction({
  title = "Page Under Construction",
  description = "This page is currently being developed. Please check back later."
}: UnderConstructionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = location.pathname.split('/').pop() || 'Home';
  const formattedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-2">{formattedPageName}</h1>
      <p className="text-gray-500 mb-8">
        {title === "Page Under Construction" ? formattedPageName + " Page" : title}
      </p>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
