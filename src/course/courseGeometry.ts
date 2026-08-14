import * as THREE from 'three'

import type { GolfHole } from '../courses/courseTypes'
import {
  cartPathCenterX,
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'

export function createCourseShape(
  hole: GolfHole,
  extraWidth: number
) {
  const shape = new THREE.Shape()
  const steps = 60

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const z = THREE.MathUtils.lerp(
      hole.fairway.startZ,
      hole.fairway.endZ,
      t
    )
    const x =
      fairwayCenterX(hole, z) -
      fairwayHalfWidth(hole, z) -
      extraWidth

    if (i === 0) {
      shape.moveTo(x, z)
    } else {
      shape.lineTo(x, z)
    }
  }

  for (let i = steps; i >= 0; i--) {
    const t = i / steps
    const z = THREE.MathUtils.lerp(
      hole.fairway.startZ,
      hole.fairway.endZ,
      t
    )
    const x =
      fairwayCenterX(hole, z) +
      fairwayHalfWidth(hole, z) +
      extraWidth

    shape.lineTo(x, z)
  }

  shape.closePath()
  return shape
}

export function createCartPathShape(hole: GolfHole) {
  if (!hole.cartPath) {
    return null
  }

  const shape = new THREE.Shape()
  const steps = 60
  const halfWidth = hole.cartPath.halfWidth

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const z = THREE.MathUtils.lerp(
      hole.fairway.startZ,
      hole.fairway.endZ,
      t
    )
    const x = cartPathCenterX(hole, z) - halfWidth

    if (i === 0) {
      shape.moveTo(x, z)
    } else {
      shape.lineTo(x, z)
    }
  }

  for (let i = steps; i >= 0; i--) {
    const t = i / steps
    const z = THREE.MathUtils.lerp(
      hole.fairway.startZ,
      hole.fairway.endZ,
      t
    )

    shape.lineTo(
      cartPathCenterX(hole, z) + halfWidth,
      z
    )
  }

  shape.closePath()
  return shape
}
