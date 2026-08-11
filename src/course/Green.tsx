import { courseMaterials } from '../components/simulator/CourseMaterials'
import { plumasLakeHole1 } from '../courses/plumasLakeHole1'

export function Green() {
  const green = plumasLakeHole1.green

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
          roughnessMap={courseMaterials.firstCut.roughnessMap}
          roughness={0.9}
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
          roughnessMap={courseMaterials.green.roughnessMap}
          roughness={0.7}
        />
      </mesh>
    </>
  )
}
