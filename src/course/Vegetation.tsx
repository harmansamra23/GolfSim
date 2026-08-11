import type { GolfHole } from '../courses/courseTypes'
import {
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'

export function Vegetation({ hole }: { hole: GolfHole }) {
  const treeRows = Array.from({ length: 11 }, (_, index) => {
    const t = (index + 1) / 12
    const z =
      hole.fairway.startZ +
      (hole.fairway.endZ - hole.fairway.startZ) * t
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)

    return {
      z,
      leftX: center - width - 13 - (index % 3) * 2,
      rightX: center + width + 13 + ((index + 1) % 3) * 2,
      leftScale: 1 + (index % 4) * 0.08,
      rightScale: 1.05 + ((index + 2) % 4) * 0.07,
      leftRotation: -0.65 + (index % 5) * 0.28,
      rightRotation: 0.6 - (index % 5) * 0.25,
    }
  })

  return (
    <>
      {treeRows.map((tree, index) => (
        <Tree
          key={`left-${index}`}
          position={[tree.leftX, 0, tree.z]}
          scale={tree.leftScale}
          rotation={tree.leftRotation}
        />
      ))}

      {treeRows.map((tree, index) => (
        <Tree
          key={`right-${index}`}
          position={[tree.rightX, 0, tree.z]}
          scale={tree.rightScale}
          rotation={tree.rightRotation}
        />
      ))}
    </>
  )
}

function Tree({
  position,
  scale,
  rotation,
}: {
  position: [number, number, number]
  scale: number
  rotation: number
}) {
  return (
    <group
      position={position}
      scale={scale}
      rotation={[0, rotation, 0]}
    >
      <mesh position={[0, 2.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.48, 5.6, 9]} />
        <meshStandardMaterial color="#4b3524" roughness={0.96} />
      </mesh>

      <mesh
        position={[0.65, 4.55, 0]}
        rotation={[0, 0, -0.48]}
        castShadow
      >
        <cylinderGeometry args={[0.12, 0.2, 3, 7]} />
        <meshStandardMaterial color="#4a3423" roughness={1} />
      </mesh>

      <mesh
        position={[-0.7, 4.8, -0.25]}
        rotation={[0.15, 0, 0.55]}
        castShadow
      >
        <cylinderGeometry args={[0.11, 0.19, 2.8, 7]} />
        <meshStandardMaterial color="#4a3423" roughness={1} />
      </mesh>

      <Canopy
        position={[0, 6.7, 0]}
        scale={[1.6, 1.08, 1.3]}
        color="#275d31"
      />
      <Canopy
        position={[1.55, 6.15, 0.35]}
        scale={[1.15, 0.9, 1.05]}
        color="#33733b"
      />
      <Canopy
        position={[-1.55, 6.25, -0.2]}
        scale={[1.15, 0.92, 1.08]}
        color="#2e6837"
      />
      <Canopy
        position={[0.35, 7.75, -0.25]}
        scale={[1.05, 0.82, 0.95]}
        color="#3a7b42"
      />
    </group>
  )
}

function Canopy({
  position,
  scale,
  color,
}: {
  position: [number, number, number]
  scale: [number, number, number]
  color: string
}) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <icosahedronGeometry args={[2.2, 2]} />
      <meshStandardMaterial color={color} roughness={0.94} />
    </mesh>
  )
}
