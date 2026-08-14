import type { GolfHole } from '../courses/courseTypes'
import {
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'

const MOUNTAIN_COUNT = 30
const MOUNTAIN_RADIUS = 560

export function CourseScenery({ hole }: { hole: GolfHole }) {
  if (hole.environmentStyle === 'SACRAMENTO_VALLEY') {
    return <SacramentoValleyScenery hole={hole} />
  }

  return <GenericScenery hole={hole} />
}

function SacramentoValleyScenery({ hole }: { hole: GolfHole }) {
  const holeLength = Math.abs(hole.green.center.z - hole.tee.z)
  const worldCenterX = (hole.tee.x + hole.green.center.x) / 2
  const worldCenterZ = (hole.tee.z + hole.green.center.z) / 2

  const horizonTrees = Array.from({ length: 18 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1
    const t = (Math.floor(index / 2) + 1) / 10
    const z = hole.tee.z - 25 - t * (holeLength + 55)
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)

    return {
      x: center + side * (width + 45 + (index % 3) * 12),
      z,
      scale: 0.72 + (index % 5) * 0.08,
    }
  })

  const fieldBands = Array.from({ length: 5 }, (_, index) => ({
    x: worldCenterX + (index - 2) * 190,
    z: worldCenterZ - 120 - (index % 2) * 70,
    width: 180 + (index % 3) * 55,
    depth: 260 + (index % 2) * 110,
  }))

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[worldCenterX, -0.24, worldCenterZ]}
        receiveShadow
      >
        <circleGeometry args={[760, 96]} />
        <meshStandardMaterial color="#49633c" roughness={1} />
      </mesh>

      {fieldBands.map((field, index) => (
        <mesh
          key={`field-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[field.x, -0.21, field.z]}
        >
          <planeGeometry args={[field.width, field.depth]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#6f7441' : '#59683d'}
            roughness={1}
          />
        </mesh>
      ))}

      {horizonTrees.map((tree, index) => (
        <DistantOak
          key={`valley-oak-${index}`}
          position={[tree.x, 0, tree.z]}
          scale={tree.scale}
        />
      ))}

      <HorizonLine
        centerX={worldCenterX}
        centerZ={worldCenterZ - holeLength * 0.45}
      />
    </group>
  )
}

function HorizonLine({
  centerX,
  centerZ,
}: {
  centerX: number
  centerZ: number
}) {
  return (
    <group position={[centerX, 0, centerZ]}>
      {Array.from({ length: 20 }, (_, index) => {
        const angle = (index / 20) * Math.PI * 2
        const radius = 610 + (index % 4) * 22
        return (
          <mesh
            key={index}
            position={[
              Math.cos(angle) * radius,
              5 + (index % 3),
              Math.sin(angle) * radius,
            ]}
            scale={[44 + (index % 4) * 8, 7 + (index % 3), 18]}
          >
            <sphereGeometry args={[1, 12, 6]} />
            <meshStandardMaterial color="#52654b" roughness={1} />
          </mesh>
        )
      })}
    </group>
  )
}

function GenericScenery({ hole }: { hole: GolfHole }) {
  const holeLength = Math.abs(hole.green.center.z - hole.tee.z)
  const worldCenterX = (hole.tee.x + hole.green.center.x) / 2
  const worldCenterZ = (hole.tee.z + hole.green.center.z) / 2

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

  const mountains = Array.from({ length: MOUNTAIN_COUNT }, (_, index) => {
    const angle = (index / MOUNTAIN_COUNT) * Math.PI * 2
    const radius = MOUNTAIN_RADIUS + (index % 4) * 26
    const height = 68 + (index % 6) * 12
    const width = 76 + ((index * 3) % 5) * 14

    return {
      x: worldCenterX + Math.cos(angle) * radius,
      z: worldCenterZ + Math.sin(angle) * radius,
      height,
      width,
      rotationY: -angle + Math.PI / 2,
      color:
        index % 3 === 0
          ? '#61746a'
          : index % 3 === 1
            ? '#53675e'
            : '#718078',
    }
  })

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[worldCenterX, -0.22, worldCenterZ]}
        receiveShadow
      >
        <circleGeometry args={[720, 96]} />
        <meshStandardMaterial color="#34573a" roughness={1} />
      </mesh>

      {mountains.map((mountain, index) => (
        <group
          key={`mountain-${index}`}
          position={[mountain.x, 0, mountain.z]}
          rotation={[0, mountain.rotationY, 0]}
        >
          <mesh
            position={[0, mountain.height * 0.42 - 9, 0]}
            scale={[1, 1, 0.72]}
          >
            <coneGeometry args={[mountain.width, mountain.height, 7, 3]} />
            <meshStandardMaterial color={mountain.color} roughness={1} />
          </mesh>
        </group>
      ))}

      {rows.map((row, index) => (
        <group key={`scenery-row-${index}`}>
          <LowHill
            position={[row.leftX - 18, -2.8, row.z - 18]}
            scale={[38 * row.hillScale, 7, 48]}
          />
          <LowHill
            position={[row.rightX + 18, -3.1, row.z - 28]}
            scale={[42 * row.hillScale, 8, 52]}
          />
          <DistantTree position={[row.leftX, 0, row.z]} scale={row.treeScale} />
          <DistantTree position={[row.rightX, 0, row.z - 8]} scale={row.treeScale * 1.05} />
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

function DistantOak({
  position,
  scale,
}: {
  position: [number, number, number]
  scale: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.72, 6.4, 8]} />
        <meshStandardMaterial color="#51402d" roughness={1} />
      </mesh>
      <mesh position={[0, 7.1, 0]} scale={[1.55, 0.78, 1.35]} castShadow>
        <icosahedronGeometry args={[3.6, 1]} />
        <meshStandardMaterial color="#365a32" roughness={1} />
      </mesh>
      <mesh position={[2.5, 6.6, 0.3]} scale={[1.1, 0.62, 1]} castShadow>
        <icosahedronGeometry args={[2.7, 1]} />
        <meshStandardMaterial color="#3f6738" roughness={1} />
      </mesh>
      <mesh position={[-2.4, 6.7, -0.4]} scale={[1.1, 0.65, 1]} castShadow>
        <icosahedronGeometry args={[2.6, 1]} />
        <meshStandardMaterial color="#31542f" roughness={1} />
      </mesh>
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
      <mesh position={[0, 3.5, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.45, 7, 8]} />
        <meshStandardMaterial color="#493423" roughness={1} />
      </mesh>
      <mesh position={[0, 7.9, 0]} castShadow>
        <sphereGeometry args={[3.2, 10, 8]} />
        <meshStandardMaterial color="#234d2b" roughness={1} />
      </mesh>
    </group>
  )
}
