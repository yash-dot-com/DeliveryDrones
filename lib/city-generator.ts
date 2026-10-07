// ============================================================
// CITY GENERATOR — Procedural city generation
// Generates buildings with random positions, sizes, and colors
// using a deterministic seed for reproducibility.
// ============================================================

import type { Building, CityConfig, CityData, DockingStation } from '@/types';
import { createRng } from './random';

const BUILDING_COLORS = [
  '#FFB3BA', // pastel pink
  '#FFDFBA', // pastel orange
  '#FFFFBA', // pastel yellow
  '#BAFFC9', // pastel green
  '#BAE1FF', // pastel blue
  '#D7BDE2', // pastel purple
  '#A3E4D7', // pale turquoise
  '#F9E79F', // soft yellow
  '#F5CBA7', // peach
  '#C39BD3', // soft amethyst
  '#7FB3D5', // soft blue
  '#82E0AA', // light emerald
];

export const DEFAULT_CITY_CONFIG: CityConfig = {
  seed: 42,
  buildingCount: 15,
  citySize: 40,
  minBuildingSize: 1.5,
  maxBuildingSize: 3.5,
  minBuildingHeight: 2,
  maxBuildingHeight: 8,
};

/**
 * Generates a city layout deterministically from a seed.
 * 
 * Buildings are placed using a Poisson-like rejection sampling:
 * we keep trying positions until they don't overlap existing buildings.
 * The docking station is placed at the centre of the city.
 */
export function generateCity(config: Partial<CityConfig> = {}): CityData {
  const cfg = { ...DEFAULT_CITY_CONFIG, ...config };
  const rng = createRng(cfg.seed);
  const halfSize = cfg.citySize / 2;

  // Place the docking station at the center
  const dockingStation: DockingStation = {
    id: 'DOCK',
    position: { x: 0, z: 0 },
  };

  const buildings: Building[] = [];
  const minGap = 2.0; // Minimum gap between building edges
  const maxAttempts = 200;

  for (let i = 0; i < cfg.buildingCount; i++) {
    let placed = false;

    for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
      const width = rng.range(cfg.minBuildingSize, cfg.maxBuildingSize);
      const depth = rng.range(cfg.minBuildingSize, cfg.maxBuildingSize);
      const x = rng.range(-halfSize + width, halfSize - width);
      const z = rng.range(-halfSize + depth, halfSize - depth);

      // Check distance from docking station (keep a clear zone)
      const dockDist = Math.sqrt(x * x + z * z);
      if (dockDist < 4) continue;

      // Check overlap with existing buildings
      let overlaps = false;
      for (const existing of buildings) {
        const dx = Math.abs(x - existing.position.x);
        const dz = Math.abs(z - existing.position.z);
        const gapX = (width + existing.width) / 2 + minGap;
        const gapZ = (depth + existing.depth) / 2 + minGap;
        if (dx < gapX && dz < gapZ) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        const height = rng.range(cfg.minBuildingHeight, cfg.maxBuildingHeight);
        const color = BUILDING_COLORS[i % BUILDING_COLORS.length];

        buildings.push({
          id: `B${i + 1}`,
          position: { x, z },
          width,
          depth,
          height,
          color,
        });
        placed = true;
      }
    }
  }

  return {
    buildings,
    dockingStation,
    config: cfg,
  };
}
