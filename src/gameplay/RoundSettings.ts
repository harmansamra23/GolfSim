import type { CourseSelection } from '../course/CourseLoader'

export type TeeSelection = 'BLACK' | 'BLUE' | 'WHITE' | 'GOLD'
export type PinDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'RANDOM'
export type WindMode = 'CALM' | 'REALISTIC' | 'RANDOM'
export type PuttingMode = 'ENABLED' | 'AUTO_PUTT' | 'GIMME'

export type RoundSettings = {
  playerName: string
  courseId: CourseSelection
  tee: TeeSelection
  pinDifficulty: PinDifficulty
  wind: WindMode
  mulligans: boolean
  putting: PuttingMode
  gimmeFeet: number
}

export const DEFAULT_ROUND_SETTINGS: RoundSettings = {
  playerName: 'Player 1',
  courseId: 'plumas-lake',
  tee: 'BLUE',
  pinDifficulty: 'MEDIUM',
  wind: 'CALM',
  mulligans: true,
  putting: 'ENABLED',
  gimmeFeet: 6,
}
