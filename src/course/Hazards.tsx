import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'

export function Hazards({ hole }: { hole: GolfHole }) {
  return (
    <>
      {(hole.hazards ?? []).map((hazard) => {
        if (hazard.type === 'WATER') {
          return (
            <group key={hazard.id}>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[hazard.center.x, 0.045, hazard.center.z]}
                scale={[
                  hazard.radiusX * 1.16,
                  hazard.radiusZ * 1.08,
                  1,
                ]}
                receiveShadow
              >
                <circleGeometry args={[1, 64]} />
                <meshStandardMaterial
                  color="#6d7146"
                  roughness={1}
                />
              </mesh>

              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[hazard.center.x, 0.075, hazard.center.z]}
                scale={[hazard.radiusX, hazard.radiusZ, 1]}
                receiveShadow
              >
                <circleGeometry args={[1, 64]} />
                <meshPhysicalMaterial
                  color="#2f7289"
                  roughness={0.18}
                  metalness={0.02}
                  transmission={0.08}
                  transparent
                  opacity={0.9}
                  clearcoat={0.45}
                  clearcoatRoughness={0.12}
                  side={THREE.DoubleSide}
                />
              </mesh>

              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[hazard.center.x, 0.09, hazard.center.z]}
                scale={[hazard.radiusX, hazard.radiusZ, 1]}
              >
                <ringGeometry args={[0.9, 1, 64]} />
                <meshBasicMaterial
                  color="#9bb6af"
                  transparent
                  opacity={0.24}
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
              position={[hazard.center.x, 0.055, hazard.center.z]}
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
