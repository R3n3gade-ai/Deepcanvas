import axios from 'axios';
import { WorkflowNode, WorkflowEdge } from './workflowTypes';
import { generateId } from './workflowUtils';

// API configuration
interface GeminiConfig {
  apiKey?: string;
  baseUrl: string;
  model: string;
}

const GEMINI_CONFIG: GeminiConfig = {
  baseUrl: "https://generativelanguage.googleapis.com/v1",
  model: "gemini-1.5-pro",
  // API key will be set from local storage
};

// Local storage key for API keys
const API_KEYS_STORAGE_KEY = "studio_api_keys";

// Load API key from local storage
function loadApiKey(): string | null {
  try {
    const savedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (savedKeys) {
      const parsedKeys = JSON.parse(savedKeys);
      return parsedKeys.gemini || null;
    }
  } catch (error) {
    console.error('Error loading API key:', error);
  }
  return null;
}

// Node type definitions for the AI to understand
const NODE_TYPES = {
  input: {
    description: "Input node that provides data to the workflow",
    inputs: [],
    outputs: [{ id: "output", label: "Output", type: "any" }],
  },
  output: {
    description: "Output node that receives the final result of the workflow",
    inputs: [{ id: "input", label: "Input", type: "any" }],
    outputs: [],
  },
  llm: {
    description: "Large Language Model node for text generation and completion",
    inputs: [{ id: "prompt", label: "Prompt", type: "string" }],
    outputs: [{ id: "completion", label: "Completion", type: "string" }],
  },
  embedding: {
    description: "Embedding node that converts text to vector embeddings",
    inputs: [{ id: "text", label: "Text", type: "string" }],
    outputs: [{ id: "embedding", label: "Embedding", type: "array" }],
  },
  database: {
    description: "Database node for storing and retrieving data",
    inputs: [{ id: "data", label: "Data", type: "any" }],
    outputs: [{ id: "result", label: "Result", type: "any" }],
  },
  transform: {
    description: "Transform node that modifies data structure or format",
    inputs: [{ id: "input", label: "Input", type: "any" }],
    outputs: [{ id: "output", label: "Output", type: "any" }],
  },
  filter: {
    description: "Filter node that selects specific data based on conditions",
    inputs: [{ id: "input", label: "Input", type: "any" }],
    outputs: [{ id: "output", label: "Output", type: "any" }],
  },
  code: {
    description: "Code node that executes custom code",
    inputs: [{ id: "input", label: "Input", type: "any" }],
    outputs: [{ id: "output", label: "Output", type: "any" }],
  },
  switch: {
    description: "Switch node that routes data based on conditions",
    inputs: [{ id: "input", label: "Input", type: "any" }],
    outputs: [
      { id: "true", label: "True", type: "any" },
      { id: "false", label: "False", type: "any" },
    ],
  },
  loop: {
    description: "Loop node that iterates over data",
    inputs: [{ id: "items", label: "Items", type: "array" }],
    outputs: [
      { id: "item", label: "Item", type: "any" },
      { id: "completed", label: "Completed", type: "array" },
    ],
  },
  api: {
    description: "API node that makes HTTP requests",
    inputs: [{ id: "request", label: "Request", type: "object" }],
    outputs: [{ id: "response", label: "Response", type: "object" }],
  },
  http: {
    description: "HTTP node for making web requests",
    inputs: [{ id: "request", label: "Request", type: "object" }],
    outputs: [{ id: "response", label: "Response", type: "object" }],
  },
  textToSpeech: {
    description: "Text-to-Speech node that converts text to audio",
    inputs: [{ id: "text", label: "Text", type: "string" }],
    outputs: [{ id: "audio", label: "Audio", type: "binary" }],
  },
  imageGeneration: {
    description: "Image Generation node that creates images from text prompts",
    inputs: [{ id: "prompt", label: "Prompt", type: "string" }],
    outputs: [{ id: "image", label: "Image", type: "binary" }],
  },
  vectorStore: {
    description: "Vector Store node for semantic search and retrieval",
    inputs: [
      { id: "query", label: "Query", type: "string" },
      { id: "documents", label: "Documents", type: "array" },
    ],
    outputs: [{ id: "results", label: "Results", type: "array" }],
  },
};

// Generate a workflow from a natural language description
export async function generateWorkflowFromDescription(
  description: string,
  workflowName: string
): Promise<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }> {
  const apiKey = loadApiKey();
  if (!apiKey) {
    throw new Error("Gemini API key not found. Please set it in the Studio settings.");
  }

  GEMINI_CONFIG.apiKey = apiKey;

  // Prepare the prompt for the AI
  const prompt = `
You are a workflow designer assistant. Your task is to create a workflow based on the following description:

"${description}"

The workflow should be designed for a system that supports the following node types:
${Object.entries(NODE_TYPES)
  .map(([type, def]) => `- ${type}: ${def.description}`)
  .join("\n")}

Please generate a JSON object with two arrays:
1. "nodes": An array of workflow nodes with the following structure:
   {
     "id": string,
     "type": string (one of the node types listed above),
     "position": { "x": number, "y": number },
     "data": { ... node-specific configuration ... }
   }

2. "edges": An array of connections between nodes with the following structure:
   {
     "id": string,
     "source": string (node id),
     "sourceHandle": string (output id from source node),
     "target": string (node id),
     "targetHandle": string (input id from target node)
   }

Position the nodes in a logical flow from left to right, with appropriate spacing.
Make sure to include at least one input node and one output node.
Ensure all connections are valid based on the input/output types of each node.
Include meaningful labels and descriptions in the node data.

Return ONLY the JSON object without any additional text or explanation.
`;

  try {
    // Make API call to Gemini
    const response = await axios.post(
      `${GEMINI_CONFIG.baseUrl}/models/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 8192,
        }
      }
    );

    // Extract the generated JSON
    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Clean up the response to extract just the JSON
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }
    
    const workflowData = JSON.parse(jsonMatch[0]);
    
    // Validate the workflow data
    if (!workflowData.nodes || !Array.isArray(workflowData.nodes) || 
        !workflowData.edges || !Array.isArray(workflowData.edges)) {
      throw new Error("Invalid workflow data structure");
    }
    
    // Ensure all nodes have unique IDs
    const nodes = workflowData.nodes.map((node: any) => ({
      ...node,
      id: node.id || generateId(),
      data: {
        ...node.data,
        label: node.data?.label || `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node`,
      }
    }));
    
    // Ensure all edges have unique IDs and valid connections
    const edges = workflowData.edges.map((edge: any) => ({
      ...edge,
      id: edge.id || `e${generateId()}`,
    }));
    
    return { nodes, edges };
  } catch (error) {
    console.error("Error generating workflow:", error);
    throw new Error("Failed to generate workflow. Please try again.");
  }
}
