import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef, type ComponentRef } from 'react'
import * as THREE from 'three'

import type { BallStateReader } from '../ball/BallState'
import type { GolfHole } from '../courses/courseTypes'
import { terrainHeightAtPosition } from '../course/terrainHeight'

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
  const lateral = useRef(new THREE.Vector3())

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

    const pinGroundY = terrainHeightAtPosition(
      hole,
      hole.green.center.x,
      hole.green.center.z
    )

    desiredTarget.current.set(
      hole.green.center.x,
      pinGroundY + 0.8,
      hole.green.center.z
    )

    awayFromFlag.current.set(
      ball.x - hole.green.center.x,
      0,
      ball.z - hole.green.center.z
    )

    const distanceToFlag = awayFromFlag.current.length()

    if (distanceToFlag < 0.01) {
      awayFromFlag.current.set(0, 0, 1)
    } else {
      awayFromFlag.current.normalize()
    }

    lateral.current.set(
      awayFromFlag.current.z,
      0,
      -awayFromFlag.current.x
    )

    const addressBackDistance = THREE.MathUtils.clamp(
      10 + distanceToFlag * 0.05,
      14,
      32
    )
    const lateralOffset = THREE.MathUtils.clamp(
      1.4 + distanceToFlag * 0.004,
      1.6,
      3.2
    )
    const ballGroundY = terrainHeightAtPosition(hole, ball.x, ball.z)
    const addressHeight = ballGroundY + 1.72

    if (state.phase === 'ADDRESS') {
      desiredPosition.current.set(
        ball.x +
          awayFromFlag.current.x * addressBackDistance +
          lateral.current.x * lateralOffset,
        addressHeight,
        ball.z +
          awayFromFlag.current.z * addressBackDistance +
          lateral.current.z * lateralOffset
      )
    } else if (state.phase === 'FLIGHT') {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 12 + lateral.current.x * 1.8,
        ball.y + 5.2,
        ball.z + awayFromFlag.current.z * 12 + lateral.current.z * 1.8
      )
    } else if (state.phase === 'LANDING') {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 12 + lateral.current.x * 2.2,
        ball.y + 4.5,
        ball.z + awayFromFlag.current.z * 12 + lateral.current.z * 2.2
      )
    } else if (state.phase === 'ROLLING') {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 9 + lateral.current.x * 2,
        ballGroundY + 3.1,
        ball.z + awayFromFlag.current.z * 9 + lateral.current.z * 2
      )
    } else {
      desiredPosition.current.set(
        ball.x + awayFromFlag.current.x * 9 + lateral.current.x * 2,
        ballGroundY + 3.4,
        ball.z + awayFromFlag.current.z * 9 + lateral.current.z * 2
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
      maxDistance={180}
      maxPolarAngle={Math.PI * 0.48}
    />
  )
}
