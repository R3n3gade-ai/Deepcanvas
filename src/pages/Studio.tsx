import React, { useEffect, useState, useRef } from 'react';
import { GenerationForm } from '../components/studio/GenerationForm';
import { MediaGallery } from '../components/studio/MediaGallery';
import { ApiKeySettings } from '../components/studio/ApiKeySettings';
import { MediaViewer } from '../components/studio/MediaViewer';
import useStudioStore from '../features/studio/store/studioStore';
import { GeneratedMedia, MediaType, GenerationOptions, ApiProvider, ImageSize, ImageStyle } from '../features/studio/types';
import { toast } from 'react-hot-toast';

export default function Studio() {
  const [activeTab, setActiveTab] = useState<'generate' | 'settings'>('generate');
  const [viewingMedia, setViewingMedia] = useState<GeneratedMedia | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState<ImageSize>('1024x1024');
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('photographic');
  const [temperature, setTemperature] = useState(0.7);
  const [seed, setSeed] = useState<number | null>(null);
  const [batchSize, setBatchSize] = useState(1);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    apiConfigs,
    availableProviders,
    selectedProvider,
    availableModels,
    selectedModel,
    generatedMedia,
    isGenerating,
    error,
    setApiKey,
    removeApiKey,
    selectProvider,
    selectModel,
    generateMedia,
    deleteMedia
  } = useStudioStore();

  // Load generated media on component mount
  useEffect(() => {
    // This is handled by the store initialization
  }, []);

  // Handle file upload for reference images
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearReferenceImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const handleClearSeed = () => {
    setSeed(null);
  };

  const handleGenerate = async (type: MediaType, options: GenerationOptions) => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const fullOptions: GenerationOptions = {
      prompt: customPrompt,
      negativePrompt: negativePrompt || undefined,
      imageSize: selectedSize,
      imageStyle: selectedStyle,
      temperature,
      seed,
    };

    try {
      const result = await generateMedia(type, fullOptions);
      if (result) {
        toast.success('Media generated successfully!');
      }
    } catch (err) {
      toast.error('Failed to generate media');
    }
  };

  const handleBatchGenerate = async () => {
    if (!customPrompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGeneratingBatch(true);
    setBatchProgress(0);

    try {
      for (let i = 0; i < batchSize; i++) {
        const fullOptions: GenerationOptions = {
          prompt: customPrompt,
          negativePrompt: negativePrompt || undefined,
          imageSize: selectedSize,
          imageStyle: selectedStyle,
          temperature,
          seed: seed !== null ? seed + i : Math.floor(Math.random() * 1000000),
        };

        await generateMedia('image', fullOptions);
        setBatchProgress(Math.round(((i + 1) / batchSize) * 100));
      }

      toast.success(`Generated ${batchSize} images successfully!`);
    } catch (err) {
      toast.error('Failed to generate batch');
    } finally {
      setIsGeneratingBatch(false);
      setBatchProgress(0);
    }
  };

  const handleDeleteMedia = (id: string) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      deleteMedia(id);

      // If the deleted media is currently being viewed, close the viewer
      if (viewingMedia && viewingMedia.id === id) {
        setViewingMedia(null);
      }

      toast.success('Media deleted successfully');
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Studio</h1>
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'generate' ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('generate')}
          >
            Generate
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('settings')}
          >
            API Settings
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6 text-red-800">
          {error}
        </div>
      )}

      {activeTab === 'generate' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Generate Media</h2>

              {availableProviders.length === 0 ? (
                <div className="bg-yellow-50 p-4 rounded-md mb-4">
                  <p className="text-yellow-800">
                    No API providers configured. Please add API keys in the settings.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleGenerate('image', {} as GenerationOptions);
                }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Provider</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      value={selectedProvider}
                      onChange={(e) => selectProvider(e.target.value as ApiProvider)}
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
                      onChange={(e) => selectModel(e.target.value)}
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
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe the image you want to generate..."
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
                      placeholder="Describe what you don't want in the generated image..."
                      disabled={isGenerating}
                    />
                  </div>

                  <div className="mb-4">
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      disabled={isGenerating}
                    >
                      {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
                    </button>
                  </div>

                  {showAdvancedOptions && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Image Size</label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value as ImageSize)}
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
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value as ImageStyle)}
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

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Batch Size: {batchSize}
                        </label>
                        <input
                          type="range"
                          className="w-full"
                          min="1"
                          max="10"
                          step="1"
                          value={batchSize}
                          onChange={(e) => setBatchSize(parseInt(e.target.value))}
                          disabled={isGenerating || isGeneratingBatch}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Reference Image</label>
                        <div className="flex items-center">
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isGenerating}
                          />
                          <button
                            type="button"
                            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isGenerating}
                          >
                            Upload Image
                          </button>
                          {previewImage && (
                            <button
                              type="button"
                              className="ml-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                              onClick={handleClearReferenceImage}
                              disabled={isGenerating}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        {previewImage && (
                          <div className="mt-2">
                            <img
                              src={previewImage}
                              alt="Reference"
                              className="h-32 object-contain rounded-md border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <div className="mt-6 space-y-2">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isGenerating || !customPrompt.trim() || availableModels.length === 0}
                    >
                      {isGenerating ? (
                        <span className="flex items-center justify-center">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Generating...
                        </span>
                      ) : (
                        'Generate Image'
                      )}
                    </button>

                    {showAdvancedOptions && batchSize > 1 && (
                      <button
                        type="button"
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleBatchGenerate}
                        disabled={isGenerating || isGeneratingBatch || !customPrompt.trim() || availableModels.length === 0}
                      >
                        {isGeneratingBatch ? (
                          <span className="flex items-center justify-center">
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Generating Batch... {batchProgress}%
                          </span>
                        ) : (
                          `Generate Batch (${batchSize} images)`
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="lg:col-span-2">
            <MediaGallery
              media={generatedMedia}
              onDelete={handleDeleteMedia}
              onView={setViewingMedia}
            />
          </div>
        </div>
      ) : (
        <ApiKeySettings
          apiConfigs={apiConfigs}
          onSetApiKey={setApiKey}
          onRemoveApiKey={removeApiKey}
        />
      )}

      {viewingMedia && (
        <MediaViewer
          media={viewingMedia}
          onClose={() => setViewingMedia(null)}
        />
      )}
    </div>
  );
}