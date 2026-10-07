// ============================================================
// DYNAMIC PROGRAMMING WITH BITMASK — TSP Variant Solver
//
// Problem:
//   Given a set of delivery locations and a fixed start/end
//   (docking station), find the minimum-cost Hamiltonian path
//   that visits every delivery location exactly once and returns
//   to the docking station, subject to a battery constraint.
//
// State representation:
//   dp[mask][i] = minimum distance to reach delivery node i,
//   having visited exactly the set of delivery nodes indicated
//   by `mask`, starting from the docking station.
//
//   mask: a bitmask of length n (number of delivery nodes).
//         bit j is set if delivery node j has been visited.
//   i:    index of the current delivery node (0-indexed into
//         the deliveryNodes array).
//
// Base case:
//   dp[1 << i][i] = dist(dock, deliveryNodes[i])
//   (Go directly from dock to delivery node i.)
//
// Transition:
//   dp[mask | (1 << i)][i] = min over all j where bit j is set in mask
//     of (dp[mask][j] + dist(deliveryNodes[j], deliveryNodes[i]))
//   (Extend the path: arrive at i from some previously-visited j.)
//
// Answer:
//   min over all i of (dp[fullMask][i] + dist(deliveryNodes[i], dock))
//   where fullMask = (1 << n) - 1 (all delivery nodes visited).
//
// Route reconstruction:
//   Track parent[mask][i] = the previous node j that led to state (mask, i).
//   Backtrack from the optimal final state to recover the full order.
//
// Time complexity:  O(2^n × n²)    where n = number of delivery nodes
// Space complexity: O(2^n × n)
//
// This algorithm is kept completely independent from React / Three.js.
// ============================================================

import type { BatteryConfig, RouteResult, WeightedGraph } from '@/types';
import { buildDistanceMatrix, getEdgeWeight } from '@/lib/graph';
import { calculateBatteryStatus } from '@/lib/battery';

/**
 * Find the optimal delivery route using DP with Bitmasking.
 *
 * @param graph        - The weighted city graph
 * @param startNodeId  - ID of the docking station (start and end)
 * @param deliveryIds  - IDs of the buildings to deliver to
 * @param battery      - Battery configuration
 * @returns            - A structured RouteResult
 */
export function findOptimalRouteDP(
  graph: WeightedGraph,
  startNodeId: string,
  deliveryIds: string[],
  battery: BatteryConfig
): RouteResult {
  const t0 = performance.now();

  // ---- Edge cases ----
  const n = deliveryIds.length;

  if (n === 0) {
    const t1 = performance.now();
    return {
      algorithm: 'dp',
      route: [startNodeId, startNodeId],
      totalDistance: 0,
      isFeasible: true,
      batteryStatus: calculateBatteryStatus(0, battery),
      executionTimeMs: t1 - t0,
      statesEvaluated: 0,
      deliveryOrder: [],
    };
  }

  if (n === 1) {
    const d = deliveryIds[0];
    const distOut = getEdgeWeight(graph, startNodeId, d);
    const distBack = getEdgeWeight(graph, d, startNodeId);
    const totalDistance = distOut + distBack;
    const t1 = performance.now();
    return {
      algorithm: 'dp',
      route: [startNodeId, d, startNodeId],
      totalDistance,
      isFeasible: totalDistance <= battery.maxRange,
      batteryStatus: calculateBatteryStatus(totalDistance, battery),
      executionTimeMs: t1 - t0,
      statesEvaluated: 1,
      deliveryOrder: [d],
    };
  }

  // ---- Build distance matrix for relevant nodes ----
  // Index 0 in our internal arrays corresponds to the docking station.
  // Indices 1..n correspond to deliveryIds[0..n-1].
  const allIds = [startNodeId, ...deliveryIds];
  const dist = buildDistanceMatrix(graph, allIds);

  // ---- DP table ----
  const totalStates = 1 << n; // 2^n possible subsets of delivery nodes
  const INF = Infinity;

  // dp[mask][i]: min distance to visit the delivery nodes in `mask`,
  // ending at delivery node i (0-indexed among delivery nodes).
  // We allocate flat arrays for performance.
  const dp: number[][] = Array.from({ length: totalStates }, () =>
    new Array(n).fill(INF)
  );
  const parent: number[][] = Array.from({ length: totalStates }, () =>
    new Array(n).fill(-1)
  );

  let statesEvaluated = 0;

  // ---- Base case: go directly from dock to each delivery node ----
  for (let i = 0; i < n; i++) {
    const mask = 1 << i;
    dp[mask][i] = dist[0][i + 1]; // dist from dock (index 0) to delivery node i (index i+1)
    statesEvaluated++;
  }

  // ---- Fill DP table ----
  for (let mask = 1; mask < totalStates; mask++) {
    for (let last = 0; last < n; last++) {
      // Skip if `last` is not in the current mask
      if (!(mask & (1 << last))) continue;
      if (dp[mask][last] === INF) continue;

      // Try extending to each unvisited delivery node
      for (let next = 0; next < n; next++) {
        if (mask & (1 << next)) continue; // already visited

        const newMask = mask | (1 << next);
        const newDist = dp[mask][last] + dist[last + 1][next + 1];
        statesEvaluated++;

        if (newDist < dp[newMask][next]) {
          dp[newMask][next] = newDist;
          parent[newMask][next] = last;
        }
      }
    }
  }

  // ---- Find optimal ending node ----
  const fullMask = totalStates - 1; // All delivery nodes visited
  let bestDist = INF;
  let bestLast = -1;

  for (let i = 0; i < n; i++) {
    const totalDist = dp[fullMask][i] + dist[i + 1][0]; // + return to dock
    if (totalDist < bestDist) {
      bestDist = totalDist;
      bestLast = i;
    }
  }

  // ---- Reconstruct route ----
  const deliveryOrder: string[] = [];
  if (bestLast !== -1 && bestDist < INF) {
    let currentMask = fullMask;
    let currentNode = bestLast;

    while (currentNode !== -1) {
      deliveryOrder.push(deliveryIds[currentNode]);
      const prevNode = parent[currentMask][currentNode];
      currentMask ^= 1 << currentNode; // Remove current node from mask
      currentNode = prevNode;
    }

    deliveryOrder.reverse();
  }

  const route = [startNodeId, ...deliveryOrder, startNodeId];
  const totalDistance = bestDist === INF ? Infinity : bestDist;
  const t1 = performance.now();

  return {
    algorithm: 'dp',
    route,
    totalDistance,
    isFeasible: totalDistance <= battery.maxRange,
    batteryStatus: calculateBatteryStatus(totalDistance, battery),
    executionTimeMs: t1 - t0,
    statesEvaluated,
    deliveryOrder,
  };
}
