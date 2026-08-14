import type {
  FairwayControlPoint,
  GolfCourse,
  GolfHole,
} from './courseTypes'

type HoleSpec = {
  par: number
  yardage: number
  name: string
  profile: FairwayControlPoint[]
  greenX: number
  bunkerSide: -1 | 1
}

const HOLES: HoleSpec[] = [
  {
    par: 4,
    yardage: 409,
    name: 'Opening Bend',
    greenX: -30,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 11 },
      { t: 0.28, centerOffsetX: 14, halfWidth: 18 },
      { t: 0.58, centerOffsetX: 2, halfWidth: 16 },
      { t: 0.78, centerOffsetX: -20, halfWidth: 13 },
      { t: 1, centerOffsetX: -30, halfWidth: 9 },
    ],
  },
  {
    par: 5,
    yardage: 515,
    name: 'Long Right',
    greenX: 88,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 13 },
      { t: 0.24, centerOffsetX: -12, halfWidth: 22 },
      { t: 0.5, centerOffsetX: 18, halfWidth: 24 },
      { t: 0.72, centerOffsetX: 55, halfWidth: 19 },
      { t: 0.88, centerOffsetX: 78, halfWidth: 14 },
      { t: 1, centerOffsetX: 88, halfWidth: 10 },
    ],
  },
  {
    par: 3,
    yardage: 168,
    name: 'Short Target',
    greenX: -28,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 7 },
      { t: 0.45, centerOffsetX: -12, halfWidth: 8 },
      { t: 1, centerOffsetX: -28, halfWidth: 7 },
    ],
  },
  {
    par: 4,
    yardage: 382,
    name: 'Left Dogleg',
    greenX: -78,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 11 },
      { t: 0.3, centerOffsetX: 14, halfWidth: 18 },
      { t: 0.55, centerOffsetX: 4, halfWidth: 17 },
      { t: 0.72, centerOffsetX: -30, halfWidth: 14 },
      { t: 0.88, centerOffsetX: -64, halfWidth: 11 },
      { t: 1, centerOffsetX: -78, halfWidth: 9 },
    ],
  },
  {
    par: 4,
    yardage: 431,
    name: 'Wide Landing',
    greenX: 20,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 10 },
      { t: 0.28, centerOffsetX: -8, halfWidth: 29 },
      { t: 0.58, centerOffsetX: 10, halfWidth: 27 },
      { t: 0.8, centerOffsetX: 25, halfWidth: 16 },
      { t: 1, centerOffsetX: 20, halfWidth: 8 },
    ],
  },
  {
    par: 3,
    yardage: 194,
    name: 'Narrow Green',
    greenX: 38,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 6.5 },
      { t: 0.45, centerOffsetX: 18, halfWidth: 6.5 },
      { t: 1, centerOffsetX: 38, halfWidth: 6 },
    ],
  },
  {
    par: 5,
    yardage: 548,
    name: 'S Curve',
    greenX: -48,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 13 },
      { t: 0.2, centerOffsetX: 42, halfWidth: 20 },
      { t: 0.44, centerOffsetX: -36, halfWidth: 22 },
      { t: 0.68, centerOffsetX: 24, halfWidth: 18 },
      { t: 0.84, centerOffsetX: -18, halfWidth: 15 },
      { t: 1, centerOffsetX: -48, halfWidth: 10 },
    ],
  },
  {
    par: 4,
    yardage: 407,
    name: 'Right Dogleg',
    greenX: 80,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 11 },
      { t: 0.32, centerOffsetX: -12, halfWidth: 19 },
      { t: 0.56, centerOffsetX: 2, halfWidth: 17 },
      { t: 0.74, centerOffsetX: 36, halfWidth: 14 },
      { t: 0.9, centerOffsetX: 68, halfWidth: 11 },
      { t: 1, centerOffsetX: 80, halfWidth: 9 },
    ],
  },
  {
    par: 4,
    yardage: 365,
    name: 'Hourglass',
    greenX: 5,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 17 },
      { t: 0.3, centerOffsetX: 8, halfWidth: 25 },
      { t: 0.55, centerOffsetX: -4, halfWidth: 6 },
      { t: 0.78, centerOffsetX: 10, halfWidth: 21 },
      { t: 1, centerOffsetX: 5, halfWidth: 9 },
    ],
  },
  {
    par: 4,
    yardage: 421,
    name: 'Sweep Left',
    greenX: -62,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 12 },
      { t: 0.25, centerOffsetX: -8, halfWidth: 18 },
      { t: 0.5, centerOffsetX: -24, halfWidth: 19 },
      { t: 0.75, centerOffsetX: -45, halfWidth: 15 },
      { t: 1, centerOffsetX: -62, halfWidth: 9 },
    ],
  },
  {
    par: 3,
    yardage: 176,
    name: 'Diagonal Par 3',
    greenX: 46,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 7 },
      { t: 0.5, centerOffsetX: 23, halfWidth: 8 },
      { t: 1, centerOffsetX: 46, halfWidth: 7 },
    ],
  },
  {
    par: 5,
    yardage: 532,
    name: 'Three Landing Zones',
    greenX: 34,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 11 },
      { t: 0.22, centerOffsetX: -38, halfWidth: 27 },
      { t: 0.46, centerOffsetX: 12, halfWidth: 11 },
      { t: 0.7, centerOffsetX: 58, halfWidth: 26 },
      { t: 0.86, centerOffsetX: 42, halfWidth: 15 },
      { t: 1, centerOffsetX: 34, halfWidth: 10 },
    ],
  },
  {
    par: 4,
    yardage: 394,
    name: 'Tight Corridor',
    greenX: -26,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 8 },
      { t: 0.32, centerOffsetX: -8, halfWidth: 8.5 },
      { t: 0.62, centerOffsetX: -18, halfWidth: 7 },
      { t: 1, centerOffsetX: -26, halfWidth: 6.5 },
    ],
  },
  {
    par: 4,
    yardage: 446,
    name: 'Double Bend',
    greenX: 42,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 12 },
      { t: 0.22, centerOffsetX: 38, halfWidth: 18 },
      { t: 0.5, centerOffsetX: -34, halfWidth: 16 },
      { t: 0.76, centerOffsetX: 18, halfWidth: 15 },
      { t: 1, centerOffsetX: 42, halfWidth: 9 },
    ],
  },
  {
    par: 3,
    yardage: 186,
    name: 'Left Shelf',
    greenX: -48,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 7 },
      { t: 0.5, centerOffsetX: -24, halfWidth: 7 },
      { t: 1, centerOffsetX: -48, halfWidth: 6.5 },
    ],
  },
  {
    par: 5,
    yardage: 556,
    name: 'Big Right Finish',
    greenX: 98,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 14 },
      { t: 0.22, centerOffsetX: -18, halfWidth: 28 },
      { t: 0.46, centerOffsetX: 20, halfWidth: 23 },
      { t: 0.68, centerOffsetX: 60, halfWidth: 20 },
      { t: 0.84, centerOffsetX: 86, halfWidth: 15 },
      { t: 1, centerOffsetX: 98, halfWidth: 10 },
    ],
  },
  {
    par: 4,
    yardage: 371,
    name: 'Split Width',
    greenX: 30,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 9 },
      { t: 0.28, centerOffsetX: 18, halfWidth: 26 },
      { t: 0.56, centerOffsetX: 2, halfWidth: 7 },
      { t: 0.78, centerOffsetX: 24, halfWidth: 21 },
      { t: 1, centerOffsetX: 30, halfWidth: 10 },
    ],
  },
  {
    par: 4,
    yardage: 428,
    name: 'Closing Dogleg',
    greenX: -92,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 12 },
      { t: 0.28, centerOffsetX: 20, halfWidth: 20 },
      { t: 0.5, centerOffsetX: 8, halfWidth: 18 },
      { t: 0.7, centerOffsetX: -28, halfWidth: 15 },
      { t: 0.86, centerOffsetX: -70, halfWidth: 11 },
      { t: 1, centerOffsetX: -92, halfWidth: 9 },
    ],
  },
]

