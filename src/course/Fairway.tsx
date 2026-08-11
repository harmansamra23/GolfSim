import { useMemo } from 'react'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import {
  createCartPathShape,
  createCourseShape,
} from './courseGeometry'

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
          roughnessMap={courseMaterials.firstCut.roughnessMap}
          roughness={0.96}
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
          roughnessMap={courseMaterials.fairway.roughnessMap}
          roughness={0.88}
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
          roughnessMap={courseMaterials.path.roughnessMap}
          roughness={1}
        />
      </mesh>
    </>
  )
}
