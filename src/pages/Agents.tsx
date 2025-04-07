import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Agents() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">AI Agents</h1>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => navigate('/agent-builder')}
            >
              Create Agent
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-600 text-center py-8">
              You don't have any agents yet. Create your first agent to get started.
            </p>
          </div>
    </div>
  );
}
