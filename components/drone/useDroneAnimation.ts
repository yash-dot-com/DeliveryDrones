'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Position3D, WeightedGraph } from '@/types';
import { findNode } from '@/lib/graph';

interface AnimationState {
  position: Position3D;
  rotation: number;
  isFlying: boolean;
  currentSegment: number;
  progress: number;
  isComplete: boolean;
}

interface UseDroneAnimationProps {
  route: string[] | null;
  graph: WeightedGraph;
  isPlaying: boolean;
  isReady?: boolean;
  speed: number;
  flyHeight?: number;
  yOffset?: number;
  onComplete?: () => void;
}

/**
 * Hook that animates the drone along the calculated route.
 * Returns the current drone position, rotation, and animation state.
 */
export function useDroneAnimation({
  route,
  graph,
  isPlaying,
  isReady = false,
  speed,
  flyHeight = 6,
  yOffset = 0,
  onComplete,
}: UseDroneAnimationProps): AnimationState {
  const [state, setState] = useState<AnimationState>({
    position: { x: 0, y: flyHeight, z: 0 },
    rotation: 0,
    isFlying: false,
    currentSegment: 0,
    progress: 0,
    isComplete: false,
  });

  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const segmentRef = useRef(0);
  const progressRef = useRef(0);

  // Build waypoints from route
  const waypoints = useCallback((): Position3D[] => {
    if (!route || route.length === 0) return [];

    // Find highest building to ensure we fly over everything
    let maxBuildingHeight = 0;
    Array.from(graph.nodes.values()).forEach(node => {
      maxBuildingHeight = Math.max(maxBuildingHeight, node.height);
    });
    const safeFlyHeight = Math.max(flyHeight, maxBuildingHeight + 2) + yOffset;

    const dropOffset = 1.0; // height above building to drop package
    const wps: Position3D[] = [];

    for (let i = 0; i < route.length; i++) {
      const node = findNode(graph, route[i]);
      if (!node) continue;

      if (i === 0) {
        // Start at dock (height 0)
        wps.push({ x: node.position.x, y: node.height + dropOffset, z: node.position.z });
        wps.push({ x: node.position.x, y: safeFlyHeight, z: node.position.z });
      } else if (i === route.length - 1) {
        // End at dock
        wps.push({ x: node.position.x, y: safeFlyHeight, z: node.position.z });
        wps.push({ x: node.position.x, y: node.height + dropOffset, z: node.position.z });
      } else {
        // Delivery node
        wps.push({ x: node.position.x, y: safeFlyHeight, z: node.position.z });
        wps.push({ x: node.position.x, y: node.height + dropOffset, z: node.position.z });
        // Add a duplicate waypoint to simulate a pause during delivery
        wps.push({ x: node.position.x, y: node.height + dropOffset, z: node.position.z });
        wps.push({ x: node.position.x, y: safeFlyHeight, z: node.position.z });
      }
    }

    return wps;
  }, [route, graph, flyHeight, yOffset]);

  // Reset animation
  const reset = useCallback(() => {
    const wp = waypoints();
    if (wp.length === 0) {
      const dock = findNode(graph, 'DOCK');
      const pos = dock
        ? { x: dock.position.x, y: flyHeight, z: dock.position.z }
        : { x: 0, y: flyHeight, z: 0 };
      setState({
        position: pos,
        rotation: 0,
        isFlying: false,
        currentSegment: 0,
        progress: 0,
        isComplete: false,
      });
    } else {
      setState({
        position: wp[0],
        rotation: 0,
        isFlying: false,
        currentSegment: 0,
        progress: 0,
        isComplete: false,
      });
    }
    segmentRef.current = 0;
    progressRef.current = 0;
  }, [waypoints, graph, flyHeight, yOffset]);

  // Reset when route changes
  useEffect(() => {
    reset();
  }, [route, reset]);

  // Reset when replay is triggered (isPlaying becomes true while isComplete is true)
  useEffect(() => {
    if (isPlaying && state.isComplete) {
      reset();
    }
  }, [isPlaying, state.isComplete, reset]);

  // Reset manually when simulation transitions back to 'ready'
  useEffect(() => {
    if (isReady) {
      reset();
    }
  }, [isReady, reset]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !route || route.length < 2) return;

    const wp = waypoints();
    if (wp.length < 2) return;
    if (segmentRef.current >= wp.length - 1) return;

    lastTimeRef.current = performance.now();

    const animate = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const seg = segmentRef.current;
      if (seg >= wp.length - 1) {
        setState((prev) => ({
          ...prev,
          position: wp[wp.length - 1],
          isFlying: false,
          isComplete: true,
        }));
        onComplete?.();
        return;
      }

      const from = wp[seg];
      const to = wp[seg + 1];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dz = to.z - from.z;
      const segDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const segSpeed = speed * 5; // units per second

      // If segment distance is extremely small (e.g. duplicate waypoint for pause), handle it gracefully
      if (segDist < 0.01) {
        progressRef.current += (speed * 0.5) * dt; // Arbitrary time for pause (e.g. ~2s at 1x speed)
      } else {
        progressRef.current += (segSpeed * dt) / segDist;
      }

      if (progressRef.current >= 1) {
        segmentRef.current++;
        progressRef.current = 0;
        animFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const t = progressRef.current;
      const px = from.x + dx * t;
      const py = from.y + dy * t;
      const pz = from.z + dz * t;

      let rotation = state.rotation; // keep previous rotation
      if (dx !== 0 || dz !== 0) {
        rotation = Math.atan2(dx, dz);
      }

      setState(prev => ({
        position: { x: px, y: py, z: pz },
        rotation,
        isFlying: true,
        currentSegment: seg,
        progress: t,
        isComplete: false,
      }));

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, route, waypoints, speed, flyHeight, yOffset, onComplete]);

  return state;
}
