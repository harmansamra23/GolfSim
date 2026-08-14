export type TeeSelection = 'BLACK' | 'BLUE' | 'WHITE' | 'GOLD' | 'RED'
export type PinDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'RANDOM'
export type WindMode = 'CALM' | 'REALISTIC' | 'RANDOM'
export type PuttingMode = 'ENABLED' | 'AUTO_PUTT' | 'GIMME'

export type RoundSettings = {
  playerName: string
  tee: TeeSelection
  pinDifficulty: PinDifficulty
  wind: WindMode
  mulligans: boolean
  putting: PuttingMode
  gimmeFeet: number
}

export const DEFAULT_ROUND_SETTINGS: RoundSettings = {
  playerName: 'Player 1',
  tee: 'BLUE',
  pinDifficulty: 'MEDIUM',
  wind: 'CALM',
  mulligans: true,
  putting: 'ENABLED',
  gimmeFeet: 6,
}
