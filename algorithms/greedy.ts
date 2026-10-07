// ============================================================
// GREEDY NEAREST NEIGHBOR — Heuristic TSP Solver
//
// Algorithm:
//   1. Start at the Docking Station.
//   2. Select the nearest unvisited delivery building.
//   3. Move to that building.
//   4. Repeat until all delivery buildings are visited.
//   5. Return to the Docking Station.
//
// This is a greedy heuristic — it does NOT guarantee an optimal
// solution. It produces a valid route but may produce a longer
// route than the DP solution.
//
// Time complexity:  O(n²)   where n = number of delivery nodes
// Space complexity: O(n)
//
// This algorithm is kept completely independent from React / Three.js.
// ============================================================

import type { BatteryConfig, RouteResult, WeightedGraph } from '@/types';
import { getEdgeWeight } from '@/lib/graph';
import { calculateBatteryStatus } from '@/lib/battery';

/**
 * Find a delivery route using the Nearest Neighbor greedy heuristic.
 *
 * @param graph        - The weighted city graph
 * @param startNodeId  - ID of the docking station (start and end)
 * @param deliveryIds  - IDs of the buildings to deliver to
 * @param battery      - Battery configuration
 * @returns            - A structured RouteResult
 */
export function findRouteGreedy(
  graph: WeightedGraph,
  startNodeId: string,
  deliveryIds: string[],
  battery: BatteryConfig
): RouteResult {
  const t0 = performance.now();
  const n = deliveryIds.length;

  // ---- Edge case: no deliveries ----
  if (n === 0) {
    const t1 = performance.now();
    return {
      algorithm: 'greedy',
      route: [startNodeId, startNodeId],
      totalDistance: 0,
      isFeasible: true,
      batteryStatus: calculateBatteryStatus(0, battery),
      executionTimeMs: t1 - t0,
      statesEvaluated: 0,
      deliveryOrder: [],
    };
  }

  // ---- Greedy nearest-neighbor construction ----
  const visited = new Set<string>();
  const deliveryOrder: string[] = [];
  let currentId = startNodeId;
  let totalDistance = 0;
  let stepsEvaluated = 0;

  while (visited.size < n) {
    let bestDist = Infinity;
    let bestId = '';

    // Find the nearest unvisited delivery node
    for (const candidateId of deliveryIds) {
      if (visited.has(candidateId)) continue;
      stepsEvaluated++;

      const d = getEdgeWeight(graph, currentId, candidateId);
      if (d < bestDist) {
        bestDist = d;
        bestId = candidateId;
      }
    }

    if (!bestId) break; // Safety: should not happen

    visited.add(bestId);
    deliveryOrder.push(bestId);
    totalDistance += bestDist;
    currentId = bestId;
  }

  // Return to docking station
  const returnDist = getEdgeWeight(graph, currentId, startNodeId);
  totalDistance += returnDist;

  const route = [startNodeId, ...deliveryOrder, startNodeId];
  const t1 = performance.now();

  return {
    algorithm: 'greedy',
    route,
    totalDistance,
    isFeasible: totalDistance <= battery.maxRange,
    batteryStatus: calculateBatteryStatus(totalDistance, battery),
    executionTimeMs: t1 - t0,
    statesEvaluated: stepsEvaluated,
    deliveryOrder,
  };
}
