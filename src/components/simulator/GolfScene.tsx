import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function GolfScene() {
  return (
    <Canvas
      shadows
      camera={{
        position: [0, 5, 14],
        fov: 55,
      }}
    >
      <color attach="background" args={['#87ceeb']} />

      <ambientLight intensity={1.2} />

      <directionalLight
        position={[10, 20, 10]}
        intensity={2}
        castShadow
      />

      {/* Rough */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -100]}
        receiveShadow
      >
        <planeGeometry args={[220, 500]} />
        <meshStandardMaterial color="#2f5f2d" />
      </mesh>

      {/* Fairway */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, -120]}
        receiveShadow
      >
        <planeGeometry args={[45, 300]} />
        <meshStandardMaterial color="#5a9b49" />
      </mesh>

      {/* Green */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, -265]}
        receiveShadow
      >
        <circleGeometry args={[18, 64]} />
        <meshStandardMaterial color="#77ad5b" />
      </mesh>

      {/* Golf ball */}
      <mesh position={[0, 0.12, 6]} castShadow>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Tee markers */}
      <mesh position={[-1.3, 0.18, 6]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#2464c4" />
      </mesh>

      <mesh position={[1.3, 0.18, 6]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.35]} />
        <meshStandardMaterial color="#2464c4" />
      </mesh>

      {/* Flag pole */}
      <mesh position={[0, 2, -265]}>
        <cylinderGeometry args={[0.04, 0.04, 4, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Flag */}
      <mesh position={[0.55, 3.4, -265]}>
        <planeGeometry args={[1.1, 0.6]} />
        <meshStandardMaterial color="white" side={2} />
      </mesh>

      <OrbitControls />
    </Canvas>
  )
}

export default GolfScene