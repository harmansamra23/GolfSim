import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function GolfScene() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 4.2, 18],
        fov: 50,
      }}
    >
      <color attach="background" args={['#8ecdf0']} />
      <fog attach="fog" args={['#8ecdf0', 140, 430]} />

      <ambientLight intensity={1.1} />

      <directionalLight
        position={[45, 65, 25]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <GolfCourse />

      <OrbitControls
        target={[0, 1.2, -120]}
        minDistance={6}
        maxDistance={180}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  )
}

function GolfCourse() {
  const fairwayShape = new THREE.Shape()

  fairwayShape.moveTo(-11, 0)

  fairwayShape.bezierCurveTo(
    -14,
    -35,
    -21,
    -75,
    -18,
    -115
  )

  fairwayShape.bezierCurveTo(
    -15,
    -160,
    -8,
    -205,
    -9,
    -250
  )

  fairwayShape.bezierCurveTo(
    -9,
    -260,
    -7,
    -267,
    -6,
    -270
  )

  fairwayShape.lineTo(6, -270)

  fairwayShape.bezierCurveTo(
    7,
    -267,
    9,
    -260,
    9,
    -250
  )

  fairwayShape.bezierCurveTo(
    8,
    -205,
    15,
    -160,
    18,
    -115
  )

  fairwayShape.bezierCurveTo(
    21,
    -75,
    14,
    -35,
    11,
    0
  )

  fairwayShape.closePath()

  return (
    <>
      <Terrain />

      {/* Tee box */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.09, 6]}
        receiveShadow
      >
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial
          color="#6cae58"
          roughness={0.95}
        />
      </mesh>

      {/* Fairway */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.11, 0]}
        receiveShadow
      >
        <shapeGeometry args={[fairwayShape]} />
        <meshStandardMaterial
          color="#62a94f"
          roughness={0.9}
        />
      </mesh>

      {/* Green fringe */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.12, -270]}
        receiveShadow
      >
        <circleGeometry args={[22, 64]} />
        <meshStandardMaterial
          color="#4f9144"
          roughness={0.95}
        />
      </mesh>

      {/* Green */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.13, -270]}
        receiveShadow
      >
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial
          color="#7dbc63"
          roughness={0.85}
        />
      </mesh>

      {/* Bunkers */}
      <Bunker
        position={[-13, 0.14, -251]}
        scale={[1.35, 0.72, 1]}
      />

      <Bunker
        position={[14, 0.14, -258]}
        scale={[1.5, 0.75, 1]}
      />

      {/* Golf ball */}
      <mesh position={[0, 0.24, 6]} castShadow>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
        />
      </mesh>

      {/* Tee markers */}
      <mesh position={[-1.5, 0.22, 6]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.4]} />
        <meshStandardMaterial color="#1958d1" />
      </mesh>

      <mesh position={[1.5, 0.22, 6]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.4]} />
        <meshStandardMaterial color="#1958d1" />
      </mesh>

      {/* Flag pole */}
      <mesh position={[0, 2.25, -270]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 4.4, 12]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      {/* Flag */}
      <mesh position={[0.65, 3.75, -270]} castShadow>
        <planeGeometry args={[1.3, 0.7]} />
        <meshStandardMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left tree line */}
      <Tree position={[-24, 0, -35]} scale={1.05} />
      <Tree position={[-28, 0, -65]} scale={1.2} />
      <Tree position={[-30, 0, -95]} scale={0.95} />
      <Tree position={[-29, 0, -125]} scale={1.2} />
      <Tree position={[-27, 0, -155]} scale={1.05} />
      <Tree position={[-25, 0, -190]} scale={1.3} />
      <Tree position={[-23, 0, -220]} scale={0.95} />

      {/* Right tree line */}
      <Tree position={[24, 0, -40]} scale={1.1} />
      <Tree position={[28, 0, -70]} scale={0.95} />
      <Tree position={[31, 0, -100]} scale={1.25} />
      <Tree position={[29, 0, -130]} scale={1.05} />
      <Tree position={[27, 0, -165]} scale={1.2} />
      <Tree position={[25, 0, -200]} scale={1} />
      <Tree position={[23, 0, -230]} scale={1.15} />

      {/* Background trees */}
      <Tree position={[-42, 0, -130]} scale={1.1} />
      <Tree position={[43, 0, -145]} scale={1.2} />
      <Tree position={[-38, 0, -205]} scale={0.95} />
      <Tree position={[39, 0, -215]} scale={1} />
    </>
  )
}

function Terrain() {
  const geometry = new THREE.PlaneGeometry(
    240,
    520,
    60,
    130
  )

  const positionAttribute = geometry.attributes.position

  for (let i = 0; i < positionAttribute.count; i++) {
    const x = positionAttribute.getX(i)
    const y = positionAttribute.getY(i)

    const gentleRoll =
      Math.sin(x * 0.035) * 1.4 +
      Math.cos(y * 0.018) * 1.1

    const sideVariation =
      Math.sin((x + y) * 0.025) * 0.7

    const elevation = gentleRoll + sideVariation

    positionAttribute.setZ(i, elevation)
  }

  geometry.computeVertexNormals()

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.05, -140]}
      receiveShadow
    >
      <meshStandardMaterial
        color="#2d612f"
        roughness={1}
      />
    </mesh>
  )
}

function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh
        position={[0, 2.1, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.3, 0.42, 4.2, 10]} />
        <meshStandardMaterial
          color="#65452c"
          roughness={1}
        />
      </mesh>

      <mesh position={[0, 5.3, 0]} castShadow>
        <sphereGeometry args={[2.3, 16, 16]} />
        <meshStandardMaterial
          color="#2d7034"
          roughness={1}
        />
      </mesh>

      <mesh position={[1.3, 4.9, 0.2]} castShadow>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshStandardMaterial
          color="#377d3c"
          roughness={1}
        />
      </mesh>

      <mesh position={[-1.25, 4.9, -0.1]} castShadow>
        <sphereGeometry args={[1.55, 16, 16]} />
        <meshStandardMaterial
          color="#347438"
          roughness={1}
        />
      </mesh>
    </group>
  )
}

function Bunker({
  position,
  scale,
}: {
  position: [number, number, number]
  scale: [number, number, number]
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      scale={scale}
      receiveShadow
    >
      <circleGeometry args={[5, 48]} />

      <meshStandardMaterial
        color="#d9c590"
        roughness={1}
      />
    </mesh>
  )
}

export default GolfScene