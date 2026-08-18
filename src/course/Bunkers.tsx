import { useMemo } from 'react'
import * as THREE from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'
import { terrainHeightAtPosition } from './terrainHeight'

function createBunkerGeometry() {
  const geometry = new THREE.CircleGeometry(1, 64)
  const positions = geometry.attributes.position

  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index)
    const y = positions.getY(index)
    const radius = Math.min(1, Math.hypot(x, y))
    const depth = -0.42 * Math.pow(1 - radius, 1.25)
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
      {hole.bunkers.map((bunker, index) => {
        const bunkerY = terrainHeightAtPosition(
          hole,
          bunker.center.x,
          bunker.center.z
        )

        return (
          <group
            key={index}
            position={[bunker.center.x, bunkerY + 0.08, bunker.center.z]}
          >
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[
                bunker.radiusX * 1.2,
                bunker.radiusZ * 1.2,
                1,
              ]}
              position={[0, -0.045, 0]}
              receiveShadow
            >
              <ringGeometry args={[0.8, 1, 64]} />
              <meshStandardMaterial
                color="#4f6f3d"
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
                roughness={0.98}
                color="#fff0c2"
              />
            </mesh>

            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[
                bunker.radiusX * 0.96,
                bunker.radiusZ * 0.96,
                1,
              ]}
              position={[0, -0.06, 0]}
            >
              <ringGeometry args={[0.87, 1, 64]} />
              <meshBasicMaterial
                color="#aa8c57"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
