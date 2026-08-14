import * as THREE from 'three'

import type { GreenSlope } from '../courses/courseTypes'
import { mphToMetersPerSecond } from '../simulator/units'
import type { ShotData } from '../types/shot'

const PUTTING_DECELERATION = 1.55
const SLOPE_ACCELERATION_PER_PERCENT = 0.34
export const CUP_CAPTURE_RADIUS_METERS = 0.18

export function createPuttVelocity(shot: ShotData) {
  const speed = mphToMetersPerSecond(shot.ballSpeed)
  const direction = THREE.MathUtils.degToRad(shot.launchDirection)

  return new THREE.Vector3(
    speed * Math.sin(direction),
    0,
    -speed * Math.cos(direction)
  )
}

export function stepPutt(
  velocity: THREE.Vector3,
  dt: number,
  slope?: GreenSlope
) {
  if (slope) {
    velocity.x += slope.xPercent * SLOPE_ACCELERATION_PER_PERCENT * dt
    velocity.z += slope.zPercent * SLOPE_ACCELERATION_PER_PERCENT * dt
  }

  const speed = Math.hypot(velocity.x, velocity.z)

  if (speed <= 0) {
    velocity.set(0, 0, 0)
    return 0
  }

  const nextSpeed = Math.max(
    0,
    speed - PUTTING_DECELERATION * dt
  )

  if (nextSpeed === 0) {
    velocity.set(0, 0, 0)
    return 0
  }

  const scale = nextSpeed / speed
  velocity.x *= scale
  velocity.z *= scale
  velocity.y = 0

  return nextSpeed
}

export function isBallHoled(
  position: THREE.Vector3,
  cupX: number,
  cupZ: number
) {
  return Math.hypot(
    position.x - cupX,
    position.z - cupZ
  ) <= CUP_CAPTURE_RADIUS_METERS
}
