import type { SurfaceType } from '../courses/courseTypes'
import { plumasLakeHole1Zones } from '../courses/plumasLakeHole1'

export type SurfacePhysics = {
  bounce: number
  horizontalRetention: number
  rollingFriction: number
}

export function getSurfaceAtPosition(
  x: number,
  z: number
): SurfaceType {
  for (const zone of plumasLakeHole1Zones) {
    const insideX =
      x >= zone.minX &&
      x <= zone.maxX

    const insideZ =
      z >= zone.minZ &&
      z <= zone.maxZ

    if (insideX && insideZ) {
      return zone.surface
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
        bounce: 0.30,
        horizontalRetention: 0.80,
        rollingFriction: 0.975,
      }

    case 'FAIRWAY':
      return {
        bounce: 0.32,
        horizontalRetention: 0.80,
        rollingFriction: 0.978,
      }

    case 'ROUGH':
      return {
        bounce: 0.16,
        horizontalRetention: 0.56,
        rollingFriction: 0.94,
      }

    case 'GREEN':
      return {
        bounce: 0.12,
        horizontalRetention: 0.82,
        rollingFriction: 0.985,
      }

    case 'BUNKER':
      return {
        bounce: 0.04,
        horizontalRetention: 0.22,
        rollingFriction: 0.82,
      }
  }
}