import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import { getSurfaceAtPosition } from '../physics/surfacePhysics'
import { terrainHeightAtPosition } from './terrainHeight'

const PATCH_RADIUS = 32
const REFRESH_DISTANCE = 6
const SAMPLE_COUNT = 5200

const ROUGH_CAPACITY = 2400
const FIRST_CUT_CAPACITY = 1300
const FAIRWAY_CAPACITY = 900

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

type LayerSettings = {
  mesh: THREE.InstancedMesh | null
  capacity: number
  offsetY: number
  minHeight: number
  maxHeight: number
  minWidth: number
  maxWidth: number
  density: number
}

export function GrassDetail({ hole }: { hole: GolfHole }) {
  const { camera } = useThree()
  const roughRef = useRef<THREE.InstancedMesh>(null)
  const firstCutRef = useRef<THREE.InstancedMesh>(null)
  const fairwayRef = useRef<THREE.InstancedMesh>(null)
  const lastPatchCenter = useRef(
    new THREE.Vector2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
  )
  const dummy = useRef(new THREE.Object3D())

  useEffect(() => {
    const meshes = [roughRef.current, firstCutRef.current, fairwayRef.current]
    for (const mesh of meshes) {
      mesh?.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    }
  }, [])

  function updateGrassPatch(centerX: number, centerZ: number) {
    const rough: LayerSettings = {
      mesh: roughRef.current,
      capacity: ROUGH_CAPACITY,
      offsetY: 0.018,
      minHeight: 0.11,
      maxHeight: 0.22,
      minWidth: 0.028,
      maxWidth: 0.052,
      density: 0.75,
    }
    const firstCut: LayerSettings = {
      mesh: firstCutRef.current,
      capacity: FIRST_CUT_CAPACITY,
      offsetY: 0.038,
      minHeight: 0.055,
      maxHeight: 0.1,
      minWidth: 0.022,
      maxWidth: 0.038,
      density: 0.56,
    }
    const fairway: LayerSettings = {
      mesh: fairwayRef.current,
      capacity: FAIRWAY_CAPACITY,
      offsetY: 0.052,
      minHeight: 0.018,
      maxHeight: 0.04,
      minWidth: 0.015,
      maxWidth: 0.028,
      density: 0.28,
    }

    const counts = { rough: 0, firstCut: 0, fairway: 0 }
    const patchSeed =
      Math.round(centerX / REFRESH_DISTANCE) * 92821 +
      Math.round(centerZ / REFRESH_DISTANCE) * 68917 +
      hole.number * 101

    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const randomX = seededRandom(patchSeed + i * 4 + 1)
      const randomZ = seededRandom(patchSeed + i * 4 + 2)
      const densityRoll = seededRandom(patchSeed + i * 4 + 3)
      const variation = seededRandom(patchSeed + i * 4 + 4)
      const x = centerX + (randomX * 2 - 1) * PATCH_RADIUS
      const z = centerZ + (randomZ * 2 - 1) * PATCH_RADIUS
      const dx = x - centerX
      const dz = z - centerZ
      const distance = Math.sqrt(dx * dx + dz * dz)

      if (distance > PATCH_RADIUS) continue

      const edgeFade = THREE.MathUtils.clamp(
        (PATCH_RADIUS - distance) / 7,
        0,
        1
      )
      if (edgeFade <= 0.04) continue

      const surface = getSurfaceAtPosition(hole, x, z)
      let layer: LayerSettings | null = null
      let countKey: keyof typeof counts | null = null

      if (surface === 'ROUGH') {
        layer = rough
        countKey = 'rough'
      } else if (surface === 'FIRST_CUT') {
        layer = firstCut
        countKey = 'firstCut'
      } else if (surface === 'FAIRWAY' || surface === 'TEE') {
        layer = fairway
        countKey = 'fairway'
      }

      if (!layer || !countKey || !layer.mesh) continue
      if (densityRoll > layer.density) continue
      if (counts[countKey] >= layer.capacity) continue

      const height = THREE.MathUtils.lerp(
        layer.minHeight,
        layer.maxHeight,
        variation
      ) * edgeFade
      const width = THREE.MathUtils.lerp(
        layer.minWidth,
        layer.maxWidth,
        seededRandom(patchSeed + i * 7 + 11)
      )
      const rotation = seededRandom(patchSeed + i * 5 + 19) * Math.PI
      const terrainY = terrainHeightAtPosition(hole, x, z)

      dummy.current.position.set(
        x,
        terrainY + layer.offsetY + height * 0.5,
        z
      )
      dummy.current.rotation.set(0, rotation, 0)
      dummy.current.scale.set(width, height, 1)
      dummy.current.updateMatrix()
      layer.mesh.setMatrixAt(counts[countKey], dummy.current.matrix)
      counts[countKey] += 1
    }

    const layers = [
      { mesh: rough.mesh, count: counts.rough },
      { mesh: firstCut.mesh, count: counts.firstCut },
      { mesh: fairway.mesh, count: counts.fairway },
    ]

    for (const layer of layers) {
      if (!layer.mesh) continue
      layer.mesh.count = layer.count
      layer.mesh.instanceMatrix.needsUpdate = true
    }
  }

  useFrame(() => {
    const centerX = Math.round(camera.position.x / REFRESH_DISTANCE) * REFRESH_DISTANCE
    const centerZ = Math.round(camera.position.z / REFRESH_DISTANCE) * REFRESH_DISTANCE
    const nextCenter = new THREE.Vector2(centerX, centerZ)

    if (
      lastPatchCenter.current.distanceTo(nextCenter) <
      REFRESH_DISTANCE * 0.75
    ) {
      return
    }

    lastPatchCenter.current.copy(nextCenter)
    updateGrassPatch(centerX, centerZ)
  })

  return (
    <group>
      <instancedMesh
        ref={roughRef}
        args={[undefined, undefined, ROUGH_CAPACITY]}
        frustumCulled={false}
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#416e3d"
          roughness={0.96}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <instancedMesh
        ref={firstCutRef}
        args={[undefined, undefined, FIRST_CUT_CAPACITY]}
        frustumCulled={false}
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#78a84f"
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      <instancedMesh
        ref={fairwayRef}
        args={[undefined, undefined, FAIRWAY_CAPACITY]}
        frustumCulled={false}
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#a4cc6b"
          roughness={0.78}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  )
}
