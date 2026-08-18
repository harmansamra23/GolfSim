import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import { terrainHeightAtPosition } from './terrainHeight'

export function Flag({ hole }: { hole: GolfHole }) {
  const green = hole.green
  const greenY = terrainHeightAtPosition(
    hole,
    green.center.x,
    green.center.z
  )

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[green.center.x, greenY + 0.076, green.center.z]}
      >
        <circleGeometry args={[0.11, 32]} />
        <meshStandardMaterial color="#0b0b0b" roughness={1} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[green.center.x, greenY + 0.079, green.center.z]}
      >
        <ringGeometry args={[0.108, 0.135, 32]} />
        <meshStandardMaterial color="#f1f1e8" roughness={0.7} />
      </mesh>

      <mesh
        position={[green.center.x, greenY + 2.25, green.center.z]}
        castShadow
      >
        <cylinderGeometry args={[0.025, 0.025, 4.3, 12]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.45} />
      </mesh>

      <mesh
        position={[green.center.x + 0.7, greenY + 3.7, green.center.z]}
        castShadow
      >
        <planeGeometry args={[1.4, 0.72]} />
        <meshStandardMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>
    </>
  )
}
