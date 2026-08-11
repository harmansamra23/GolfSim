import type { SurfaceType } from '../courses/courseTypes'
import type { ShotData } from '../types/shot'
import {
  GAME_STATES,
  type GameState,
} from './GameState'
import type {
  WorldPosition,
  WorldVelocity,
} from './CoordinateSystem'

export type CameraMode =
  | 'FOLLOW'
  | 'BALL'
  | 'PLAYER'
  | 'LANDING'
  | 'FREE'

export type SimulatorBallState = {
  position: WorldPosition
  velocity: WorldVelocity
  lie: SurfaceType
  isMoving: boolean
}

export type SimulatorState = {
  gameState: GameState
  cameraMode: CameraMode
  activeShot: ShotData | null
  ball: SimulatorBallState
}

export function createInitialSimulatorState(
  ballPosition: WorldPosition
): SimulatorState {
  return {
    gameState: GAME_STATES.PRE_SHOT,
    cameraMode: 'FOLLOW',
    activeShot: null,
    ball: {
      position: { ...ballPosition },
      velocity: {
        x: 0,
        y: 0,
        z: 0,
      },
      lie: 'TEE',
      isMoving: false,
    },
  }
}
