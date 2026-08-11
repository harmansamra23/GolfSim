import * as THREE from 'three'

import type { ShotData } from '../types/shot'
import { mphToMetersPerSecond, rpmToRadiansPerSecond } from '../simulator/units'

export const BALL_FLIGHT_STEP_SECONDS = 1 / 120

const GRAVITY = new THREE.Vector3(0, -9.81, 0)
const AIR_DENSITY = 1.225
const BALL_MASS_KG = 0.04593
const BALL_RADIUS_M = 0.021335
const BALL_AREA_M2 = Math.PI * BALL_RADIUS_M * BALL_RADIUS_M
const DRAG_COEFFICIENT = 0.25

function createSpinAxis(spinAxisDeg: number) {
  const tilt = THREE.MathUtils.degToRad(spinAxisDeg)

  return new THREE.Vector3(
    Math.cos(tilt),
    Math.sin(tilt),
    0
  ).normalize()
}

export function createLaunchVelocity(shot: ShotData) {
  const speed = mphToMetersPerSecond(shot.ballSpeed)
  const launchAngle = THREE.MathUtils.degToRad(shot.launchAngle)
  const direction = THREE.MathUtils.degToRad(shot.launchDirection)
  const horizontal = speed * Math.cos(launchAngle)

  return new THREE.Vector3(
    horizontal * Math.sin(direction),
    speed * Math.sin(launchAngle),
    -horizontal * Math.cos(direction)
  )
}

export function stepBallFlight(
  velocity: THREE.Vector3,
  shot: ShotData,
  dt: number
) {
  const speed = velocity.length()

  if (speed < 0.001) {
    velocity.addScaledVector(GRAVITY, dt)
    return
  }

  const acceleration = GRAVITY.clone()
  const velocityDirection = velocity.clone().normalize()

  const dynamicPressure = 0.5 * AIR_DENSITY * speed * speed
  const dragForce = dynamicPressure * BALL_AREA_M2 * DRAG_COEFFICIENT
  const dragAcceleration = dragForce / BALL_MASS_KG

  acceleration.addScaledVector(
    velocityDirection,
    -dragAcceleration
  )

  const omega = rpmToRadiansPerSecond(Math.max(0, shot.spinRate))
  const spinParameter = (omega * BALL_RADIUS_M) / Math.max(speed, 0.1)
  const liftCoefficient = THREE.MathUtils.clamp(
    spinParameter * 1.15,
    0,
    0.38
  )

  const spinAxis = createSpinAxis(shot.spinAxis)
  const magnusDirection = spinAxis
    .clone()
    .cross(velocityDirection)

  if (magnusDirection.lengthSq() > 0.000001) {
    magnusDirection.normalize()

    const liftForce = dynamicPressure * BALL_AREA_M2 * liftCoefficient
    const liftAcceleration = liftForce / BALL_MASS_KG

    acceleration.addScaledVector(
      magnusDirection,
      liftAcceleration
    )
  }

  velocity.addScaledVector(acceleration, dt)
}
