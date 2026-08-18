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

  const broadRoll =
    Math.sin(z * 0.018 + hole.number * 0.73) * 0.42 +
    Math.sin(x * 0.031 - z * 0.009 + hole.number) * 0.24

  const center = fairwayCenterX(hole, z)
  const halfWidth = Math.max(8, fairwayHalfWidth(hole, z))
  const lateral = Math.min(2.5, Math.abs(x - center) / halfWidth)
  const fairwayCrown = Math.max(0, 1 - lateral) * 0.22
  const roughRoll = smoothstep(0.8, 2.2, lateral) *
    Math.sin(x * 0.055 + z * 0.014) * 0.26

  const approachLift = smoothstep(0.72, 0.96, along) * 0.34

  const teeDistance = Math.hypot(x - hole.tee.x, z - hole.tee.z)
  const teeBlend = smoothstep(8, 24, teeDistance)

  const greenDistance = Math.hypot(
    (x - hole.green.center.x) / Math.max(1, hole.green.radiusX),
    (z - hole.green.center.z) / Math.max(1, hole.green.radiusZ)
  )
  const greenPlateau = (1 - smoothstep(0.65, 1.65, greenDistance)) * 0.28

  return (
    (broadRoll + fairwayCrown + roughRoll + approachLift) * teeBlend +
    greenPlateau
  )
}
