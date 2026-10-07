'use client';

import { Billboard, Text } from '@react-three/drei';
import type { Building } from '@/types';

interface BuildingLabelsProps {
  buildings: Building[];
  selectedIds: Set<string>;
  deliveryOrder?: string[];
}

export function BuildingLabels({
  buildings,
  selectedIds,
  deliveryOrder,
}: BuildingLabelsProps) {
  return (
    <>
      {buildings.map((building) => {
        const isSelected = selectedIds.has(building.id);
        const deliveryIdx = deliveryOrder?.indexOf(building.id);
        const hasDeliveryIndex = deliveryIdx !== undefined && deliveryIdx !== -1;

        const labelText = hasDeliveryIndex 
          ? `${deliveryIdx! + 1}. ${building.id}`
          : building.id;

        const textColor = isSelected ? '#ffffff' : '#e2e8f0';
        const bgColor = isSelected ? '#06b6d4' : '#0f172a'; // cyan-500 or slate-900

        return (
          <group
            key={building.id}
            position={[
              building.position.x,
              building.height + 1.2,
              building.position.z,
            ]}
          >
            <Billboard follow={true}>
              <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[1.5, 0.6]} />
                <meshBasicMaterial color={bgColor} transparent opacity={0.8} />
              </mesh>
              <Text
                color={textColor}
                fontSize={0.35}
                anchorX="center"
                anchorY="middle"
              >
                {labelText}
              </Text>
            </Billboard>
          </group>
        );
      })}

      {/* Docking station label */}
      <group position={[0, 2.2, 0]}>
        <Billboard follow={true}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.8, 0.6]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.9} /> {/* amber-500 */}
          </mesh>
          <Text
            color="#ffffff"
            fontSize={0.35}
            anchorX="center"
            anchorY="middle"
          >
            DOCK
          </Text>
        </Billboard>
      </group>
    </>
  );
}
