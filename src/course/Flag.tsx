import * as THREE from 'three'

import { plumasLakeHole1 } from '../courses/plumasLakeHole1'

export function Flag() {
  const green = plumasLakeHole1.green

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[green.center.x, 0.082, green.center.z]}
      >
        <circleGeometry args={[0.11, 32]} />
        <meshStandardMaterial color="#0b0b0b" roughness={1} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[green.center.x, 0.084, green.center.z]}
      >
        <ringGeometry args={[0.108, 0.135, 32]} />
        <meshStandardMaterial color="#f1f1e8" roughness={0.7} />
      </mesh>

      <mesh
        position={[green.center.x, 2.25, green.center.z]}
        castShadow
      >
        <cylinderGeometry args={[0.025, 0.025, 4.3, 12]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.45} />
      </mesh>

      <mesh
        position={[green.center.x + 0.7, 3.7, green.center.z]}
        castShadow
      >
        <planeGeometry args={[1.4, 0.72]} />
        <meshStandardMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>
    </>
  )
}
