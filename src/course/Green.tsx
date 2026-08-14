import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'

const fringeNormalScale = new Vector2(0.95, 0.95)
const greenNormalScale = new Vector2(0.28, 0.28)

export function Green({ hole }: { hole: GolfHole }) {
  const green = hole.green

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[green.center.x, 0.055, green.center.z]}
        scale={[green.radiusX + 4, green.radiusZ + 4, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial
          map={courseMaterials.firstCut.map}
          normalMap={courseMaterials.firstCut.normalMap}
          normalScale={fringeNormalScale}
          roughnessMap={courseMaterials.firstCut.roughnessMap}
          roughness={0.92}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[green.center.x, 0.07, green.center.z]}
        scale={[green.radiusX, green.radiusZ, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial
          map={courseMaterials.green.map}
          normalMap={courseMaterials.green.normalMap}
          normalScale={greenNormalScale}
          roughnessMap={courseMaterials.green.roughnessMap}
          roughness={0.48}
        />
      </mesh>
    </>
  )
}
