import type * as THREE from 'three'

export type BallPhase =
  | 'ADDRESS'
  | 'FLIGHT'
  | 'LANDING'
  | 'ROLLING'
  | 'STOPPED'

export type BallState = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  phase: BallPhase
}

export type BallStateReader = () => BallState

export type BallStateWriter = (
  phase: BallPhase,
  position: THREE.Vector3,
  velocity: THREE.Vector3
) => void
