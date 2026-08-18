import type { GolfHole } from '../courses/courseTypes'

const MOUNTAIN_COUNT = 18

export function CourseScenery({ hole }: { hole: GolfHole }) {
  const holeLength = Math.abs(hole.green.center.z - hole.tee.z)
  const centerX = (hole.tee.x + hole.green.center.x) / 2
  const centerZ = hole.green.center.z - Math.max(210, holeLength * 0.28)

  return (
    <group position={[centerX, 0, centerZ]}>
      {Array.from({ length: MOUNTAIN_COUNT }, (_, index) => {
        const t = index / (MOUNTAIN_COUNT - 1)
        const x = -620 + t * 1240
        const z = -430 - Math.sin(t * Math.PI) * 90 - (index % 3) * 35
        const width = 105 + (index % 5) * 24
        const height = 70 + (index % 6) * 18
        const depth = 48 + (index % 4) * 10
        const color =
          index % 3 === 0
            ? '#8298a5'
            : index % 3 === 1
              ? '#91a5ae'
              : '#748b99'

        return (
          <group key={index} position={[x, 0, z]}>
            <mesh
              position={[0, height * 0.42, 0]}
              scale={[width, height, depth]}
            >
              <coneGeometry args={[1, 1, 7, 2]} />
              <meshStandardMaterial color={color} roughness={1} />
            </mesh>

            <mesh
              position={[width * 0.42, height * 0.28, 18]}
              scale={[width * 0.64, height * 0.7, depth * 0.82]}
            >
              <coneGeometry args={[1, 1, 6, 2]} />
              <meshStandardMaterial color="#9aabb2" roughness={1} />
            </mesh>

            <mesh
              position={[-width * 0.38, height * 0.24, 28]}
              scale={[width * 0.58, height * 0.58, depth * 0.74]}
            >
              <coneGeometry args={[1, 1, 6, 2]} />
              <meshStandardMaterial color="#879ba5" roughness={1} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
