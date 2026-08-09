import type { GolfHole } from './courseTypes'

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
}

export const FAIRWAY_START_Z = 3
export const FAIRWAY_END_Z = -350

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, value)
  )
}

export function fairwayProgress(
  z: number
) {
  return clamp(
    (FAIRWAY_START_Z - z) /
      (FAIRWAY_START_Z -
        FAIRWAY_END_Z),
    0,
    1
  )
}

export function fairwayCenterX(
  z: number
) {
  const t = fairwayProgress(z)

  return (
    Math.sin(
      t * Math.PI * 1.35
    ) *
      2.8 -
    t
  )
}

export function fairwayHalfWidth(
  z: number
) {
  const t = fairwayProgress(z)

  return (
    10 +
    Math.sin(
      t * Math.PI
    ) *
      8 -
    t * 2
  )
}

export function cartPathCenterX(
  z: number
) {
  const t = fairwayProgress(z)

  return (
    30 +
    Math.sin(
      t *
        Math.PI *
        1.15
    ) *
      2.5
  )
}