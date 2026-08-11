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
    greenX: -6,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 10 },
      { t: 0.3, centerOffsetX: 5, halfWidth: 16 },
      { t: 0.65, centerOffsetX: -3, halfWidth: 15 },
      { t: 1, centerOffsetX: -6, halfWidth: 9 },
    ],
  },
  {
    par: 5,
    yardage: 515,
    name: 'Long Right',
    greenX: 20,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 12 },
      { t: 0.25, centerOffsetX: -4, halfWidth: 19 },
      { t: 0.55, centerOffsetX: 7, halfWidth: 22 },
      { t: 0.78, centerOffsetX: 18, halfWidth: 15 },
      { t: 1, centerOffsetX: 20, halfWidth: 10 },
    ],
  },
  {
    par: 3,
    yardage: 168,
    name: 'Short Target',
    greenX: -11,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 7 },
      { t: 0.5, centerOffsetX: -5, halfWidth: 8 },
      { t: 1, centerOffsetX: -11, halfWidth: 7 },
    ],
  },
  {
    par: 4,
    yardage: 382,
    name: 'Left Dogleg',
    greenX: -25,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 11 },
      { t: 0.35, centerOffsetX: 5, halfWidth: 16 },
      { t: 0.6, centerOffsetX: -4, halfWidth: 15 },
      { t: 0.8, centerOffsetX: -20, halfWidth: 12 },
      { t: 1, centerOffsetX: -25, halfWidth: 9 },
    ],
  },
  {
    par: 4,
    yardage: 431,
    name: 'Wide Landing',
    greenX: 4,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 10 },
      { t: 0.3, centerOffsetX: -2, halfWidth: 22 },
      { t: 0.6, centerOffsetX: 5, halfWidth: 20 },
      { t: 1, centerOffsetX: 4, halfWidth: 8 },
    ],
  },
  {
    par: 3,
    yardage: 194,
    name: 'Narrow Green',
    greenX: 15,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 6.5 },
      { t: 0.45, centerOffsetX: 8, halfWidth: 6.5 },
      { t: 1, centerOffsetX: 15, halfWidth: 6 },
    ],
  },
  {
    par: 5,
    yardage: 548,
    name: 'S Curve',
    greenX: -14,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 12 },
      { t: 0.22, centerOffsetX: 15, halfWidth: 18 },
      { t: 0.48, centerOffsetX: -10, halfWidth: 20 },
      { t: 0.72, centerOffsetX: 7, halfWidth: 16 },
      { t: 1, centerOffsetX: -14, halfWidth: 10 },
    ],
  },
  {
    par: 4,
    yardage: 407,
    name: 'Right Dogleg',
    greenX: 27,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 10 },
      { t: 0.4, centerOffsetX: -5, halfWidth: 17 },
      { t: 0.68, centerOffsetX: 9, halfWidth: 14 },
      { t: 0.85, centerOffsetX: 24, halfWidth: 11 },
      { t: 1, centerOffsetX: 27, halfWidth: 9 },
    ],
  },
  {
    par: 4,
    yardage: 365,
    name: 'Hourglass',
    greenX: 0,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 14 },
      { t: 0.35, centerOffsetX: 2, halfWidth: 18 },
      { t: 0.58, centerOffsetX: -2, halfWidth: 7 },
      { t: 0.8, centerOffsetX: 3, halfWidth: 14 },
      { t: 1, centerOffsetX: 0, halfWidth: 9 },
    ],
  },
  {
    par: 4,
    yardage: 421,
    name: 'Sweep Left',
    greenX: -20,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 11 },
      { t: 0.25, centerOffsetX: -4, halfWidth: 16 },
      { t: 0.55, centerOffsetX: -12, halfWidth: 17 },
      { t: 1, centerOffsetX: -20, halfWidth: 9 },
    ],
  },
  {
    par: 3,
    yardage: 176,
    name: 'Diagonal Par 3',
    greenX: 18,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 7 },
      { t: 0.5, centerOffsetX: 10, halfWidth: 8 },
      { t: 1, centerOffsetX: 18, halfWidth: 7 },
    ],
  },
  {
    par: 5,
    yardage: 532,
    name: 'Three Landing Zones',
    greenX: 8,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 10 },
      { t: 0.25, centerOffsetX: -10, halfWidth: 22 },
      { t: 0.5, centerOffsetX: 4, halfWidth: 12 },
      { t: 0.72, centerOffsetX: 15, halfWidth: 21 },
      { t: 1, centerOffsetX: 8, halfWidth: 10 },
    ],
  },
  {
    par: 4,
    yardage: 394,
    name: 'Tight Corridor',
    greenX: -8,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 8 },
      { t: 0.35, centerOffsetX: -3, halfWidth: 9 },
      { t: 0.7, centerOffsetX: -6, halfWidth: 8 },
      { t: 1, centerOffsetX: -8, halfWidth: 7 },
    ],
  },
  {
    par: 4,
    yardage: 446,
    name: 'Double Bend',
    greenX: 12,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 11 },
      { t: 0.25, centerOffsetX: 11, halfWidth: 16 },
      { t: 0.55, centerOffsetX: -8, halfWidth: 15 },
      { t: 0.8, centerOffsetX: 5, halfWidth: 13 },
      { t: 1, centerOffsetX: 12, halfWidth: 9 },
    ],
  },
  {
    par: 3,
    yardage: 186,
    name: 'Left Shelf',
    greenX: -18,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 7 },
      { t: 0.5, centerOffsetX: -9, halfWidth: 7 },
      { t: 1, centerOffsetX: -18, halfWidth: 6.5 },
    ],
  },
  {
    par: 5,
    yardage: 556,
    name: 'Big Right Finish',
    greenX: 28,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 13 },
      { t: 0.25, centerOffsetX: -7, halfWidth: 23 },
      { t: 0.5, centerOffsetX: 8, halfWidth: 19 },
      { t: 0.75, centerOffsetX: 24, halfWidth: 16 },
      { t: 1, centerOffsetX: 28, halfWidth: 10 },
    ],
  },
  {
    par: 4,
    yardage: 371,
    name: 'Split Width',
    greenX: 9,
    bunkerSide: -1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 9 },
      { t: 0.35, centerOffsetX: 6, halfWidth: 19 },
      { t: 0.62, centerOffsetX: 0, halfWidth: 8 },
      { t: 1, centerOffsetX: 9, halfWidth: 11 },
    ],
  },
  {
    par: 4,
    yardage: 428,
    name: 'Closing Dogleg',
    greenX: -28,
    bunkerSide: 1,
    profile: [
      { t: 0, centerOffsetX: 0, halfWidth: 12 },
      { t: 0.3, centerOffsetX: 8, halfWidth: 18 },
      { t: 0.6, centerOffsetX: -4, halfWidth: 15 },
      { t: 0.82, centerOffsetX: -22, halfWidth: 11 },
      { t: 1, centerOffsetX: -28, halfWidth: 9 },
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
