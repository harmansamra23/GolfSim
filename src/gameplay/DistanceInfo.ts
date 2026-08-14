import type { GolfHole, GolfPoint, HazardZone } from '../courses/courseTypes'
import { metersToYards } from '../simulator/units'

function distanceYards(a: GolfPoint, b: GolfPoint) {
  return metersToYards(Math.hypot(a.x - b.x, a.z - b.z))
}

export type GreenDistances = {
  front: number
  pin: number
  back: number
}

export type HazardDistance = {
  id: string
  label: string
  type: HazardZone['type']
  carryYards: number
}

export function getGreenDistances(
  hole: GolfHole,
  ball: GolfPoint
): GreenDistances {
  const toCenter = distanceYards(ball, hole.green.center)
  const radiusYards = metersToYards(hole.green.radiusZ)

  return {
    front: Math.max(0, Math.round(toCenter - radiusYards)),
    pin: Math.max(0, Math.round(toCenter)),
    back: Math.max(0, Math.round(toCenter + radiusYards)),
  }
}

export function getHazardDistances(
  hole: GolfHole,
  ball: GolfPoint
): HazardDistance[] {
  return (hole.hazards ?? [])
    .map((hazard) => {
      const centerYards = distanceYards(ball, hazard.center)
      const nearRadiusYards = metersToYards(
        Math.max(hazard.radiusX, hazard.radiusZ)
      )

      return {
        id: hazard.id,
        label: hazard.label,
        type: hazard.type,
        carryYards: Math.max(0, Math.round(centerYards - nearRadiusYards)),
      }
    })
    .filter((hazard) => hazard.carryYards <= 320)
    .sort((a, b) => a.carryYards - b.carryYards)
}
