import type { RouteResult, WeightedGraph, BatteryConfig } from '@/types';
import { getEdgeWeight } from '@/lib/graph';
import { calculateBatteryStatus } from '@/lib/battery';

function calculateRouteDistance(route: string[], graph: WeightedGraph): number {
  let distance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    distance += getEdgeWeight(graph, route[i], route[i + 1]);
  }
  return distance;
}

// Fisher-Yates shuffle
function shuffleArray(array: string[]) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Find a delivery route using Random Search (Monte Carlo).
 * Generates N random routes and picks the best one.
 */
export function findRouteRandom(
  graph: WeightedGraph,
  deliveryNodes: string[],
  battery: BatteryConfig,
  iterations: number = 1000
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

  let bestRoute: string[] = [];
  let bestDistance = Infinity;

  for (let i = 0; i < iterations; i++) {
    const shuffled = shuffleArray(deliveryNodes);
    const candidateRoute = ['DOCK', ...shuffled, 'DOCK'];
    const distance = calculateRouteDistance(candidateRoute, graph);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestRoute = candidateRoute;
    }
  }

  const endTime = performance.now();

  return {
    algorithm: 'random' as any,
    route: bestRoute,
    deliveryOrder: bestRoute.slice(1, -1),
    totalDistance: bestDistance,
    isFeasible: bestDistance <= battery.maxRange,
    batteryStatus: calculateBatteryStatus(bestDistance, battery),
    executionTimeMs: endTime - startTime,
    statesEvaluated: iterations,
  };
}
