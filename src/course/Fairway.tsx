import { useMemo } from 'react'
import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import {
  createCartPathShape,
  createCourseShape,
} from './courseGeometry'

const firstCutNormalScale = new Vector2(1.35, 1.35)
const fairwayNormalScale = new Vector2(0.55, 0.55)
const pathNormalScale = new Vector2(0.75, 0.75)

export function Fairway() {
  const firstCutShape = useMemo(
    () => createCourseShape(4),
    []
  )

  const fairwayShape = useMemo(
    () => createCourseShape(0),
    []
  )

  const pathShape = useMemo(
    () => createCartPathShape(),
    []
  )

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.025, 0]}
        receiveShadow
      >
        <shapeGeometry args={[firstCutShape]} />
        <meshStandardMaterial
          map={courseMaterials.firstCut.map}
          normalMap={courseMaterials.firstCut.normalMap}
          normalScale={firstCutNormalScale}
          roughnessMap={courseMaterials.firstCut.roughnessMap}
          roughness={1}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        receiveShadow
      >
        <shapeGeometry args={[fairwayShape]} />
        <meshStandardMaterial
          map={courseMaterials.fairway.map}
          normalMap={courseMaterials.fairway.normalMap}
          normalScale={fairwayNormalScale}
          roughnessMap={courseMaterials.fairway.roughnessMap}
          roughness={0.72}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        receiveShadow
      >
        <shapeGeometry args={[pathShape]} />
        <meshStandardMaterial
          map={courseMaterials.path.map}
          normalMap={courseMaterials.path.normalMap}
          normalScale={pathNormalScale}
          roughnessMap={courseMaterials.path.roughnessMap}
          roughness={1}
        />
      </mesh>
    </>
  )
}
