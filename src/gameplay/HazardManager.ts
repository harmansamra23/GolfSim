import type { GolfHole, GolfPoint, SurfaceType } from '../courses/courseTypes'
import { getSurfaceAtPosition } from '../physics/surfacePhysics'

export type HazardResolution = {
  surface: Extract<SurfaceType, 'WATER' | 'OUT_OF_BOUNDS'>
  penaltyStrokes: number
  dropPosition: GolfPoint
}

export function resolveHazard(
  hole: GolfHole,
  previousPosition: GolfPoint,
  finalPosition: GolfPoint
): HazardResolution | null {
  const surface = getSurfaceAtPosition(hole, finalPosition.x, finalPosition.z)

  if (surface !== 'WATER' && surface !== 'OUT_OF_BOUNDS') {
    return null
  }

  // Prototype rules: one-stroke penalty and return to the last playable
  // position. This keeps the simulator deterministic until a real course
  // supplies marked drop zones / stroke-and-distance rules.
  return {
    surface,
    penaltyStrokes: 1,
    dropPosition: { ...previousPosition },
  }
}
