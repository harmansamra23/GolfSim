import { useMemo } from 'react'
import * as THREE from 'three'

import { courseMaterials } from '../components/simulator/CourseMaterials'
import type { GolfHole } from '../courses/courseTypes'
import { terrainHeightAtPosition } from './terrainHeight'

const roughNormalScale = new THREE.Vector2(1.65, 1.65)

export function Terrain({ hole }: { hole: GolfHole }) {
  const centerZ = (hole.tee.z + hole.green.center.z) / 2
  const length = Math.abs(hole.green.center.z - hole.tee.z) + 180
  const width =
    hole.environmentStyle === 'SACRAMENTO_VALLEY' ? 420 : 320

  const geometry = useMemo(() => {
    const zSegments = Math.min(180, Math.max(90, Math.round(length / 4)))
    const terrain = new THREE.PlaneGeometry(width, length, 72, zSegments)
    terrain.rotateX(-Math.PI / 2)

    const positions = terrain.attributes.position

    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index)
      const localZ = positions.getZ(index)
      const worldZ = localZ + centerZ
      positions.setY(index, terrainHeightAtPosition(hole, x, worldZ))
    }

    positions.needsUpdate = true
    terrain.computeVertexNormals()
    terrain.computeBoundingSphere()
    return terrain
  }, [centerZ, hole, length, width])

  return (
    <mesh
      geometry={geometry}
      position={[0, 0, centerZ]}
      receiveShadow
    >
      <meshStandardMaterial
        map={courseMaterials.rough.map}
        normalMap={courseMaterials.rough.normalMap}
        normalScale={roughNormalScale}
        roughnessMap={courseMaterials.rough.roughnessMap}
        color="#91ad72"
        roughness={0.96}
      />
    </mesh>
  )
}
