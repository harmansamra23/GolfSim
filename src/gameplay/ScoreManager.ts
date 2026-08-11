export type HoleScore = {
  hole: number
  par: number
  strokes: number
  penalties: number
}

export function scoreToPar(score: HoleScore) {
  return score.strokes + score.penalties - score.par
}

export function scoreLabel(relativeToPar: number) {
  if (relativeToPar <= -3) return 'ALBATROSS'
  if (relativeToPar === -2) return 'EAGLE'
  if (relativeToPar === -1) return 'BIRDIE'
  if (relativeToPar === 0) return 'PAR'
  if (relativeToPar === 1) return 'BOGEY'
  if (relativeToPar === 2) return 'DOUBLE BOGEY'
  if (relativeToPar === 3) return 'TRIPLE BOGEY'

  return `+${relativeToPar}`
}

export function roundTotalToPar(scores: HoleScore[]) {
  return scores.reduce(
    (total, score) => total + scoreToPar(score),
    0
  )
}
