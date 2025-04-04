import React, { useCallback, useRef, useState, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap,
  NodeTypes,
  Panel, 
  useReactFlow, 
  OnConnect,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  ConnectionMode,
  OnConnectStart,
  OnConnectEnd,
  EdgeTypes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';

import { WorkflowNode } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import { NodeConfigPanel } from './NodeConfigPanel';
import useWorkflowStore from '../utils/workflowStore';

// Workflow styles are in index.css

// Register custom node types
const nodeTypes: NodeTypes = {
  default: WorkflowNode,
  input: WorkflowNode,
  output: WorkflowNode,
  llm: WorkflowNode,
  embedding: WorkflowNode,
  search: WorkflowNode,
  database: WorkflowNode,
  filter: WorkflowNode,
  transform: WorkflowNode,
  code: WorkflowNode,
  math: WorkflowNode,
  map: WorkflowNode,
  reduce: WorkflowNode,
  switch: WorkflowNode,
  loop: WorkflowNode,
  api: WorkflowNode,
  http: WorkflowNode,
  trigger: WorkflowNode,
  timer: WorkflowNode,
  file: WorkflowNode,
  image: WorkflowNode,
  audio: WorkflowNode,
  video: WorkflowNode,
};

// Register custom edge types
const edgeTypes = {
  default: WorkflowEdge,
  data: WorkflowEdge,
  control: WorkflowEdge,
};

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { nodes, edges, updateNodes, updateEdges, addNode, addEdge, selectNode, selectEdge, selectedNodeId } = useWorkflowStore();
  const { project } = useReactFlow();
  
  // Local state to manage ReactFlow's internal state
  const [reactFlowNodes, setReactFlowNodes, onNodesChange] = useNodesState(nodes);
  const [reactFlowEdges, setReactFlowEdges, onEdgesChange] = useEdgesState(edges);
  const [connectionStartNodeId, setConnectionStartNodeId] = useState<string | null>(null);
  
  // Update local state when store changes
  React.useEffect(() => {
    setReactFlowNodes(nodes);
    setReactFlowEdges(edges);
  }, [nodes, edges, setReactFlowNodes, setReactFlowEdges]);
  
  // Update store when local state changes
  React.useEffect(() => {
    updateNodes(reactFlowNodes);
    updateEdges(reactFlowEdges);
  }, [reactFlowNodes, reactFlowEdges, updateNodes, updateEdges]);


  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      console.log('Drop event triggered in ReactFlow component');

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) {
        console.error('No flow bounds');
        return;
      }

      // Log available data types
      console.log('Available data types:', event.dataTransfer.types);
      
      // Get node type and data from drag event
      const nodeType = event.dataTransfer.getData('application/reactflow/type') || 
                       event.dataTransfer.getData('text/plain');
      
      const nodeDataStr = event.dataTransfer.getData('application/reactflow/data');
      
      console.log('Drop data received:', { nodeType, nodeDataStr });
      
      if (!nodeType) {
        console.error('No node type found in drop event');
        return;
      }

      try {
        // Parse the node data safely
        const nodeData = nodeDataStr ? JSON.parse(nodeDataStr) : {};

        // Calculate position where to place the new node
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        console.log('Adding node to position:', { position, nodeType, nodeData });

        // Add node to the store
        addNode(nodeType, position, nodeData);
      } catch (error) {
        console.error('Error processing node data:', error);
      }
    },
    [project, addNode]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        console.log('Connection created:', connection);
        
        // Check that we're not trying to connect a node to itself
        if (connection.source === connection.target) {
          toast.error('Cannot connect a node to itself', {
            description: 'Please connect to a different node',
            position: 'bottom-center',
          });
          return;
        }
        
        // Get the nodes to check connection compatibility
        const sourceNode = nodes.find(node => node.id === connection.source);
        const targetNode = nodes.find(node => node.id === connection.target);
        
        if (!sourceNode || !targetNode) {
          toast.error('Cannot find nodes to connect');
          return;
        }
        
        // Validate connection types if needed in the future
        // For now, we'll add a simple validation based on node types to demonstrate the concept
        const sourceType = sourceNode.type || 'default';
        const targetType = targetNode.type || 'default';
        
        // Example validation rule: trigger nodes can only connect to action nodes
        if (sourceType === 'trigger' && targetType === 'trigger') {
          toast.error('Invalid connection', {
            description: 'Trigger nodes cannot connect to other trigger nodes',
            position: 'bottom-center',
          });
          return;
        }
        
        // Add the edge
        addEdge(
          connection.source,
          connection.target,
          connection.sourceHandle || undefined,
          connection.targetHandle || undefined
        );
      }
    },
    [addEdge, nodes]
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    selectNode(node.id);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    selectEdge(edge.id);
  };

  const onPaneClick = () => {
    selectNode(null);
    selectEdge(null);
  };

  // Track connection start and end for visual feedback
  const onConnectStart: OnConnectStart = useCallback((_, { nodeId, handleId, handleType }) => {
    if (nodeId) {
      setConnectionStartNodeId(nodeId);
      // Add visual indicator class to all possible target nodes
      setReactFlowNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) {
            return {
              ...node,
              className: 'possible-connection-target',
            };
          }
          return {
            ...node,
            className: 'connection-source',
          };
        })
      );
      
      // Show tooltip about dragging connection
      toast.info(
        handleType === 'source' ? 
          'Drag to connect to another node\'s input' : 
          'Drag to connect from another node\'s output',
        {
          id: 'connection-info',
          duration: 2000,
        }
      );
    }
  }, [setReactFlowNodes]);

  const onConnectEnd: OnConnectEnd = useCallback(() => {
    setConnectionStartNodeId(null);
    // Remove visual indicator class from all nodes
    setReactFlowNodes((nds) =>
      nds.map((node) => ({
        ...node,
        className: undefined,
      }))
    );
    
    // Dismiss any connection tooltips
    toast.dismiss('connection-info');
    
    // Using setTimeout to ensure the class reset happens after connection events
    setTimeout(() => {
      // Double check that the classes are reset - fixes connection visual feedback
      setReactFlowNodes((nds) =>
        nds.map((node) => ({
          ...node,
          className: undefined,
        }))
      );
    }, 100);
  }, [setReactFlowNodes]);

  const isValidConnection = useCallback(
    (connection: Connection) => {
      // Don't allow connections to self
      if (connection.source === connection.target) {
        return false;
      }

      // Get nodes to check compatibility
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);
      
      if (!sourceNode || !targetNode) {
        return false;
      }
      
      // Simple validation based on node types
      const sourceType = sourceNode.type || 'default';
      const targetType = targetNode.type || 'default';
      
      // Example validation rule: trigger nodes can only connect to action nodes
      if (sourceType === 'trigger' && targetType === 'trigger') {
        return false;
      }
      
      return true;
    },
    [nodes]
  );

  return (
    <div className="h-full w-full relative bg-gray-50 border border-gray-200 rounded-md" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={nodes.length > 0}
        snapToGrid
        snapGrid={[15, 15]}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ 
          stroke: '#6366f1', 
          strokeWidth: 3, 
          strokeDasharray: '5 5',
          animation: 'dashdraw 0.5s linear infinite',
          filter: 'drop-shadow(0 0 3px rgba(99, 102, 241, 0.4))'
        }}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Strict}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#555', 
            strokeWidth: 2,
            transition: 'stroke 0.3s, stroke-width 0.3s',
          },
        }}
        proOptions={{ hideAttribution: true }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Control', 'Meta']}
        className="touch-none"
      >
        <Background color="#aaa" gap={16} variant="dots" />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          nodeBorderRadius={2}
        />
        
        {/* Node Configuration Panel - Draggable */}
        {selectedNodeId && <NodeConfigPanel onClose={() => selectNode(null)} />}
        
        {/* Empty state - show when no nodes */}
        {nodes.length === 0 && (
          <Panel position="center" className="pointer-events-none">
            <div className="bg-white/90 p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Your canvas is empty</h3>
              <p className="text-gray-600 mb-4">Drag elements from the left panel to create your workflow</p>
              <p className="text-sm text-gray-500">Tip: Connect nodes by dragging from one handle to another</p>
            </div>
          </Panel>
        )}
        
        {/* Connection hint tooltip appears conditionally via toast on connection start */}
      </ReactFlow>
    </div>
  );
}