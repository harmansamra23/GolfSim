import type {
  FairwayControlPoint,
  GolfCourse,
  GolfHole,
  HazardZone,
} from './courseTypes'
import { plumasLakeMetadata } from './plumasLakeMetadata'

export type PlumasTeeId = 'black' | 'blue' | 'white' | 'gold'

type ShapeSpec = {
  name: string
  profile: FairwayControlPoint[]
  greenX: number
  bunkerSide: -1 | 1
  canalSide?: -1 | 1
  canalT?: number
}

const SHAPES: ShapeSpec[] = [
  { name: 'Opening Oaks', greenX: -20, bunkerSide: 1, canalSide: -1, canalT: 0.58, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 11 }, { t: 0.3, centerOffsetX: 12, halfWidth: 18 }, { t: 0.62, centerOffsetX: -4, halfWidth: 17 }, { t: 1, centerOffsetX: -20, halfWidth: 9 }] },
  { name: 'Canal Bend', greenX: 34, bunkerSide: -1, canalSide: 1, canalT: 0.64, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 11 }, { t: 0.35, centerOffsetX: -12, halfWidth: 18 }, { t: 0.68, centerOffsetX: 15, halfWidth: 16 }, { t: 1, centerOffsetX: 34, halfWidth: 9 }] },
  { name: 'Oak Par Three', greenX: -18, bunkerSide: 1, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 7 }, { t: 0.55, centerOffsetX: -8, halfWidth: 8 }, { t: 1, centerOffsetX: -18, halfWidth: 7 }] },
  { name: 'Valley Turn', greenX: 48, bunkerSide: -1, canalSide: 1, canalT: 0.5, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 10 }, { t: 0.28, centerOffsetX: -8, halfWidth: 17 }, { t: 0.58, centerOffsetX: 8, halfWidth: 16 }, { t: 1, centerOffsetX: 48, halfWidth: 9 }] },
  { name: 'Long Canal', greenX: -32, bunkerSide: 1, canalSide: -1, canalT: 0.7, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 13 }, { t: 0.23, centerOffsetX: 18, halfWidth: 24 }, { t: 0.5, centerOffsetX: 2, halfWidth: 22 }, { t: 0.75, centerOffsetX: -18, halfWidth: 17 }, { t: 1, centerOffsetX: -32, halfWidth: 10 }] },
  { name: 'Oak Corridor', greenX: 22, bunkerSide: 1, canalSide: -1, canalT: 0.56, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 9 }, { t: 0.35, centerOffsetX: 8, halfWidth: 14 }, { t: 0.72, centerOffsetX: 16, halfWidth: 13 }, { t: 1, centerOffsetX: 22, halfWidth: 8 }] },
  { name: 'Canal Short', greenX: 12, bunkerSide: -1, canalSide: 1, canalT: 0.72, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 7 }, { t: 0.55, centerOffsetX: 5, halfWidth: 8 }, { t: 1, centerOffsetX: 12, halfWidth: 7 }] },
  { name: 'Hardest Bend', greenX: -58, bunkerSide: 1, canalSide: -1, canalT: 0.62, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 10 }, { t: 0.3, centerOffsetX: 18, halfWidth: 17 }, { t: 0.55, centerOffsetX: 8, halfWidth: 14 }, { t: 0.78, centerOffsetX: -24, halfWidth: 12 }, { t: 1, centerOffsetX: -58, halfWidth: 9 }] },
  { name: 'Clubhouse Turn', greenX: 18, bunkerSide: -1, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 10 }, { t: 0.32, centerOffsetX: -10, halfWidth: 17 }, { t: 0.68, centerOffsetX: 5, halfWidth: 15 }, { t: 1, centerOffsetX: 18, halfWidth: 9 }] },
  { name: 'Back Nine Reach', greenX: 42, bunkerSide: 1, canalSide: -1, canalT: 0.48, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 13 }, { t: 0.22, centerOffsetX: -14, halfWidth: 22 }, { t: 0.48, centerOffsetX: 12, halfWidth: 23 }, { t: 0.74, centerOffsetX: 31, halfWidth: 17 }, { t: 1, centerOffsetX: 42, halfWidth: 10 }] },
  { name: 'Oak Alley', greenX: -28, bunkerSide: -1, canalSide: 1, canalT: 0.58, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 9 }, { t: 0.32, centerOffsetX: -5, halfWidth: 14 }, { t: 0.66, centerOffsetX: -18, halfWidth: 13 }, { t: 1, centerOffsetX: -28, halfWidth: 8 }] },
  { name: 'Canal Challenge', greenX: 55, bunkerSide: 1, canalSide: -1, canalT: 0.68, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 10 }, { t: 0.26, centerOffsetX: -12, halfWidth: 16 }, { t: 0.52, centerOffsetX: 4, halfWidth: 14 }, { t: 0.77, centerOffsetX: 30, halfWidth: 12 }, { t: 1, centerOffsetX: 55, halfWidth: 8 }] },
  { name: 'Small Green', greenX: -10, bunkerSide: 1, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 7 }, { t: 0.55, centerOffsetX: -4, halfWidth: 8 }, { t: 1, centerOffsetX: -10, halfWidth: 6.5 }] },
  { name: 'Drainage Line', greenX: -44, bunkerSide: -1, canalSide: 1, canalT: 0.54, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 11 }, { t: 0.25, centerOffsetX: 10, halfWidth: 18 }, { t: 0.5, centerOffsetX: 2, halfWidth: 16 }, { t: 0.75, centerOffsetX: -22, halfWidth: 13 }, { t: 1, centerOffsetX: -44, halfWidth: 9 }] },
  { name: 'Long Oak Five', greenX: 38, bunkerSide: 1, canalSide: -1, canalT: 0.62, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 13 }, { t: 0.24, centerOffsetX: -18, halfWidth: 23 }, { t: 0.5, centerOffsetX: 4, halfWidth: 21 }, { t: 0.74, centerOffsetX: 26, halfWidth: 17 }, { t: 1, centerOffsetX: 38, halfWidth: 10 }] },
  { name: 'Quiet Par Three', greenX: 16, bunkerSide: -1, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 7 }, { t: 0.5, centerOffsetX: 8, halfWidth: 7 }, { t: 1, centerOffsetX: 16, halfWidth: 6.5 }] },
  { name: 'Late Canal', greenX: -25, bunkerSide: 1, canalSide: -1, canalT: 0.57, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 10 }, { t: 0.3, centerOffsetX: 12, halfWidth: 17 }, { t: 0.64, centerOffsetX: -5, halfWidth: 14 }, { t: 1, centerOffsetX: -25, halfWidth: 8 }] },
  { name: 'Home Through Oaks', greenX: 30, bunkerSide: -1, canalSide: 1, canalT: 0.66, profile: [{ t: 0, centerOffsetX: 0, halfWidth: 10 }, { t: 0.28, centerOffsetX: -14, halfWidth: 17 }, { t: 0.6, centerOffsetX: 4, halfWidth: 15 }, { t: 0.82, centerOffsetX: 20, halfWidth: 12 }, { t: 1, centerOffsetX: 30, halfWidth: 9 }] },
]

