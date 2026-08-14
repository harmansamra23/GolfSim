import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import { getSurfaceAtPosition } from '../physics/surfacePhysics'

const PATCH_RADIUS = 32
const REFRESH_DISTANCE = 6
const SAMPLE_COUNT = 7200

const ROUGH_CAPACITY = 3200
const FIRST_CUT_CAPACITY = 1800
const FAIRWAY_CAPACITY = 1400

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

type LayerSettings = {
  mesh: THREE.InstancedMesh | null
  capacity: number
  baseY: number
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
      baseY: 0.02,
      minHeight: 0.16,
      maxHeight: 0.3,
      minWidth: 0.035,
      maxWidth: 0.06,
      density: 0.92,
    }
    const firstCut: LayerSettings = {
      mesh: firstCutRef.current,
      capacity: FIRST_CUT_CAPACITY,
      baseY: 0.045,
      minHeight: 0.07,
      maxHeight: 0.12,
      minWidth: 0.025,
      maxWidth: 0.042,
      density: 0.68,
    }
    const fairway: LayerSettings = {
      mesh: fairwayRef.current,
      capacity: FAIRWAY_CAPACITY,
      baseY: 0.06,
      minHeight: 0.025,
      maxHeight: 0.05,
      minWidth: 0.018,
      maxWidth: 0.032,
      density: 0.38,
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

      dummy.current.position.set(x, layer.baseY + height * 0.5, z)
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
          color="#315a35"
          roughness={0.98}
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
          color="#5d8449"
          roughness={0.94}
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
          color="#84bd60"
          roughness={0.84}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  )
}
