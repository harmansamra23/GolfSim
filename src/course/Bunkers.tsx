import { useMemo } from 'react'
import * as THREE from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'

function createBunkerGeometry() {
  const geometry = new THREE.CircleGeometry(1, 64)
  const positions = geometry.attributes.position

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const radius = Math.min(1, Math.hypot(x, y))
    const depth = -0.12 * (1 - radius * radius)
    positions.setZ(index, depth)
  }

  positions.needsUpdate = true
  geometry.computeVertexNormals()
  return geometry
}

export function Bunkers({ hole }: { hole: GolfHole }) {
  const bowlGeometry = useMemo(() => createBunkerGeometry(), [])

  return (
    <>
      {hole.bunkers.map((bunker, index) => (
        <group
          key={index}
          position={[bunker.center.x, 0.095, bunker.center.z]}
        >
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[
              bunker.radiusX * 1.08,
              bunker.radiusZ * 1.08,
              1,
            ]}
            position={[0, -0.035, 0]}
            receiveShadow
          >
            <ringGeometry args={[0.89, 1, 64]} />
            <meshStandardMaterial
              color="#536c3c"
              roughness={1}
              side={THREE.DoubleSide}
            />
          </mesh>

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[bunker.radiusX, bunker.radiusZ, 1]}
            geometry={bowlGeometry}
            receiveShadow
          >
            <meshStandardMaterial
              map={courseMaterials.sand.map}
              normalMap={courseMaterials.sand.normalMap}
              roughnessMap={courseMaterials.sand.roughnessMap}
              roughness={1}
            />
          </mesh>

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[
              bunker.radiusX * 0.95,
              bunker.radiusZ * 0.95,
              1,
            ]}
            position={[0, -0.045, 0]}
          >
            <ringGeometry args={[0.91, 1, 64]} />
            <meshBasicMaterial
              color="#8a774b"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}
