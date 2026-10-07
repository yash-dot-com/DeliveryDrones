'use client';

import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { RouteResult, WeightedGraph } from '@/types';
import { findNode } from '@/lib/graph';

interface RouteVisualizationProps {
  route: RouteResult;
  graph: WeightedGraph;
  flyHeight?: number;
  color?: string;
  yOffset?: number;
}

/**
 * Renders the calculated route as a 3D line in the scene.
 * The line follows the actual graph node positions, elevated above buildings.
 */
export function RouteVisualization({
  route,
  graph,
  flyHeight = 6,
  color = '#00E5FF',
  yOffset = 0,
}: RouteVisualizationProps) {
  const points = useMemo(() => {
    // Find highest building
    let maxBuildingHeight = 0;
    Array.from(graph.nodes.values()).forEach(node => {
      maxBuildingHeight = Math.max(maxBuildingHeight, node.height);
    });
    const safeFlyHeight = Math.max(flyHeight, maxBuildingHeight + 2);

    return route.route
      .map((nodeId) => {
        const node = findNode(graph, nodeId);
        if (!node) return null;
        return [node.position.x, safeFlyHeight + yOffset, node.position.z] as [number, number, number];
      })
      .filter((p): p is [number, number, number] => p !== null);
  }, [route.route, graph, flyHeight, yOffset]);

  if (points.length < 2) return null;

  return (
    <group>
      {/* Main route line */}
      <Line
        points={points}
        color={color}
        lineWidth={3}
        transparent
        opacity={0.8}
      />

      {/* Route direction arrows — small spheres at waypoints */}
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial
            color={i === 0 || i === points.length - 1 ? '#FFD600' : color}
          />
        </mesh>
      ))}

      {/* Vertical lines from route waypoints to ground */}
      {points.map((point, i) => {
        if (i === 0 || i === points.length - 1) return null; // skip dock
        return (
          <Line
            key={`vline-${i}`}
            points={[
              [point[0], 0.1, point[2]],
              point,
            ]}
            color={color}
            lineWidth={1}
            transparent
            opacity={0.3}
            dashed
            dashSize={0.3}
            gapSize={0.2}
          />
        );
      })}
    </group>
  );
}
