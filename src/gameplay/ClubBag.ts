export type ClubCategory =
  | 'DRIVER'
  | 'WOOD'
  | 'HYBRID'
  | 'IRON'
  | 'WEDGE'
  | 'PUTTER'

export type GolfClub = {
  id: string
  name: string
  shortName: string
  category: ClubCategory
  loftDeg: number | null
  defaultCarryYards: number
  defaultTotalYards: number
}

export const DEFAULT_BAG: GolfClub[] = [
  { id: 'driver', name: 'Driver', shortName: 'DR', category: 'DRIVER', loftDeg: 10.5, defaultCarryYards: 250, defaultTotalYards: 270 },
  { id: '3w', name: '3 Wood', shortName: '3W', category: 'WOOD', loftDeg: 15, defaultCarryYards: 225, defaultTotalYards: 240 },
  { id: '5w', name: '5 Wood', shortName: '5W', category: 'WOOD', loftDeg: 18, defaultCarryYards: 210, defaultTotalYards: 222 },
  { id: '4h', name: '4 Hybrid', shortName: '4H', category: 'HYBRID', loftDeg: 22, defaultCarryYards: 195, defaultTotalYards: 205 },
  { id: '5i', name: '5 Iron', shortName: '5I', category: 'IRON', loftDeg: 26, defaultCarryYards: 182, defaultTotalYards: 190 },
  { id: '6i', name: '6 Iron', shortName: '6I', category: 'IRON', loftDeg: 30, defaultCarryYards: 170, defaultTotalYards: 177 },
  { id: '7i', name: '7 Iron', shortName: '7I', category: 'IRON', loftDeg: 34, defaultCarryYards: 158, defaultTotalYards: 164 },
  { id: '8i', name: '8 Iron', shortName: '8I', category: 'IRON', loftDeg: 38, defaultCarryYards: 146, defaultTotalYards: 151 },
  { id: '9i', name: '9 Iron', shortName: '9I', category: 'IRON', loftDeg: 42, defaultCarryYards: 134, defaultTotalYards: 138 },
  { id: 'pw', name: 'Pitching Wedge', shortName: 'PW', category: 'WEDGE', loftDeg: 46, defaultCarryYards: 120, defaultTotalYards: 123 },
  { id: 'gw', name: 'Gap Wedge', shortName: 'GW', category: 'WEDGE', loftDeg: 50, defaultCarryYards: 105, defaultTotalYards: 108 },
  { id: 'sw', name: 'Sand Wedge', shortName: 'SW', category: 'WEDGE', loftDeg: 56, defaultCarryYards: 88, defaultTotalYards: 91 },
  { id: 'lw', name: 'Lob Wedge', shortName: 'LW', category: 'WEDGE', loftDeg: 60, defaultCarryYards: 70, defaultTotalYards: 72 },
  { id: 'putter', name: 'Putter', shortName: 'PT', category: 'PUTTER', loftDeg: 3, defaultCarryYards: 0, defaultTotalYards: 0 },
]

export function findClubById(clubId: string) {
  return DEFAULT_BAG.find((club) => club.id === clubId) ?? DEFAULT_BAG[0]
}

export function recommendClubFromBag(
  remainingYards: number,
  onGreen: boolean
) {
  if (onGreen) return findClubById('putter')

  const playable = DEFAULT_BAG.filter((club) => club.category !== 'PUTTER')
  let best = playable[0]
  let bestDifference = Number.POSITIVE_INFINITY

  for (const club of playable) {
    const difference = Math.abs(club.defaultCarryYards - remainingYards)
    if (difference < bestDifference) {
      best = club
      bestDifference = difference
    }
  }

  return best
}
