// ============================================================
// GRAPH ENGINE — Weighted graph for the city
//
// Every building and the docking station become vertices.
// Edge weights = 2D Euclidean distance between positions.
// Building height is NOT used in distance calculations.
//
// The graph is kept completely independent from React / Three.js.
// ============================================================

import type {
  CityData,
  GraphEdge,
  GraphNode,
  Position2D,
  WeightedGraph,
} from '@/types';

// ---- Distance calculation ----

/** Euclidean distance on the ground plane (2D: x, z) */
export function euclideanDistance(a: Position2D, b: Position2D): number {
  const dx = a.x - b.x;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dz * dz);
}

// ---- Graph construction ----

/** Create an empty weighted graph. */
export function createGraph(): WeightedGraph {
  return {
    nodes: new Map(),
    edges: new Map(),
  };
}

/** Add a node to the graph. */
export function addNode(graph: WeightedGraph, node: GraphNode): void {
  graph.nodes.set(node.id, node);
  if (!graph.edges.has(node.id)) {
    graph.edges.set(node.id, []);
  }
}

/** Add a bidirectional edge between two nodes. */
export function addEdge(graph: WeightedGraph, from: string, to: string, weight: number): void {
  const edgeForward: GraphEdge = { from, to, weight };
  const edgeBackward: GraphEdge = { from: to, to: from, weight };

  graph.edges.get(from)?.push(edgeForward);
  graph.edges.get(to)?.push(edgeBackward);
}

// ---- Graph queries ----

/** Get all neighbors of a node. */
export function getNeighbors(graph: WeightedGraph, nodeId: string): GraphEdge[] {
  return graph.edges.get(nodeId) ?? [];
}

/** Get the edge weight between two nodes, or Infinity if not connected. */
export function getEdgeWeight(graph: WeightedGraph, from: string, to: string): number {
  const edges = graph.edges.get(from);
  if (!edges) return Infinity;
  const edge = edges.find((e) => e.to === to);
  return edge?.weight ?? Infinity;
}

/** Find a node by ID. */
export function findNode(graph: WeightedGraph, nodeId: string): GraphNode | undefined {
  return graph.nodes.get(nodeId);
}

/** Get the distance between two nodes using the graph edge weight. */
export function getDistance(graph: WeightedGraph, from: string, to: string): number {
  return getEdgeWeight(graph, from, to);
}

/** Get all node IDs in the graph. */
export function getNodeIds(graph: WeightedGraph): string[] {
  return Array.from(graph.nodes.keys());
}

// ---- Build complete graph from city data ----

/**
 * Build a complete weighted graph from city data.
 * 
 * Every location (buildings + docking station) is connected to
 * every other location. Edge weight = 2D Euclidean distance.
 * 
 * This creates O(n²) edges for n locations.
 */
export function buildGraphFromCity(city: CityData): WeightedGraph {
  const graph = createGraph();

  // Add docking station as a node
  addNode(graph, {
    id: city.dockingStation.id,
    position: city.dockingStation.position,
    height: 0,
    type: 'docking_station',
  });

  // Add buildings as nodes
  for (const building of city.buildings) {
    addNode(graph, {
      id: building.id,
      position: building.position,
      height: building.height,
      type: 'building',
    });
  }

  // Create complete graph: connect every pair of nodes
  const nodeIds = getNodeIds(graph);
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      const nodeA = graph.nodes.get(nodeIds[i])!;
      const nodeB = graph.nodes.get(nodeIds[j])!;
      const weight = euclideanDistance(nodeA.position, nodeB.position);
      addEdge(graph, nodeA.id, nodeB.id, weight);
    }
  }

  return graph;
}

/**
 * Build a distance matrix from a graph for a subset of nodes.
 * Returns a 2D array where dist[i][j] = distance between nodes[i] and nodes[j].
 * This is used by the DP algorithm for fast lookups.
 */
export function buildDistanceMatrix(
  graph: WeightedGraph,
  nodeIds: string[]
): number[][] {
  const n = nodeIds.length;
  const dist: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = getEdgeWeight(graph, nodeIds[i], nodeIds[j]);
      dist[i][j] = d;
      dist[j][i] = d;
    }
  }

  return dist;
}
