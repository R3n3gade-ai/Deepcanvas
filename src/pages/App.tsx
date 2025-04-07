import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

export default function App() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">DeepCanvas</h1>
          <p className="text-gray-600 mb-6">
            Welcome to DeepCanvas - Your AI Hub for building and managing AI agents, workflows, and knowledge bases.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* AI Agents Card */}
            <div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/agents')}
            >
              <h2 className="text-lg font-semibold mb-2">AI Agents</h2>
              <p className="text-gray-600 mb-4">Create and manage your custom AI agents</p>
              <div className="flex justify-end">
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/agent-builder');
                  }}
                >
                  Create Agent
                </button>
              </div>
            </div>
            
            {/* API Connect Card */}
            <div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/api-connect')}
            >
              <h2 className="text-lg font-semibold mb-2">API Connect</h2>
              <p className="text-gray-600 mb-4">Connect to external APIs and services</p>
              <div className="flex justify-end">
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/api-connect');
                  }}
                >
                  Manage Connections
                </button>
              </div>
            </div>
            
            {/* Brain Card */}
            <div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/brain')}
            >
              <h2 className="text-lg font-semibold mb-2">Knowledge Base</h2>
              <p className="text-gray-600 mb-4">Manage your AI knowledge base</p>
              <div className="flex justify-end">
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/brain');
                  }}
                >
                  View Knowledge
                </button>
              </div>
            </div>
            
            {/* Workflow Builder Card */}
            <div 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate('/workflow-builder')}
            >
              <h2 className="text-lg font-semibold mb-2">Workflow Builder</h2>
              <p className="text-gray-600 mb-4">Create automated workflows</p>
              <div className="flex justify-end">
                <button 
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/workflow-builder');
                  }}
                >
                  Create Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
