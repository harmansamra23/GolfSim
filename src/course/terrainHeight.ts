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
  const signedLateral = (x - center) / halfWidth
  const lateral = Math.min(3, Math.abs(signedLateral))

  // Low, broad land movement that remains believable for a valley course.
  const longWave =
    Math.sin(z * 0.014 + hole.number * 0.61) * 0.16 +
    Math.sin(z * 0.027 - hole.number * 0.37) * 0.07
  const crossFall = signedLateral *
    Math.sin(z * 0.011 + hole.number * 0.43) *
    0.12

  // A subtle fairway crown gives the camera something to read in side light.
  const fairwayCrown = Math.max(0, 1 - lateral) * 0.12

  // Outside the playable corridor the land moves more strongly and forms
  // natural shoulders instead of reading as a perfectly flat plane.
  const roughBlend = smoothstep(0.9, 2.3, lateral)
  const roughRoll = roughBlend * (
    Math.sin(x * 0.031 + z * 0.012 + hole.number) * 0.48 +
    Math.sin(x * 0.061 - z * 0.018 + hole.number * 0.4) * 0.22
  )
  const edgeShoulder =
    smoothstep(1.0, 1.8, lateral) *
    (0.18 + 0.15 * Math.sin(z * 0.02 + hole.number))

  const approachLift = smoothstep(0.68, 0.96, along) * 0.2
  const teeDistance = Math.hypot(x - hole.tee.x, z - hole.tee.z)
  const teeBlend = smoothstep(10, 30, teeDistance)

  const greenDistance = Math.hypot(
    (x - hole.green.center.x) / Math.max(1, hole.green.radiusX),
    (z - hole.green.center.z) / Math.max(1, hole.green.radiusZ)
  )
  const greenPlateau =
    (1 - smoothstep(0.72, 1.55, greenDistance)) * 0.18
  const greenShoulder =
    (1 - smoothstep(1.0, 2.05, greenDistance)) *
    smoothstep(0.62, 1.15, greenDistance) *
    0.16

  return (
    (longWave +
      crossFall +
      fairwayCrown +
      roughRoll +
      edgeShoulder +
      approachLift) *
      teeBlend +
    greenPlateau +
    greenShoulder
  )
}
