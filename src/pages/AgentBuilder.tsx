import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AgentBuilder() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    alert('Agent saved successfully!');
    navigate('/agents');
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Create New Agent</h1>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={handleSave}
            >
              Save Agent
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="max-w-2xl">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Agent Name</label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter agent name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what your agent does"
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Personality</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Professional Assistant</option>
                  <option>Creative Collaborator</option>
                  <option>Technical Expert</option>
                  <option>Friendly Guide</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Model</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option>Gemini 1.5 Pro</option>
                  <option>Gemini 1.0 Pro</option>
                  <option>GPT-4o</option>
                  <option>Claude 3 Opus</option>
                </select>
              </div>
            </div>
          </div>
    </div>
  );
}