function createHole(spec: HoleSpec, index: number): GolfHole {
  const number = index + 1
  const meters = spec.yardage * 0.9144
  const endZ = -(meters - 18)
  const finalWidth = spec.profile[spec.profile.length - 1].halfWidth
  const approachZ = -meters + (spec.par === 3 ? 7 : 16)

  return {
    number,
    name: spec.name,
    par: spec.par,
    yardage: spec.yardage,
    tee: { x: 0, z: 5 },
    green: {
      center: { x: spec.greenX, z: -meters },
      radiusX: spec.par === 3 ? 14 : 18,
      radiusZ: spec.par === 3 ? 11 : 14,
    },
    bunkers: [
      {
        center: {
          x: spec.greenX + spec.bunkerSide * (finalWidth + 6),
          z: approachZ,
        },
        radiusX: spec.par === 3 ? 6 : 7.5,
        radiusZ: spec.par === 3 ? 4 : 5,
      },
      ...(spec.par === 5
        ? [
            {
              center: {
                x: spec.profile[2].centerOffsetX - spec.bunkerSide * 13,
                z: -meters * 0.52,
              },
              radiusX: 8,
              radiusZ: 5,
            },
          ]
        : []),
    ],
    fairway: {
      startZ: 3,
      endZ,
      baseHalfWidth: 10,
      middleWidthBoost: 7,
      endTaper: 2,
      curveAmplitude: 0,
      curveCycles: 1,
      endOffsetX: spec.greenX,
      profile: spec.profile,
    },
    cartPath:
      spec.par === 3
        ? undefined
        : {
            offsetX: spec.bunkerSide * -31,
            halfWidth: 1.35,
            waveAmplitude: 2.5,
            waveCycles: 1.15,
          },
  }
}

export const prototype18Course: GolfCourse = {
  id: 'golfsim-prototype-18',
  name: 'GolfSim Prototype 18',
  location: 'Development Course',
  prototype: true,
  holes: HOLES.map(createHole),
}
