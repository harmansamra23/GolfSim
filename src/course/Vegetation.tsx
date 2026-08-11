const leftTrees = [
  [-24, -25, 1.1],
  [-28, -50, 1.25],
  [-31, -78, 1.0],
  [-33, -108, 1.3],
  [-34, -140, 1.1],
  [-33, -172, 1.25],
  [-31, -205, 1.05],
  [-30, -238, 1.2],
  [-29, -270, 1.15],
  [-27, -300, 1.25],
  [-26, -330, 1.05],
] as const

const rightTrees = [
  [25, -28, 1.15],
  [29, -55, 1.0],
  [32, -82, 1.3],
  [34, -112, 1.1],
  [35, -145, 1.25],
  [34, -178, 1.05],
  [33, -210, 1.2],
  [32, -243, 1.1],
  [30, -276, 1.25],
  [28, -307, 1.0],
  [27, -335, 1.15],
] as const

export function Vegetation() {
  return (
    <>
      {leftTrees.map(([x, z, scale], index) => (
        <Tree
          key={`left-${index}`}
          position={[x, 0, z]}
          scale={scale}
        />
      ))}

      {rightTrees.map(([x, z, scale], index) => (
        <Tree
          key={`right-${index}`}
          position={[x, 0, z]}
          scale={scale}
        />
      ))}
    </>
  )
}

function Tree({
  position,
  scale,
}: {
  position: [number, number, number]
  scale: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2.7, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.5, 5.4, 10]} />
        <meshStandardMaterial
          color="#503a29"
          roughness={1}
        />
      </mesh>

      <mesh
        position={[0, 6.4, 0]}
        scale={[1.35, 0.9, 1.15]}
        castShadow
      >
        <dodecahedronGeometry args={[2.5, 1]} />
        <meshStandardMaterial
          color="#285e31"
          roughness={1}
          flatShading
        />
      </mesh>

      <mesh position={[1.5, 5.8, 0.3]} castShadow>
        <dodecahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#34713a"
          roughness={1}
          flatShading
        />
      </mesh>

      <mesh position={[-1.5, 5.9, -0.2]} castShadow>
        <dodecahedronGeometry args={[1.7, 1]} />
        <meshStandardMaterial
          color="#306936"
          roughness={1}
          flatShading
        />
      </mesh>
    </group>
  )
}
