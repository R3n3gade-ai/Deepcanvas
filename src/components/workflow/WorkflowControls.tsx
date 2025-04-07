import React, { useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { WorkflowNodeData } from '../../features/workflow/types';

// Node type definitions
const nodeTypes = [
  {
    type: 'dataSource',
    category: 'Data',
    label: 'Data Source',
    description: 'Connect to external data sources',
    color: '#3b82f6',
    inputs: [],
    outputs: [
      { id: 'output', label: 'Output', type: 'object' }
    ]
  },
  {
    type: 'dataTransform',
    category: 'Data',
    label: 'Transform',
    description: 'Transform data from one format to another',
    color: '#8b5cf6',
    inputs: [
      { id: 'input', label: 'Input', type: 'object' }
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'object' }
    ]
  },
  {
    type: 'aiPrompt',
    category: 'AI',
    label: 'AI Prompt',
    description: 'Send a prompt to an AI model',
    color: '#10b981',
    inputs: [
      { id: 'input', label: 'Input', type: 'string' }
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'string' }
    ]
  },
  {
    type: 'condition',
    category: 'Logic',
    label: 'Condition',
    description: 'Branch based on a condition',
    color: '#f59e0b',
    inputs: [
      { id: 'input', label: 'Input', type: 'any' }
    ],
    outputs: [
      { id: 'true', label: 'True', type: 'any' },
      { id: 'false', label: 'False', type: 'any' }
    ]
  },
  {
    type: 'apiCall',
    category: 'Integration',
    label: 'API Call',
    description: 'Make an API request',
    color: '#ef4444',
    inputs: [
      { id: 'input', label: 'Input', type: 'object' }
    ],
    outputs: [
      { id: 'output', label: 'Output', type: 'object' }
    ]
  }
];

interface WorkflowControlsProps {
  onExecute?: () => void;
  onSave?: () => void;
  isExecuting?: boolean;
}

export function WorkflowControls({ onExecute, onSave, isExecuting = false }: WorkflowControlsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const reactFlowInstance = useReactFlow();

  // Filter node types based on search and category
  const filteredNodeTypes = nodeTypes.filter(nodeType => {
    const matchesSearch = nodeType.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nodeType.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? nodeType.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(nodeTypes.map(nodeType => nodeType.category)));

  // Handle node drag
  const onDragStart = (event: React.DragEvent, nodeType: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeType));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Handle node drop
  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (!reactFlowBounds) return;

    const nodeTypeString = event.dataTransfer.getData('application/reactflow');
    if (!nodeTypeString) return;

    const nodeType = JSON.parse(nodeTypeString);

    // Calculate position relative to the viewport
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    // Create a new node
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'workflowNode',
      position,
      data: {
        label: nodeType.label,
        type: nodeType.type,
        inputs: nodeType.inputs,
        outputs: nodeType.outputs,
        config: {},
        color: nodeType.color,
      },
    };

    // Add the node to the flow
    reactFlowInstance.addNodes(newNode);
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="bg-white border-l border-gray-200 w-64 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-2">Workflow Controls</h3>

        <div className="flex space-x-2 mb-4">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={onSave}
          >
            Save
          </button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            onClick={onExecute}
            disabled={isExecuting}
          >
            {isExecuting ? 'Running...' : 'Execute'}
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search nodes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <button
            className={`px-2 py-1 text-xs rounded-md ${
              selectedCategory === null ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`px-2 py-1 text-xs rounded-md ${
                selectedCategory === category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4" onDrop={onDrop} onDragOver={onDragOver}>
        <div className="space-y-2">
          {filteredNodeTypes.map((nodeType) => (
            <div
              key={nodeType.type}
              className="p-3 bg-white border border-gray-200 rounded-md shadow-sm cursor-move hover:shadow-md transition-shadow"
              draggable
              onDragStart={(event) => onDragStart(event, nodeType)}
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: nodeType.color }}
                />
                <h4 className="font-medium text-sm">{nodeType.label}</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1">{nodeType.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
