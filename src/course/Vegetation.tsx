import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import {
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'

type TreeInstance = {
  position: THREE.Vector3
  scale: number
  rotation: number
  valleyStyle: boolean
}

const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.82, 6.2, 8)
const trunkMaterial = new THREE.MeshStandardMaterial({
  color: '#4b3524',
  roughness: 0.96,
})
const canopyGeometry = new THREE.IcosahedronGeometry(2.2, 1)
const canopyMaterials = [
  new THREE.MeshStandardMaterial({ color: '#315b31', roughness: 0.94 }),
  new THREE.MeshStandardMaterial({ color: '#3d6c38', roughness: 0.94 }),
  new THREE.MeshStandardMaterial({ color: '#2f5830', roughness: 0.94 }),
  new THREE.MeshStandardMaterial({ color: '#47753f', roughness: 0.94 }),
]

export function Vegetation({ hole }: { hole: GolfHole }) {
  const instances = useMemo(() => createTreeInstances(hole), [hole])

  return <InstancedOakRows instances={instances} />
}

function createTreeInstances(hole: GolfHole): TreeInstance[] {
  const valleyStyle = hole.environmentStyle === 'SACRAMENTO_VALLEY'
  const rowCount = valleyStyle ? 16 : 11
  const instances: TreeInstance[] = []

  for (let index = 0; index < rowCount; index += 1) {
    const t = (index + 1) / (rowCount + 1)
    const z =
      hole.fairway.startZ +
      (hole.fairway.endZ - hole.fairway.startZ) * t
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)
    const edgeGap = valleyStyle ? 10 : 13

    instances.push({
      position: new THREE.Vector3(
        center - width - edgeGap - (index % 3) * 2,
        0,
        z
      ),
      scale: (valleyStyle ? 1.18 : 1) + (index % 4) * 0.08,
      rotation: -0.65 + (index % 5) * 0.28,
      valleyStyle,
    })

    instances.push({
      position: new THREE.Vector3(
        center + width + edgeGap + ((index + 1) % 3) * 2,
        0,
        z - (valleyStyle && index % 2 ? 6 : 0)
      ),
      scale: (valleyStyle ? 1.22 : 1.05) + ((index + 2) % 4) * 0.07,
      rotation: 0.6 - (index % 5) * 0.25,
      valleyStyle,
    })
  }

  return instances
}

function InstancedOakRows({ instances }: { instances: TreeInstance[] }) {
  const trunksRef = useRef<THREE.InstancedMesh>(null)
  const canopyRefs = [
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
  ]

  useLayoutEffect(() => {
    const trunkMesh = trunksRef.current
    if (!trunkMesh) return

    const treeMatrix = new THREE.Matrix4()
    const localMatrix = new THREE.Matrix4()
    const finalMatrix = new THREE.Matrix4()
    const treeQuaternion = new THREE.Quaternion()
    const localQuaternion = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)

    const canopyPositions = [
      new THREE.Vector3(0, 7.4, 0),
      new THREE.Vector3(2, 6.95, 0.35),
      new THREE.Vector3(-2, 7.05, -0.2),
      new THREE.Vector3(0.35, 8.45, -0.25),
    ]
    const canopyScales = [
      new THREE.Vector3(2.05, 1.02, 1.72),
      new THREE.Vector3(1.45, 0.78, 1.28),
      new THREE.Vector3(1.48, 0.8, 1.3),
      new THREE.Vector3(1.2, 0.67, 1.08),
    ]

    instances.forEach((tree, index) => {
      treeQuaternion.setFromAxisAngle(up, tree.rotation)
      treeMatrix.compose(
        tree.position,
        treeQuaternion,
        new THREE.Vector3(tree.scale, tree.scale, tree.scale)
      )

      localMatrix.compose(
        new THREE.Vector3(0, tree.valleyStyle ? 3.2 : 2.8, 0),
        localQuaternion,
        new THREE.Vector3(
          tree.valleyStyle ? 1 : 0.76,
          tree.valleyStyle ? 1.03 : 0.9,
          tree.valleyStyle ? 1 : 0.76
        )
      )
      finalMatrix.multiplyMatrices(treeMatrix, localMatrix)
      trunkMesh.setMatrixAt(index, finalMatrix)

      canopyRefs.forEach((ref, canopyIndex) => {
        const canopy = ref.current
        if (!canopy) return

        const position = tree.valleyStyle
          ? canopyPositions[canopyIndex]
          : canopyPositions[canopyIndex].clone().multiplyScalar(0.9)
        const scale = tree.valleyStyle
          ? canopyScales[canopyIndex]
          : canopyScales[canopyIndex].clone().multiplyScalar(0.8)

        localMatrix.compose(position, localQuaternion, scale)
        finalMatrix.multiplyMatrices(treeMatrix, localMatrix)
        canopy.setMatrixAt(index, finalMatrix)
      })
    })

    trunkMesh.instanceMatrix.needsUpdate = true
    trunkMesh.computeBoundingSphere()

    canopyRefs.forEach((ref) => {
      if (!ref.current) return
      ref.current.instanceMatrix.needsUpdate = true
      ref.current.computeBoundingSphere()
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
      {canopyRefs.map((ref, index) => (
        <instancedMesh
          key={index}
          ref={ref}
          args={[canopyGeometry, canopyMaterials[index], instances.length]}
          castShadow
          receiveShadow
        />
      ))}
    </>
  )
}
