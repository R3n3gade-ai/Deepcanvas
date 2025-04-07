import React, { useState } from 'react';
import { ApiProvider, ApiConfig } from '../../features/studio/types';

interface ApiKeySettingsProps {
  apiConfigs: Record<ApiProvider, ApiConfig>;
  onSetApiKey: (provider: ApiProvider, key: string) => void;
  onRemoveApiKey: (provider: ApiProvider) => void;
}

export function ApiKeySettings({ 
  apiConfigs, 
  onSetApiKey, 
  onRemoveApiKey 
}: ApiKeySettingsProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const handleInputChange = (provider: string, value: string) => {
    setApiKeys({
      ...apiKeys,
      [provider]: value
    });
  };

  const handleToggleShowKey = (provider: string) => {
    setShowKeys({
      ...showKeys,
      [provider]: !showKeys[provider]
    });
  };

  const handleSaveKey = (provider: ApiProvider) => {
    if (apiKeys[provider] && apiKeys[provider].trim()) {
      onSetApiKey(provider, apiKeys[provider].trim());
      
      // Clear the input
      setApiKeys({
        ...apiKeys,
        [provider]: ''
      });
    }
  };

  const handleRemoveKey = (provider: ApiProvider) => {
    if (confirm(`Are you sure you want to remove the API key for ${apiConfigs[provider].name}?`)) {
      onRemoveApiKey(provider);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">API Settings</h2>
      
      <div className="space-y-6">
        {Object.entries(apiConfigs).map(([provider, config]) => (
          <div key={provider} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">{config.name}</h3>
              <div className="flex items-center">
                {config.enabled ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <span className="w-2 h-2 mr-1 bg-gray-500 rounded-full"></span>
                    Not Connected
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {provider === 'gemini' && (
                <>
                  Generate images with Google's Gemini API. 
                  <a 
                    href="https://ai.google.dev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    Get API key
                  </a>
                </>
              )}
              
              {provider === 'vertex' && (
                <>
                  Generate images and videos with Google's Vertex AI. 
                  <a 
                    href="https://cloud.google.com/vertex-ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    Get API key
                  </a>
                </>
              )}
              
              {provider === 'openai' && (
                <>
                  Generate images with OpenAI's DALL-E models. 
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    Get API key
                  </a>
                </>
              )}
              
              {provider === 'stability' && (
                <>
                  Generate images with Stability AI's models. 
                  <a 
                    href="https://platform.stability.ai/account/keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    Get API key
                  </a>
                </>
              )}
              
              {provider === 'runway' && (
                <>
                  Generate videos with Runway's Gen-2 model. 
                  <a 
                    href="https://app.runwayml.com/login" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-1"
                  >
                    Get API key
                  </a>
                </>
              )}
            </p>
            
            {config.enabled ? (
              <div className="flex items-center">
                <div className="flex-1 mr-2">
                  <input
                    type={showKeys[provider] ? 'text' : 'password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    value="••••••••••••••••••••••••••••••"
                    disabled
                  />
                </div>
                <button
                  type="button"
                  className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                  onClick={() => handleRemoveKey(provider as ApiProvider)}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <div className="flex-1 mr-2">
                  <input
                    type={showKeys[provider] ? 'text' : 'password'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder={`Enter ${config.name} API key`}
                    value={apiKeys[provider] || ''}
                    onChange={(e) => handleInputChange(provider, e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={() => handleToggleShowKey(provider)}
                >
                  {showKeys[provider] ? (
                    <i className="fas fa-eye-slash"></i>
                  ) : (
                    <i className="fas fa-eye"></i>
                  )}
                </button>
                <button
                  type="button"
                  className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => handleSaveKey(provider as ApiProvider)}
                  disabled={!apiKeys[provider] || !apiKeys[provider].trim()}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
