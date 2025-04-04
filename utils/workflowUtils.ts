import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useWorkflowStore } from './workflowStore';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function nodeTypeToColor(nodeType: string): string {
  const types: Record<string, string> = {
    input: '#00bfff',
    output: '#009900',
    text: '#a855f7',
    llm: '#ff9900',
    embedding: '#ff66cc',
    search: '#9966ff',
    database: '#00b3b3',
    filter: '#cc6600',
    transform: '#1a66ff',
    code: '#333333',
    math: '#3399ff',
    map: '#009999',
    reduce: '#ff6666',
    switch: '#ff3333',
    loop: '#6600cc',
    api: '#00cc66',
    http: '#cc0066',
    trigger: '#ff0066',
    timer: '#ff6600',
    file: '#339933',
    image: '#cc00cc',
    audio: '#0066cc',
    video: '#336600',
    default: '#888888',
  };
  
  return types[nodeType.toLowerCase()] || types.default;
}

export function formatNodeType(nodeType: string): string {
  return nodeType.charAt(0).toUpperCase() + nodeType.slice(1).replace(/([A-Z])/g, ' $1').trim();
}

// Create empty workflow object with default values
export const getEmptyWorkflow = (name: string, description?: string) => {
  return {
    id: 'temp-' + Math.random().toString(36).substring(2, 9),
    name,
    description: description || '',
    nodes: [],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// Format date in a readable way
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get node counts by type
export const getNodeCounts = (nodes: any[]): Record<string, number> => {
  return nodes.reduce((counts: Record<string, number>, node) => {
    const type = node.type || 'unknown';
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});
};

// Generate a unique node ID
export const generateNodeId = (type: string): string => {
  return `${type.toLowerCase()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Create a new node with default properties
export const createNewNode = (type: string, position: { x: number; y: number }, data?: any) => {
  return {
    id: generateNodeId(type),
    type,
    position,
    data: {
      label: formatNodeType(type),
      type: type,
      ...data
    }
  };
};

// Create a new edge between nodes
export const createNewEdge = (source: string, target: string, sourceHandle?: string, targetHandle?: string) => {
  return {
    id: `e-${source}-${target}-${Math.random().toString(36).substring(2, 5)}`,
    source,
    target,
    sourceHandle,
    targetHandle,
    animated: true,
    style: { stroke: '#555' },
  };
};

// Check if a workflow is valid (has required structure)
export const isWorkflowValid = (workflow: any): boolean => {
  // Basic validation
  if (!workflow || typeof workflow !== 'object') return false;
  
  // Check for required fields
  if (!workflow.name || !Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) {
    return false;
  }
  
  // Additional validation could be added here
  // For example, check if there's at least one input and one output node
  const hasInputNode = workflow.nodes.some((node: any) => node.type === 'input');
  const hasOutputNode = workflow.nodes.some((node: any) => node.type === 'output');
  
  return hasInputNode && hasOutputNode;
};

// Get node type categories for organizing node selection panel
export const getNodeTypeCategories = () => {
  return [
    {
      name: 'Basic',
      types: ['input', 'output', 'text']
    },
    {
      name: 'AI',
      types: ['llm', 'embedding', 'search']
    },
    {
      name: 'Data',
      types: ['database', 'file', 'transform']
    },
    {
      name: 'Logic',
      types: ['filter', 'map', 'reduce', 'switch', 'loop']
    },
    {
      name: 'Integration',
      types: ['api', 'http', 'trigger', 'timer']
    },
    {
      name: 'Media',
      types: ['image', 'audio', 'video']
    },
    {
      name: 'Development',
      types: ['code', 'math']
    }
  ];
};

export { useWorkflowStore };