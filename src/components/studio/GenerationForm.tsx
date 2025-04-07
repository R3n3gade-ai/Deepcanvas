import React, { useState, useEffect } from 'react';
import { 
  ApiProvider, 
  MediaType, 
  ImageSize, 
  ImageStyle, 
  GenerationOptions 
} from '../../features/studio/types';

interface GenerationFormProps {
  availableProviders: ApiProvider[];
  selectedProvider: ApiProvider;
  availableModels: string[];
  selectedModel: string;
  isGenerating: boolean;
  onSelectProvider: (provider: ApiProvider) => void;
  onSelectModel: (model: string) => void;
  onGenerate: (type: MediaType, options: GenerationOptions) => void;
}

export function GenerationForm({
  availableProviders,
  selectedProvider,
  availableModels,
  selectedModel,
  isGenerating,
  onSelectProvider,
  onSelectModel,
  onGenerate
}: GenerationFormProps) {
  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [imageSize, setImageSize] = useState<ImageSize>('1024x1024');
  const [imageStyle, setImageStyle] = useState<ImageStyle>('photographic');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoFps, setVideoFps] = useState(30);
  const [temperature, setTemperature] = useState(0.7);
  const [seed, setSeed] = useState<number | null>(null);
  const [advancedOptions, setAdvancedOptions] = useState(false);

  // Update media type based on selected model
  useEffect(() => {
    if (selectedModel.includes('video')) {
      setMediaType('video');
    } else {
      setMediaType('image');
    }
  }, [selectedModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      return;
    }
    
    const options: GenerationOptions = {
      prompt,
      negativePrompt: negativePrompt || undefined,
      temperature,
      seed: seed || undefined,
    };
    
    if (mediaType === 'image') {
      options.imageSize = imageSize;
      options.imageStyle = imageStyle;
    } else {
      options.videoDuration = videoDuration;
      options.videoFps = videoFps;
    }
    
    onGenerate(mediaType, options);
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const handleClearSeed = () => {
    setSeed(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Generate Media</h2>
      
      <form onSubmit={handleSubmit}>
        {availableProviders.length === 0 ? (
          <div className="bg-yellow-50 p-4 rounded-md mb-4">
            <p className="text-yellow-800">
              No API providers configured. Please add API keys in the settings.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Provider</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedProvider}
                onChange={(e) => onSelectProvider(e.target.value as ApiProvider)}
                disabled={isGenerating}
              >
                {availableProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Model</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={selectedModel}
                onChange={(e) => onSelectModel(e.target.value)}
                disabled={isGenerating || availableModels.length === 0}
              >
                {availableModels.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  availableModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Prompt</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mediaType === 'image' 
                  ? "Describe the image you want to generate..." 
                  : "Describe the video you want to generate..."}
                disabled={isGenerating}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Negative Prompt</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Describe what you don't want in the generated media..."
                disabled={isGenerating}
              />
            </div>
            
            {mediaType === 'image' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Image Size</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                    disabled={isGenerating}
                  >
                    <option value="512x512">512x512</option>
                    <option value="1024x1024">1024x1024</option>
                    <option value="1024x1792">1024x1792 (Portrait)</option>
                    <option value="1792x1024">1792x1024 (Landscape)</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Style</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={imageStyle}
                    onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                    disabled={isGenerating}
                  >
                    <option value="photographic">Photographic</option>
                    <option value="digital-art">Digital Art</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="anime">Anime</option>
                    <option value="painting">Painting</option>
                    <option value="sketch">Sketch</option>
                  </select>
                </div>
              </>
            )}
            
            {mediaType === 'video' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Duration (seconds): {videoDuration}
                  </label>
                  <input
                    type="range"
                    className="w-full"
                    min="1"
                    max="10"
                    step="1"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(parseInt(e.target.value))}
                    disabled={isGenerating}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    FPS: {videoFps}
                  </label>
                  <input
                    type="range"
                    className="w-full"
                    min="15"
                    max="60"
                    step="15"
                    value={videoFps}
                    onChange={(e) => setVideoFps(parseInt(e.target.value))}
                    disabled={isGenerating}
                  />
                </div>
              </>
            )}
            
            <div className="mb-4">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setAdvancedOptions(!advancedOptions)}
                disabled={isGenerating}
              >
                {advancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
              </button>
            </div>
            
            {advancedOptions && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Temperature: {temperature}
                  </label>
                  <input
                    type="range"
                    className="w-full"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    disabled={isGenerating}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Deterministic</span>
                    <span>Creative</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Seed</label>
                  <div className="flex">
                    <input
                      type="number"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
                      value={seed === null ? '' : seed}
                      onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Random"
                      disabled={isGenerating}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0"
                      onClick={handleRandomSeed}
                      disabled={isGenerating}
                      title="Random Seed"
                    >
                      <i className="fas fa-dice"></i>
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md"
                      onClick={handleClearSeed}
                      disabled={isGenerating}
                      title="Clear Seed"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </>
            )}
            
            <div className="mt-6">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isGenerating || !prompt.trim() || availableModels.length === 0}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Generating...
                  </span>
                ) : (
                  `Generate ${mediaType === 'image' ? 'Image' : 'Video'}`
                )}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
