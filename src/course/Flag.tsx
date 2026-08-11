import * as THREE from 'three'

import { plumasLakeHole1 } from '../courses/plumasLakeHole1'

export function Flag() {
  const green = plumasLakeHole1.green

  return (
    <>
      <mesh
        position={[green.center.x, 2.25, green.center.z]}
        castShadow
      >
        <cylinderGeometry
          args={[0.025, 0.025, 4.3, 12]}
        />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      <mesh
        position={[green.center.x + 0.7, 3.7, green.center.z]}
        castShadow
      >
        <planeGeometry args={[1.4, 0.72]} />
        <meshStandardMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}
