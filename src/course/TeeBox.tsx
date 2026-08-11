import { courseMaterials } from '../components/simulator/CourseMaterials'
import { plumasLakeHole1 } from '../courses/plumasLakeHole1'

export function TeeBox() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          plumasLakeHole1.tee.x,
          0.055,
          plumasLakeHole1.tee.z,
        ]}
        receiveShadow
      >
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial
          map={courseMaterials.tee.map}
          normalMap={courseMaterials.tee.normalMap}
          roughnessMap={courseMaterials.tee.roughnessMap}
          roughness={0.82}
        />
      </mesh>

      <TeeMarker x={-1.5} />
      <TeeMarker x={1.5} />
    </>
  )
}

function TeeMarker({ x }: { x: number }) {
  return (
    <mesh
      position={[
        plumasLakeHole1.tee.x + x,
        0.22,
        plumasLakeHole1.tee.z,
      ]}
      castShadow
    >
      <sphereGeometry args={[0.23, 20, 20]} />
      <meshStandardMaterial
        color="#1f5fc9"
        roughness={0.4}
      />
    </mesh>
  )
}
