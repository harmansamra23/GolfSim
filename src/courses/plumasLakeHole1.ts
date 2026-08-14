import type { GolfHole } from './courseTypes'
import {
  cartPathCenterX as getCartPathCenterX,
  fairwayCenterX as getFairwayCenterX,
  fairwayHalfWidth as getFairwayHalfWidth,
  fairwayProgress as getFairwayProgress,
} from './holeGeometryMath'

/*
  IMPORTANT:

  These coordinates are our current playable prototype,
  not yet surveyed Plumas Lake map data.

  World units are approximately meters.

  Tee -> green distance is intentionally close to
  the real 409-yard blue-tee distance.
*/

export const plumasLakeHole1: GolfHole = {
  number: 1,
  par: 4,
  yardage: 409,
  tee: {
    x: 0,
    z: 5,
  },
  green: {
    center: {
      x: -3,
      z: -368,
    },
    radiusX: 18,
    radiusZ: 14,
  },
  bunkers: [
    {
      center: {
        x: -17,
        z: -351,
      },
      radiusX: 8,
      radiusZ: 5,
    },
    {
      center: {
        x: 11,
        z: -359,
      },
      radiusX: 7,
      radiusZ: 4.5,
    },
  ],
  fairway: {
    startZ: 3,
    endZ: -350,
    baseHalfWidth: 10,
    middleWidthBoost: 8,
    endTaper: 2,
    curveAmplitude: 2.8,
    curveCycles: 1.35,
    endOffsetX: -1,
  },
  cartPath: {
    offsetX: 30,
    halfWidth: 1.35,
    waveAmplitude: 2.5,
    waveCycles: 1.15,
  },
}

export const FAIRWAY_START_Z = plumasLakeHole1.fairway.startZ
export const FAIRWAY_END_Z = plumasLakeHole1.fairway.endZ

export function fairwayProgress(z: number) {
  return getFairwayProgress(plumasLakeHole1, z)
}

export function fairwayCenterX(z: number) {
  return getFairwayCenterX(plumasLakeHole1, z)
}

export function fairwayHalfWidth(z: number) {
  return getFairwayHalfWidth(plumasLakeHole1, z)
}

export function cartPathCenterX(z: number) {
  return getCartPathCenterX(plumasLakeHole1, z)
}
