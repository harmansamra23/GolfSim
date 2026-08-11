import type {
  EllipseZone,
  GolfHole,
  SurfaceType,
} from '../courses/courseTypes'
import {
  cartPathCenterX,
  fairwayCenterX,
  fairwayHalfWidth,
} from '../courses/holeGeometryMath'

export type SurfacePhysics = {
  bounce: number
  horizontalRetention: number
  rollingFriction: number
}

function insideEllipse(
  x: number,
  z: number,
  ellipse: EllipseZone
) {
  const dx = (x - ellipse.center.x) / ellipse.radiusX
  const dz = (z - ellipse.center.z) / ellipse.radiusZ

  return dx * dx + dz * dz <= 1
}

export function getSurfaceAtPosition(
  hole: GolfHole,
  x: number,
  z: number
): SurfaceType {
  const tee = hole.tee

  if (
    Math.abs(x - tee.x) <= 6 &&
    Math.abs(z - tee.z) <= 5
  ) {
    return 'TEE'
  }

  if (insideEllipse(x, z, hole.green)) {
    return 'GREEN'
  }

  for (const bunker of hole.bunkers) {
    if (insideEllipse(x, z, bunker)) {
      return 'BUNKER'
    }
  }

  if (
    z <= hole.fairway.startZ &&
    z >= hole.fairway.endZ
  ) {
    if (hole.cartPath) {
      const pathX = cartPathCenterX(hole, z)

      if (Math.abs(x - pathX) <= hole.cartPath.halfWidth + 0.25) {
        return 'PATH'
      }
    }

    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)
    const distance = Math.abs(x - center)

    if (distance <= width) {
      return 'FAIRWAY'
    }

    if (distance <= width + 4) {
      return 'FIRST_CUT'
    }
  }

  return 'ROUGH'
}

export function getSurfacePhysics(
  surface: SurfaceType
): SurfacePhysics {
  switch (surface) {
    case 'TEE':
      return {
        bounce: 0.3,
        horizontalRetention: 0.82,
        rollingFriction: 0.976,
      }

    case 'FAIRWAY':
      return {
        bounce: 0.32,
        horizontalRetention: 0.82,
        rollingFriction: 0.979,
      }

    case 'FIRST_CUT':
      return {
        bounce: 0.23,
        horizontalRetention: 0.7,
        rollingFriction: 0.962,
      }

    case 'ROUGH':
      return {
        bounce: 0.14,
        horizontalRetention: 0.53,
        rollingFriction: 0.94,
      }

    case 'GREEN':
      return {
        bounce: 0.1,
        horizontalRetention: 0.84,
        rollingFriction: 0.986,
      }

    case 'BUNKER':
      return {
        bounce: 0.025,
        horizontalRetention: 0.18,
        rollingFriction: 0.8,
      }

    case 'PATH':
      return {
        bounce: 0.47,
        horizontalRetention: 0.88,
        rollingFriction: 0.991,
      }
  }
}
