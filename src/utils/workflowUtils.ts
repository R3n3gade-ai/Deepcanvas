import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { WorkflowNode, WorkflowEdge } from './workflowTypes';

// Utility function to combine Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map node types to colors for visual distinction
export function nodeTypeToColor(nodeType: string): string {
  const colorMap: Record<string, string> = {
    // Input/Output
    input: 'border-green-500 bg-green-50',
    output: 'border-red-500 bg-red-50',

    // AI Models
    llm: 'border-purple-500 bg-purple-50',
    embedding: 'border-indigo-500 bg-indigo-50',
    textToSpeech: 'border-pink-500 bg-pink-50',
    imageGeneration: 'border-fuchsia-500 bg-fuchsia-50',

    // Data Handling
    database: 'border-blue-500 bg-blue-50',
    transform: 'border-cyan-500 bg-cyan-50',
    filter: 'border-teal-500 bg-teal-50',
    vectorStore: 'border-emerald-500 bg-emerald-50',

    // Logic & Control
    code: 'border-amber-500 bg-amber-50',
    switch: 'border-orange-500 bg-orange-50',
    loop: 'border-yellow-500 bg-yellow-50',

    // Integrations
    api: 'border-sky-500 bg-sky-50',
    http: 'border-blue-500 bg-blue-50',
    apiConnect: 'border-violet-500 bg-violet-50',

    // Triggers
    webhookTrigger: 'border-rose-500 bg-rose-50',
    scheduleTrigger: 'border-amber-500 bg-amber-50',

    // API Providers
    openaiNode: 'border-green-500 bg-green-50',

    // Default
    default: 'border-gray-500 bg-gray-50'
  };

  return colorMap[nodeType] || colorMap.default;
}

// Format node type for display (camelCase to Title Case)
export function formatNodeType(nodeType: string): string {
  // Special case for acronyms
  if (nodeType.toLowerCase() === 'llm') return 'LLM';
  if (nodeType.toLowerCase() === 'api') return 'API';

  // Handle camelCase
  const formatted = nodeType
    .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter

  return formatted;
}

// Validate connection between nodes
export function validateConnection(
  sourceNode: WorkflowNode | undefined,
  targetNode: WorkflowNode | undefined,
  sourceHandle: string | undefined,
  targetHandle: string | undefined
): { valid: boolean; message?: string } {
  // Check if nodes exist
  if (!sourceNode || !targetNode) {
    return { valid: false, message: 'Source or target node not found' };
  }

  // Don't allow connections to self
  if (sourceNode.id === targetNode.id) {
    return { valid: false, message: 'Cannot connect a node to itself' };
  }

  // Don't allow output nodes to have outgoing connections
  if (sourceNode.type === 'output') {
    return { valid: false, message: 'Output nodes cannot have outgoing connections' };
  }

  // Don't allow input nodes to have incoming connections
  if (targetNode.type === 'input') {
    return { valid: false, message: 'Input nodes cannot have incoming connections' };
  }

  // Validate handle types if needed

  return { valid: true };
}

// Sort nodes topologically for execution order
export function sortNodesTopologically(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
  // Create a map of node IDs to their nodes
  const nodeMap = new Map<string, WorkflowNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));

  // Create adjacency list
  const adjacencyList = new Map<string, string[]>();
  nodes.forEach(node => adjacencyList.set(node.id, []));

  // Create in-degree map (number of incoming edges)
  const inDegree = new Map<string, number>();
  nodes.forEach(node => inDegree.set(node.id, 0));

  // Fill adjacency list and in-degree map
  edges.forEach(edge => {
    const source = edge.source;
    const target = edge.target;

    if (adjacencyList.has(source)) {
      adjacencyList.get(source)!.push(target);
    }

    if (inDegree.has(target)) {
      inDegree.set(target, inDegree.get(target)! + 1);
    }
  });

  // Queue for nodes with no incoming edges
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  // Result array
  const result: WorkflowNode[] = [];

  // Process queue
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodeMap.get(nodeId);

    if (node) {
      result.push(node);

      // Reduce in-degree of adjacent nodes
      adjacencyList.get(nodeId)!.forEach(adjacentId => {
        inDegree.set(adjacentId, inDegree.get(adjacentId)! - 1);

        // If in-degree becomes 0, add to queue
        if (inDegree.get(adjacentId) === 0) {
          queue.push(adjacentId);
        }
      });
    }
  }

  // Check if all nodes are included (if not, there's a cycle)
  if (result.length !== nodes.length) {
    console.warn('Cycle detected in workflow graph');

    // Return all nodes in some order as fallback
    const remainingNodes = nodes.filter(node => !result.some(n => n.id === node.id));
    return [...result, ...remainingNodes];
  }

  return result;
}

// Generate a unique ID for new nodes or edges
export function generateId(prefix: string = 'node'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

// Find input and output nodes in a workflow
export function findIONodes(nodes: WorkflowNode[]): { inputNodes: WorkflowNode[], outputNodes: WorkflowNode[] } {
  const inputNodes = nodes.filter(node => node.type === 'input');
  const outputNodes = nodes.filter(node => node.type === 'output');

  return { inputNodes, outputNodes };
}

// Check if a workflow is valid (has at least one input and one output node)
export function isWorkflowValid(nodes: WorkflowNode[]): { valid: boolean; message?: string } {
  const { inputNodes, outputNodes } = findIONodes(nodes);

  if (inputNodes.length === 0) {
    return { valid: false, message: 'Workflow must have at least one input node' };
  }

  if (outputNodes.length === 0) {
    return { valid: false, message: 'Workflow must have at least one output node' };
  }

  return { valid: true };
}
