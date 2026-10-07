'use client';

import { useRef, useState } from 'react';
import { Mesh } from 'three';
import type { Building as BuildingType } from '@/types';

interface BuildingProps {
  building: BuildingType;
  isSelected: boolean;
  isDelivered?: boolean;
  deliveryIndex?: number;
  onClick?: () => void;
}

export function Building({
  building,
  isSelected,
  isDelivered,
  deliveryIndex,
  onClick,
}: BuildingProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const baseColor = isSelected
    ? '#00E5FF'
    : isDelivered
      ? '#76FF03'
      : building.color;

  const emissiveColor = isSelected
    ? '#00B8D4'
    : hovered
      ? '#ffffff'
      : '#000000';

  const emissiveIntensity = isSelected ? 0.4 : hovered ? 0.15 : 0;

  return (
    <group position={[building.position.x, 0, building.position.z]}>
      {/* Building body */}
      <mesh
        ref={meshRef}
        position={[0, building.height / 2, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[building.width, building.height, building.depth]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          metalness={0.1}
          roughness={0.7}
        />
      </mesh>

      {/* Roof accent */}
      <mesh position={[0, building.height + 0.05, 0]}>
        <boxGeometry args={[building.width + 0.1, 0.1, building.depth + 0.1]} />
        <meshStandardMaterial
          color={isSelected ? '#00E5FF' : '#333'}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>

      {/* Selection indicator — glowing ring at base */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(building.width, building.depth) * 0.7, Math.max(building.width, building.depth) * 0.85, 32]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.6} />
        </mesh>
      )}



      {/* Delivery order marker */}
      {deliveryIndex !== undefined && (
        <mesh position={[0, building.height + 1.5, 0]}>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshBasicMaterial color="#FFD600" />
        </mesh>
      )}
    </group>
  );
}
