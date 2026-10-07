// ============================================================
// CORE TYPES — Drone Delivery Route Optimizer
// ============================================================

// ---- Coordinates & Positions ----

export interface Position2D {
  x: number;
  z: number;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

// ---- City & Buildings ----

export interface Building {
  id: string;
  position: Position2D;
  width: number;
  depth: number;
  height: number; // Visual only — not used in algorithm
  color: string;
}

export interface DockingStation {
  id: string;
  position: Position2D;
}

export interface CityConfig {
  seed: number;
  buildingCount: number;
  citySize: number;
  minBuildingSize: number;
  maxBuildingSize: number;
  minBuildingHeight: number;
  maxBuildingHeight: number;
}

export interface CityData {
  buildings: Building[];
  dockingStation: DockingStation;
  config: CityConfig;
}

// ---- Graph ----

export interface GraphNode {
  id: string;
  position: Position2D;
  height: number;
  type: 'building' | 'docking_station';
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number; // Euclidean 2D distance
}

export interface WeightedGraph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge[]>; // adjacency list keyed by node id
}

// ---- Battery ----

export interface BatteryConfig {
  maxRange: number; // Maximum distance in km the drone can travel
}

export interface BatteryStatus {
  capacity: number;
  used: number;
  remaining: number;
  percentUsed: number;
  percentRemaining: number;
  isFeasible: boolean;
}

// ---- Algorithm ----

export type AlgorithmType = 'dp' | 'greedy';

export interface RouteResult {
  algorithm: AlgorithmType;
  route: string[];          // Ordered node IDs: [Dock, B3, B7, ..., Dock]
  totalDistance: number;
  isFeasible: boolean;
  batteryStatus: BatteryStatus;
  executionTimeMs: number;
  statesEvaluated: number;  // DP states or greedy steps
  deliveryOrder: string[];  // Just the delivery buildings, no dock
}

export interface AlgorithmComparison {
  dp: RouteResult | null;
  greedy: RouteResult | null;
  twoOpt: RouteResult | null;
  random: RouteResult | null;
}

// ---- Simulation / Animation ----

export type SimulationState = 'idle' | 'computing' | 'ready' | 'playing' | 'paused' | 'completed';

export interface SimulationConfig {
  speed: number;       // Animation speed multiplier
  showRoute: boolean;
  showMarkers: boolean;
}

export interface DroneState {
  position: Position3D;
  rotation: number;   // Y-axis rotation in radians
  currentSegment: number;
  progress: number;   // 0–1 progress within current segment
}

// ---- Selection ----

export interface SelectionState {
  selectedBuildingIds: Set<string>;
}

// ---- Performance Experiment ----

export interface ExperimentResult {
  deliveryCount: number;
  dpTime: number;
  greedyTime: number;
  dpDistance: number;
  greedyDistance: number;
  dpStates: number;
  dpFeasible: boolean;
  greedyFeasible: boolean;
}

// ---- App State ----

export interface AppState {
  city: CityData | null;
  graph: WeightedGraph | null;
  selection: SelectionState;
  battery: BatteryConfig;
  results: AlgorithmComparison;
  simulation: SimulationState;
  simulationConfig: SimulationConfig;
}
