'use client';

// ============================================================
// APP STORE — Global state management via React Context
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type {
  AlgorithmComparison,
  BatteryConfig,
  CityData,
  ExperimentResult,
  RouteResult,
  SimulationState,
  WeightedGraph,
} from '@/types';
import { generateCity, DEFAULT_CITY_CONFIG } from '@/lib/city-generator';
import { buildGraphFromCity } from '@/lib/graph';
import { DEFAULT_BATTERY_CAPACITY } from '@/lib/battery';
import { runComparison, findOptimalRouteDP, findRouteGreedy, findRoute2Opt, findRouteRandom } from '@/algorithms';
import { calculateBatteryStatus } from '@/lib/battery';

// ---- State shape ----

interface StoreState {
  city: CityData;
  graph: WeightedGraph;
  selectedBuildingIds: Set<string>;
  battery: BatteryConfig;
  results: AlgorithmComparison;
  simulation: SimulationState;
  animationSpeed: number;
  activeRoute: RouteResult | null;
  experiments: ExperimentResult[];
  seed: number;
}

// ---- Actions ----

type Action =
  | { type: 'GENERATE_CITY'; seed: number }
  | { type: 'TOGGLE_BUILDING'; buildingId: string }
  | { type: 'SET_SELECTION'; buildingIds: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SELECT_RANDOM'; count: number }
  | { type: 'SET_BATTERY'; maxRange: number }
  | { type: 'SET_RESULTS'; results: AlgorithmComparison }
  | { type: 'SET_ACTIVE_ROUTE'; route: RouteResult | null }
  | { type: 'SET_SIMULATION'; state: SimulationState }
  | { type: 'SET_ANIMATION_SPEED'; speed: number }
  | { type: 'ADD_EXPERIMENT'; result: ExperimentResult }
  | { type: 'CLEAR_EXPERIMENTS' };

// ---- Initial state ----

function createInitialState(seed: number = 42): StoreState {
  const city = generateCity({ ...DEFAULT_CITY_CONFIG, seed });
  const graph = buildGraphFromCity(city);
  return {
    city,
    graph,
    selectedBuildingIds: new Set(),
    battery: { maxRange: DEFAULT_BATTERY_CAPACITY },
    results: { dp: null, greedy: null, twoOpt: null, random: null },
    simulation: 'idle',
    animationSpeed: 1,
    activeRoute: null,
    experiments: [],
    seed,
  };
}

// ---- Reducer ----

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'GENERATE_CITY': {
      const city = generateCity({ ...DEFAULT_CITY_CONFIG, seed: action.seed });
      const graph = buildGraphFromCity(city);
      return {
        ...state,
        city,
        graph,
        seed: action.seed,
        selectedBuildingIds: new Set(),
        results: { dp: null, greedy: null, twoOpt: null, random: null },
        activeRoute: null,
        simulation: 'idle',
      };
    }

    case 'TOGGLE_BUILDING': {
      const next = new Set(state.selectedBuildingIds);
      if (next.has(action.buildingId)) {
        next.delete(action.buildingId);
      } else {
        next.add(action.buildingId);
      }
      return {
        ...state,
        selectedBuildingIds: next,
        results: { dp: null, greedy: null, twoOpt: null, random: null },
        activeRoute: null,
        simulation: 'idle',
      };
    }

    case 'SET_SELECTION': {
      return {
        ...state,
        selectedBuildingIds: new Set(action.buildingIds),
        results: { dp: null, greedy: null, twoOpt: null, random: null },
        activeRoute: null,
        simulation: 'idle',
      };
    }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedBuildingIds: new Set(),
        results: { dp: null, greedy: null, twoOpt: null, random: null },
        activeRoute: null,
        simulation: 'idle',
      };

    case 'SELECT_RANDOM': {
      const ids = state.city.buildings.map((b) => b.id);
      const shuffled = [...ids].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(action.count, ids.length));
      return {
        ...state,
        selectedBuildingIds: new Set(selected),
        results: { dp: null, greedy: null, twoOpt: null, random: null },
        activeRoute: null,
        simulation: 'idle',
      };
    }

    case 'SET_BATTERY':
      return {
        ...state,
        battery: { maxRange: action.maxRange },
        results: { dp: null, greedy: null, twoOpt: null, random: null },
        activeRoute: null,
        simulation: 'idle',
      };

    case 'SET_RESULTS':
      return { ...state, results: action.results };

    case 'SET_ACTIVE_ROUTE':
      return { ...state, activeRoute: action.route };

    case 'SET_SIMULATION':
      return { ...state, simulation: action.state };

    case 'SET_ANIMATION_SPEED':
      return { ...state, animationSpeed: action.speed };

    case 'ADD_EXPERIMENT':
      return { ...state, experiments: [...state.experiments, action.result] };

    case 'CLEAR_EXPERIMENTS':
      return { ...state, experiments: [] };

    default:
      return state;
  }
}

// ---- Context ----

interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
  // Convenience methods
  generateNewCity: () => void;
  toggleBuilding: (id: string) => void;
  clearSelection: () => void;
  selectRandom: (count: number) => void;
  setBattery: (maxRange: number) => void;
  runOptimization: () => void;
  runComparisonBoth: () => void;
  setActiveRoute: (route: RouteResult | null) => void;
  setSimulation: (state: SimulationState) => void;
  setAnimationSpeed: (speed: number) => void;
  runExperiment: (maxDeliveries: number) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, 42, createInitialState);

  const generateNewCity = useCallback(() => {
    const newSeed = Math.floor(Math.random() * 100000);
    dispatch({ type: 'GENERATE_CITY', seed: newSeed });
  }, []);

  const toggleBuilding = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_BUILDING', buildingId: id });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const selectRandom = useCallback((count: number) => {
    dispatch({ type: 'SELECT_RANDOM', count });
  }, []);

  const setBattery = useCallback((maxRange: number) => {
    dispatch({ type: 'SET_BATTERY', maxRange });
  }, []);

  const runOptimization = useCallback(() => {
    const deliveryIds = Array.from(state.selectedBuildingIds);
    if (deliveryIds.length === 0) return;

    dispatch({ type: 'SET_SIMULATION', state: 'computing' });

    const dpResult = findOptimalRouteDP(
      state.graph,
      state.city.dockingStation.id,
      deliveryIds,
      state.battery
    );

    dispatch({
      type: 'SET_RESULTS',
      results: { ...state.results, dp: dpResult },
    });
    dispatch({ type: 'SET_ACTIVE_ROUTE', route: dpResult });
    dispatch({ type: 'SET_SIMULATION', state: 'ready' });
  }, [state.selectedBuildingIds, state.graph, state.city, state.battery, state.results]);

  const runComparisonBoth = useCallback(() => {
    const deliveryIds = Array.from(state.selectedBuildingIds);
    if (deliveryIds.length === 0) return;

    dispatch({ type: 'SET_SIMULATION', state: 'computing' });

    // Assuming runComparison is still used for stats, but we can also run all of them individually here
    const dpResult = findOptimalRouteDP(state.graph, state.city.dockingStation.id, deliveryIds, state.battery);
    const greedyResult = findRouteGreedy(state.graph, state.city.dockingStation.id, deliveryIds, state.battery);
    
    const twoOptResult = findRoute2Opt(state.graph, deliveryIds, state.battery);
    const randomResult = findRouteRandom(state.graph, deliveryIds, state.battery);

    dispatch({ type: 'SET_RESULTS', results: { dp: dpResult, greedy: greedyResult, twoOpt: twoOptResult, random: randomResult } });
    dispatch({ type: 'SET_ACTIVE_ROUTE', route: dpResult });
    dispatch({ type: 'SET_SIMULATION', state: 'ready' });
  }, [state.selectedBuildingIds, state.graph, state.city, state.battery]);

  const setActiveRoute = useCallback((route: RouteResult | null) => {
    dispatch({ type: 'SET_ACTIVE_ROUTE', route });
  }, []);

  const setSimulation = useCallback((simState: SimulationState) => {
    dispatch({ type: 'SET_SIMULATION', state: simState });
  }, []);

  const setAnimationSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_ANIMATION_SPEED', speed });
  }, []);

  const runExperiment = useCallback(
    (maxDeliveries: number) => {
      dispatch({ type: 'CLEAR_EXPERIMENTS' });
      const buildingIds = state.city.buildings.map((b) => b.id);

      for (let count = 1; count <= Math.min(maxDeliveries, buildingIds.length); count++) {
        const deliveries = buildingIds.slice(0, count);
        const dp = findOptimalRouteDP(state.graph, 'DOCK', deliveries, state.battery);
        const greedy = findRouteGreedy(state.graph, 'DOCK', deliveries, state.battery);
        dispatch({
          type: 'ADD_EXPERIMENT',
          result: {
            deliveryCount: count,
            dpTime: dp.executionTimeMs,
            greedyTime: greedy.executionTimeMs,
            dpDistance: dp.totalDistance,
            greedyDistance: greedy.totalDistance,
            dpStates: dp.statesEvaluated,
            dpFeasible: dp.isFeasible,
            greedyFeasible: greedy.isFeasible,
          },
        });
      }
    },
    [state.city, state.graph, state.battery]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      state,
      dispatch,
      generateNewCity,
      toggleBuilding,
      clearSelection,
      selectRandom,
      setBattery,
      runOptimization,
      runComparisonBoth,
      setActiveRoute,
      setSimulation,
      setAnimationSpeed,
      runExperiment,
    }),
    [
      state,
      generateNewCity,
      toggleBuilding,
      clearSelection,
      selectRandom,
      setBattery,
      runOptimization,
      runComparisonBoth,
      setActiveRoute,
      setSimulation,
      setAnimationSpeed,
      runExperiment,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
