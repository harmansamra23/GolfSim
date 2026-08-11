import type { SurfaceType } from '../courses/courseTypes'

export type ClubName =
  | 'DRIVER'
  | '3 WOOD'
  | '5 IRON'
  | '6 IRON'
  | '7 IRON'
  | '8 IRON'
  | '9 IRON'
  | 'PITCHING WEDGE'
  | 'SAND WEDGE'
  | 'PUTTER'

export function recommendClub(
  remainingYards: number,
  lie: SurfaceType
): ClubName {
  if (lie === 'GREEN') return 'PUTTER'
  if (lie === 'BUNKER') return 'SAND WEDGE'

  if (remainingYards >= 235) return 'DRIVER'
  if (remainingYards >= 205) return '3 WOOD'
  if (remainingYards >= 180) return '5 IRON'
  if (remainingYards >= 165) return '6 IRON'
  if (remainingYards >= 150) return '7 IRON'
  if (remainingYards >= 135) return '8 IRON'
  if (remainingYards >= 120) return '9 IRON'
  if (remainingYards >= 85) return 'PITCHING WEDGE'

  return 'SAND WEDGE'
}
