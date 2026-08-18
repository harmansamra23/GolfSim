import { Sky } from '@react-three/drei'

export function FivePmEnvironment() {
  return (
    <>
      <color attach="background" args={['#a9c9df']} />
      <fog attach="fog" args={['#c8c3ad', 260, 1100]} />

      <Sky
        distance={449000}
        sunPosition={[-95, 28, -70]}
        turbidity={6.5}
        rayleigh={1.6}
        mieCoefficient={0.008}
        mieDirectionalG={0.82}
      />

      <ambientLight intensity={0.24} color="#fff0df" />
      <hemisphereLight
        intensity={1.02}
        color="#fff5e7"
        groundColor="#586447"
      />
      <directionalLight
        position={[-55, 68, 42]}
        intensity={0.95}
        color="#ffe0ad"
      />
    </>
  )
}
