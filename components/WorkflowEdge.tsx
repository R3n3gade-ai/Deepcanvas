import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { useCallback } from 'react';
import useWorkflowStore from '../utils/workflowStore';

interface WorkflowEdgeData {
  sourceHandleId?: string;
  targetHandleId?: string;
  label?: string;
}

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
  selected,
  data,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { removeEdge } = useWorkflowStore();
  const edgeData = data as WorkflowEdgeData | undefined;
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeDoubleClick = useCallback(
    (evt: React.MouseEvent<SVGPathElement, MouseEvent>) => {
      evt.stopPropagation();
      removeEdge(id);
    },
    [id, removeEdge]
  );

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: selected ? '#6366f1' : style.stroke || '#555',
          strokeWidth: selected ? 3 : style.strokeWidth || 2,
          transition: 'stroke 0.3s, stroke-width 0.3s',
          cursor: 'pointer',
        }}
        onDoubleClick={onEdgeDoubleClick}
      />
      
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              padding: '2px 4px',
              fontSize: 10,
              fontWeight: 500,
              background: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 4,
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              color: '#333',
              userSelect: 'none',
            }}
            className="nodrag nopan"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Flow direction indicators */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${(sourceX + targetX) / 2}px,${(sourceY + targetY) / 2}px)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
          className="edge-flow-indicator"
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="8" fill="white" opacity="0.8" />
            <path
              d="M5 8h6M11 8l-2 -2M11 8l-2 2"
              stroke={selected ? '#6366f1' : '#555'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
