const leftTrees = [
  [-24, -25, 1.1, 0.1],
  [-28, -50, 1.25, -0.35],
  [-31, -78, 1.0, 0.45],
  [-33, -108, 1.3, -0.1],
  [-34, -140, 1.1, 0.7],
  [-33, -172, 1.25, -0.55],
  [-31, -205, 1.05, 0.25],
  [-30, -238, 1.2, -0.8],
  [-29, -270, 1.15, 0.55],
  [-27, -300, 1.25, -0.2],
  [-26, -330, 1.05, 0.85],
] as const

const rightTrees = [
  [25, -28, 1.15, -0.2],
  [29, -55, 1.0, 0.6],
  [32, -82, 1.3, -0.45],
  [34, -112, 1.1, 0.3],
  [35, -145, 1.25, -0.7],
  [34, -178, 1.05, 0.15],
  [33, -210, 1.2, 0.8],
  [32, -243, 1.1, -0.25],
  [30, -276, 1.25, 0.5],
  [28, -307, 1.0, -0.6],
  [27, -335, 1.15, 0.2],
] as const

export function Vegetation() {
  return (
    <>
      {leftTrees.map(([x, z, scale, rotation], index) => (
        <Tree
          key={`left-${index}`}
          position={[x, 0, z]}
          scale={scale}
          rotation={rotation}
        />
      ))}

      {rightTrees.map(([x, z, scale, rotation], index) => (
        <Tree
          key={`right-${index}`}
          position={[x, 0, z]}
          scale={scale}
          rotation={rotation}
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
        <meshStandardMaterial
          color="#4b3524"
          roughness={0.96}
        />
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
      <meshStandardMaterial
        color={color}
        roughness={0.94}
      />
    </mesh>
  )
}
