import { Vector2 } from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'

const roughNormalScale = new Vector2(1.8, 1.8)

export function Terrain() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, -180]}
      receiveShadow
    >
      <planeGeometry args={[280, 820]} />

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
