import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import { terrainHeightAtPosition } from './terrainHeight'

export function Hazards({ hole }: { hole: GolfHole }) {
  return (
    <>
      {(hole.hazards ?? []).map((hazard) => {
        const terrainY = terrainHeightAtPosition(
          hole,
          hazard.center.x,
          hazard.center.z
        )

        if (hazard.type === 'WATER') {
          return (
            <group key={hazard.id}>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                  hazard.center.x,
                  terrainY - 0.03,
                  hazard.center.z,
                ]}
                scale={[
                  hazard.radiusX * 1.34,
                  hazard.radiusZ * 1.18,
                  1,
                ]}
                receiveShadow
              >
                <ringGeometry args={[0.73, 1, 64]} />
                <meshStandardMaterial
                  color="#71805a"
                  roughness={1}
                  side={THREE.DoubleSide}
                />
              </mesh>

              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                  hazard.center.x,
                  terrainY - 0.14,
                  hazard.center.z,
                ]}
                scale={[
                  hazard.radiusX * 1.08,
                  hazard.radiusZ * 1.04,
                  1,
                ]}
              >
                <circleGeometry args={[1, 64]} />
                <meshStandardMaterial
                  color="#4c5d4a"
                  roughness={1}
                />
              </mesh>

              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                  hazard.center.x,
                  terrainY - 0.09,
                  hazard.center.z,
                ]}
                scale={[hazard.radiusX, hazard.radiusZ, 1]}
                receiveShadow
              >
                <circleGeometry args={[1, 64]} />
                <meshPhysicalMaterial
                  color="#3d8aa4"
                  roughness={0.14}
                  metalness={0.02}
                  transmission={0.12}
                  transparent
                  opacity={0.9}
                  clearcoat={0.62}
                  clearcoatRoughness={0.08}
                  side={THREE.DoubleSide}
                />
              </mesh>

              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[
                  hazard.center.x,
                  terrainY - 0.075,
                  hazard.center.z,
                ]}
                scale={[hazard.radiusX, hazard.radiusZ, 1]}
              >
                <ringGeometry args={[0.9, 1, 64]} />
                <meshBasicMaterial
                  color="#c9e2dc"
                  transparent
                  opacity={0.22}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )
        }

        return (
          <group key={hazard.id}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[
                hazard.center.x,
                terrainY + 0.055,
                hazard.center.z,
              ]}
              scale={[hazard.radiusX, hazard.radiusZ, 1]}
            >
              <ringGeometry args={[0.84, 1, 48]} />
              <meshBasicMaterial
                color="#d34b4b"
                transparent
                opacity={0.52}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
