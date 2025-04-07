import { Handle, NodeProps, Position } from "@xyflow/react";
import { nodeTypeToColor, formatNodeType, cn } from "../utils/workflowUtils";
import { getNodeTypeDefinition } from "../utils/nodeTypes";
import { useState } from "react";
import { Settings, ArrowRightLeft } from "lucide-react";
import useWorkflowStore from "../utils/workflowStore";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NodeData {
  label: string;
  type: string;
  inputs?: { id: string; label: string; type: string; optional?: boolean }[];
  outputs?: { id: string; label: string; type: string; optional?: boolean }[];
  executionResult?: {
    status: string;
    output?: any;
    error?: string;
    execution_time?: number;
  };
  [key: string]: any;
}

export function WorkflowNode({ id, data, selected }: NodeProps) {
  const { selectNode } = useWorkflowStore();
  const nodeType = data.type || "default";
  const color = nodeTypeToColor(nodeType);
  const [expanded, setExpanded] = useState(false);
  
  // Get node type definition
  const nodeTypeDefinition = getNodeTypeDefinition(nodeType);
  
  // Define inputs and outputs based on node type if not provided
  const inputs = data.inputs || nodeTypeDefinition.inputs;
  const outputs = data.outputs || nodeTypeDefinition.outputs;
  
  // Determine execution status styling
  const executionStatus = data.executionResult?.status;
  let statusColor = "";
  let statusIcon = null;
  
  if (executionStatus) {
    switch (executionStatus) {
      case "success":
        statusColor = "bg-green-500";
        break;
      case "error":
        statusColor = "bg-red-500";
        break;
      case "skipped":
        statusColor = "bg-yellow-500";
        break;
      default:
        statusColor = "bg-gray-500";
    }
  }

  const handleOpenProperties = () => {
    selectNode(id);
    // Add a subtle highlight effect when opening properties
    toast.info(`Configuring ${data.label || formatNodeType(nodeType)} node`, {
      id: `node-${id}-config`,
      duration: 1500,
    });
  };

  return (
    <div 
      className={cn(
        "border-2 rounded-md shadow-sm bg-white overflow-hidden transition-all",
        color,
        selected ? "ring-2 ring-blue-500 shadow-md" : "",
        executionStatus === "error" ? "ring-2 ring-red-500" : "",
        executionStatus === "success" ? "ring-1 ring-green-500" : ""
      )}
      style={{ minWidth: 180, maxWidth: 300 }}
    >
      {/* Node Header */}
      <div className={cn(
        "flex items-center justify-between p-2 border-b",
        selected ? "bg-blue-50" : "bg-gray-50"
      )}>
        <div className="flex items-center">
          {executionStatus && (
            <div className={cn("w-2 h-2 rounded-full mr-2", statusColor)} title={`Execution: ${executionStatus}`} />
          )}
          <h3 className="text-sm font-medium truncate">
            {data.label || formatNodeType(nodeType)}
          </h3>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-xs text-neutral-400 hover:text-neutral-800" 
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▲" : "▼"}
          </button>
          <button
            onClick={handleOpenProperties}
            className="text-xs text-neutral-400 hover:text-neutral-800"
            title="Edit properties"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
      
      {/* Connection Instructions */}
      {!expanded && (inputs?.length > 0 || outputs?.length > 0) && (
        <div className="px-2 py-1 text-xs text-center text-gray-400 bg-gray-50 border-b">
          Connect handles to other nodes
        </div>
      )}
      
      {/* Input Handles */}
      {inputs && inputs.map((input, index) => (
        <Handle
          key={`input-${input.id}`}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{ 
            background: '#3b82f6', 
            width: 10, 
            height: 10,
            top: expanded ? 50 + (index * 28) : 50 + (index * 20)
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute left-2 w-2 h-2" />
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                <div>
                  <div className="font-medium">{input.label} ({input.type})</div>
                  <div className="text-gray-400">Drag to connect</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Handle>
      ))}
      
      {/* Output Handles */}
      {outputs && outputs.map((output, index) => (
        <Handle
          key={`output-${output.id}`}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{ 
            background: '#8b5cf6', 
            width: 10, 
            height: 10,
            top: expanded ? 50 + (index * 28) : 50 + (index * 20)
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute right-2 w-2 h-2" />
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                <div>
                  <div className="font-medium">{output.label} ({output.type})</div>
                  <div className="text-gray-400">Drag to connect</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Handle>
      ))}
      
      {/* Node Content */}
      {expanded && (
        <div className="p-3 text-xs">
          {/* Input Labels */}
          {inputs && inputs.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-medium text-gray-500 mb-1">INPUTS:</div>
              {inputs.map((input) => (
                <div key={input.id} className="flex items-center mb-1 ml-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                  <div className="text-gray-700">
                    {input.label} <span className="text-gray-400">({input.type})</span>
                    {input.optional && <span className="text-gray-400 ml-1">(optional)</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Properties */}
          {Object.entries(data)
            .filter(([key]) => !['label', 'inputs', 'outputs', 'type', 'executionResult'].includes(key))
            .slice(0, 3) // Only show first 3 properties when expanded
            .map(([key, value]) => (
              <div key={key} className="mb-1">
                <div className="text-gray-500 font-medium">{key}:</div>
                <div className="ml-2 text-gray-700 break-words">
                  {typeof value === 'object' 
                    ? JSON.stringify(value).slice(0, 25) + '...' 
                    : String(value).slice(0, 25)}
                </div>
              </div>
            ))}
          
          {Object.entries(data).filter(([key]) => !['label', 'inputs', 'outputs', 'type', 'executionResult'].includes(key)).length > 3 && (
            <div className="text-gray-400 text-center mt-1">
              {Object.entries(data).filter(([key]) => !['label', 'inputs', 'outputs', 'type', 'executionResult'].includes(key)).length - 3} more properties...
            </div>
          )}
          
          {/* Execution Results */}
          {data.executionResult && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-1">EXECUTION:</div>
              <div className="ml-2">
                <div className="flex items-center">
                  <div className={cn("w-2 h-2 rounded-full mr-2", statusColor)} />
                  <div className="font-medium capitalize">{data.executionResult.status}</div>
                  {data.executionResult.execution_time && (
                    <div className="ml-2 text-gray-400">
                      ({data.executionResult.execution_time.toFixed(2)}s)
                    </div>
                  )}
                </div>
                
                {data.executionResult.error && (
                  <div className="mt-1 p-1 bg-red-50 text-red-700 rounded border border-red-100">
                    {data.executionResult.error}
                  </div>
                )}
                
                {data.executionResult.output && (
                  <div className="mt-1">
                    <div className="text-gray-500">Output:</div>
                    <div className="p-1 bg-gray-50 rounded border border-gray-100 font-mono text-xs break-words">
                      {typeof data.executionResult.output === 'object'
                        ? JSON.stringify(data.executionResult.output, null, 2).slice(0, 100) + (JSON.stringify(data.executionResult.output).length > 100 ? '...' : '')
                        : String(data.executionResult.output).slice(0, 100) + (String(data.executionResult.output).length > 100 ? '...' : '')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Output Labels */}
          {outputs && outputs.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-500 mb-1">OUTPUTS:</div>
              {outputs.map((output) => (
                <div key={output.id} className="flex items-center mb-1 ml-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                  <div className="text-gray-700">
                    {output.label} <span className="text-gray-400">({output.type})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
