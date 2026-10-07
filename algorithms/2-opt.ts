import type { RouteResult, WeightedGraph, BatteryConfig } from '@/types';
import { getEdgeWeight } from '@/lib/graph';
import { calculateBatteryStatus } from '@/lib/battery';

/**
 * Calculates the total distance of a given route.
 */
function calculateRouteDistance(route: string[], graph: WeightedGraph): number {
  let distance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    distance += getEdgeWeight(graph, route[i], route[i + 1]);
  }
  return distance;
}

/**
 * Perform a 2-opt swap by reversing the nodes between i and k.
 */
function twoOptSwap(route: string[], i: number, k: number): string[] {
  const newRoute = [...route];
  let left = i;
  let right = k;
  while (left < right) {
    const temp = newRoute[left];
    newRoute[left] = newRoute[right];
    newRoute[right] = temp;
    left++;
    right--;
  }
  return newRoute;
}

/**
 * Find a delivery route using the 2-Opt heuristic.
 * This starts with an initial random or greedy route and iteratively improves it.
 */
export function findRoute2Opt(
  graph: WeightedGraph,
  deliveryNodes: string[],
  battery: BatteryConfig
): RouteResult {
  const startTime = performance.now();
  const n = deliveryNodes.length;

  if (n === 0) {
    return {
      route: [],
      deliveryOrder: [],
      totalDistance: 0,
      isFeasible: true,
      batteryStatus: calculateBatteryStatus(0, battery),
      executionTimeMs: 0,
      statesEvaluated: 0,
    };
  }

  // Initial Route: Dock -> Delivery Nodes -> Dock
  // We'll just use the order they are provided as the initial route.
  let bestRoute = ['DOCK', ...deliveryNodes, 'DOCK'];
  let bestDistance = calculateRouteDistance(bestRoute, graph);
  let statesEvaluated = 1;
  let improved = true;

  // 2-Opt iteratively swaps pairs of edges to find a shorter path.
  // We don't swap the first or last node (Dock).
  while (improved) {
    improved = false;
    for (let i = 1; i < bestRoute.length - 2; i++) {
      for (let k = i + 1; k < bestRoute.length - 1; k++) {
        statesEvaluated++;
        const newRoute = twoOptSwap(bestRoute, i, k);
        const newDistance = calculateRouteDistance(newRoute, graph);
        
        if (newDistance < bestDistance) {
          bestDistance = newDistance;
          bestRoute = newRoute;
          improved = true;
        }
      }
    }
  }

  const endTime = performance.now();

  return {
    algorithm: 'twoOpt' as any,
    route: bestRoute,
    deliveryOrder: bestRoute.slice(1, -1),
    totalDistance: bestDistance,
    isFeasible: bestDistance <= battery.maxRange,
    batteryStatus: calculateBatteryStatus(bestDistance, battery),
    executionTimeMs: endTime - startTime,
    statesEvaluated,
  };
}
