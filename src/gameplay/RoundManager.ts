import type { GolfCourse } from '../courses/courseTypes'
import {
  isSkippedScore,
  type HoleScore,
} from './ScoreManager'

export type RoundState = {
  courseId: string
  currentHoleIndex: number
  scores: HoleScore[]
  complete: boolean
}

export function createRound(course: GolfCourse): RoundState {
  return {
    courseId: course.id,
    currentHoleIndex: 0,
    scores: [],
    complete: false,
  }
}

export function saveHoleScore(
  state: RoundState,
  score: HoleScore,
  course: GolfCourse
): RoundState {
  const existingIndex = state.scores.findIndex(
    (entry) => entry.hole === score.hole
  )
  const scores = [...state.scores]

  if (existingIndex >= 0) {
    scores[existingIndex] = score
  } else {
    scores.push(score)
  }

  scores.sort((a, b) => a.hole - b.hole)

  const lastHole = state.currentHoleIndex >= course.holes.length - 1

  return {
    ...state,
    scores,
    complete: lastHole,
  }
}

export function advanceRound(
  state: RoundState,
  course: GolfCourse
): RoundState {
  if (state.currentHoleIndex >= course.holes.length - 1) {
    return {
      ...state,
      complete: true,
    }
  }

  return {
    ...state,
    currentHoleIndex: state.currentHoleIndex + 1,
  }
}

export function totalStrokes(scores: HoleScore[]) {
  return scores.reduce(
    (total, score) =>
      isSkippedScore(score)
        ? total
        : total + score.strokes + score.penalties,
    0
  )
}

export function totalPar(scores: HoleScore[]) {
  return scores.reduce(
    (total, score) =>
      isSkippedScore(score) ? total : total + score.par,
    0
  )
}
