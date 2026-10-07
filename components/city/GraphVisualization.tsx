'use client';

import { useMemo } from 'react';
import { Line, Html } from '@react-three/drei';
import type { WeightedGraph } from '@/types';
import { getEdgeWeight } from '@/lib/graph';

interface GraphVisualizationProps {
  graph: WeightedGraph;
  selectedIds: Set<string>;
}

const HTML_STYLE: React.CSSProperties = { pointerEvents: 'none', zIndex: 0 };

/**
 * Renders the edges between all selected buildings and the docking station.
 * Displays the distance on each edge.
 */
export function GraphVisualization({ graph, selectedIds }: GraphVisualizationProps) {
  const edges = useMemo(() => {
    const nodesToConnect = ['DOCK', ...Array.from(selectedIds)];
    const edgesList: { p1: [number, number, number]; p2: [number, number, number]; distance: string; mid: [number, number, number] }[] = [];

    // Fully connected graph between selected nodes
    for (let i = 0; i < nodesToConnect.length; i++) {
      for (let j = i + 1; j < nodesToConnect.length; j++) {
        const n1 = graph.nodes.get(nodesToConnect[i]);
        const n2 = graph.nodes.get(nodesToConnect[j]);
        if (n1 && n2) {
          const dist = getEdgeWeight(graph, n1.id, n2.id);
          edgesList.push({
            p1: [n1.position.x, 0.5, n1.position.z],
            p2: [n2.position.x, 0.5, n2.position.z],
            distance: dist.toFixed(1) + 'km',
            mid: [(n1.position.x + n2.position.x) / 2, 0.5, (n1.position.z + n2.position.z) / 2],
          });
        }
      }
    }
    return edgesList;
  }, [graph, selectedIds]);

  return (
    <group>
      {edges.map((edge, i) => (
        <group key={i}>
          <Line
            points={[edge.p1, edge.p2]}
            color="#334155" // slate-700
            lineWidth={1}
            transparent
            opacity={0.3}
          />
          <group position={edge.mid}>
            <Html center style={HTML_STYLE}>
              <div className="px-1 py-0.5 rounded bg-background/80 backdrop-blur border border-border text-[8px] text-muted-foreground font-mono whitespace-nowrap shadow-sm">
                {edge.distance}
              </div>
            </Html>
          </group>
        </group>
      ))}
    </group>
  );
}
