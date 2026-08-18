import { useMemo } from 'react'
import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'
import { createGreenSurfaceGeometry } from './surfaceGeometry'

const fringeNormalScale = new Vector2(0.9, 0.9)
const greenNormalScale = new Vector2(0.2, 0.2)

export function Green({ hole }: { hole: GolfHole }) {
  const green = hole.green
  const fringeGeometry = useMemo(
    () =>
      createGreenSurfaceGeometry(
        hole,
        green.radiusX + 4.2,
        green.radiusZ + 4.2,
        0.035,
        false
      ),
    [green.radiusX, green.radiusZ, hole]
  )
  const greenGeometry = useMemo(
    () =>
      createGreenSurfaceGeometry(
        hole,
        green.radiusX,
        green.radiusZ,
        0.055,
        true
      ),
    [green.radiusX, green.radiusZ, hole]
  )

  return (
    <>
      <mesh geometry={fringeGeometry} receiveShadow>
        <meshStandardMaterial
          map={courseMaterials.firstCut.map}
          normalMap={courseMaterials.firstCut.normalMap}
          normalScale={fringeNormalScale}
          roughnessMap={courseMaterials.firstCut.roughnessMap}
          color="#a6c979"
          roughness={0.86}
        />
      </mesh>

      <mesh geometry={greenGeometry} receiveShadow>
        <meshStandardMaterial
          map={courseMaterials.green.map}
          normalMap={courseMaterials.green.normalMap}
          normalScale={greenNormalScale}
          roughnessMap={courseMaterials.green.roughnessMap}
          color="#c8e49a"
          roughness={0.36}
        />
      </mesh>
    </>
  )
}
