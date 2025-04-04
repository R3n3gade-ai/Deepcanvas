import { useState } from "react";
import useWorkflowStore from "../utils/workflowStore";
import { nodeTypeToColor, formatNodeType, cn } from "../utils/workflowUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NodeTypeItem {
  type: string;
  category: string;
  description: string;
  inputs?: { id: string; label: string; type: string }[];
  outputs?: { id: string; label: string; type: string }[];
}

interface NodePanelProps {
  onDragStart?: (event: React.DragEvent, nodeType: string, nodeData: any) => void;
}

// Node categories and types
const NODE_CATEGORIES = [
  {
    name: "Input/Output",
    description: "Start and end points for your workflow",
    types: [
      { type: "input", description: "Starting point of workflow", outputs: [{id: "output", label: "Output", type: "any"}] },
      { type: "output", description: "Final result collector", inputs: [{id: "input", label: "Input", type: "any"}] },
    ],
  },
  {
    name: "AI Models",
    description: "Language and embedding models",
    types: [
      { type: "llm", description: "Generate text with AI models", inputs: [{id: "prompt", label: "Prompt", type: "string"}], outputs: [{id: "response", label: "Response", type: "string"}] },
      { type: "embedding", description: "Convert text to vector embeddings", inputs: [{id: "text", label: "Text", type: "string"}], outputs: [{id: "embedding", label: "Embedding", type: "array"}] },
    ],
  },
  {
    name: "Data Handling",
    description: "Process and transform data",
    types: [
      { type: "database", description: "Query databases and datastores", inputs: [{id: "query", label: "Query", type: "string"}], outputs: [{id: "results", label: "Results", type: "array"}] },
      { type: "transform", description: "Modify and transform data format", inputs: [{id: "input", label: "Input", type: "any"}], outputs: [{id: "output", label: "Output", type: "any"}] },
      { type: "filter", description: "Filter data based on criteria", inputs: [{id: "data", label: "Data", type: "array"}], outputs: [{id: "filtered", label: "Filtered", type: "array"}] },
    ],
  },
  {
    name: "Logic & Control",
    description: "Control workflow execution",
    types: [
      { type: "code", description: "Run custom JavaScript code", inputs: [{id: "input", label: "Input", type: "any"}], outputs: [{id: "output", label: "Output", type: "any"}] },
      { type: "switch", description: "Branch based on conditions", inputs: [{id: "condition", label: "Condition", type: "boolean"}], outputs: [{id: "true", label: "True", type: "any"}, {id: "false", label: "False", type: "any"}] },
      { type: "loop", description: "Iterate over arrays of data", inputs: [{id: "items", label: "Items", type: "array"}], outputs: [{id: "item", label: "Item", type: "any"}] },
    ],
  },
  {
    name: "Integrations",
    description: "Connect to external services",
    types: [
      { type: "api", description: "Make API requests to services", inputs: [{id: "request", label: "Request", type: "object"}], outputs: [{id: "response", label: "Response", type: "object"}] },
      { type: "http", description: "Simple HTTP/REST requests", inputs: [{id: "url", label: "URL", type: "string"}], outputs: [{id: "data", label: "Data", type: "any"}] },
    ],
  },
];

export function NodePanel() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Input/Output");
  const [searchTerm, setSearchTerm] = useState("");
  const { addNode } = useWorkflowStore();

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  const handleDragStart = (event: React.DragEvent, nodeType: string, nodeTypeData: NodeTypeItem) => {
    console.log('Node drag started:', nodeType);
    
    // Format the node data
    const nodeData = {
      type: nodeType,
      label: formatNodeType(nodeType),
      inputs: nodeTypeData.inputs,
      outputs: nodeTypeData.outputs,
    };
    
    // Clear any existing data
    event.dataTransfer.clearData();
    
    // First set text/plain for fallback
    event.dataTransfer.setData('text/plain', nodeType);
    
    // Then set the ReactFlow specific data
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify(nodeData));
    
    // Set allowed effect
    event.dataTransfer.effectAllowed = 'move';
    
    // For debugging
    console.log('Drag data set:', { nodeType, nodeData });
  };

  // Filter node types based on search
  const filteredCategories = searchTerm.trim() === ""
    ? NODE_CATEGORIES
    : NODE_CATEGORIES.map(category => ({
        ...category,
        types: category.types.filter(node => 
          node.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
          node.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.types.length > 0);

  return (
    <div className="h-full w-full overflow-y-auto border-r border-gray-200 bg-white p-4 max-h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Node Types</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600">
                <HelpCircle size={16} />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3">
              <p className="text-xs">Drag and drop nodes from here to the canvas to build your workflow. Connect nodes by dragging from outputs to inputs.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Instructions */}
      <div className="mb-4 rounded-md bg-blue-50 p-3 text-xs text-blue-800">
        <p className="mb-1 font-medium">How to build a workflow:</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>Drag nodes from here to the canvas</li>
          <li>Connect nodes by dragging from an output to an input</li>
          <li>Click nodes to edit their properties</li>
          <li>Save your workflow when you're done</li>
        </ul>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search nodes..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Node Categories */}
      <div className="space-y-3">
        {filteredCategories.map((category) => (
          <div key={category.name} className="rounded-md border border-gray-200">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="flex w-full items-center justify-between bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center gap-1.5">
                <span>{category.name}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
                        <HelpCircle size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs">{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span>{expandedCategory === category.name ? "▲" : "▼"}</span>
            </button>
            
            {/* Node Types */}
            {expandedCategory === category.name && (
              <div className="space-y-1 p-2">
                {category.types.map((nodeType) => (
                  <div
                    key={nodeType.type}
                    draggable
                    onDragStart={(event) => {
                      event.stopPropagation();
                      handleDragStart(event, nodeType.type, nodeType);
                    }}
                    className="flex cursor-grab items-center rounded-md p-2 hover:bg-gray-100 active:cursor-grabbing"
                    title={`Drag to add ${formatNodeType(nodeType.type)}`}
                  >
                    <div 
                      className="mr-2 h-3 w-3 flex-shrink-0 rounded-full" 
                      style={{ backgroundColor: nodeTypeToColor(nodeType.type) }} 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{formatNodeType(nodeType.type)}</div>
                      <div className="truncate text-xs text-gray-500">{nodeType.description}</div>
                    </div>
                    <button
                      className="ml-1 rounded-sm bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add node at a default position - adjust as needed
                        const position = { x: 250, y: 150 };
                        const nodeData = {
                          type: nodeType.type,
                          label: formatNodeType(nodeType.type),
                          inputs: nodeType.inputs,
                          outputs: nodeType.outputs,
                        };
                        addNode(nodeType.type, position, nodeData);
                        console.log('Added node directly:', nodeType.type, position, nodeData);
                      }}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}