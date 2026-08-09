import type {
  EllipseZone,
  SurfaceType,
} from '../courses/courseTypes'

import {
  FAIRWAY_END_Z,
  FAIRWAY_START_Z,
  cartPathCenterX,
  fairwayCenterX,
  fairwayHalfWidth,
  plumasLakeHole1,
} from '../courses/plumasLakeHole1'

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
  const dx =
    (x -
      ellipse.center.x) /
    ellipse.radiusX

  const dz =
    (z -
      ellipse.center.z) /
    ellipse.radiusZ

  return (
    dx * dx +
      dz * dz <=
    1
  )
}

export function getSurfaceAtPosition(
  x: number,
  z: number
): SurfaceType {
  const tee =
    plumasLakeHole1.tee

  if (
    Math.abs(x - tee.x) <= 6 &&
    Math.abs(z - tee.z) <= 5
  ) {
    return 'TEE'
  }

  if (
    insideEllipse(
      x,
      z,
      plumasLakeHole1.green
    )
  ) {
    return 'GREEN'
  }

  for (
    const bunker
    of plumasLakeHole1.bunkers
  ) {
    if (
      insideEllipse(
        x,
        z,
        bunker
      )
    ) {
      return 'BUNKER'
    }
  }

  if (
    z <= FAIRWAY_START_Z &&
    z >= FAIRWAY_END_Z
  ) {
    const pathX =
      cartPathCenterX(z)

    if (
      Math.abs(x - pathX) <=
      1.6
    ) {
      return 'PATH'
    }

    const center =
      fairwayCenterX(z)

    const width =
      fairwayHalfWidth(z)

    const distance =
      Math.abs(x - center)

    if (
      distance <= width
    ) {
      return 'FAIRWAY'
    }

    if (
      distance <=
      width + 4
    ) {
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