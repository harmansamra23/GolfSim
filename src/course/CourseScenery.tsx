import type { GolfHole } from '../courses/courseTypes'
import {
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'

export function CourseScenery({ hole }: { hole: GolfHole }) {
  const holeLength = Math.abs(hole.green.center.z - hole.tee.z)

  const rows = Array.from({ length: 7 }, (_, index) => {
    const t = index / 6
    const z = hole.tee.z - 70 - t * (holeLength + 80)
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)

    return {
      z,
      leftX: center - width - 58 - (index % 2) * 13,
      rightX: center + width + 58 + ((index + 1) % 2) * 13,
      hillScale: 1 + (index % 3) * 0.16,
      treeScale: 0.95 + (index % 4) * 0.12,
    }
  })

  return (
    <group>
      {rows.map((row, index) => (
        <group key={index}>
          <LowHill
            position={[row.leftX - 18, -2.8, row.z - 18]}
            scale={[38 * row.hillScale, 7, 48]}
          />
          <LowHill
            position={[row.rightX + 18, -3.1, row.z - 28]}
            scale={[42 * row.hillScale, 8, 52]}
          />

          <DistantTree
            position={[row.leftX, 0, row.z]}
            scale={row.treeScale}
          />
          <DistantTree
            position={[row.rightX, 0, row.z - 8]}
            scale={row.treeScale * 1.05}
          />
          <DistantTree
            position={[row.leftX - 12, 0, row.z - 18]}
            scale={row.treeScale * 0.82}
          />
          <DistantTree
            position={[row.rightX + 14, 0, row.z - 22]}
            scale={row.treeScale * 0.88}
          />
        </group>
      ))}
    </group>
  )
}

function LowHill({
  position,
  scale,
}: {
  position: [number, number, number]
  scale: [number, number, number]
}) {
  return (
    <mesh position={position} scale={scale} receiveShadow>
      <sphereGeometry args={[1, 24, 12]} />
      <meshStandardMaterial color="#2d5235" roughness={1} />
    </mesh>
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
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 7, 8]} />
        <meshStandardMaterial color="#493423" roughness={1} />
      </mesh>

      <mesh position={[0, 7.9, 0]} castShadow>
        <sphereGeometry args={[3.2, 10, 8]} />
        <meshStandardMaterial color="#234d2b" roughness={1} />
      </mesh>

      <mesh position={[2.1, 7.2, 0.35]} castShadow>
        <sphereGeometry args={[2.2, 9, 7]} />
        <meshStandardMaterial color="#2d5c33" roughness={1} />
      </mesh>

      <mesh position={[-2, 7.3, -0.45]} castShadow>
        <sphereGeometry args={[2.15, 9, 7]} />
        <meshStandardMaterial color="#315f36" roughness={1} />
      </mesh>
    </group>
  )
}
