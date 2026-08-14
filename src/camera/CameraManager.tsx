import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type ComponentRef } from 'react'
import * as THREE from 'three'

import type { BallStateReader } from '../ball/BallState'
import type { GolfHole } from '../courses/courseTypes'

export type CameraPreference = 'AUTO' | 'FREE'

type CameraManagerProps = {
  getBallState: BallStateReader
  preference: CameraPreference
  hole: GolfHole
}

export function CameraManager({
  getBallState,
  preference,
  hole,
}: CameraManagerProps) {
  const { camera } = useThree()
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null)
  const desiredPosition = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())
  const awayFromFlag = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const state = getBallState()
    const ball = state.position
    const stationary =
      state.phase === 'ADDRESS' || state.phase === 'STOPPED'
    const freeEnabled = preference === 'FREE' && stationary

    if (controlsRef.current) {
      controlsRef.current.enabled = freeEnabled

      if (freeEnabled) {
        controlsRef.current.update()
      }
    }

    if (freeEnabled) return

    // AUTO camera always faces the flag. The camera can move with the ball,
    // but the pin remains the visual anchor throughout the entire shot.
    desiredTarget.current.set(
      hole.green.center.x,
      1,
      hole.green.center.z
    )

    awayFromFlag.current.set(
      ball.x - hole.green.center.x,
      0,
      ball.z - hole.green.center.z
    )

    if (awayFromFlag.current.lengthSq() < 0.0001) {
      awayFromFlag.current.set(0, 0, 1)
    } else {
      awayFromFlag.current.normalize()
    }

    if (state.phase === 'ADDRESS') {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 10,
        1.8,
        ball.z + awayFromFlag.current.z * 10
      )
    } else if (state.phase === 'FLIGHT') {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 12,
        ball.y + 5.5,
        ball.z + awayFromFlag.current.z * 12
      )
    } else if (state.phase === 'LANDING') {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 13,
        ball.y + 5,
        ball.z + awayFromFlag.current.z * 13
      )
    } else if (state.phase === 'ROLLING') {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 10,
        4,
        ball.z + awayFromFlag.current.z * 10
      )
    } else {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 10,
        4.5,
        ball.z + awayFromFlag.current.z * 10
      )
    }

    const smoothing = 1 - Math.exp(-4 * delta)
    camera.position.lerp(desiredPosition.current, smoothing)
    camera.lookAt(desiredTarget.current)

    if (controlsRef.current) {
      controlsRef.current.target.copy(desiredTarget.current)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={120}
      maxPolarAngle={Math.PI * 0.48}
    />
  )
}
