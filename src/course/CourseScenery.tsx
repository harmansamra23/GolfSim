import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import {
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'

export function CourseScenery({ hole }: { hole: GolfHole }) {
  const centerZ = (hole.tee.z + hole.green.center.z) / 2
  const holeLength = Math.abs(hole.green.center.z - hole.tee.z)

  const hillRows = Array.from({ length: 7 }, (_, index) => {
    const t = index / 6
    const z = hole.tee.z - 65 - t * (holeLength + 80)
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)

    return {
      z,
      leftX: center - width - 72 - (index % 2) * 12,
      rightX: center + width + 72 + ((index + 1) % 2) * 12,
      leftScale: 1.15 + (index % 3) * 0.15,
      rightScale: 1.1 + ((index + 1) % 3) * 0.16,
    }
  })

  return (
    <group>
      <mesh
        position={[0, -7.5, centerZ - 20]}
        scale={[155, 12, holeLength * 0.9 + 170]}
        receiveShadow
      >
        <sphereGeometry args={[1, 36, 20]} />
        <meshStandardMaterial
          color="#25452a"
          roughness={1}
        />
      </mesh>

      <mesh
        position={[-135, -3, centerZ - 55]}
        scale={[92, 16, holeLength * 0.62 + 115]}
        receiveShadow
      >
        <sphereGeometry args={[1, 30, 16]} />
        <meshStandardMaterial
          color="#31563a"
          roughness={1}
        />
      </mesh>

      <mesh
        position={[142, -4, centerZ - 20]}
        scale={[100, 18, holeLength * 0.68 + 120]}
        receiveShadow
      >
        <sphereGeometry args={[1, 30, 16]} />
        <meshStandardMaterial
          color="#2c5034"
          roughness={1}
        />
      </mesh>

      {hillRows.map((row, index) => (
        <group key={index}>
          <DistantTree
            position={[row.leftX, 0, row.z]}
            scale={row.leftScale}
          />
          <DistantTree
            position={[row.rightX, 0, row.z - 10]}
            scale={row.rightScale}
          />
          <DistantTree
            position={[row.leftX - 14, 0, row.z - 18]}
            scale={row.leftScale * 0.86}
          />
          <DistantTree
            position={[row.rightX + 16, 0, row.z - 26]}
            scale={row.rightScale * 0.9}
          />
        </group>
      ))}
    </group>
  )
}

function DistantTree({
  position,
  scale,
}: {
  position: [number, number, number]
  scale: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 3.8, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.5, 7.6, 8]} />
        <meshStandardMaterial color="#493423" roughness={1} />
      </mesh>

      <mesh position={[0, 8.4, 0]} castShadow>
        <sphereGeometry args={[3.6, 10, 8]} />
        <meshStandardMaterial
          color="#234d2b"
          roughness={1}
        />
      </mesh>

      <mesh position={[2.4, 7.6, 0.4]} castShadow>
        <sphereGeometry args={[2.5, 9, 7]} />
        <meshStandardMaterial
          color="#2d5c33"
          roughness={1}
        />
      </mesh>

      <mesh position={[-2.3, 7.7, -0.5]} castShadow>
        <sphereGeometry args={[2.45, 9, 7]} />
        <meshStandardMaterial
          color="#315f36"
          roughness={1}
        />
      </mesh>
    </group>
  )
}
