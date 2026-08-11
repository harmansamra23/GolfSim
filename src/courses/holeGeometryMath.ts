import * as THREE from 'three'

import type { GolfHole } from './courseTypes'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function fairwayProgress(hole: GolfHole, z: number) {
  const { startZ, endZ } = hole.fairway

  return clamp(
    (startZ - z) / (startZ - endZ),
    0,
    1
  )
}

export function fairwayCenterX(hole: GolfHole, z: number) {
  const t = fairwayProgress(hole, z)
  const { curveAmplitude, curveCycles, endOffsetX } = hole.fairway

  return (
    hole.tee.x +
    Math.sin(t * Math.PI * curveCycles) * curveAmplitude +
    t * endOffsetX
  )
}

export function fairwayHalfWidth(hole: GolfHole, z: number) {
  const t = fairwayProgress(hole, z)
  const {
    baseHalfWidth,
    middleWidthBoost,
    endTaper,
  } = hole.fairway

  return (
    baseHalfWidth +
    Math.sin(t * Math.PI) * middleWidthBoost -
    t * endTaper
  )
}

export function cartPathCenterX(hole: GolfHole, z: number) {
  const path = hole.cartPath

  if (!path) {
    return fairwayCenterX(hole, z) + 30
  }

  const t = fairwayProgress(hole, z)

  return (
    hole.tee.x +
    path.offsetX +
    Math.sin(t * Math.PI * path.waveCycles) * path.waveAmplitude
  )
}

export function holeDistanceMeters(hole: GolfHole) {
  return Math.hypot(
    hole.green.center.x - hole.tee.x,
    hole.green.center.z - hole.tee.z
  )
}

export function aimDirectionDegrees(
  from: { x: number; z: number },
  to: { x: number; z: number }
) {
  const dx = to.x - from.x
  const dz = to.z - from.z

  return THREE.MathUtils.radToDeg(Math.atan2(dx, -dz))
}
