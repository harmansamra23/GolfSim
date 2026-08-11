import { courseMaterials } from '../components/simulator/CourseMaterials'

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
        roughnessMap={courseMaterials.rough.roughnessMap}
        roughness={1}
      />
    </mesh>
  )
}
