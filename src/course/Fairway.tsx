import { useMemo } from 'react'
import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'
import {
  createCartPathSurfaceGeometry,
  createFairwaySurfaceGeometry,
} from './surfaceGeometry'

const firstCutNormalScale = new Vector2(1.25, 1.25)
const fairwayNormalScale = new Vector2(0.3, 0.3)
const pathNormalScale = new Vector2(0.7, 0.7)

export function Fairway({ hole }: { hole: GolfHole }) {
  const firstCutGeometry = useMemo(
    () => createFairwaySurfaceGeometry(hole, 5.5, 0.03),
    [hole]
  )
  const fairwayGeometry = useMemo(
    () => createFairwaySurfaceGeometry(hole, 0, 0.05),
    [hole]
  )
  const pathGeometry = useMemo(
    () => createCartPathSurfaceGeometry(hole, 0.055),
    [hole]
  )

  return (
    <>
      <mesh geometry={firstCutGeometry} receiveShadow>
        <meshStandardMaterial
          map={courseMaterials.firstCut.map}
          normalMap={courseMaterials.firstCut.normalMap}
          normalScale={firstCutNormalScale}
          roughnessMap={courseMaterials.firstCut.roughnessMap}
          color="#6f974f"
          roughness={0.96}
        />
      </mesh>

      <mesh geometry={fairwayGeometry} receiveShadow>
        <meshStandardMaterial
          map={courseMaterials.fairway.map}
          normalMap={courseMaterials.fairway.normalMap}
          normalScale={fairwayNormalScale}
          roughnessMap={courseMaterials.fairway.roughnessMap}
          color="#a8cf6c"
          roughness={0.52}
        />
      </mesh>

      {pathGeometry ? (
        <mesh geometry={pathGeometry} receiveShadow>
          <meshStandardMaterial
            map={courseMaterials.path.map}
            normalMap={courseMaterials.path.normalMap}
            normalScale={pathNormalScale}
            roughnessMap={courseMaterials.path.roughnessMap}
            color="#bdb39b"
            roughness={1}
          />
        </mesh>
      ) : null}
    </>
  )
}
