import { courseMaterials } from '../components/simulator/CourseMaterials'
import { plumasLakeHole1 } from '../courses/plumasLakeHole1'

export function Bunkers() {
  return (
    <>
      {plumasLakeHole1.bunkers.map((bunker, index) => (
        <mesh
          key={index}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            bunker.center.x,
            0.08,
            bunker.center.z,
          ]}
          scale={[
            bunker.radiusX,
            bunker.radiusZ,
            1,
          ]}
          receiveShadow
        >
          <circleGeometry args={[1, 64]} />
          <meshStandardMaterial
            map={courseMaterials.sand.map}
            normalMap={courseMaterials.sand.normalMap}
            roughnessMap={courseMaterials.sand.roughnessMap}
            roughness={1}
          />
        </mesh>
      ))}
    </>
  )
}
