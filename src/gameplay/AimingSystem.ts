import type { GolfHole, GolfPoint } from '../courses/courseTypes'
import { aimDirectionDegrees, fairwayCenterX } from '../courses/holeGeometryMath'

export type AimTarget = GolfPoint

export function defaultAimTarget(
  hole: GolfHole,
  ball: GolfPoint,
  remainingYards: number
): AimTarget {
  if (remainingYards <= 220 || hole.par === 3) {
    return { ...hole.green.center }
  }

  const targetMeters = Math.min(230, remainingYards * 0.62) * 0.9144
  const targetZ = Math.max(hole.fairway.endZ, ball.z - targetMeters)

  return {
    x: fairwayCenterX(hole, targetZ),
    z: targetZ,
  }
}

export function moveAimTarget(
  target: AimTarget,
  lateralMeters: number
): AimTarget {
  return {
    ...target,
    x: target.x + lateralMeters,
  }
}

export function aimDirectionToTarget(
  ball: GolfPoint,
  target: AimTarget
) {
  return aimDirectionDegrees(ball, target)
}
