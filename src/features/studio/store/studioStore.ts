import { create } from 'zustand';
import { 
  ApiProvider, 
  MediaType, 
  GenerationOptions, 
  GeneratedMedia,
  StudioStore 
} from '../types';
import studioService from '../services/studioService';

// Create the store
const useStudioStore = create<StudioStore>((set, get) => ({
  // API state
  apiConfigs: studioService.getApiConfigs(),
  apiKeys: {},
  availableProviders: [],
  selectedProvider: 'gemini',
  availableModels: [],
  selectedModel: '',
  
  // Media state
  generatedMedia: [],
  isGenerating: false,
  error: null,
  
  // Actions
  setApiKey: (provider: ApiProvider, key: string) => {
    studioService.setApiKey(provider, key);
    
    set(state => ({
      apiConfigs: studioService.getApiConfigs(),
      availableProviders: studioService.getAvailableProviders(),
    }));
  },
  
  removeApiKey: (provider: ApiProvider) => {
    studioService.removeApiKey(provider);
    
    set(state => {
      const newState = {
        apiConfigs: studioService.getApiConfigs(),
        availableProviders: studioService.getAvailableProviders(),
      };
      
      // If the selected provider is the one being removed, select another one
      if (state.selectedProvider === provider) {
        const newProviders = studioService.getAvailableProviders();
        if (newProviders.length > 0) {
          return {
            ...newState,
            selectedProvider: newProviders[0],
            availableModels: studioService.getAvailableModels(newProviders[0], 'image'),
            selectedModel: studioService.getAvailableModels(newProviders[0], 'image')[0] || '',
          };
        } else {
          return {
            ...newState,
            selectedProvider: 'gemini',
            availableModels: [],
            selectedModel: '',
          };
        }
      }
      
      return newState;
    });
  },
  
  selectProvider: (provider: ApiProvider) => {
    set(state => {
      const mediaType = state.selectedModel.includes('video') ? 'video' : 'image';
      const availableModels = studioService.getAvailableModels(provider, mediaType);
      
      return {
        selectedProvider: provider,
        availableModels,
        selectedModel: availableModels.length > 0 ? availableModels[0] : '',
      };
    });
  },
  
  selectModel: (model: string) => {
    set({ selectedModel: model });
  },
  
  generateMedia: async (type: MediaType, options: GenerationOptions) => {
    const { selectedProvider, selectedModel } = get();
    
    if (!selectedProvider || !selectedModel) {
      set({ error: 'Please select a provider and model' });
      return null;
    }
    
    set({ isGenerating: true, error: null });
    
    try {
      const newMedia = await studioService.generateMedia(
        type,
        selectedProvider,
        selectedModel,
        options
      );
      
      set(state => ({
        generatedMedia: [newMedia, ...state.generatedMedia],
        isGenerating: false,
      }));
      
      return newMedia;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred while generating media',
        isGenerating: false,
      });
      return null;
    }
  },
  
  deleteMedia: (id: string) => {
    studioService.deleteMedia(id);
    
    set(state => ({
      generatedMedia: state.generatedMedia.filter(media => media.id !== id),
    }));
  },
}));

// Initialize the store
const initializeStore = () => {
  const store = useStudioStore.getState();
  
  // Initialize the service if not already initialized
  if (!studioService.isInitialized()) {
    studioService.initialize();
  }
  
  // Load generated media
  const generatedMedia = studioService.getGeneratedMedia();
  
  // Get available providers
  const availableProviders = studioService.getAvailableProviders();
  
  // Set initial provider and models
  let selectedProvider: ApiProvider = 'gemini';
  let availableModels: string[] = [];
  let selectedModel: string = '';
  
  if (availableProviders.length > 0) {
    selectedProvider = availableProviders[0];
    availableModels = studioService.getAvailableModels(selectedProvider, 'image');
    if (availableModels.length > 0) {
      selectedModel = availableModels[0];
    }
  }
  
  // Update the store
  useStudioStore.setState({
    apiConfigs: studioService.getApiConfigs(),
    availableProviders,
    selectedProvider,
    availableModels,
    selectedModel,
    generatedMedia,
  });
};

// Initialize the store when it's imported
initializeStore();

export default useStudioStore;
