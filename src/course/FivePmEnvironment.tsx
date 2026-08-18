import { Sky } from '@react-three/drei'

export function FivePmEnvironment() {
  return (
    <>
      <color attach="background" args={['#9fc8e8']} />
      <fog attach="fog" args={['#b7c7c8', 330, 1220]} />

      <Sky
        distance={449000}
        sunPosition={[-85, 36, -55]}
        turbidity={5.2}
        rayleigh={1.8}
        mieCoefficient={0.006}
        mieDirectionalG={0.78}
      />

      <ambientLight intensity={0.32} color="#fff6ea" />
      <hemisphereLight
        intensity={1.14}
        color="#fff9f0"
        groundColor="#687557"
      />
      <directionalLight
        position={[-48, 78, 38]}
        intensity={1.18}
        color="#ffe1ad"
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-camera-near={1}
        shadow-camera-far={340}
        shadow-bias={-0.00018}
      />
    </>
  )
}
