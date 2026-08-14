import type { GolfHole } from './courseTypes'

export const drivingRangeHole: GolfHole = {
  number: 1,
  par: 4,
  yardage: 350,
  tee: { x: 0, z: 5 },
  green: {
    center: { x: 0, z: -320 },
    radiusX: 24,
    radiusZ: 18,
  },
  bunkers: [],
  fairway: {
    startZ: 3,
    endZ: -310,
    baseHalfWidth: 34,
    middleWidthBoost: 10,
    endTaper: 4,
    curveAmplitude: 0,
    curveCycles: 1,
    endOffsetX: 0,
  },
}
