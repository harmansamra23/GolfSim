import { useMemo } from 'react'
import * as THREE from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'

function createBunkerGeometry() {
  const geometry = new THREE.CircleGeometry(1, 64)
  const positions = geometry.attributes.position

  positions.setZ(0, -0.075)
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
            rotation={[Math.PI / 2, 0, 0]}
            scale={[bunker.radiusX, bunker.radiusZ, 1]}
            receiveShadow
          >
            <torusGeometry args={[1, 0.035, 8, 64]} />
            <meshStandardMaterial
              color="#cdb77c"
              roughness={1}
            />
          </mesh>
        </group>
      ))}
    </>
  )
}
