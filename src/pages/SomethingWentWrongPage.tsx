import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SomethingWentWrongPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">Something Went Wrong</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        We're sorry, but something went wrong. Please try again later.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Back
        </button>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
