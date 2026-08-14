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

  const mountainZ = hole.green.center.z - 190
  const mountainCenterX = hole.green.center.x * 0.35

  return (
    <group>
      <MountainRange
        centerX={mountainCenterX}
        z={mountainZ}
      />

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

function MountainRange({
  centerX,
  z,
}: {
  centerX: number
  z: number
}) {
  const peaks = [
    { x: -210, height: 72, radius: 105, depth: 0 },
    { x: -125, height: 105, radius: 125, depth: -18 },
    { x: -38, height: 82, radius: 108, depth: 8 },
    { x: 55, height: 122, radius: 138, depth: -28 },
    { x: 150, height: 92, radius: 118, depth: 4 },
    { x: 235, height: 68, radius: 96, depth: -12 },
  ]

  return (
    <group>
      {peaks.map((peak, index) => (
        <mesh
          key={index}
          position={[
            centerX + peak.x,
            peak.height * 0.42 - 8,
            z + peak.depth,
          ]}
          scale={[1, 1, 0.72]}
          receiveShadow
        >
          <coneGeometry
            args={[peak.radius, peak.height, 7, 3]}
          />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#5f746b' : '#536a62'}
            roughness={1}
          />
        </mesh>
      ))}

      {peaks.slice(1, 5).map((peak, index) => (
        <mesh
          key={`ridge-${index}`}
          position={[
            centerX + peak.x + 34,
            peak.height * 0.28 - 13,
            z - 38 + peak.depth,
          ]}
          scale={[1.1, 0.72, 0.8]}
        >
          <coneGeometry args={[peak.radius * 0.8, peak.height * 0.72, 6, 2]} />
          <meshStandardMaterial color="#73837a" roughness={1} />
        </mesh>
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
