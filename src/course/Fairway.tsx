import { useMemo } from 'react'
import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'
import {
  createCartPathSurfaceGeometry,
  createFairwaySurfaceGeometry,
} from './surfaceGeometry'

const firstCutNormalScale = new Vector2(1.15, 1.15)
const fairwayNormalScale = new Vector2(0.38, 0.38)
const pathNormalScale = new Vector2(0.7, 0.7)

export function Fairway({ hole }: { hole: GolfHole }) {
  const firstCutGeometry = useMemo(
    () => createFairwaySurfaceGeometry(hole, 5, 0.028),
    [hole]
  )
  const fairwayGeometry = useMemo(
    () => createFairwaySurfaceGeometry(hole, 0, 0.045),
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
          color="#9fbd75"
          roughness={0.92}
        />
      </mesh>

      <mesh geometry={fairwayGeometry} receiveShadow>
        <meshStandardMaterial
          map={courseMaterials.fairway.map}
          normalMap={courseMaterials.fairway.normalMap}
          normalScale={fairwayNormalScale}
          roughnessMap={courseMaterials.fairway.roughnessMap}
          color="#b8d982"
          roughness={0.58}
        />
      </mesh>

      {pathGeometry ? (
        <mesh geometry={pathGeometry} receiveShadow>
          <meshStandardMaterial
            map={courseMaterials.path.map}
            normalMap={courseMaterials.path.normalMap}
            normalScale={pathNormalScale}
            roughnessMap={courseMaterials.path.roughnessMap}
            color="#c7bda4"
            roughness={1}
          />
        </mesh>
      ) : null}
    </>
  )
}
