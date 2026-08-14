import * as THREE from 'three'

import type {
  FairwayControlPoint,
  GolfHole,
} from './courseTypes'

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function interpolateProfile(
  profile: FairwayControlPoint[],
  t: number,
  key: 'centerOffsetX' | 'halfWidth'
) {
  if (profile.length === 0) return 0
  if (t <= profile[0].t) return profile[0][key]
  if (t >= profile[profile.length - 1].t) {
    return profile[profile.length - 1][key]
  }

  for (let index = 1; index < profile.length; index++) {
    const current = profile[index]
    const previous = profile[index - 1]

    if (t <= current.t) {
      const segment =
        (t - previous.t) / Math.max(0.0001, current.t - previous.t)
      const eased = segment * segment * (3 - 2 * segment)

      return THREE.MathUtils.lerp(
        previous[key],
        current[key],
        eased
      )
    }
  }

  return profile[profile.length - 1][key]
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
  const { profile, curveAmplitude, curveCycles, endOffsetX } = hole.fairway

  if (profile && profile.length > 0) {
    return hole.tee.x + interpolateProfile(profile, t, 'centerOffsetX')
  }

  return (
    hole.tee.x +
    Math.sin(t * Math.PI * curveCycles) * curveAmplitude +
    t * endOffsetX
  )
}

export function fairwayHalfWidth(hole: GolfHole, z: number) {
  const t = fairwayProgress(hole, z)
  const {
    profile,
    baseHalfWidth,
    middleWidthBoost,
    endTaper,
  } = hole.fairway

  if (profile && profile.length > 0) {
    return Math.max(5.5, interpolateProfile(profile, t, 'halfWidth'))
  }

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
    fairwayCenterX(hole, z) +
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
