import { useCallback, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  useReactFlow,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeDragHandler,
  NodeMouseHandler,
  EdgeMouseHandler,
  Connection,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  ConnectionLineType,
  BackgroundVariant,
} from "@xyflow/react";
import { WorkflowNode } from "./WorkflowNode";
import { WorkflowEdge } from "./WorkflowEdge";
import { WorkflowControls } from "./WorkflowControls";
import { NodePropertiesPanel } from "./NodePropertiesPanel";
import { NodePanel } from "./NodePanel";
import useWorkflowStore from "../utils/workflowStore";
import { validateConnection } from "../utils/workflowUtils";
import { toast } from "sonner";

// Define custom node types
const nodeTypes: NodeTypes = {
  default: WorkflowNode,
  input: WorkflowNode,
  output: WorkflowNode,
  llm: WorkflowNode,
  embedding: WorkflowNode,
  database: WorkflowNode,
  transform: WorkflowNode,
  filter: WorkflowNode,
  code: WorkflowNode,
  switch: WorkflowNode,
  loop: WorkflowNode,
  api: WorkflowNode,
  http: WorkflowNode,
  // New node types for API Connect
  apiConnect: WorkflowNode,
  webhookTrigger: WorkflowNode,
  scheduleTrigger: WorkflowNode,
  openaiNode: WorkflowNode,
  textToSpeech: WorkflowNode,
  imageGeneration: WorkflowNode,
  vectorStore: WorkflowNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  default: WorkflowEdge,
};

export function WorkflowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const {
    nodes,
    edges,
    updateNodes,
    updateEdges,
    addNode,
    addEdge,
    selectNode,
    selectEdge,
    selectedNodeId,
    removeNode,
    removeEdge
  } = useWorkflowStore();

  // Handle node changes
  const onNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Handle node removal
      const nodeRemovals = changes.filter(
        (change) => change.type === "remove"
      );

      if (nodeRemovals.length > 0) {
        nodeRemovals.forEach((change) => {
          if (change.id) {
            removeNode(change.id);
          }
        });
        return;
      }

      // Handle other node changes
      const updatedNodes = [...nodes];
      changes.forEach((change) => {
        if (change.type === "position" && change.position && change.id) {
          const nodeIndex = updatedNodes.findIndex((n) => n.id === change.id);
          if (nodeIndex !== -1) {
            updatedNodes[nodeIndex] = {
              ...updatedNodes[nodeIndex],
              position: change.position,
            };
          }
        } else if (change.type === "select" && change.id) {
          selectNode(change.selected ? change.id : null);
        }
      });

      updateNodes(updatedNodes);
    },
    [nodes, updateNodes, removeNode, selectNode]
  );

  // Handle edge changes
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Handle edge removal
      const edgeRemovals = changes.filter(
        (change) => change.type === "remove"
      );

      if (edgeRemovals.length > 0) {
        edgeRemovals.forEach((change) => {
          if (change.id) {
            removeEdge(change.id);
          }
        });
        return;
      }

      // Handle other edge changes
      const updatedEdges = [...edges];
      changes.forEach((change) => {
        if (change.type === "select" && change.id) {
          selectEdge(change.selected ? change.id : null);
        }
      });

      updateEdges(updatedEdges);
    },
    [edges, updateEdges, removeEdge, selectEdge]
  );

  // Handle node connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      // Find source and target nodes
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      // Validate connection
      const validation = validateConnection(
        sourceNode,
        targetNode,
        connection.sourceHandle,
        connection.targetHandle
      );

      if (!validation.valid) {
        toast.error("Invalid connection", {
          description: validation.message || "Cannot connect these nodes",
        });
        return;
      }

      // Add edge
      addEdge(
        connection.source,
        connection.target,
        connection.sourceHandle,
        connection.targetHandle
      );
    },
    [nodes, addEdge]
  );

  // Handle node drag over
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle node drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      // Get node type from drag data
      const nodeType = event.dataTransfer.getData("application/reactflow/type");
      if (!nodeType) return;

      // Get node data from drag data
      let nodeData = {};
      try {
        const nodeDataStr = event.dataTransfer.getData("application/reactflow/data");
        if (nodeDataStr) {
          nodeData = JSON.parse(nodeDataStr);
        }
      } catch (error) {
        console.error("Error parsing node data:", error);
      }

      // Get drop position
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Add node
      addNode(nodeType, position, nodeData);
    },
    [reactFlowInstance, addNode]
  );

  // Handle node click
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Handle edge click
  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  // Handle pane click
  const onPaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  return (
    <div className="flex h-full">
      <div className="w-64 border-r border-gray-200">
        <NodePanel />
      </div>

      <div className="flex-1 h-full" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            connectionLineType={ConnectionLineType.SmoothStep}
            connectionLineStyle={{ stroke: "#555", strokeWidth: 2 }}
            deleteKeyCode={["Backspace", "Delete"]}
            selectionKeyCode="Shift"
            multiSelectionKeyCode="Control"
            zoomActivationKeyCode="Meta"
            panActivationKeyCode="Space"
            selectionOnDrag
            panOnScroll
            panOnDrag
            zoomOnScroll
            zoomOnPinch
            zoomOnDoubleClick
            attributionPosition="bottom-right"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="#f0f0f0"
            />
            <Controls showInteractive={false} />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
              nodeColor={(node) => {
                switch (node.type) {
                  case "input":
                    return "#22c55e";
                  case "output":
                    return "#ef4444";
                  case "llm":
                    return "#a855f7";
                  case "embedding":
                    return "#6366f1";
                  case "database":
                    return "#3b82f6";
                  case "transform":
                    return "#06b6d4";
                  case "filter":
                    return "#14b8a6";
                  case "code":
                    return "#f59e0b";
                  case "switch":
                    return "#f97316";
                  case "loop":
                    return "#eab308";
                  case "api":
                    return "#0ea5e9";
                  case "http":
                    return "#3b82f6";
                  default:
                    return "#9ca3af";
                }
              }}
            />
            <Panel position="top-center">
              <WorkflowControls />
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {selectedNodeId && (
        <div className="w-80 h-full">
          <NodePropertiesPanel />
        </div>
      )}
    </div>
  );
}
