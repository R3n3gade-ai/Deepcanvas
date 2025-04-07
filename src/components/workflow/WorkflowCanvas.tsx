import React, { useCallback, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  NodeTypes,
  EdgeTypes,
  useReactFlow,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionLineType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { WorkflowNode } from './WorkflowNode';
import { WorkflowEdge } from './WorkflowEdge';
import { Workflow } from '../../features/workflow/types';

// Define custom node types
const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  workflowEdge: WorkflowEdge,
};

interface WorkflowCanvasProps {
  workflow: Workflow;
  onWorkflowChange?: (workflow: Workflow) => void;
  readOnly?: boolean;
}

export function WorkflowCanvas({ workflow, onWorkflowChange, readOnly = false }: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Initialize nodes and edges from the workflow
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges);

  // Handle node changes
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      if (readOnly) return;
      onNodesChange(changes);

      // Update the workflow with the new nodes
      if (onWorkflowChange) {
        const updatedWorkflow = {
          ...workflow,
          nodes: nodes,
          edges: edges,
          updatedAt: new Date().toISOString(),
        };
        onWorkflowChange(updatedWorkflow);
      }
    },
    [onNodesChange, onWorkflowChange, workflow, nodes, edges, readOnly]
  );

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (readOnly) return;
      onEdgesChange(changes);

      // Update the workflow with the new edges
      if (onWorkflowChange) {
        const updatedWorkflow = {
          ...workflow,
          nodes: nodes,
          edges: edges,
          updatedAt: new Date().toISOString(),
        };
        onWorkflowChange(updatedWorkflow);
      }
    },
    [onEdgesChange, onWorkflowChange, workflow, nodes, edges, readOnly]
  );

  // Handle connections between nodes
  const handleConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (readOnly) return;

      // Create a new edge
      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
        source: connection.source || '',
        sourceHandle: connection.sourceHandle || '',
        target: connection.target || '',
        targetHandle: connection.targetHandle || '',
        type: 'workflowEdge',
        animated: true,
      };

      setEdges((eds) => [...eds, newEdge]);

      // Update the workflow with the new edge
      if (onWorkflowChange) {
        const updatedWorkflow = {
          ...workflow,
          nodes: nodes,
          edges: [...edges, newEdge],
          updatedAt: new Date().toISOString(),
        };
        onWorkflowChange(updatedWorkflow);
      }
    },
    [setEdges, onWorkflowChange, workflow, nodes, edges, readOnly]
  );

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.Bezier}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={4}
        onInit={setReactFlowInstance}
        fitView
        attributionPosition="bottom-right"
        // connectionMode="strict"
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'workflowNode') return '#0041d0';
            return '#eee';
          }}
          nodeColor={(n) => {
            if (n.type === 'workflowNode') return '#3b82f6';
            return '#fff';
          }}
          nodeBorderRadius={2}
        />
        <Panel position="top-right">
          <div className="bg-white p-2 rounded-md shadow-md">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              onClick={() => {
                if (reactFlowInstance) {
                  reactFlowInstance.fitView();
                }
              }}
            >
              Fit View
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
