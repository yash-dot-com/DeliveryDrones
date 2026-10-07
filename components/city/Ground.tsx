'use client';

import { Line } from '@react-three/drei';

interface GroundProps {
  size: number;
}

export function Ground({ size }: GroundProps) {
  const halfSize = size / 2;
  const gridCount = Math.floor(size / 5); // Grid lines every 5 units

  return (
    <group>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[(size + 20) / 2, (size + 20) / 2, 1, 64]} />
        <meshStandardMaterial color="#70b8ffff" metalness={0.1} roughness={0.9} />
      </mesh>

      {/* Grid lines — streets */}
      {Array.from({ length: gridCount + 1 }, (_, i) => {
        const pos = -halfSize + i * 5;
        return (
          <group key={`grid-${i}`}>
            {/* X-axis road */}
            <mesh position={[0, 0.005, pos]} receiveShadow>
              <boxGeometry args={[size, 0.002, 1.2]} />
              <meshBasicMaterial color="#111111" /> {/* Black road */}
            </mesh>
            {/* Z-axis road */}
            <mesh position={[pos, 0.006, 0]} receiveShadow>
              <boxGeometry args={[1.2, 0.002, size]} />
              <meshBasicMaterial color="#111111" />
            </mesh>

            {/* Dashed white strips */}
            <Line
              points={[[-halfSize, 0.01, pos], [halfSize, 0.01, pos]]}
              color="#ffffff"
              lineWidth={2}
              dashed
              dashSize={0.5}
              gapSize={0.5}
            />
            <Line
              points={[[pos, 0.01, -halfSize], [pos, 0.01, halfSize]]}
              color="#ffffff"
              lineWidth={2}
              dashed
              dashSize={0.5}
              gapSize={0.5}
            />
          </group>
        );
      })}

      {/* Boundary edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[halfSize + 5, halfSize + 5.15, 64]} />
        <meshBasicMaterial color="#cbd5e1" transparent opacity={0.5} />
      </mesh>

      {/* Decorative Grass and Trees */}
      {Array.from({ length: 40 }, (_, i) => {
        // Random deterministic placement around the grid
        const isTree = i % 8 === 0;
        const randX = (Math.sin(i * 13) * size * 0.4);
        const randZ = (Math.cos(i * 27) * size * 0.4);

        // Avoid roads
        if (Math.abs(randX % 5) < 1 || Math.abs(randZ % 5) < 1) return null;

        if (isTree) {
          return (
            <group key={`veg-${i}`} position={[randX, 0, randZ]}>
              <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.05, 0.1, 0.8]} />
                <meshStandardMaterial color="#4A2F1D" />
              </mesh>
              <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
                <coneGeometry args={[0.8, 1.6, 8]} />
                <meshStandardMaterial color="#2d4c1e" />
              </mesh>
            </group>
          );
        } else {
          // Grass patch
          return (
            <group key={`veg-${i}`} position={[randX, 0, randZ]}>
              {[0, 1, 2, 3].map((g) => (
                <mesh
                  key={g}
                  position={[(g % 2) * 0.1, 0.1, Math.floor(g / 2) * 0.1]}
                  rotation={[0, Math.sin(g) * Math.PI, 0]}
                  castShadow
                >
                  <coneGeometry args={[0.05, 0.3, 4]} />
                  <meshStandardMaterial color="#4a7c2a" />
                </mesh>
              ))}
            </group>
          );
        }
      })}
    </group>
  );
}
