import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import type { BallStateReader } from '../ball/BallState'
import {
  fairwayCenterX,
  plumasLakeHole1,
} from '../courses/plumasLakeHole1'

export type CameraPreference = 'AUTO' | 'FREE'

type CameraManagerProps = {
  getBallState: BallStateReader
  preference: CameraPreference
}

export function CameraManager({
  getBallState,
  preference,
}: CameraManagerProps) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const desiredPosition = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())

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

    if (state.phase === 'ADDRESS') {
      desiredPosition.current.set(
        plumasLakeHole1.tee.x,
        1.8,
        plumasLakeHole1.tee.z + 10
      )
      desiredTarget.current.set(
        fairwayCenterX(-80),
        1,
        -80
      )
    } else if (state.phase === 'FLIGHT') {
      desiredPosition.current.set(
        ball.x,
        ball.y + 5.5,
        ball.z + 12
      )
      desiredTarget.current.set(
        ball.x,
        ball.y + 1,
        ball.z - 10
      )
    } else if (state.phase === 'LANDING') {
      desiredPosition.current.set(
        ball.x + 7,
        ball.y + 5,
        ball.z + 13
      )
      desiredTarget.current.copy(ball)
    } else if (state.phase === 'ROLLING') {
      desiredPosition.current.set(
        ball.x + 6,
        4,
        ball.z + 10
      )
      desiredTarget.current.set(
        ball.x,
        0.3,
        ball.z
      )
    } else {
      desiredPosition.current.set(
        ball.x + 7,
        4.5,
        ball.z + 10
      )
      desiredTarget.current.set(
        ball.x,
        0.3,
        ball.z
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
