import { Handle, NodeProps, Position } from "@xyflow/react";
import { nodeTypeToColor, formatNodeType, cn } from "../utils/workflowUtils";
import { useState } from "react";
import { Settings, ArrowRightLeft } from "lucide-react";
import useWorkflowStore from "../utils/workflowStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NodeData {
  label: string;
  type: string;
  inputs?: { id: string; label: string; type: string }[];
  outputs?: { id: string; label: string; type: string }[];
  [key: string]: any;
}

export function WorkflowNode({ id, data, selected }: NodeProps<NodeData>) {
  const { selectNode } = useWorkflowStore();
  const nodeType = data.type || "default";
  const color = nodeTypeToColor(nodeType);
  const [expanded, setExpanded] = useState(false);
  
  // Define inputs and outputs based on node type if not provided
  let inputs = data.inputs;
  let outputs = data.outputs;
  
  if (!inputs || !outputs) {
    // Default configurations based on node type
    switch(nodeType) {
      case 'input':
        inputs = [{id: "output", label: "Output", type: "any"}];
        outputs = [{id: "output", label: "Output", type: "any"}];
        break;
      case 'output':
        inputs = [{id: "input", label: "Input", type: "any"}];
        outputs = [];
        break;
      case 'llm':
        inputs = [{id: "prompt", label: "Prompt", type: "string"}];
        outputs = [{id: "response", label: "Response", type: "string"}];
        break;
      case 'embedding':
        inputs = [{id: "text", label: "Text", type: "string"}];
        outputs = [{id: "embedding", label: "Embedding", type: "array"}];
        break;
      case 'filter':
        inputs = [{id: "data", label: "Data", type: "array"}];
        outputs = [{id: "filtered", label: "Filtered", type: "array"}];
        break;
      case 'transform':
        inputs = [{id: "input", label: "Input", type: "any"}];
        outputs = [{id: "output", label: "Output", type: "any"}];
        break;
      case 'switch':
        inputs = [{id: "condition", label: "Condition", type: "any"}];
        outputs = [{id: "true", label: "True", type: "any"}, {id: "false", label: "False", type: "any"}];
        break;
      case 'code':
        inputs = [{id: "input", label: "Input", type: "any"}];
        outputs = [{id: "output", label: "Output", type: "any"}];
        break;
      case 'api':
      case 'http':
        inputs = [{id: "request", label: "Request", type: "object"}];
        outputs = [{id: "response", label: "Response", type: "object"}];
        break;
      default:
        inputs = [{id: "default", label: "Input", type: "any"}];
        outputs = [{id: "default", label: "Output", type: "any"}];
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
        "group rounded-md border border-neutral-300 bg-white shadow-sm transition-all",
        "w-48 px-2 py-1 text-sm",
        selected ? "ring-2 ring-offset-2" : "",
        selected ? `ring-[${color}]` : ""
      )}
      style={{ borderLeft: `4px solid ${color}` }}
      onDoubleClick={handleOpenProperties}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-1">
        <div className="flex items-center gap-1.5">
          <div 
            className="h-2 w-2 rounded-full" 
            style={{ backgroundColor: color }}
          />
          <div className="font-medium truncate">{data.label || formatNodeType(nodeType)}</div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleOpenProperties}
            className="text-xs text-neutral-400 hover:text-neutral-800"
            title="Configure node"
          >
            <Settings size={12} />
          </button>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-neutral-400 hover:text-neutral-800"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Connection Instructions */}
      {!expanded && (inputs?.length > 0 || outputs?.length > 0) && (
        <div className="mt-1 flex items-center justify-center text-[10px] text-neutral-400">
          <ArrowRightLeft size={10} className="mr-1" />
          <span>Connect handles to other nodes</span>
        </div>
      )}

      {/* Input Handles */}
      {inputs && inputs.map((input, index) => (
        <TooltipProvider key={`input-${input.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Handle
                id={input.id}
                type="target"
                position={Position.Left}
                className="h-3 w-3 rounded-sm bg-blue-400 border-2 border-white transition-all hover:bg-blue-500 hover:scale-125 group-hover:shadow-[0_0_5px_2px_rgba(59,130,246,0.5)]"
                style={{ top: 32 + (index * 16) }}
                data-tip={`${input.label} (${input.type})`}
                data-for="node-tooltip"
              />
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-blue-600 text-white text-[10px] p-1">
              <p>{input.label} ({input.type})</p>
              <p className="text-[8px] mt-0.5">Drag to connect</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* Output Handles */}
      {outputs && outputs.map((output, index) => (
        <TooltipProvider key={`output-${output.id}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Handle
                id={output.id}
                type="source"
                position={Position.Right}
                className="h-3 w-3 rounded-sm bg-purple-400 border-2 border-white transition-all hover:bg-purple-500 hover:scale-125 group-hover:shadow-[0_0_5px_2px_rgba(147,51,234,0.5)]" 
                style={{ top: 32 + (index * 16) }}
                data-tip={`${output.label} (${output.type})`}
                data-for="node-tooltip"
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-purple-600 text-white text-[10px] p-1">
              <p>{output.label} ({output.type})</p>
              <p className="text-[8px] mt-0.5">Drag to connect</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}

      {/* Node Content */}
      {expanded && (
        <div className="mt-2 space-y-2 py-1 text-xs">
          {/* Input Labels */}
          <div className="space-y-1">
            {inputs && inputs.length > 0 && (
              <div className="mb-1 text-[10px] font-medium text-neutral-500">INPUTS:</div>
            )}
            {inputs && inputs.map((input) => (
              <div 
                key={`input-label-${input.id}`}
                className="flex items-center gap-1"
                style={{ marginLeft: "12px" }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                <span>{input.label}</span>
                <span className="text-[10px] text-neutral-400">({input.type})</span>
              </div>
            ))}
          </div>

          {/* Properties */}
          {Object.entries(data)
            .filter(([key]) => !['label', 'inputs', 'outputs', 'type'].includes(key))
            .slice(0, 3) // Only show first 3 properties when expanded
            .map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-1 border-t border-neutral-100 pt-1">
                <div className="text-xs font-medium text-neutral-500">{key}:</div>
                <div className="col-span-2 truncate">
                  {typeof value === 'object' 
                    ? JSON.stringify(value).slice(0, 25) + '...' 
                    : String(value).slice(0, 25)}
                </div>
              </div>
            ))}
          
          {Object.entries(data).filter(([key]) => !['label', 'inputs', 'outputs', 'type'].includes(key)).length > 3 && (
            <div className="text-center text-[10px] text-neutral-400">
              {Object.entries(data).filter(([key]) => !['label', 'inputs', 'outputs', 'type'].includes(key)).length - 3} more properties...
            </div>
          )}

          {/* Output Labels */}
          <div className="space-y-1">
            {outputs && outputs.length > 0 && (
              <div className="mb-1 text-[10px] font-medium text-neutral-500">OUTPUTS:</div>
            )}
            {outputs && outputs.map((output) => (
              <div 
                key={`output-label-${output.id}`}
                className="flex items-center justify-end gap-1"
                style={{ marginRight: "12px" }}
              >
                <span>{output.label}</span>
                <span className="text-[10px] text-neutral-400">({output.type})</span>
                <div className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}