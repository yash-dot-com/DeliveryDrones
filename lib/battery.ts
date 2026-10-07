// ============================================================
// BATTERY MODEL — Simple distance-based battery system
//
// The drone has a maximum travel range in kilometers.
// A route is feasible only if the total round-trip distance
// (Dock → deliveries → Dock) is within battery capacity.
//
// No real battery physics. No charging stations.
// Purely: totalDistance <= maxRange
// ============================================================

import type { BatteryConfig, BatteryStatus } from '@/types';

export const DEFAULT_BATTERY_CAPACITY = 50; // km

/**
 * Calculate the battery status for a given route distance.
 */
export function calculateBatteryStatus(
  totalDistance: number,
  battery: BatteryConfig
): BatteryStatus {
  const used = totalDistance;
  const remaining = Math.max(0, battery.maxRange - totalDistance);
  const percentUsed = battery.maxRange > 0 ? (used / battery.maxRange) * 100 : 100;
  const percentRemaining = Math.max(0, 100 - percentUsed);
  const isFeasible = totalDistance <= battery.maxRange;

  return {
    capacity: battery.maxRange,
    used,
    remaining,
    percentUsed: Math.min(100, percentUsed),
    percentRemaining,
    isFeasible,
  };
}

/**
 * Check whether a route distance is within battery capacity.
 */
export function isRouteFeasible(
  totalDistance: number,
  battery: BatteryConfig
): boolean {
  return totalDistance <= battery.maxRange;
}

/**
 * Calculate the total distance of a route given an ordered list of node IDs
 * and a distance lookup function.
 */
export function calculateRouteDistance(
  route: string[],
  getDistance: (from: string, to: string) => number
): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += getDistance(route[i], route[i + 1]);
  }
  return total;
}
