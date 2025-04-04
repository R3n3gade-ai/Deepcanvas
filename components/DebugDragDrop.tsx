import React, { useState } from 'react';

export function DebugDragDrop() {
  const [dropData, setDropData] = useState<string>('No drops yet');
  const [dragCount, setDragCount] = useState(0);
  const [allDataTypes, setAllDataTypes] = useState<string[]>([]);

  const onDragStart = (event: React.DragEvent) => {
    console.log('Debug drag start');
    event.dataTransfer.setData('text/plain', 'Test data');
    event.dataTransfer.setData('application/reactflow/type', 'test-node');
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify({type: 'test-node', label: 'Test Node'}));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    console.log('Debug drop event');
    
    try {
      // Get all available types
      const types: string[] = [];
      for (let i = 0; i < event.dataTransfer.types.length; i++) {
        types.push(event.dataTransfer.types[i]);
      }
      setAllDataTypes(types);
      
      // Try to get specific data
      const textData = event.dataTransfer.getData('text/plain') || 'No text data';
      const nodeType = event.dataTransfer.getData('application/reactflow/type') || 'No node type data';
      const nodeData = event.dataTransfer.getData('application/reactflow/data') || 'No node data';
      
      setDropData(`Dropped:\nText: ${textData}\nNode Type: ${nodeType}\nNode Data: ${nodeData}`);
      setDragCount(prev => prev + 1);
    } catch (error) {
      console.error('Error in debug drop:', error);
      setDropData(`Error: ${error}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-4">Drag Drop Debugger</h3>
      
      <div className="flex space-x-4">
        <div 
          className="w-32 h-32 bg-blue-200 flex items-center justify-center cursor-grab border rounded-md" 
          draggable 
          onDragStart={onDragStart}
        >
          Drag me<br/>(ReactFlow Data)
        </div>
        
        <div 
          className="w-64 h-32 bg-green-100 flex items-center justify-center border-2 border-dashed border-green-400 rounded-md text-xs p-2 overflow-hidden"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="overflow-y-auto h-full w-full">
            <div className="font-bold">Drop here to debug</div>
            <div className="whitespace-pre-wrap">{dropData}</div>
            <div>{dragCount} drops detected</div>
            <div className="mt-2 font-semibold">Available data types:</div>
            <ul className="list-disc pl-4">
              {allDataTypes.map((type, i) => (
                <li key={i}>{type}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
