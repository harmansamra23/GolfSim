import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import {
  cartPathCenterX,
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'
import { terrainHeightAtPosition } from './terrainHeight'

function finalizeGeometry(
  positions: number[],
  uvs: number[],
  indices: number[]
) {
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  )
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export function createFairwaySurfaceGeometry(
  hole: GolfHole,
  extraWidth: number,
  verticalOffset: number
) {
  const holeLength = Math.abs(hole.fairway.endZ - hole.fairway.startZ)
  const lengthSegments = THREE.MathUtils.clamp(
    Math.round(holeLength / 3.5),
    72,
    150
  )
  const crossSegments = 10
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let row = 0; row <= lengthSegments; row += 1) {
    const t = row / lengthSegments
    const z = THREE.MathUtils.lerp(
      hole.fairway.startZ,
      hole.fairway.endZ,
      t
    )
    const center = fairwayCenterX(hole, z)
    const halfWidth = fairwayHalfWidth(hole, z) + extraWidth

    for (let column = 0; column <= crossSegments; column += 1) {
      const across = column / crossSegments
      const side = across * 2 - 1
      const x = center + side * halfWidth
      const y = terrainHeightAtPosition(hole, x, z) + verticalOffset

      positions.push(x, y, z)
      uvs.push(across, t * 10)
    }
  }

  const stride = crossSegments + 1

  for (let row = 0; row < lengthSegments; row += 1) {
    for (let column = 0; column < crossSegments; column += 1) {
      const a = row * stride + column
      const b = a + 1
      const c = a + stride
      const d = c + 1

      indices.push(a, c, b, b, c, d)
    }
  }

  return finalizeGeometry(positions, uvs, indices)
}

export function createCartPathSurfaceGeometry(
  hole: GolfHole,
  verticalOffset: number
) {
  if (!hole.cartPath) return null

  const holeLength = Math.abs(hole.fairway.endZ - hole.fairway.startZ)
  const lengthSegments = THREE.MathUtils.clamp(
    Math.round(holeLength / 4),
    54,
    120
  )
  const crossSegments = 4
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let row = 0; row <= lengthSegments; row += 1) {
    const t = row / lengthSegments
    const z = THREE.MathUtils.lerp(
      hole.fairway.startZ,
      hole.fairway.endZ,
      t
    )
    const center = cartPathCenterX(hole, z)

    for (let column = 0; column <= crossSegments; column += 1) {
      const across = column / crossSegments
      const x = THREE.MathUtils.lerp(
        center - hole.cartPath.halfWidth,
        center + hole.cartPath.halfWidth,
        across
      )
      const y = terrainHeightAtPosition(hole, x, z) + verticalOffset

      positions.push(x, y, z)
      uvs.push(across, t * 12)
    }
  }

  const stride = crossSegments + 1

  for (let row = 0; row < lengthSegments; row += 1) {
    for (let column = 0; column < crossSegments; column += 1) {
      const a = row * stride + column
      const b = a + 1
      const c = a + stride
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  return finalizeGeometry(positions, uvs, indices)
}

export function createGreenSurfaceGeometry(
  hole: GolfHole,
  radiusX: number,
  radiusZ: number,
  verticalOffset: number,
  includeSlope: boolean
) {
  const segments = 72
  const rings = 10
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const green = hole.green

  const centerY =
    terrainHeightAtPosition(hole, green.center.x, green.center.z) +
    verticalOffset

  positions.push(green.center.x, centerY, green.center.z)
  uvs.push(0.5, 0.5)

  for (let ring = 1; ring <= rings; ring += 1) {
    const radial = ring / rings

    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2
      const localX = Math.cos(angle) * radiusX * radial
      const localZ = Math.sin(angle) * radiusZ * radial
      const x = green.center.x + localX
      const z = green.center.z + localZ
      const terrainY = terrainHeightAtPosition(hole, x, z)
      const slopeY = includeSlope
        ? (localX * (hole.greenSlope?.xPercent ?? 0) +
            localZ * (hole.greenSlope?.zPercent ?? 0)) /
          100
        : 0
      const crown = includeSlope ? (1 - radial * radial) * 0.035 : 0
      const y = terrainY + verticalOffset + slopeY + crown

      positions.push(x, y, z)
      uvs.push(
        0.5 + Math.cos(angle) * radial * 0.5,
        0.5 + Math.sin(angle) * radial * 0.5
      )
    }
  }

  const ringIndex = (ring: number, segment: number) =>
    1 + (ring - 1) * segments + ((segment + segments) % segments)

  for (let segment = 0; segment < segments; segment += 1) {
    indices.push(
      0,
      ringIndex(1, segment),
      ringIndex(1, segment + 1)
    )
  }

  for (let ring = 1; ring < rings; ring += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const a = ringIndex(ring, segment)
      const b = ringIndex(ring, segment + 1)
      const c = ringIndex(ring + 1, segment)
      const d = ringIndex(ring + 1, segment + 1)
      indices.push(a, c, b, b, c, d)
    }
  }

  return finalizeGeometry(positions, uvs, indices)
}
