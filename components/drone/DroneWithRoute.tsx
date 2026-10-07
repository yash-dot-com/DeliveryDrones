'use client';

import { useDroneAnimation } from './useDroneAnimation';
import { Drone } from './Drone';
import { RouteVisualization } from '@/components/route/RouteVisualization';
import type { RouteResult, WeightedGraph } from '@/types';

interface DroneWithRouteProps {
  routeResult: RouteResult;
  graph: WeightedGraph;
  isPlaying: boolean;
  isReady?: boolean;
  speed: number;
  color: string;
  yOffset?: number;
  onComplete?: () => void;
}

export function DroneWithRoute({
  routeResult,
  graph,
  isPlaying,
  isReady = false,
  speed,
  color,
  yOffset = 0,
  onComplete,
}: DroneWithRouteProps) {
  const droneState = useDroneAnimation({
    route: routeResult.route,
    graph,
    isPlaying,
    isReady,
    speed,
    flyHeight: 6,
    yOffset,
    onComplete,
  });

  return (
    <>
      <RouteVisualization route={routeResult} graph={graph} color={color} yOffset={yOffset} />
      <Drone
        position={droneState.position}
        rotation={droneState.rotation}
        isFlying={droneState.isFlying}
        color={color}
      />
    </>
  );
}
