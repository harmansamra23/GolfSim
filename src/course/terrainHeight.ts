import type { GolfHole } from '../courses/courseTypes'
import { fairwayCenterX, fairwayHalfWidth } from '../courses/holeGeometryMath'

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

export function terrainHeightAtPosition(
  hole: GolfHole,
  x: number,
  z: number
) {
  const holeLength = Math.max(
    1,
    Math.abs(hole.green.center.z - hole.tee.z)
  )
  const along = Math.min(
    1,
    Math.max(0, Math.abs(z - hole.tee.z) / holeLength)
  )

  const center = fairwayCenterX(hole, z)
  const halfWidth = Math.max(8, fairwayHalfWidth(hole, z))
  const lateral = Math.min(3, Math.abs(x - center) / halfWidth)

  const playableRoll =
    Math.sin(z * 0.018 + hole.number * 0.73) * 0.08 +
    Math.sin(x * 0.028 - z * 0.008 + hole.number) * 0.05
  const crown = Math.max(0, 1 - lateral) * 0.06

  const roughBlend = smoothstep(0.95, 2.35, lateral)
  const roughRoll = roughBlend * (
    Math.sin(x * 0.036 + z * 0.013 + hole.number) * 0.34 +
    Math.sin(x * 0.071 - z * 0.019) * 0.16
  )

  const approachLift = smoothstep(0.76, 0.98, along) * 0.08
  const teeDistance = Math.hypot(x - hole.tee.x, z - hole.tee.z)
  const teeBlend = smoothstep(9, 25, teeDistance)

  const greenDistance = Math.hypot(
    (x - hole.green.center.x) / Math.max(1, hole.green.radiusX),
    (z - hole.green.center.z) / Math.max(1, hole.green.radiusZ)
  )
  const greenPlateau = (1 - smoothstep(0.7, 1.55, greenDistance)) * 0.08

  return (
    (playableRoll + crown + roughRoll + approachLift) * teeBlend +
    greenPlateau
  )
}