function teeYardage(holeIndex: number, tee: PlumasTeeId) {
  return plumasLakeMetadata.scorecard.holes[holeIndex].yardages[tee]
}

function createCanalHazard(
  number: number,
  lengthMeters: number,
  shape: ShapeSpec
): HazardZone[] {
  if (!shape.canalSide || shape.canalT == null) return []

  const t = shape.canalT
  const point = shape.profile.reduce((best, current) =>
    Math.abs(current.t - t) < Math.abs(best.t - t) ? current : best
  )

  return [{
    id: `plumas-canal-${number}`,
    label: 'Drainage Canal',
    type: 'WATER',
    center: {
      x: point.centerOffsetX + shape.canalSide * (point.halfWidth + 15),
      z: 3 - lengthMeters * t,
    },
    radiusX: 8,
    radiusZ: Math.max(24, lengthMeters * 0.13),
  }]
}

function createHole(index: number, tee: PlumasTeeId): GolfHole {
  const row = plumasLakeMetadata.scorecard.holes[index]
  const shape = SHAPES[index]
  const yardage = teeYardage(index, tee)
  const meters = yardage * 0.9144
  const endZ = -(meters - 18)
  const finalWidth = shape.profile[shape.profile.length - 1].halfWidth
  const approachZ = -meters + (row.par === 3 ? 8 : 16)

  return {
    number: row.hole,
    name: shape.name,
    par: row.par,
    yardage,
    tee: { x: 0, z: 5 },
    green: {
      center: { x: shape.greenX, z: -meters },
      radiusX: row.par === 3 ? 13 : 16,
      radiusZ: row.par === 3 ? 10 : 12,
    },
    bunkers: [
      {
        center: {
          x: shape.greenX + shape.bunkerSide * (finalWidth + 5),
          z: approachZ,
        },
        radiusX: row.par === 3 ? 5.5 : 7,
        radiusZ: row.par === 3 ? 3.8 : 4.8,
      },
      ...(row.par === 5
        ? [{
            center: {
              x: shape.profile[Math.min(2, shape.profile.length - 1)].centerOffsetX - shape.bunkerSide * 12,
              z: -meters * 0.52,
            },
            radiusX: 7.5,
            radiusZ: 4.5,
          }]
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
      endOffsetX: shape.greenX,
      profile: shape.profile,
    },
    cartPath: row.par === 3 ? undefined : {
      offsetX: shape.bunkerSide * -28,
      halfWidth: 1.25,
      waveAmplitude: 1.8,
      waveCycles: 1,
    },
    hazards: createCanalHazard(row.hole, meters, shape),
    outOfBoundsHalfWidth: 110,
    greenSlope: {
      xPercent: ((row.hole % 5) - 2) * 0.22,
      zPercent: ((row.hole % 4) - 1.5) * 0.18,
    },
    environmentStyle: 'SACRAMENTO_VALLEY',
  }
}

export function createPlumasLakeCourse(
  tee: PlumasTeeId = 'blue'
): GolfCourse {
  const teeName = plumasLakeMetadata.scorecard.tees.find(
    (candidate) => candidate.id === tee
  )?.name ?? 'Blue'

  return {
    id: `plumas-lake-${tee}`,
    name: 'Plumas Lake Golf Club',
    location: 'Olivehurst, California',
    prototype: false,
    geometryStatus: 'MAPPED_APPROX',
    sourceNote: `Real ${teeName} tee scorecard yardages with mapped-approx hole geometry. Replace with surveyed GPS without changing gameplay systems.`,
    holes: SHAPES.map((_, index) => createHole(index, tee)),
  }
}
