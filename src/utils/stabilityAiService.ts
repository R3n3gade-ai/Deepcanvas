import axios from 'axios';
import { getApiKey } from './apiHubService';

// API configuration
interface StabilityAIConfig {
  apiKey?: string;
  baseUrl: string;
  defaultEngine: string;
}

const STABILITY_CONFIG: StabilityAIConfig = {
  baseUrl: "https://api.stability.ai/v1",
  defaultEngine: "stable-diffusion-xl-1024-v1-0",
  // API key will be set from API Hub
};

// Load API key from API Hub
function loadApiKey(): string | null {
  return getApiKey('stability-ai');
}

// Check if API key is set
export function isApiKeySet(): boolean {
  return !!loadApiKey();
}

// Get available engines
export async function getAvailableEngines(): Promise<{ id: string, name: string }[]> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    return [
      { id: "stable-diffusion-xl-1024-v1-0", name: "Stable Diffusion XL" },
      { id: "stable-diffusion-v1-6", name: "Stable Diffusion 1.6" },
      { id: "stable-diffusion-512-v2-1", name: "Stable Diffusion 2.1" }
    ];
  }

  try {
    const response = await axios.get(`${STABILITY_CONFIG.baseUrl}/engines/list`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.data.map((engine: any) => ({
      id: engine.id,
      name: engine.name
    }));
  } catch (error) {
    console.error("Error fetching Stability AI engines:", error);
    return [
      { id: "stable-diffusion-xl-1024-v1-0", name: "Stable Diffusion XL" },
      { id: "stable-diffusion-v1-6", name: "Stable Diffusion 1.6" },
      { id: "stable-diffusion-512-v2-1", name: "Stable Diffusion 2.1" }
    ];
  }
}

// Interface for image generation options
export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  cfgScale?: number;
  steps?: number;
  samples?: number;
  seed?: number;
  engineId?: string;
}

// Generate an image using the Stability AI API
export async function generateImage(options: ImageGenerationOptions): Promise<string[]> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("Stability AI API key not found. Please set it in the API Hub.");
  }

  const engineId = options.engineId || STABILITY_CONFIG.defaultEngine;
  
  // Set default values
  const width = options.width || 1024;
  const height = options.height || 1024;
  const cfgScale = options.cfgScale || 7;
  const steps = options.steps || 30;
  const samples = options.samples || 1;

  try {
    const response = await axios.post(
      `${STABILITY_CONFIG.baseUrl}/generation/${engineId}/text-to-image`,
      {
        text_prompts: [
          {
            text: options.prompt,
            weight: 1
          },
          ...(options.negativePrompt ? [{
            text: options.negativePrompt,
            weight: -1
          }] : [])
        ],
        cfg_scale: cfgScale,
        height,
        width,
        samples,
        steps,
        ...(options.seed !== undefined ? { seed: options.seed } : {})
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        responseType: 'json'
      }
    );

    // Extract base64 images from the response
    return response.data.artifacts.map((artifact: any) => {
      return `data:image/png;base64,${artifact.base64}`;
    });
  } catch (error) {
    console.error("Error generating image:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else {
      throw new Error("Failed to generate image. Please try again.");
    }
  }
}

// Interface for image-to-image options
export interface ImageToImageOptions {
  initImage: string; // base64 encoded image
  prompt: string;
  negativePrompt?: string;
  cfgScale?: number;
  steps?: number;
  samples?: number;
  seed?: number;
  engineId?: string;
  imageStrength?: number; // How much to transform the initial image (0-1)
}

// Generate an image from another image using the Stability AI API
export async function generateImageFromImage(options: ImageToImageOptions): Promise<string[]> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("Stability AI API key not found. Please set it in the API Hub.");
  }

  const engineId = options.engineId || STABILITY_CONFIG.defaultEngine;
  
  // Set default values
  const cfgScale = options.cfgScale || 7;
  const steps = options.steps || 30;
  const samples = options.samples || 1;
  const imageStrength = options.imageStrength || 0.35;

  // Remove the data URL prefix if present
  const base64Image = options.initImage.replace(/^data:image\/\w+;base64,/, '');

  try {
    const response = await axios.post(
      `${STABILITY_CONFIG.baseUrl}/generation/${engineId}/image-to-image`,
      {
        text_prompts: [
          {
            text: options.prompt,
            weight: 1
          },
          ...(options.negativePrompt ? [{
            text: options.negativePrompt,
            weight: -1
          }] : [])
        ],
        init_image: base64Image,
        image_strength: imageStrength,
        cfg_scale: cfgScale,
        samples,
        steps,
        ...(options.seed !== undefined ? { seed: options.seed } : {})
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        responseType: 'json'
      }
    );

    // Extract base64 images from the response
    return response.data.artifacts.map((artifact: any) => {
      return `data:image/png;base64,${artifact.base64}`;
    });
  } catch (error) {
    console.error("Error generating image from image:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else {
      throw new Error("Failed to generate image. Please try again.");
    }
  }
}

// Interface for upscaling options
export interface UpscaleOptions {
  image: string; // base64 encoded image
  width?: number;
  height?: number;
  engineId?: string;
}

// Upscale an image using the Stability AI API
export async function upscaleImage(options: UpscaleOptions): Promise<string> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("Stability AI API key not found. Please set it in the API Hub.");
  }

  // Use the upscaling engine
  const engineId = "esrgan-v1-x2plus";
  
  // Remove the data URL prefix if present
  const base64Image = options.image.replace(/^data:image\/\w+;base64,/, '');

  try {
    const response = await axios.post(
      `${STABILITY_CONFIG.baseUrl}/generation/${engineId}/image-to-image/upscale`,
      {
        image: base64Image,
        width: options.width,
        height: options.height
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        responseType: 'json'
      }
    );

    // Return the base64 upscaled image
    return `data:image/png;base64,${response.data.artifacts[0].base64}`;
  } catch (error) {
    console.error("Error upscaling image:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else {
      throw new Error("Failed to upscale image. Please try again.");
    }
  }
}
