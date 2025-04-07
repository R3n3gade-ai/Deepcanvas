import React, { useState } from 'react';
import { WorkflowExecutionResult } from '../../features/workflow/types';

interface WorkflowResultsProps {
  results: Record<string, WorkflowExecutionResult>;
  onClose?: () => void;
}

export function WorkflowResults({ results, onClose }: WorkflowResultsProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Get all node IDs from results
  const nodeIds = Object.keys(results);
  
  // Get the selected node result or the first one
  const selectedResult = selectedNodeId 
    ? results[selectedNodeId] 
    : nodeIds.length > 0 
      ? results[nodeIds[0]] 
      : null;
  
  if (nodeIds.length === 0) {
    return (
      <div className="bg-white border-l border-gray-200 w-64 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Results</h3>
          {onClose && (
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              ×
            </button>
          )}
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <p className="text-gray-500 text-center">No results available</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border-l border-gray-200 w-64 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Results</h3>
        {onClose && (
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        )}
      </div>
      
      <div className="border-b border-gray-200 p-2">
        <div className="flex flex-wrap gap-1">
          {nodeIds.map((nodeId) => (
            <button
              key={nodeId}
              className={`px-2 py-1 text-xs rounded-md ${
                selectedNodeId === nodeId ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}
              onClick={() => setSelectedNodeId(nodeId)}
            >
              Node {nodeId.split('-')[1]}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {selectedResult && (
          <div>
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div 
                  className={`w-2 h-2 rounded-full mr-2 ${
                    selectedResult.status === 'success' ? 'bg-green-500' : 
                    selectedResult.status === 'error' ? 'bg-red-500' : 
                    selectedResult.status === 'running' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} 
                />
                <span className="text-sm font-medium">Status: {selectedResult.status}</span>
              </div>
              
              {selectedResult.startTime && (
                <div className="text-xs text-gray-500 mb-1">
                  Started: {new Date(selectedResult.startTime).toLocaleString()}
                </div>
              )}
              
              {selectedResult.endTime && (
                <div className="text-xs text-gray-500 mb-1">
                  Ended: {new Date(selectedResult.endTime).toLocaleString()}
                </div>
              )}
            </div>
            
            {selectedResult.error ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <h4 className="text-sm font-medium text-red-800 mb-1">Error</h4>
                <p className="text-xs text-red-700">{selectedResult.error}</p>
              </div>
            ) : selectedResult.data ? (
              <div>
                <h4 className="text-sm font-medium mb-2">Output Data</h4>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                    {typeof selectedResult.data === 'object'
                      ? JSON.stringify(selectedResult.data, null, 2)
                      : String(selectedResult.data)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center">No data available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
