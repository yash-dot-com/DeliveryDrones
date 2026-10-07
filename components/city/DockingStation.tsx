'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import type { DockingStation as DockType } from '@/types';

interface DockingStationProps {
  station: DockType;
}

export function DockingStation({ station }: DockingStationProps) {
  const ringRef = useRef<Mesh>(null);
  const beaconRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.5; // Actually it's rotated -PI/2 on x, so z is the rotation axis we want
    }
    if (beaconRef.current) {
      beaconRef.current.position.y = 1.2 + Math.sin(Date.now() * 0.003) * 0.15;
    }
  });

  return (
    <group position={[station.position.x, 0, station.position.z]}>
      {/* Landing pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Inner pad */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[1.4, 32]} />
        <meshStandardMaterial color="#0D47A1" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* H marking (helipad style) — cross bars */}
      <mesh position={[-0.4, 0.06, 0]}>
        <boxGeometry args={[0.15, 0.02, 1]} />
        <meshBasicMaterial color="#E0E0E0" />
      </mesh>
      <mesh position={[0.4, 0.06, 0]}>
        <boxGeometry args={[0.15, 0.02, 1]} />
        <meshBasicMaterial color="#E0E0E0" />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.95, 0.02, 0.15]} />
        <meshBasicMaterial color="#E0E0E0" />
      </mesh>

      {/* Rotating ring */}
      <mesh ref={ringRef} position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.8, 32]} />
        <meshBasicMaterial color="#00E5FF" transparent opacity={0.5} />
      </mesh>

      {/* Beacon */}
      <mesh ref={beaconRef} position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.2, 0]} />
        <meshBasicMaterial color="#00E5FF" />
      </mesh>

      {/* Corner posts */}
      {[
        [1.5, 0, 1.5],
        [-1.5, 0, 1.5],
        [1.5, 0, -1.5],
        [-1.5, 0, -1.5],
      ].map(([x, , z], i) => (
        <mesh key={i} position={[x, 0.3, z]}>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 8]} />
          <meshStandardMaterial color="#455A64" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Point light for glow effect */}
      <pointLight
        position={[0, 1.5, 0]}
        color="#00E5FF"
        intensity={2}
        distance={8}
        decay={2}
      />
    </group>
  );
}
