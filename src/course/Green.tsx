import { useMemo } from 'react'
import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'
import { createGreenSurfaceGeometry } from './surfaceGeometry'

const collarNormalScale = new Vector2(1.15, 1.15)
const fringeNormalScale = new Vector2(0.72, 0.72)
const greenNormalScale = new Vector2(0.16, 0.16)

export function Green({ hole }: { hole: GolfHole }) {
  const green = hole.green
  const collarGeometry = useMemo(
    () =>
      createGreenSurfaceGeometry(
        hole,
        green.radiusX + 6.5,
        green.radiusZ + 6.5,
        0.026,
        false
      ),
    [green.radiusX, green.radiusZ, hole]
  )
  const fringeGeometry = useMemo(
    () =>
      createGreenSurfaceGeometry(
        hole,
        green.radiusX + 3.2,
        green.radiusZ + 3.2,
        0.044,
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
        0.066,
        true
      ),
    [green.radiusX, green.radiusZ, hole]
  )

  return (
    <>
      <mesh geometry={collarGeometry} receiveShadow>
        <meshStandardMaterial
          map={courseMaterials.firstCut.map}
          normalMap={courseMaterials.firstCut.normalMap}
          normalScale={collarNormalScale}
          roughnessMap={courseMaterials.firstCut.roughnessMap}
          color="#5f8747"
          roughness={0.95}
        />
      </mesh>

      <mesh geometry={fringeGeometry} receiveShadow>
        <meshStandardMaterial
          map={courseMaterials.fairway.map}
          normalMap={courseMaterials.fairway.normalMap}
          normalScale={fringeNormalScale}
          roughnessMap={courseMaterials.fairway.roughnessMap}
          color="#88b95d"
          roughness={0.72}
        />
      </mesh>

      <mesh geometry={greenGeometry} receiveShadow>
        <meshStandardMaterial
          map={courseMaterials.green.map}
          normalMap={courseMaterials.green.normalMap}
          normalScale={greenNormalScale}
          roughnessMap={courseMaterials.green.roughnessMap}
          color="#b7e47b"
          roughness={0.32}
        />
      </mesh>
    </>
  )
}
