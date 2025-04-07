import { useCallback } from "react";
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";
import useWorkflowStore from "../utils/workflowStore";
import { X } from "lucide-react";

export function WorkflowEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const { removeEdge, selectEdge, selectedEdgeId } = useWorkflowStore();
  
  const isSelected = selected || selectedEdgeId === id;
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  const onEdgeClick = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      selectEdge(id);
    },
    [id, selectEdge]
  );
  
  const onEdgeRemove = useCallback(
    (evt: React.MouseEvent) => {
      evt.stopPropagation();
      removeEdge(id);
    },
    [id, removeEdge]
  );
  
  // Determine edge style based on selection state
  const edgeStyle = {
    ...style,
    stroke: isSelected ? "#3b82f6" : style.stroke || "#555",
    strokeWidth: isSelected ? 3 : style.strokeWidth || 2,
    transition: "stroke 0.3s, stroke-width 0.3s",
  };
  
  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
        onClick={onEdgeClick}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
            background: isSelected ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.75)",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "10px",
            fontWeight: 500,
            border: isSelected ? "1px solid #3b82f6" : "1px solid #e5e7eb",
            color: isSelected ? "#3b82f6" : "#6b7280",
            boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.3s",
          }}
          className="nodrag nopan"
          onClick={onEdgeClick}
        >
          {data?.label || `${source} → ${target}`}
          
          {isSelected && (
            <button
              className="ml-2 p-0.5 text-red-500 hover:text-red-700 bg-white rounded-full"
              onClick={onEdgeRemove}
              title="Remove connection"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
