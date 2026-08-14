export type HoleScoreStatus = 'PLAYED' | 'MAX' | 'SKIPPED'

export type HoleScore = {
  hole: number
  par: number
  strokes: number
  penalties: number
  status?: HoleScoreStatus
}

export function maxStrokesForPar(par: number) {
  return par * 2
}

export function isSkippedScore(score: HoleScore) {
  return score.status === 'SKIPPED'
}

export function scoreToPar(score: HoleScore) {
  if (isSkippedScore(score)) return 0
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
