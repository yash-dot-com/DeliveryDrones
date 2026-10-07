// ============================================================
// ALGORITHM INDEX — Common interface for route optimization
//
// Both algorithms share the same input/output types.
// This module provides a unified API for running either or both.
// ============================================================

import type { AlgorithmComparison, BatteryConfig, RouteResult, WeightedGraph } from '@/types';
import { findOptimalRouteDP } from './dp-bitmask';
import { findRouteGreedy } from './greedy';
import { findRoute2Opt } from './2-opt';
import { findRouteRandom } from './random-search';

export { findOptimalRouteDP } from './dp-bitmask';
export { findRouteGreedy } from './greedy';
export { findRoute2Opt } from './2-opt';
export { findRouteRandom } from './random-search';

/**
 * Run both algorithms and return a comparison object.
 */
export function runComparison(
  graph: WeightedGraph,
  startNodeId: string,
  deliveryIds: string[],
  battery: BatteryConfig
): AlgorithmComparison {
  const dp = findOptimalRouteDP(graph, startNodeId, deliveryIds, battery);
  const greedy = findRouteGreedy(graph, startNodeId, deliveryIds, battery);
  const twoOpt = findRoute2Opt(graph, deliveryIds, battery);
  const random = findRouteRandom(graph, deliveryIds, battery);
  return { dp, greedy, twoOpt, random };
}

/**
 * Run a specific algorithm by type.
 */
export function runAlgorithm(
  algorithm: 'dp' | 'greedy',
  graph: WeightedGraph,
  startNodeId: string,
  deliveryIds: string[],
  battery: BatteryConfig
): RouteResult {
  switch (algorithm) {
    case 'dp':
      return findOptimalRouteDP(graph, startNodeId, deliveryIds, battery);
    case 'greedy':
      return findRouteGreedy(graph, startNodeId, deliveryIds, battery);
  }
}
