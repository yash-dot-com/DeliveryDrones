'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import type { Position3D } from '@/types';

interface DroneProps {
  position: Position3D;
  rotation?: number;
  isFlying?: boolean;
  color?: string;
}

/**
 * Procedural low-poly drone.
 * Uses simple Three.js geometry — no external GLB required.
 * Will be replaced with a proper model in Phase 9.
 */
export function Drone({ position, rotation = 0, isFlying = false, color = '#263238' }: DroneProps) {
  const groupRef = useRef<Group>(null);
  const rotor1Ref = useRef<Mesh>(null);
  const rotor2Ref = useRef<Mesh>(null);
  const rotor3Ref = useRef<Mesh>(null);
  const rotor4Ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    // Hovering animation
    if (groupRef.current) {
      groupRef.current.position.y =
        position.y + Math.sin(Date.now() * 0.004) * 0.1;
    }

    // Spin rotors
    const speed = isFlying ? 25 : 15;
    const rotors = [rotor1Ref, rotor2Ref, rotor3Ref, rotor4Ref];
    rotors.forEach((ref, i) => {
      if (ref.current) {
        ref.current.rotation.y += delta * speed * (i % 2 === 0 ? 1 : -1);
      }
    });
  });

  const armLength = 0.6;
  const armPositions: [number, number, number][] = [
    [armLength, 0, armLength],
    [-armLength, 0, armLength],
    [armLength, 0, -armLength],
    [-armLength, 0, -armLength],
  ];

  const rotorRefs = [rotor1Ref, rotor2Ref, rotor3Ref, rotor4Ref];

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      rotation={[0, rotation, 0]}
    >
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.15, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Body top (dome) */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <sphereGeometry args={[0.18, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#37474F" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Status light */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={isFlying ? '#76FF03' : '#00E5FF'} />
      </mesh>

      {/* Arms and rotors */}
      {armPositions.map((pos, i) => (
        <group key={i}>
          {/* Arm */}
          <mesh
            position={[pos[0] / 2, 0, pos[2] / 2]}
            rotation={[0, Math.atan2(pos[2], pos[0]), 0]}
          >
            <boxGeometry args={[Math.sqrt(pos[0] ** 2 + pos[2] ** 2), 0.04, 0.06]} />
            <meshStandardMaterial color="#455A64" metalness={0.5} roughness={0.4} />
          </mesh>

          {/* Motor housing */}
          <mesh position={[pos[0], 0.02, pos[2]]}>
            <cylinderGeometry args={[0.06, 0.08, 0.08, 8]} />
            <meshStandardMaterial color="#37474F" metalness={0.6} roughness={0.3} />
          </mesh>

          {/* Rotor (spinning disc) */}
          <mesh ref={rotorRefs[i]} position={[pos[0], 0.08, pos[2]]}>
            <cylinderGeometry args={[0.25, 0.25, 0.015, 16]} />
            <meshStandardMaterial
              color="#78909C"
              transparent
              opacity={isFlying ? 0.3 : 0.6}
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Landing gear legs */}
      {[
        [0.25, -0.15, 0.25],
        [-0.25, -0.15, 0.25],
        [0.25, -0.15, -0.25],
        [-0.25, -0.15, -0.25],
      ].map(([x, y, z], i) => (
        <mesh key={`leg-${i}`} position={[x, y, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
          <meshStandardMaterial color="#546E7A" />
        </mesh>
      ))}

      {/* Bottom light */}
      <pointLight
        position={[0, -0.2, 0]}
        color={isFlying ? '#76FF03' : '#00E5FF'}
        intensity={1}
        distance={4}
        decay={2}
      />
    </group>
  );
}
