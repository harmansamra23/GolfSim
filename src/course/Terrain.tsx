import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'

const roughNormalScale = new Vector2(1.8, 1.8)

export function Terrain({ hole }: { hole: GolfHole }) {
  const centerZ = (hole.tee.z + hole.green.center.z) / 2
  const length = Math.abs(hole.green.center.z - hole.tee.z) + 160

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, centerZ]}
      receiveShadow
    >
      <planeGeometry args={[320, length]} />

      <meshStandardMaterial
        map={courseMaterials.rough.map}
        normalMap={courseMaterials.rough.normalMap}
        normalScale={roughNormalScale}
        roughnessMap={courseMaterials.rough.roughnessMap}
        roughness={1}
      />
    </mesh>
  )
}
