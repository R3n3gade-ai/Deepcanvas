import React, { memo } from 'react';
import { EdgeProps, getBezierPath } from '@xyflow/react';

export const WorkflowEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: selected ? 2 : 1,
          stroke: selected ? '#3b82f6' : '#b1b1b7',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {data && 'label' in data && data.label && (
        <text>
          <textPath
            href={`#${id}`}
            style={{ fontSize: '10px' }}
            startOffset="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-500"
          >
            {String(data.label)}
          </textPath>
        </text>
      )}
    </>
  );
});
