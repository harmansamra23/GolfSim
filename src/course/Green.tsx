import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'
import { terrainHeightAtPosition } from './terrainHeight'

const fringeNormalScale = new Vector2(0.95, 0.95)
const greenNormalScale = new Vector2(0.24, 0.24)

export function Green({ hole }: { hole: GolfHole }) {
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
        position={[green.center.x, greenY + 0.045, green.center.z]}
        scale={[green.radiusX + 4.2, green.radiusZ + 4.2, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 72]} />
        <meshStandardMaterial
          map={courseMaterials.firstCut.map}
          normalMap={courseMaterials.firstCut.normalMap}
          normalScale={fringeNormalScale}
          roughnessMap={courseMaterials.firstCut.roughnessMap}
          roughness={0.9}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[green.center.x, greenY + 0.065, green.center.z]}
        scale={[green.radiusX, green.radiusZ, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 72]} />
        <meshStandardMaterial
          map={courseMaterials.green.map}
          normalMap={courseMaterials.green.normalMap}
          normalScale={greenNormalScale}
          roughnessMap={courseMaterials.green.roughnessMap}
          roughness={0.4}
        />
      </mesh>
    </>
  )
}
