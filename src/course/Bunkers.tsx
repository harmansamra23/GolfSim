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
    const depth = -0.34 * Math.pow(1 - radius, 1.35)
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
            position={[bunker.center.x, bunkerY + 0.075, bunker.center.z]}
          >
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[
                bunker.radiusX * 1.15,
                bunker.radiusZ * 1.15,
                1,
              ]}
              position={[0, -0.04, 0]}
              receiveShadow
            >
              <ringGeometry args={[0.84, 1, 64]} />
              <meshStandardMaterial
                color="#5f7b48"
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
                roughness={0.94}
                color="#ead79f"
              />
            </mesh>

            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              scale={[
                bunker.radiusX * 0.98,
                bunker.radiusZ * 0.98,
                1,
              ]}
              position={[0, -0.055, 0]}
            >
              <ringGeometry args={[0.88, 1, 64]} />
              <meshBasicMaterial
                color="#8d7547"
                transparent
                opacity={0.34}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
