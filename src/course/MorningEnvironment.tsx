import { Sky } from '@react-three/drei'

type CloudSpec = {
  position: [number, number, number]
  scale: [number, number, number]
  opacity: number
}

const clouds: CloudSpec[] = [
  { position: [-210, 105, -360], scale: [30, 7, 13], opacity: 0.72 },
  { position: [45, 122, -470], scale: [40, 8, 15], opacity: 0.66 },
  { position: [255, 98, -330], scale: [34, 7, 14], opacity: 0.7 },
  { position: [-330, 132, -620], scale: [46, 9, 17], opacity: 0.58 },
  { position: [365, 140, -670], scale: [50, 10, 18], opacity: 0.56 },
  { position: [-90, 150, -760], scale: [54, 10, 20], opacity: 0.5 },
]

export function MorningEnvironment() {
  return (
    <>
      <color attach="background" args={['#b9daf2']} />
      <fog attach="fog" args={['#c9dce8', 480, 1450]} />

      <Sky
        distance={449000}
        sunPosition={[105, 72, -65]}
        turbidity={4.4}
        rayleigh={1.95}
        mieCoefficient={0.004}
        mieDirectionalG={0.74}
      />

      <ambientLight intensity={0.48} color="#ffffff" />
      <hemisphereLight
        intensity={1.32}
        color="#f5fbff"
        groundColor="#71805f"
      />
      <directionalLight
        position={[85, 115, 30]}
        intensity={1.52}
        color="#fff4dc"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-135}
        shadow-camera-right={135}
        shadow-camera-top={135}
        shadow-camera-bottom={-135}
        shadow-camera-near={1}
        shadow-camera-far={420}
        shadow-bias={-0.00016}
      />

      {clouds.map((cloud, index) => (
        <MorningCloud key={index} {...cloud} />
      ))}
    </>
  )
}

function MorningCloud({
  position,
  scale,
  opacity,
}: CloudSpec) {
  return (
    <group position={position} scale={scale}>
      <CloudPuff position={[-0.72, 0, 0]} scale={[0.85, 0.62, 0.72]} opacity={opacity} />
      <CloudPuff position={[0, 0.16, 0]} scale={[1.2, 0.82, 0.9]} opacity={opacity} />
      <CloudPuff position={[0.88, 0.02, 0.04]} scale={[0.9, 0.64, 0.76]} opacity={opacity} />
      <CloudPuff position={[0.25, 0.42, -0.04]} scale={[0.78, 0.58, 0.64]} opacity={opacity * 0.92} />
    </group>
  )
}

function CloudPuff({
  position,
  scale,
  opacity,
}: {
  position: [number, number, number]
  scale: [number, number, number]
  opacity: number
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 14, 9]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  )
}
