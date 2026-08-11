import type { GolfCourse, GolfHole } from './courseTypes'

const HOLE_SPECS = [
  [4, 409],
  [5, 515],
  [3, 168],
  [4, 382],
  [4, 431],
  [3, 194],
  [5, 548],
  [4, 407],
  [4, 365],
  [4, 421],
  [3, 176],
  [5, 532],
  [4, 394],
  [4, 446],
  [3, 186],
  [5, 556],
  [4, 371],
  [4, 428],
] as const

function createHole(
  number: number,
  par: number,
  yardage: number
): GolfHole {
  const meters = yardage * 0.9144
  const curveDirection = number % 2 === 0 ? 1 : -1
  const curveAmplitude = par === 3 ? 1.8 : par === 5 ? 5.5 : 3.4
  const greenX = curveDirection * (2 + (number % 4) * 1.4)
  const endZ = -(meters - 18)

  return {
    number,
    par,
    yardage,
    tee: { x: 0, z: 5 },
    green: {
      center: { x: greenX, z: -meters },
      radiusX: par === 3 ? 15 : 18,
      radiusZ: par === 3 ? 12 : 14,
    },
    bunkers:
      par === 3
        ? [
            {
              center: { x: greenX - 13, z: -meters + 8 },
              radiusX: 6,
              radiusZ: 4,
            },
          ]
        : [
            {
              center: {
                x: greenX - 14,
                z: -meters + 17,
              },
              radiusX: 7,
              radiusZ: 4.5,
            },
            {
              center: {
                x: greenX + 13,
                z: -meters + 10,
              },
              radiusX: 6,
              radiusZ: 4,
            },
          ],
    fairway: {
      startZ: 3,
      endZ,
      baseHalfWidth: par === 3 ? 8 : 10,
      middleWidthBoost: par === 5 ? 10 : 7,
      endTaper: 2,
      curveAmplitude,
      curveCycles: 1.1 + (number % 3) * 0.12,
      endOffsetX: greenX * 0.45,
    },
    cartPath:
      par === 3
        ? undefined
        : {
            offsetX: 30 * curveDirection,
            halfWidth: 1.35,
            waveAmplitude: 2.2,
            waveCycles: 1.05,
          },
  }
}

export const prototype18Course: GolfCourse = {
  id: 'golfsim-prototype-18',
  name: 'GolfSim Prototype 18',
  location: 'Development Course',
  prototype: true,
  holes: HOLE_SPECS.map(([par, yardage], index) =>
    createHole(index + 1, par, yardage)
  ),
}
