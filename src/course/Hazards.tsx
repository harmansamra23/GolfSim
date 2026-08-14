import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'

export function Hazards({ hole }: { hole: GolfHole }) {
  return (
    <>
      {(hole.hazards ?? []).map((hazard) => {
        if (hazard.type === 'WATER') {
          return (
            <mesh
              key={hazard.id}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[hazard.center.x, 0.075, hazard.center.z]}
              scale={[hazard.radiusX, hazard.radiusZ, 1]}
              receiveShadow
            >
              <circleGeometry args={[1, 48]} />
              <meshStandardMaterial
                color="#2d7190"
                roughness={0.22}
                metalness={0.05}
                transparent
                opacity={0.92}
              />
            </mesh>
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
