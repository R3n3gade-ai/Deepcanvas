import React, { useState } from 'react';
import { ChatSettings } from '../../features/ai-chat/types';

interface ChatSidebarProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
}

export function ChatSidebar({ settings, onSettingsChange }: ChatSidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">AI Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <button 
            className="w-full py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => {/* Create new chat */}}
          >
            New Chat
          </button>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Chats</h3>
          <div className="space-y-1">
            {/* This would be populated with actual chat history */}
            <button className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 text-sm">
              Project Planning
            </button>
            <button className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 text-sm">
              Marketing Ideas
            </button>
            <button className="w-full text-left py-2 px-3 rounded-md hover:bg-gray-100 text-sm">
              Customer Analysis
            </button>
          </div>
        </div>
        
        <div>
          <button 
            className="flex items-center justify-between w-full text-sm font-medium text-gray-500 mb-2"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <span>Settings</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-4 w-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isSettingsOpen && (
            <div className="space-y-4 mt-2 p-3 bg-white rounded-md shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  value={settings.model}
                  onChange={(e) => handleSettingChange('model', e.target.value)}
                >
                  <option value="gemini-pro">Gemini Pro</option>
                  <option value="gemini-pro-vision">Gemini Pro Vision</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature: {settings.temperature}
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  className="w-full"
                  value={settings.temperature}
                  onChange={(e) => handleSettingChange('temperature', parseFloat(e.target.value))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Tokens: {settings.maxTokens}
                </label>
                <input 
                  type="range" 
                  min="100" 
                  max="8000" 
                  step="100"
                  className="w-full"
                  value={settings.maxTokens}
                  onChange={(e) => handleSettingChange('maxTokens', parseInt(e.target.value))}
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="streamResponse"
                  className="mr-2"
                  checked={settings.streamResponse}
                  onChange={(e) => handleSettingChange('streamResponse', e.target.checked)}
                />
                <label htmlFor="streamResponse" className="text-sm text-gray-700">
                  Stream Response
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="enableRAG"
                  className="mr-2"
                  checked={settings.enableRAG}
                  onChange={(e) => handleSettingChange('enableRAG', e.target.checked)}
                />
                <label htmlFor="enableRAG" className="text-sm text-gray-700">
                  Enable RAG
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
