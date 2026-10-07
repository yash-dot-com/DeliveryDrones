'use client';

import { Suspense, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Building } from './Building';
import { DockingStation } from './DockingStation';
import { Ground } from './Ground';
import { BuildingLabels } from './BuildingLabels';
import { DroneWithRoute } from '@/components/drone/DroneWithRoute';
import { useStore } from '@/lib/store';

function SceneContent() {
  const {
    state,
    toggleBuilding,
    setSimulation,
  } = useStore();

  const { city, graph, selectedBuildingIds, activeRoute, results, simulation, animationSpeed } =
    state;

  const isPlaying = simulation === 'playing';
  const isReady = simulation === 'ready';

  const completedCountRef = useRef(0);

  useEffect(() => {
    if (isReady) {
      completedCountRef.current = 0;
    }
  }, [isReady]);

  const handleAnimationComplete = useCallback(() => {
    completedCountRef.current += 1;
    const activeCount = [results.dp, results.greedy, results.twoOpt, results.random].filter(Boolean).length;
    
    if (completedCountRef.current >= activeCount) {
      setSimulation('completed');
    }
  }, [results, setSimulation]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-near={0.1}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <directionalLight position={[-20, 30, -10]} intensity={0.3} />

      {/* Fog for depth */}

      {/* Ground */}
      <Ground size={city.config.citySize} />

      {/* Docking Station */}
      <DockingStation station={city.dockingStation} />

      {/* Buildings */}
      {city.buildings.map((building) => (
        <Building
          key={building.id}
          building={building}
          isSelected={selectedBuildingIds.has(building.id)}
          deliveryIndex={
            activeRoute?.deliveryOrder.indexOf(building.id) !== -1
              ? activeRoute?.deliveryOrder.indexOf(building.id)
              : undefined
          }
          onClick={() => toggleBuilding(building.id)}
        />
      ))}

      {/* Building Labels */}
      <BuildingLabels
        buildings={city.buildings}
        selectedIds={selectedBuildingIds}
        deliveryOrder={activeRoute?.deliveryOrder}
      />

      {/* Routes and Drones */}
      {results.dp && (
        <DroneWithRoute
          routeResult={results.dp}
          graph={graph}
          isPlaying={isPlaying}
          isReady={isReady}
          speed={animationSpeed}
          color="#00E5FF" // cyan for DP
          onComplete={handleAnimationComplete}
        />
      )}
      {results.greedy && (
        <DroneWithRoute
          routeResult={results.greedy}
          graph={graph}
          isPlaying={isPlaying}
          isReady={isReady}
          speed={animationSpeed}
          color="#FF0055" // pink/red for Greedy
          yOffset={0.5}
          onComplete={handleAnimationComplete}
        />
      )}
      {results.twoOpt && (
        <DroneWithRoute
          routeResult={results.twoOpt}
          graph={graph}
          isPlaying={isPlaying}
          isReady={isReady}
          speed={animationSpeed}
          color="#10B981" // emerald for 2-Opt
          yOffset={1.0}
          onComplete={handleAnimationComplete}
        />
      )}
      {results.random && (
        <DroneWithRoute
          routeResult={results.random}
          graph={graph}
          isPlaying={isPlaying}
          isReady={isReady}
          speed={animationSpeed}
          color="#F59E0B" // amber for Random
          yOffset={1.5}
          onComplete={handleAnimationComplete}
        />
      )}

      {/* Camera controls */}
      <OrbitControls
        enableRotate={true}
        enablePan={true}
        enableZoom={true}
        minDistance={10}
        maxDistance={120}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 - 0.05} // don't go below ground
        target={[0, 0, 0]}
      />
    </>
  );
}

export function CityScene() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{
          position: [35, 45, 35],
          fov: 45,
          near: 0.1,
          far: 200,
        }}
        gl={{ antialias: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
