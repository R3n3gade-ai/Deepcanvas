import { useState } from "react";
import useWorkflowStore from "../utils/workflowStore";
import { nodeTypeToColor, formatNodeType, cn } from "../utils/workflowUtils";
import { getNodeCategories } from "../utils/nodeTypes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface NodeTypeItem {
  type: string;
  category: string;
  description: string;
  inputs?: { id: string; label: string; type: string; optional?: boolean }[];
  outputs?: { id: string; label: string; type: string; optional?: boolean }[];
}

interface NodePanelProps {
  onDragStart?: (event: React.DragEvent, nodeType: string, nodeData: any) => void;
}

// Get node categories from the nodeTypes utility
const NODE_CATEGORIES = getNodeCategories();

export function NodePanel() {
  const [expandedCategory, setExpandedCategory] = useState("Input/Output");
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
    <div className="flex flex-col h-full overflow-hidden bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Node Types</h3>
        <p className="text-sm text-gray-500 mt-1">
          Drag and drop nodes from here to the canvas to build your workflow. Connect nodes by dragging from outputs to inputs.
        </p>
        
        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
          <h4 className="text-sm font-medium text-blue-800 mb-1">How to build a workflow:</h4>
          <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
            <li>Drag nodes from here to the canvas</li>
            <li>Connect nodes by dragging from an output to an input</li>
            <li>Click nodes to edit their properties</li>
            <li>Save your workflow when you're done</li>
          </ul>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search nodes..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Node Categories */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.name} className="border-b border-gray-200 last:border-b-0">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="flex w-full items-center justify-between bg-gray-50 px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center">
                <span>{category.name}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="ml-1.5 text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()}>
                        <HelpCircle size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="max-w-xs text-xs">{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span>{expandedCategory === category.name ? "▲" : "▼"}</span>
            </button>
            
            {/* Node Types */}
            {expandedCategory === category.name && (
              <div className="p-2 space-y-1">
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
                    <div className={cn("w-2 h-8 rounded-sm mr-2", nodeTypeToColor(nodeType.type).split(' ')[0])} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{formatNodeType(nodeType.type)}</div>
                      <div className="text-xs text-gray-500 truncate">{nodeType.description}</div>
                    </div>
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
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
