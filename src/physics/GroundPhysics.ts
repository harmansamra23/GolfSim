import * as THREE from 'three'

import type { SurfaceType } from '../courses/courseTypes'
import { getSurfacePhysics } from './surfacePhysics'

export function applyGroundImpact(
  velocity: THREE.Vector3,
  surface: SurfaceType,
  bounceCount: number
) {
  const physics = getSurfacePhysics(surface)
  const impactSpeed = Math.abs(velocity.y)
  const bounceMultiplier =
    bounceCount === 1
      ? physics.bounce
      : physics.bounce * 0.52

  velocity.y = impactSpeed * bounceMultiplier
  velocity.x *= physics.horizontalRetention
  velocity.z *= physics.horizontalRetention

  return {
    shouldRoll:
      surface === 'BUNKER' ||
      bounceCount >= 3 ||
      velocity.y < 0.9,
  }
}

export function stepGroundRoll(
  velocity: THREE.Vector3,
  surface: SurfaceType,
  dt: number
) {
  const physics = getSurfacePhysics(surface)
  const friction = Math.pow(
    physics.rollingFriction,
    dt * 60
  )

  velocity.x *= friction
  velocity.z *= friction
  velocity.y = 0

  return Math.hypot(velocity.x, velocity.z)
}
