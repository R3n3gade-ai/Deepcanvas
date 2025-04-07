import { NodeTypeDefinition } from './workflowTypes';

// Define all available node types with their configurations
export const NODE_TYPES: Record<string, NodeTypeDefinition> = {
  // Input/Output Nodes
  input: {
    category: 'Input/Output',
    description: 'Starting point of workflow',
    inputs: [],
    outputs: [{ id: 'output', label: 'Output', type: 'any' }],
    configFields: [
      { id: 'defaultValue', label: 'Default Value', type: 'text', placeholder: 'Default input value' },
      { id: 'description', label: 'Description', type: 'text', placeholder: 'Describe this input' }
    ]
  },
  output: {
    category: 'Input/Output',
    description: 'Final result collector',
    inputs: [{ id: 'input', label: 'Input', type: 'any' }],
    outputs: [],
    configFields: [
      { id: 'name', label: 'Output Name', type: 'text', placeholder: 'Name for this output' },
      { id: 'description', label: 'Description', type: 'text', placeholder: 'Describe this output' }
    ]
  },

  // AI Model Nodes
  llm: {
    category: 'AI Models',
    description: 'Generate text with AI models',
    inputs: [
      { id: 'prompt', label: 'Prompt', type: 'string' },
      { id: 'system', label: 'System', type: 'string', optional: true },
      { id: 'context', label: 'Context', type: 'array', optional: true }
    ],
    outputs: [
      { id: 'response', label: 'Response', type: 'string' },
      { id: 'tokens', label: 'Tokens', type: 'number' }
    ],
    configFields: [
      {
        id: 'model',
        label: 'Model',
        type: 'select',
        options: [
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
          { value: 'gemini-pro', label: 'Gemini Pro' },
          { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
          { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-opus', label: 'Claude 3 Opus' }
        ],
        defaultValue: 'gpt-4o-mini'
      },
      { id: 'temperature', label: 'Temperature', type: 'number', min: 0, max: 2, step: 0.1, defaultValue: 0.7 },
      { id: 'maxTokens', label: 'Max Tokens', type: 'number', min: 1, max: 4096, step: 1, defaultValue: 1024 },
      { id: 'systemPrompt', label: 'System Prompt', type: 'textarea', placeholder: 'You are a helpful assistant...' }
    ]
  },
  embedding: {
    category: 'AI Models',
    description: 'Convert text to vector embeddings',
    inputs: [{ id: 'text', label: 'Text', type: 'string' }],
    outputs: [{ id: 'embedding', label: 'Embedding', type: 'array' }],
    configFields: [
      {
        id: 'model',
        label: 'Model',
        type: 'select',
        options: [
          { value: 'text-embedding-3-small', label: 'OpenAI Embedding 3 Small' },
          { value: 'text-embedding-3-large', label: 'OpenAI Embedding 3 Large' },
          { value: 'text-embedding-ada-002', label: 'OpenAI Ada 002' }
        ],
        defaultValue: 'text-embedding-3-small'
      }
    ]
  },

  // Data Handling Nodes
  database: {
    category: 'Data Handling',
    description: 'Query databases and datastores',
    inputs: [
      { id: 'query', label: 'Query', type: 'string' },
      { id: 'parameters', label: 'Parameters', type: 'array', optional: true }
    ],
    outputs: [{ id: 'results', label: 'Results', type: 'array' }],
    configFields: [
      {
        id: 'connectionId',
        label: 'Connection',
        type: 'connection',
        connectionType: 'database',
        placeholder: 'Select database connection'
      },
      { id: 'query', label: 'Query', type: 'textarea', placeholder: 'SELECT * FROM users WHERE id = $1' }
    ]
  },
  transform: {
    category: 'Data Handling',
    description: 'Modify and transform data format',
    inputs: [{ id: 'input', label: 'Input', type: 'any' }],
    outputs: [{ id: 'output', label: 'Output', type: 'any' }],
    configFields: [
      {
        id: 'transformCode',
        label: 'Transform Code',
        type: 'code',
        language: 'javascript',
        placeholder: '// Input is available as "input" variable\nreturn input.map(item => {\n  return { ...item, processed: true };\n});'
      }
    ]
  },
  filter: {
    category: 'Data Handling',
    description: 'Filter data based on criteria',
    inputs: [{ id: 'data', label: 'Data', type: 'array' }],
    outputs: [{ id: 'filtered', label: 'Filtered', type: 'array' }],
    configFields: [
      {
        id: 'filterCondition',
        label: 'Filter Condition',
        type: 'code',
        language: 'javascript',
        placeholder: '// Each item is available as "item" variable\nreturn item.value > 10;'
      }
    ]
  },

  // Logic & Control Nodes
  code: {
    category: 'Logic & Control',
    description: 'Run custom JavaScript code',
    inputs: [{ id: 'input', label: 'Input', type: 'any' }],
    outputs: [{ id: 'output', label: 'Output', type: 'any' }],
    configFields: [
      {
        id: 'code',
        label: 'Code',
        type: 'code',
        language: 'javascript',
        placeholder: '// Input is available as "input" variable\n// Return the result\nreturn input * 2;'
      }
    ]
  },
  switch: {
    category: 'Logic & Control',
    description: 'Branch based on conditions',
    inputs: [{ id: 'condition', label: 'Condition', type: 'any' }],
    outputs: [
      { id: 'true', label: 'True', type: 'any' },
      { id: 'false', label: 'False', type: 'any' }
    ],
    configFields: [
      {
        id: 'condition',
        label: 'Condition',
        type: 'code',
        language: 'javascript',
        placeholder: '// Input is available as "input" variable\nreturn input === true;'
      }
    ]
  },
  loop: {
    category: 'Logic & Control',
    description: 'Iterate over arrays of data',
    inputs: [{ id: 'items', label: 'Items', type: 'array' }],
    outputs: [
      { id: 'item', label: 'Item', type: 'any' },
      { id: 'completed', label: 'Completed', type: 'array' }
    ],
    configFields: [
      {
        id: 'loopType',
        label: 'Loop Type',
        type: 'select',
        options: [
          { value: 'foreach', label: 'For Each (iterate array)' },
          { value: 'while', label: 'While (condition-based)' }
        ],
        defaultValue: 'foreach'
      },
      {
        id: 'whileCondition',
        label: 'While Condition',
        type: 'code',
        language: 'javascript',
        placeholder: '// Continue loop while this returns true\nreturn count < 10;',
        showIf: { field: 'loopType', value: 'while' }
      }
    ]
  },

  // Integrations Nodes
  api: {
    category: 'Integrations',
    description: 'Make API requests to services',
    inputs: [
      { id: 'request', label: 'Request', type: 'object' },
      { id: 'headers', label: 'Headers', type: 'object', optional: true }
    ],
    outputs: [{ id: 'response', label: 'Response', type: 'object' }],
    configFields: [
      { id: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/endpoint' },
      {
        id: 'method',
        label: 'Method',
        type: 'select',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' }
        ],
        defaultValue: 'GET'
      },
      {
        id: 'headers',
        label: 'Headers',
        type: 'json',
        placeholder: '{\n  "Content-Type": "application/json"\n}'
      }
    ]
  },
  http: {
    category: 'Integrations',
    description: 'Simple HTTP/REST requests',
    inputs: [
      { id: 'url', label: 'URL', type: 'string', optional: true },
      { id: 'body', label: 'Body', type: 'any', optional: true }
    ],
    outputs: [{ id: 'data', label: 'Data', type: 'any' }],
    configFields: [
      { id: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/data' },
      {
        id: 'method',
        label: 'Method',
        type: 'select',
        options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' }
        ],
        defaultValue: 'GET'
      }
    ]
  },

  // AI-specific Nodes
  textToSpeech: {
    category: 'AI Models',
    description: 'Convert text to speech audio',
    inputs: [{ id: 'text', label: 'Text', type: 'string' }],
    outputs: [{ id: 'audio', label: 'Audio', type: 'binary' }],
    configFields: [
      {
        id: 'voice',
        label: 'Voice',
        type: 'select',
        options: [
          { value: 'alloy', label: 'Alloy' },
          { value: 'echo', label: 'Echo' },
          { value: 'fable', label: 'Fable' },
          { value: 'onyx', label: 'Onyx' },
          { value: 'nova', label: 'Nova' },
          { value: 'shimmer', label: 'Shimmer' }
        ],
        defaultValue: 'alloy'
      },
      { id: 'speed', label: 'Speed', type: 'number', min: 0.25, max: 4.0, step: 0.25, defaultValue: 1.0 }
    ]
  },
  imageGeneration: {
    category: 'AI Models',
    description: 'Generate images from text prompts',
    inputs: [{ id: 'prompt', label: 'Prompt', type: 'string' }],
    outputs: [{ id: 'image', label: 'Image', type: 'binary' }],
    configFields: [
      {
        id: 'model',
        label: 'Model',
        type: 'select',
        options: [
          { value: 'dall-e-3', label: 'DALL-E 3' },
          { value: 'dall-e-2', label: 'DALL-E 2' },
          { value: 'stable-diffusion-3', label: 'Stable Diffusion 3' }
        ],
        defaultValue: 'dall-e-3'
      },
      {
        id: 'size',
        label: 'Size',
        type: 'select',
        options: [
          { value: '1024x1024', label: '1024x1024' },
          { value: '1024x1792', label: '1024x1792' },
          { value: '1792x1024', label: '1792x1024' }
        ],
        defaultValue: '1024x1024'
      },
      { id: 'quality', label: 'Quality', type: 'select', options: [
        { value: 'standard', label: 'Standard' },
        { value: 'hd', label: 'HD' }
      ], defaultValue: 'standard' }
    ]
  },
  vectorStore: {
    category: 'Data Handling',
    description: 'Store and retrieve vector embeddings',
    inputs: [
      { id: 'text', label: 'Text', type: 'string', optional: true },
      { id: 'embedding', label: 'Embedding', type: 'array', optional: true },
      { id: 'query', label: 'Query', type: 'string', optional: true }
    ],
    outputs: [
      { id: 'results', label: 'Results', type: 'array' },
      { id: 'embedding', label: 'Embedding', type: 'array' }
    ],
    configFields: [
      {
        id: 'operation',
        label: 'Operation',
        type: 'select',
        options: [
          { value: 'store', label: 'Store' },
          { value: 'retrieve', label: 'Retrieve' },
          { value: 'search', label: 'Similarity Search' }
        ],
        defaultValue: 'search'
      },
      { id: 'collectionName', label: 'Collection Name', type: 'text', placeholder: 'my-embeddings' },
      { id: 'topK', label: 'Top K Results', type: 'number', min: 1, max: 100, defaultValue: 5 }
    ]
  },

  // API Connect Nodes
  apiConnect: {
    category: 'Integrations',
    description: 'Use your connected API services',
    inputs: [
      { id: 'input', label: 'Input', type: 'object', optional: true }
    ],
    outputs: [
      { id: 'response', label: 'Response', type: 'object' },
      { id: 'error', label: 'Error', type: 'object', optional: true }
    ],
    configFields: [
      {
        id: 'connection',
        label: 'Connection',
        type: 'connection',
        placeholder: 'Select a connection'
      },
      {
        id: 'action',
        label: 'Action',
        type: 'select',
        placeholder: 'Select an action',
        options: [] // Will be populated dynamically based on selected connection
      },
      { id: 'parameters', label: 'Parameters', type: 'json', defaultValue: '{}' }
    ]
  },

  // Webhook Trigger
  webhookTrigger: {
    category: 'Triggers',
    description: 'Start workflow when webhook is called',
    inputs: [],
    outputs: [
      { id: 'payload', label: 'Payload', type: 'object' },
      { id: 'headers', label: 'Headers', type: 'object' }
    ],
    configFields: [
      { id: 'path', label: 'Webhook Path', type: 'text', placeholder: '/my-webhook' },
      {
        id: 'method',
        label: 'HTTP Method',
        type: 'select',
        options: [
          { value: 'ANY', label: 'Any Method' },
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' }
        ],
        defaultValue: 'POST'
      },
      { id: 'description', label: 'Description', type: 'text', placeholder: 'Describe this webhook' }
    ]
  },

  // Schedule Trigger
  scheduleTrigger: {
    category: 'Triggers',
    description: 'Start workflow on a schedule',
    inputs: [],
    outputs: [
      { id: 'timestamp', label: 'Timestamp', type: 'string' }
    ],
    configFields: [
      {
        id: 'schedule',
        label: 'Schedule Type',
        type: 'select',
        options: [
          { value: 'interval', label: 'Interval' },
          { value: 'cron', label: 'Cron Expression' },
          { value: 'fixed', label: 'Fixed Time' }
        ],
        defaultValue: 'interval'
      },
      { id: 'interval', label: 'Interval (minutes)', type: 'number', min: 1, defaultValue: 60, showIf: { field: 'schedule', value: 'interval' } },
      { id: 'cron', label: 'Cron Expression', type: 'text', placeholder: '0 * * * *', showIf: { field: 'schedule', value: 'cron' } },
      { id: 'time', label: 'Time', type: 'text', placeholder: '09:00', showIf: { field: 'schedule', value: 'fixed' } },
      { id: 'description', label: 'Description', type: 'text', placeholder: 'Describe this schedule' }
    ]
  },

  // API Provider-Specific Nodes
  openaiNode: {
    category: 'API Providers',
    description: 'Use OpenAI services',
    inputs: [
      { id: 'input', label: 'Input', type: 'object', optional: true }
    ],
    outputs: [
      { id: 'response', label: 'Response', type: 'object' },
      { id: 'error', label: 'Error', type: 'object', optional: true }
    ],
    configFields: [
      {
        id: 'connection',
        label: 'OpenAI Connection',
        type: 'connection',
        connectionType: 'openai',
        placeholder: 'Select OpenAI connection'
      },
      {
        id: 'action',
        label: 'Action',
        type: 'select',
        options: [
          { value: 'chat', label: 'Chat Completion' },
          { value: 'image', label: 'Image Generation' },
          { value: 'embedding', label: 'Embedding' },
          { value: 'moderation', label: 'Moderation' }
        ],
        defaultValue: 'chat'
      },
      { id: 'parameters', label: 'Parameters', type: 'json', defaultValue: '{}' }
    ]
  },

  // Data Transformation
  transform: {
    category: 'Data Handling',
    description: 'Transform data with JavaScript',
    inputs: [
      { id: 'input', label: 'Input', type: 'any' }
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'any' }
    ],
    configFields: [
      {
        id: 'code',
        label: 'JavaScript Code',
        type: 'code',
        language: 'javascript',
        defaultValue: 'function transform(input) {
  // Transform the input data
  return input;
}

return transform(input);'
      }
    ]
  }
};

// Helper function to get node type definition
export function getNodeTypeDefinition(type: string): NodeTypeDefinition {
  return NODE_TYPES[type] || {
    category: 'Unknown',
    description: 'Unknown node type',
    inputs: [{ id: 'input', label: 'Input', type: 'any' }],
    outputs: [{ id: 'output', label: 'Output', type: 'any' }],
    configFields: []
  };
}

// Get all node categories with their types
export function getNodeCategories() {
  const categories: Record<string, { description: string, types: string[] }> = {};

  Object.entries(NODE_TYPES).forEach(([type, definition]) => {
    if (!categories[definition.category]) {
      categories[definition.category] = {
        description: '',
        types: []
      };
    }

    categories[definition.category].types.push(type);
  });

  return Object.entries(categories).map(([name, data]) => ({
    name,
    description: data.description,
    types: data.types.map(type => ({
      type,
      ...NODE_TYPES[type]
    }))
  }));
}
