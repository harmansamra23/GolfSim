import type { GolfHole } from '../courses/courseTypes'
import {
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'

export function Vegetation({ hole }: { hole: GolfHole }) {
  const valleyStyle = hole.environmentStyle === 'SACRAMENTO_VALLEY'
  const rowCount = valleyStyle ? 16 : 11
  const treeRows = Array.from({ length: rowCount }, (_, index) => {
    const t = (index + 1) / (rowCount + 1)
    const z =
      hole.fairway.startZ +
      (hole.fairway.endZ - hole.fairway.startZ) * t
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)
    const edgeGap = valleyStyle ? 10 : 13

    return {
      z,
      leftX: center - width - edgeGap - (index % 3) * 2,
      rightX: center + width + edgeGap + ((index + 1) % 3) * 2,
      leftScale: (valleyStyle ? 1.18 : 1) + (index % 4) * 0.08,
      rightScale: (valleyStyle ? 1.22 : 1.05) + ((index + 2) % 4) * 0.07,
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
          valleyStyle={valleyStyle}
        />
      ))}

      {treeRows.map((tree, index) => (
        <Tree
          key={`right-${index}`}
          position={[tree.rightX, 0, tree.z - (valleyStyle && index % 2 ? 6 : 0)]}
          scale={tree.rightScale}
          rotation={tree.rightRotation}
          valleyStyle={valleyStyle}
        />
      ))}
    </>
  )
}

function Tree({
  position,
  scale,
  rotation,
  valleyStyle,
}: {
  position: [number, number, number]
  scale: number
  rotation: number
  valleyStyle: boolean
}) {
  const trunkHeight = valleyStyle ? 6.4 : 5.6
  const canopyY = valleyStyle ? 7.4 : 6.7

  return (
    <group
      position={position}
      scale={scale}
      rotation={[0, rotation, 0]}
    >
      <mesh position={[0, trunkHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={valleyStyle ? [0.38, 0.68, trunkHeight, 9] : [0.28, 0.48, trunkHeight, 9]}
        />
        <meshStandardMaterial color="#4b3524" roughness={0.96} />
      </mesh>

      <mesh
        position={[0.9, 4.9, 0]}
        rotation={[0, 0, -0.48]}
        castShadow
      >
        <cylinderGeometry args={[0.12, 0.22, 3.5, 7]} />
        <meshStandardMaterial color="#4a3423" roughness={1} />
      </mesh>

      <mesh
        position={[-0.9, 5.05, -0.25]}
        rotation={[0.15, 0, 0.55]}
        castShadow
      >
        <cylinderGeometry args={[0.11, 0.21, 3.2, 7]} />
        <meshStandardMaterial color="#4a3423" roughness={1} />
      </mesh>

      <Canopy
        position={[0, canopyY, 0]}
        scale={valleyStyle ? [2.05, 1.02, 1.72] : [1.6, 1.08, 1.3]}
        color="#315b31"
      />
      <Canopy
        position={[2, canopyY - 0.45, 0.35]}
        scale={valleyStyle ? [1.45, 0.78, 1.28] : [1.15, 0.9, 1.05]}
        color="#3d6c38"
      />
      <Canopy
        position={[-2, canopyY - 0.35, -0.2]}
        scale={valleyStyle ? [1.48, 0.8, 1.3] : [1.15, 0.92, 1.08]}
        color="#2f5830"
      />
      <Canopy
        position={[0.35, canopyY + 1.05, -0.25]}
        scale={valleyStyle ? [1.2, 0.67, 1.08] : [1.05, 0.82, 0.95]}
        color="#47753f"
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
