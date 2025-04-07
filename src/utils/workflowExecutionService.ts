import { Workflow, WorkflowNode, WorkflowEdge, WorkflowExecutionResult } from './workflowTypes';
import apiConnectService from './apiConnectService';
import { getProviderById } from './apiProviders';
import { toast } from 'sonner';

// Node execution functions
const nodeExecutors: Record<string, (node: WorkflowNode, inputs: Record<string, any>) => Promise<any>> = {
  // Input node - returns its default value or the provided input
  input: async (node, inputs) => {
    return node.data.defaultValue || inputs.input || null;
  },
  
  // Output node - simply passes through its input
  output: async (node, inputs) => {
    return inputs.input;
  },
  
  // API Connect node - executes an API call using the selected connection
  apiConnect: async (node, inputs) => {
    const { connection, action, parameters } = node.data;
    
    if (!connection) {
      throw new Error('No connection selected');
    }
    
    if (!action) {
      throw new Error('No action selected');
    }
    
    // Get connection details
    const connectionDetails = apiConnectService.getConnection(connection);
    if (!connectionDetails) {
      throw new Error('Connection not found');
    }
    
    // Get provider details
    const provider = getProviderById(connectionDetails.providerId);
    if (!provider) {
      throw new Error('Provider not found');
    }
    
    // Prepare parameters by merging node parameters with inputs
    const mergedParams = {
      ...JSON.parse(parameters || '{}'),
      ...inputs.input
    };
    
    // Execute the API call
    try {
      // This is a simplified implementation - in a real app, you would have
      // a more sophisticated way to map actions to API endpoints
      const result = await apiConnectService.makeApiRequest(
        connection,
        'POST', // Default to POST for simplicity
        `https://api.example.com/${action}`, // This would be determined by the action
        mergedParams
      );
      
      return result;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },
  
  // Webhook Trigger node - this would be triggered externally
  webhookTrigger: async (node, inputs) => {
    // In a real implementation, this would register a webhook endpoint
    // For now, we'll just return a mock response
    return {
      registered: true,
      url: `https://api.example.com/webhooks/${node.data.path}`,
      method: node.data.method
    };
  },
  
  // Schedule Trigger node - this would be triggered by a scheduler
  scheduleTrigger: async (node, inputs) => {
    // In a real implementation, this would register a scheduled job
    // For now, we'll just return a mock response
    return {
      scheduled: true,
      schedule: node.data.schedule,
      nextRun: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
    };
  },
  
  // OpenAI node - executes OpenAI API calls
  openaiNode: async (node, inputs) => {
    const { connection, action, parameters } = node.data;
    
    if (!connection) {
      throw new Error('No OpenAI connection selected');
    }
    
    if (!action) {
      throw new Error('No action selected');
    }
    
    // Get connection details
    const connectionDetails = apiConnectService.getConnection(connection);
    if (!connectionDetails) {
      throw new Error('Connection not found');
    }
    
    // Verify this is an OpenAI connection
    const provider = getProviderById(connectionDetails.providerId);
    if (!provider || provider.id !== 'openai') {
      throw new Error('Invalid connection type - OpenAI connection required');
    }
    
    // Prepare parameters by merging node parameters with inputs
    const mergedParams = {
      ...JSON.parse(parameters || '{}'),
      ...inputs.input
    };
    
    // Execute the OpenAI API call
    try {
      // This is a simplified implementation - in a real app, you would have
      // specific implementations for each action
      let endpoint = '';
      switch (action) {
        case 'chat':
          endpoint = 'https://api.openai.com/v1/chat/completions';
          break;
        case 'image':
          endpoint = 'https://api.openai.com/v1/images/generations';
          break;
        case 'embedding':
          endpoint = 'https://api.openai.com/v1/embeddings';
          break;
        case 'moderation':
          endpoint = 'https://api.openai.com/v1/moderations';
          break;
        default:
          throw new Error(`Unknown OpenAI action: ${action}`);
      }
      
      const result = await apiConnectService.makeApiRequest(
        connection,
        'POST',
        endpoint,
        mergedParams
      );
      
      return result;
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  },
  
  // Transform node - executes JavaScript code to transform data
  transform: async (node, inputs) => {
    const { code } = node.data;
    
    if (!code) {
      throw new Error('No transformation code provided');
    }
    
    try {
      // Create a safe execution environment
      const input = inputs.input;
      
      // Execute the code in a sandboxed environment
      // Note: In a production environment, you would want to use a more secure
      // sandbox solution like VM2 or a worker thread
      const result = new Function('input', code)(input);
      
      return result;
    } catch (error) {
      console.error('Transform code execution failed:', error);
      throw error;
    }
  }
};

// Execute a single node
async function executeNode(
  node: WorkflowNode,
  nodeInputs: Record<string, any>,
  executedNodes: Record<string, any>
): Promise<any> {
  console.log(`Executing node: ${node.id} (${node.type})`, nodeInputs);
  
  // Check if we have an executor for this node type
  const executor = nodeExecutors[node.type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${node.type}`);
  }
  
  try {
    // Execute the node
    const result = await executor(node, nodeInputs);
    
    // Store the result
    executedNodes[node.id] = result;
    
    return result;
  } catch (error) {
    console.error(`Error executing node ${node.id}:`, error);
    throw error;
  }
}

// Find input nodes for a given node
function findInputNodes(
  nodeId: string,
  edges: WorkflowEdge[],
  nodes: WorkflowNode[]
): { sourceNode: WorkflowNode; sourceHandle: string; targetHandle: string }[] {
  const inputEdges = edges.filter(edge => edge.target === nodeId);
  
  return inputEdges.map(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (!sourceNode) {
      throw new Error(`Source node not found: ${edge.source}`);
    }
    
    return {
      sourceNode,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle
    };
  });
}

// Execute a workflow
export async function executeWorkflow(workflow: Workflow): Promise<WorkflowExecutionResult> {
  const { nodes, edges } = workflow;
  
  // Find the starting nodes (input nodes)
  const startNodes = nodes.filter(node => node.type === 'input');
  
  if (startNodes.length === 0) {
    throw new Error('No input nodes found in workflow');
  }
  
  // Find the end nodes (output nodes)
  const endNodes = nodes.filter(node => node.type === 'output');
  
  if (endNodes.length === 0) {
    throw new Error('No output nodes found in workflow');
  }
  
  // Track executed nodes and their results
  const executedNodes: Record<string, any> = {};
  
  // Execute the workflow
  try {
    // Start with input nodes
    for (const startNode of startNodes) {
      await executeNode(startNode, {}, executedNodes);
    }
    
    // Find nodes that can be executed (all inputs are available)
    let nodesToExecute = nodes.filter(node => 
      node.type !== 'input' && // Skip input nodes (already executed)
      !executedNodes[node.id] && // Skip already executed nodes
      findInputNodes(node.id, edges, nodes).every(input => 
        executedNodes[input.sourceNode.id] !== undefined
      )
    );
    
    // Execute nodes until all are executed or no more can be executed
    while (nodesToExecute.length > 0) {
      for (const node of nodesToExecute) {
        // Get inputs for this node
        const inputs: Record<string, any> = {};
        const inputNodes = findInputNodes(node.id, edges, nodes);
        
        for (const input of inputNodes) {
          const sourceOutput = executedNodes[input.sourceNode.id];
          inputs[input.targetHandle] = sourceOutput;
        }
        
        // Execute the node
        await executeNode(node, inputs, executedNodes);
      }
      
      // Find next nodes to execute
      nodesToExecute = nodes.filter(node => 
        !executedNodes[node.id] && // Skip already executed nodes
        findInputNodes(node.id, edges, nodes).every(input => 
          executedNodes[input.sourceNode.id] !== undefined
        )
      );
    }
    
    // Check if all nodes were executed
    const unexecutedNodes = nodes.filter(node => !executedNodes[node.id]);
    
    if (unexecutedNodes.length > 0) {
      console.warn('Some nodes were not executed:', unexecutedNodes);
    }
    
    // Collect outputs
    const outputs: Record<string, any> = {};
    
    for (const endNode of endNodes) {
      if (executedNodes[endNode.id]) {
        outputs[endNode.data.name || endNode.id] = executedNodes[endNode.id];
      }
    }
    
    return {
      success: true,
      outputs,
      executedNodes
    };
  } catch (error) {
    console.error('Workflow execution failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executedNodes
    };
  }
}

export default {
  executeWorkflow,
  executeNode
};
