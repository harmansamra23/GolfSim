import * as THREE from 'three'

import {
  FAIRWAY_END_Z,
  FAIRWAY_START_Z,
  cartPathCenterX,
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/plumasLakeHole1'

export function createCourseShape(extraWidth: number) {
  const shape = new THREE.Shape()
  const steps = 60

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const z = THREE.MathUtils.lerp(
      FAIRWAY_START_Z,
      FAIRWAY_END_Z,
      t
    )
    const x =
      fairwayCenterX(z) -
      fairwayHalfWidth(z) -
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
      FAIRWAY_START_Z,
      FAIRWAY_END_Z,
      t
    )
    const x =
      fairwayCenterX(z) +
      fairwayHalfWidth(z) +
      extraWidth

    shape.lineTo(x, z)
  }

  shape.closePath()
  return shape
}

export function createCartPathShape() {
  const shape = new THREE.Shape()
  const steps = 60
  const halfWidth = 1.35

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const z = THREE.MathUtils.lerp(
      FAIRWAY_START_Z,
      FAIRWAY_END_Z,
      t
    )
    const x = cartPathCenterX(z) - halfWidth

    if (i === 0) {
      shape.moveTo(x, z)
    } else {
      shape.lineTo(x, z)
    }
  }

  for (let i = steps; i >= 0; i--) {
    const t = i / steps
    const z = THREE.MathUtils.lerp(
      FAIRWAY_START_Z,
      FAIRWAY_END_Z,
      t
    )

    shape.lineTo(
      cartPathCenterX(z) + halfWidth,
      z
    )
  }

  shape.closePath()
  return shape
}
