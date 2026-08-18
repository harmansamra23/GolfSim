import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import {
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'
import { terrainHeightAtPosition } from './terrainHeight'

type TreeInstance = {
  position: THREE.Vector3
  scale: number
  rotation: number
  variant: 0 | 1 | 2
}

const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.82, 6.2, 8)
const trunkMaterial = new THREE.MeshStandardMaterial({
  color: '#543e2b',
  roughness: 0.98,
})
const canopyGeometry = new THREE.IcosahedronGeometry(2.2, 1)
const canopyMaterialA = new THREE.MeshStandardMaterial({
  color: '#3d6839',
  roughness: 0.96,
})
const canopyMaterialB = new THREE.MeshStandardMaterial({
  color: '#4c7843',
  roughness: 0.95,
})
const canopyMaterialC = new THREE.MeshStandardMaterial({
  color: '#345f35',
  roughness: 0.96,
})
const canopyMaterialD = new THREE.MeshStandardMaterial({
  color: '#587f49',
  roughness: 0.95,
})

export function Vegetation({ hole }: { hole: GolfHole }) {
  const instances = useMemo(() => createTreeInstances(hole), [hole])

  return <InstancedOakRows instances={instances} />
}

function createTreeInstances(hole: GolfHole): TreeInstance[] {
  const valleyStyle = hole.environmentStyle === 'SACRAMENTO_VALLEY'
  const rowCount = valleyStyle ? 18 : 12
  const instances: TreeInstance[] = []

  for (let index = 0; index < rowCount; index += 1) {
    const t = (index + 1) / (rowCount + 1)
    const z =
      hole.fairway.startZ +
      (hole.fairway.endZ - hole.fairway.startZ) * t
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)
    const leftGap = valleyStyle ? 13 + (index % 4) * 3 : 14
    const rightGap = valleyStyle ? 15 + ((index + 2) % 5) * 2.5 : 14

    const leftX = center - width - leftGap
    const rightX = center + width + rightGap
    const leftZ = z - (index % 3) * 4
    const rightZ = z - ((index + 1) % 4) * 5

    instances.push({
      position: new THREE.Vector3(
        leftX,
        terrainHeightAtPosition(hole, leftX, leftZ),
        leftZ
      ),
      scale: 0.9 + (index % 5) * 0.12,
      rotation: -0.78 + (index % 6) * 0.29,
      variant: (index % 3) as 0 | 1 | 2,
    })

    if (index % 6 !== 2) {
      instances.push({
        position: new THREE.Vector3(
          rightX,
          terrainHeightAtPosition(hole, rightX, rightZ),
          rightZ
        ),
        scale: 0.94 + ((index + 3) % 6) * 0.105,
        rotation: 0.72 - (index % 7) * 0.22,
        variant: ((index + 1) % 3) as 0 | 1 | 2,
      })
    }

    if (valleyStyle && index % 5 === 1) {
      const clusterSide = index % 2 === 0 ? -1 : 1
      const clusterX = center + clusterSide * (width + 28)
      const clusterZ = z - 11

      instances.push({
        position: new THREE.Vector3(
          clusterX,
          terrainHeightAtPosition(hole, clusterX, clusterZ),
          clusterZ
        ),
        scale: 0.72 + (index % 3) * 0.08,
        rotation: index * 0.37,
        variant: 2,
      })
    }
  }

  return instances
}

function InstancedOakRows({ instances }: { instances: TreeInstance[] }) {
  const trunksRef = useRef<THREE.InstancedMesh>(null)
  const canopyARef = useRef<THREE.InstancedMesh>(null)
  const canopyBRef = useRef<THREE.InstancedMesh>(null)
  const canopyCRef = useRef<THREE.InstancedMesh>(null)
  const canopyDRef = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const trunkMesh = trunksRef.current
    const canopyA = canopyARef.current
    const canopyB = canopyBRef.current
    const canopyC = canopyCRef.current
    const canopyD = canopyDRef.current

    if (!trunkMesh || !canopyA || !canopyB || !canopyC || !canopyD) {
      return
    }

    const canopyMeshes = [canopyA, canopyB, canopyC, canopyD]
    const treeMatrix = new THREE.Matrix4()
    const localMatrix = new THREE.Matrix4()
    const finalMatrix = new THREE.Matrix4()
    const treeQuaternion = new THREE.Quaternion()
    const localQuaternion = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)

    const canopyPositions = [
      new THREE.Vector3(0, 7.2, 0),
      new THREE.Vector3(2.15, 6.7, 0.45),
      new THREE.Vector3(-2.05, 6.82, -0.3),
      new THREE.Vector3(0.25, 8.25, -0.15),
    ]

    instances.forEach((tree, index) => {
      const variant = tree.variant
      const heightScale = variant === 0 ? 0.92 : variant === 1 ? 1.16 : 0.78
      const widthScale = variant === 0 ? 1.18 : variant === 1 ? 0.84 : 1.35

      treeQuaternion.setFromAxisAngle(up, tree.rotation)
      treeMatrix.compose(
        tree.position,
        treeQuaternion,
        new THREE.Vector3(tree.scale, tree.scale, tree.scale)
      )

      localMatrix.compose(
        new THREE.Vector3(0, 3.05 * heightScale, 0),
        localQuaternion,
        new THREE.Vector3(0.88, heightScale, 0.88)
      )
      finalMatrix.multiplyMatrices(treeMatrix, localMatrix)
      trunkMesh.setMatrixAt(index, finalMatrix)

      canopyMeshes.forEach((canopy, canopyIndex) => {
        const base = canopyPositions[canopyIndex]
        const sideBias = variant === 2 ? 1.18 : 1
        const position = new THREE.Vector3(
          base.x * widthScale * sideBias,
          base.y * heightScale,
          base.z * widthScale
        )
        const baseScale =
          canopyIndex === 0
            ? new THREE.Vector3(2.1, 1.0, 1.7)
            : canopyIndex === 3
              ? new THREE.Vector3(1.18, 0.66, 1.05)
              : new THREE.Vector3(1.48, 0.76, 1.25)
        const scale = new THREE.Vector3(
          baseScale.x * widthScale,
          baseScale.y * heightScale,
          baseScale.z * widthScale
        )

        localMatrix.compose(position, localQuaternion, scale)
        finalMatrix.multiplyMatrices(treeMatrix, localMatrix)
        canopy.setMatrixAt(index, finalMatrix)
      })
    })

    trunkMesh.instanceMatrix.needsUpdate = true
    trunkMesh.computeBoundingSphere()

    canopyMeshes.forEach((canopy) => {
      canopy.instanceMatrix.needsUpdate = true
      canopy.computeBoundingSphere()
    })
  }, [instances])

  return (
    <>
      <instancedMesh
        ref={trunksRef}
        args={[trunkGeometry, trunkMaterial, instances.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={canopyARef}
        args={[canopyGeometry, canopyMaterialA, instances.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={canopyBRef}
        args={[canopyGeometry, canopyMaterialB, instances.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={canopyCRef}
        args={[canopyGeometry, canopyMaterialC, instances.length]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={canopyDRef}
        args={[canopyGeometry, canopyMaterialD, instances.length]}
        castShadow
        receiveShadow
      />
    </>
  )
}
