import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { WorkflowNodeData } from '../../features/workflow/types';

interface WorkflowNodeProps extends NodeProps {
  data: WorkflowNodeData;
}

export const WorkflowNode = memo(({ data, selected }: WorkflowNodeProps) => {
  const { label, inputs, outputs, color = '#3b82f6' } = data;

  return (
    <div
      className={`p-3 rounded-lg shadow-md border ${
        selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'
      }`}
      style={{ backgroundColor: 'white', minWidth: '180px', maxWidth: '250px' }}
    >
      {/* Node Header */}
      <div
        className="text-white text-sm font-medium p-2 rounded-t-md mb-2 flex items-center"
        style={{ backgroundColor: color }}
      >
        {data.icon && (
          <span className="mr-2">{data.icon}</span>
        )}
        <span className="truncate">{label}</span>
      </div>

      {/* Input Handles */}
      <div className="mb-3">
        {inputs.map((input, index) => (
          <div key={input.id} className="relative mb-1 pl-4 text-xs flex items-center h-6">
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white"
              style={{ left: -8, top: '50%' }}
            />
            <span className="truncate text-gray-700">{input.label}</span>
            <span className="ml-1 text-gray-400 text-xs">({input.type})</span>
          </div>
        ))}
      </div>

      {/* Output Handles */}
      <div>
        {outputs.map((output, index) => (
          <div key={output.id} className="relative mb-1 pr-4 text-xs flex items-center justify-end h-6">
            <span className="truncate text-gray-700">{output.label}</span>
            <span className="ml-1 text-gray-400 text-xs">({output.type})</span>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white"
              style={{ right: -8, top: '50%' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
});
