import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'
import { terrainHeightAtPosition } from './terrainHeight'

export function TeeBox({ hole }: { hole: GolfHole }) {
  const teeY = terrainHeightAtPosition(hole, hole.tee.x, hole.tee.z)

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[hole.tee.x, teeY + 0.055, hole.tee.z]}
        receiveShadow
      >
        <planeGeometry args={[11, 8, 6, 5]} />
        <meshStandardMaterial
          map={courseMaterials.tee.map}
          normalMap={courseMaterials.tee.normalMap}
          roughnessMap={courseMaterials.tee.roughnessMap}
          roughness={0.76}
        />
      </mesh>

      <TeeMarker hole={hole} x={-1.5} />
      <TeeMarker hole={hole} x={1.5} />
    </>
  )
}

function TeeMarker({
  hole,
  x,
}: {
  hole: GolfHole
  x: number
}) {
  const markerX = hole.tee.x + x
  const markerY = terrainHeightAtPosition(hole, markerX, hole.tee.z)

  return (
    <mesh
      position={[
        markerX,
        markerY + 0.22,
        hole.tee.z,
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
