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

  const midgroundTrees = Array.from({ length: 26 }, (_, index) => {
    const side = index % 2 === 0 ? -1 : 1
    const lane = Math.floor(index / 2)
    const t = (lane + 0.8) / 13.5
    const z = hole.tee.z - 36 - t * (holeLength + 55)
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)
    const stagger = (index % 4) * 6

    return {
      x: center + side * (width + 34 + stagger),
      z: z - (index % 3) * 7,
      scale: 0.72 + (index % 5) * 0.11,
    }
  })

  const backgroundTrees = Array.from({ length: 34 }, (_, index) => {
    const angle = -0.84 + (index / 33) * 1.68
    const radius = 330 + (index % 5) * 22
    return {
      x: worldCenterX + Math.sin(angle) * radius,
      z: hole.green.center.z - 110 - Math.cos(angle) * 75,
      scale: 0.42 + (index % 4) * 0.06,
    }
  })

  const fieldBands = Array.from({ length: 7 }, (_, index) => ({
    x: worldCenterX + (index - 3) * 155,
    z: worldCenterZ - 135 - (index % 2) * 95,
    width: 170 + (index % 3) * 55,
    depth: 300 + (index % 3) * 90,
  }))

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[worldCenterX, -0.28, worldCenterZ]}
        receiveShadow
      >
        <circleGeometry args={[820, 96]} />
        <meshStandardMaterial color="#58734a" roughness={1} />
      </mesh>

      {fieldBands.map((field, index) => (
        <mesh
          key={`field-${index}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[field.x, -0.23, field.z]}
        >
          <planeGeometry args={[field.width, field.depth]} />
          <meshStandardMaterial
            color={
              index % 3 === 0
                ? '#7c824f'
                : index % 3 === 1
                  ? '#64764b'
                  : '#6f7f4e'
            }
            roughness={1}
          />
        </mesh>
      ))}

      <LowBerm
        position={[worldCenterX - 150, 0.2, hole.green.center.z - 115]}
        scale={[150, 3.8, 24]}
      />
      <LowBerm
        position={[worldCenterX + 180, 0.1, hole.green.center.z - 145]}
        scale={[180, 4.6, 30]}
      />

      {midgroundTrees.map((tree, index) => (
        <DistantOak
          key={`mid-oak-${index}`}
          position={[tree.x, 0, tree.z]}
          scale={tree.scale}
          shadow={index < 12}
        />
      ))}

      {backgroundTrees.map((tree, index) => (
        <DistantOak
          key={`back-oak-${index}`}
          position={[tree.x, 0, tree.z]}
          scale={tree.scale}
          shadow={false}
        />
      ))}

      <ClubhouseSilhouette
        position={[
          worldCenterX - 45,
          0,
          hole.green.center.z - 180,
        ]}
      />

      <HorizonLine
        centerX={worldCenterX}
        centerZ={hole.green.center.z - 215}
      />
    </group>
  )
}

function ClubhouseSilhouette({
  position,
}: {
  position: [number, number, number]
}) {
  return (
    <group position={position}>
      <mesh position={[0, 3.2, 0]}>
        <boxGeometry args={[42, 6.4, 8]} />
        <meshStandardMaterial color="#d4cdb8" roughness={0.95} />
      </mesh>
      <mesh position={[0, 6.8, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[31, 31, 8]} />
        <meshStandardMaterial color="#8b745f" roughness={1} />
      </mesh>
      <mesh position={[28, 2.5, 3]}>
        <boxGeometry args={[18, 5, 7]} />
        <meshStandardMaterial color="#e0d9c5" roughness={0.95} />
      </mesh>
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
      {Array.from({ length: 34 }, (_, index) => {
        const t = index / 33
        const x = -620 + t * 1240
        const z = -80 - Math.sin(t * Math.PI) * 45
        const width = 38 + (index % 5) * 9
        const height = 5 + (index % 4) * 1.4

        return (
          <mesh
            key={index}
            position={[x, height * 0.5, z]}
            scale={[width, height, 16]}
          >
            <sphereGeometry args={[1, 8, 5]} />
            <meshStandardMaterial color="#5f7458" roughness={1} />
          </mesh>
        )
      })}
    </group>
  )
}

function LowBerm({
  position,
  scale,
}: {
  position: [number, number, number]
  scale: [number, number, number]
}) {
  return (
    <mesh position={position} scale={scale} receiveShadow>
      <sphereGeometry args={[1, 28, 12]} />
      <meshStandardMaterial color="#60764a" roughness={1} />
    </mesh>
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
          <LowBerm
            position={[row.leftX - 18, -2.8, row.z - 18]}
            scale={[38 * row.hillScale, 7, 48]}
          />
          <LowBerm
            position={[row.rightX + 18, -3.1, row.z - 28]}
            scale={[42 * row.hillScale, 8, 52]}
          />
          <DistantOak
            position={[row.leftX, 0, row.z]}
            scale={row.treeScale}
            shadow
          />
          <DistantOak
            position={[row.rightX, 0, row.z - 8]}
            scale={row.treeScale * 1.05}
            shadow
          />
        </group>
      ))}
    </group>
  )
}

function DistantOak({
  position,
  scale,
  shadow,
}: {
  position: [number, number, number]
  scale: number
  shadow: boolean
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 3.1, 0]} castShadow={shadow}>
        <cylinderGeometry args={[0.42, 0.72, 6.2, 7]} />
        <meshStandardMaterial color="#55412f" roughness={1} />
      </mesh>
      <mesh
        position={[0, 7, 0]}
        scale={[1.65, 0.76, 1.38]}
        castShadow={shadow}
      >
        <icosahedronGeometry args={[3.4, 1]} />
        <meshStandardMaterial color="#41683a" roughness={1} />
      </mesh>
      <mesh
        position={[2.45, 6.5, 0.35]}
        scale={[1.15, 0.6, 1]}
        castShadow={shadow}
      >
        <icosahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial color="#4c7542" roughness={1} />
      </mesh>
      <mesh
        position={[-2.35, 6.6, -0.35]}
        scale={[1.1, 0.63, 1]}
        castShadow={shadow}
      >
        <icosahedronGeometry args={[2.45, 1]} />
        <meshStandardMaterial color="#385e35" roughness={1} />
      </mesh>
    </group>
  )
}
