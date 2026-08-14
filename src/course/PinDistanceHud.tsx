import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

import type { BallStateReader } from '../ball/BallState'
import type { GolfHole } from '../courses/courseTypes'
import { metersToYards } from '../simulator/units'
import './PinDistanceHud.css'

type PinDistanceHudProps = {
  hole: GolfHole
  getBallState: BallStateReader
}

function distanceToPinYards(
  hole: GolfHole,
  x: number,
  z: number
) {
  return Math.round(
    metersToYards(
      Math.hypot(
        hole.green.center.x - x,
        hole.green.center.z - z
      )
    )
  )
}

export function PinDistanceHud({
  hole,
  getBallState,
}: PinDistanceHudProps) {
  const distanceRef = useRef<HTMLSpanElement>(null)
  const lastDistance = useRef(-1)

  useFrame(() => {
    const ball = getBallState().position
    const distance = distanceToPinYards(hole, ball.x, ball.z)

    if (distance === lastDistance.current) return
    lastDistance.current = distance

    if (distanceRef.current) {
      distanceRef.current.textContent = `${distance} YDS`
    }
  })

  const initialDistance = distanceToPinYards(
    hole,
    hole.tee.x,
    hole.tee.z
  )

  return (
    <Html
      position={[
        hole.green.center.x,
        16,
        hole.green.center.z,
      ]}
      center
      zIndexRange={[30, 0]}
    >
      <div className="pin-distance-hud">
        <span className="pin-distance-hud-icon" aria-hidden="true">
          ⛳
        </span>
        <span className="pin-distance-hud-copy">
          <small>TO PIN</small>
          <strong ref={distanceRef}>{initialDistance} YDS</strong>
        </span>
      </div>
    </Html>
  )
}
