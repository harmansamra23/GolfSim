import { Html, Sky } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

import type {
  BallPhase,
  BallState,
  BallStateReader,
  BallStateWriter,
} from '../../ball/BallState'
import {
  CameraManager,
  type CameraPreference,
} from '../../camera/CameraManager'
import { CourseHole } from '../../course/CourseHole'
import type { GolfHole } from '../../courses/courseTypes'
import {
  BALL_FLIGHT_STEP_SECONDS,
  createLaunchVelocity,
  stepBallFlight,
} from '../../physics/BallFlightPhysics'
import {
  applyGroundImpact,
  stepGroundRoll,
} from '../../physics/GroundPhysics'
import {
  createPuttVelocity,
  isBallHoled,
  stepPutt,
} from '../../physics/PuttingPhysics'
import { getSurfaceAtPosition } from '../../physics/surfacePhysics'
import { metersToYards } from '../../simulator/units'
import type { ShotData, ShotResult } from '../../types/shot'

type GolfSceneProps = {
  hole: GolfHole
  shot: ShotData | null
  cameraPreference: CameraPreference
  resetToken: number
  onBallPhaseChange: (phase: BallPhase) => void
  onShotResult: (result: ShotResult) => void
}

const tracerCoreMaterial = new THREE.MeshBasicMaterial({
  color: '#ffffff',
})

const tracerGlowMaterial = new THREE.MeshBasicMaterial({
  color: '#9fdcff',
  transparent: true,
  opacity: 0.18,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})

function GolfScene({
  hole,
  shot,
  cameraPreference,
  resetToken,
  onBallPhaseChange,
  onShotResult,
}: GolfSceneProps) {
  const ballState = useRef<BallState>({
    position: new THREE.Vector3(hole.tee.x, 0.2, hole.tee.z),
    velocity: new THREE.Vector3(),
    phase: 'ADDRESS',
  })

  const getBallState: BallStateReader = () => ballState.current

  const setBallState: BallStateWriter = (
    phase,
    position,
    velocity
  ) => {
    ballState.current.phase = phase
    ballState.current.position.copy(position)
    ballState.current.velocity.copy(velocity)
  }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: [hole.tee.x, 1.75, hole.tee.z + 14],
        fov: 50,
        near: 0.1,
        far: 1400,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
    >
      <color attach="background" args={['#8ebbd7']} />
      <fog attach="fog" args={['#8ebbd7', 300, 900]} />

      <Sky
        distance={450000}
        sunPosition={[70, 38, 30]}
        turbidity={5}
        rayleigh={1.35}
      />

      <ambientLight intensity={0.16} />
      <hemisphereLight
        intensity={0.82}
        color="#eef8ff"
        groundColor="#244528"
      />
      <directionalLight
        position={[58, 86, 34]}
        intensity={3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-95}
        shadow-camera-right={95}
        shadow-camera-top={95}
        shadow-camera-bottom={-95}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-bias={-0.0002}
      />

      <CourseHole hole={hole} />
      <PinDistanceMarker hole={hole} getBallState={getBallState} />

      <AnimatedGolfBall
        hole={hole}
        shot={shot}
        resetToken={resetToken}
        setBallState={setBallState}
        onBallPhaseChange={onBallPhaseChange}
        onShotResult={onShotResult}
      />

      <CameraManager
        hole={hole}
        getBallState={getBallState}
        preference={cameraPreference}
      />
    </Canvas>
  )
}

function PinDistanceMarker({
  hole,
  getBallState,
}: {
  hole: GolfHole
  getBallState: BallStateReader
}) {
  const textRef = useRef<HTMLSpanElement>(null)
  const lastRoundedYards = useRef(-1)

  useFrame(() => {
    const ball = getBallState().position
    const yards = Math.round(
      metersToYards(
        Math.hypot(
          hole.green.center.x - ball.x,
          hole.green.center.z - ball.z
        )
      )
    )

    if (yards === lastRoundedYards.current) return
    lastRoundedYards.current = yards

    if (textRef.current) {
      textRef.current.textContent = `${yards} YDS`
    }
  })

  const initialYards = Math.round(
    metersToYards(
      Math.hypot(
        hole.green.center.x - hole.tee.x,
        hole.green.center.z - hole.tee.z
      )
    )
  )

  return (
    <Html
      position={[
        hole.green.center.x,
        7.2,
        hole.green.center.z,
      ]}
      center
      distanceFactor={12}
      zIndexRange={[20, 0]}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderRadius: '999px',
          background: 'rgba(8, 18, 13, 0.88)',
          border: '1px solid rgba(255,255,255,0.28)',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        }}
      >
        <span aria-hidden="true">⛳</span>
        <span ref={textRef}>{initialYards} YDS</span>
      </div>
    </Html>
  )
}

function AnimatedGolfBall({
  hole,
  shot,
  resetToken,
  setBallState,
  onBallPhaseChange,
  onShotResult,
}: {
  hole: GolfHole
  shot: ShotData | null
  resetToken: number
  setBallState: BallStateWriter
  onBallPhaseChange: (phase: BallPhase) => void
  onShotResult: (result: ShotResult) => void
}) {
  const ballRef = useRef<THREE.Mesh>(null)
  const tracerRef = useRef<THREE.Group>(null)
  const position = useRef(
    new THREE.Vector3(hole.tee.x, 0.2, hole.tee.z)
  )
  const startPosition = useRef(
    new THREE.Vector3(hole.tee.x, 0.2, hole.tee.z)
  )
  const velocity = useRef(new THREE.Vector3())
  const currentShot = useRef<ShotData | null>(null)
  const lastShotId = useRef<number | null>(null)
  const lastResetToken = useRef(resetToken)
  const active = useRef(false)
  const rolling = useRef(false)
  const bounceCount = useRef(0)
  const phase = useRef<BallPhase>('ADDRESS')
  const lastReportedPhase = useRef<BallPhase>('ADDRESS')
  const carryReported = useRef(false)
  const carryYards = useRef(0)
  const tracerPoints = useRef<THREE.Vector3[]>([])
  const flightAccumulator = useRef(0)

  function setPhase(nextPhase: BallPhase) {
    phase.current = nextPhase

    if (lastReportedPhase.current !== nextPhase) {
      lastReportedPhase.current = nextPhase
      onBallPhaseChange(nextPhase)
    }
  }

  function clearTracer() {
    if (!tracerRef.current) return

    tracerRef.current.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
      }
    })

    tracerRef.current.clear()
  }

  function resetBall() {
    active.current = false
    rolling.current = false
    bounceCount.current = 0
    carryReported.current = false
    carryYards.current = 0
    currentShot.current = null
    lastShotId.current = null
    flightAccumulator.current = 0

    position.current.set(hole.tee.x, 0.2, hole.tee.z)
    startPosition.current.copy(position.current)
    velocity.current.set(0, 0, 0)
    setPhase('ADDRESS')

    clearTracer()
    tracerPoints.current = []

    if (ballRef.current) {
      ballRef.current.position.copy(position.current)
    }

    setBallState(
      phase.current,
      position.current,
      velocity.current
    )
  }

  function startShot(newShot: ShotData) {
    currentShot.current = newShot
    startPosition.current.copy(position.current)

    clearTracer()
    tracerPoints.current = [position.current.clone()]
    bounceCount.current = 0
    carryReported.current = newShot.kind === 'PUTT'
    carryYards.current = 0
    flightAccumulator.current = 0

    if (newShot.kind === 'PUTT') {
      velocity.current.copy(createPuttVelocity(newShot))
      rolling.current = true
      setPhase('ROLLING')
    } else {
      velocity.current.copy(createLaunchVelocity(newShot))
      rolling.current = false
      setPhase('FLIGHT')
    }

    active.current = true

    setBallState(
      phase.current,
      position.current,
      velocity.current
    )
  }

  function reportCarry(current: ShotData) {
    if (carryReported.current) return

    const carryMeters = Math.hypot(
      position.current.x - startPosition.current.x,
      position.current.z - startPosition.current.z
    )

    carryYards.current = metersToYards(carryMeters)
    carryReported.current = true

    onShotResult({
      id: current.id,
      carry: carryYards.current,
      lie: getSurfaceAtPosition(
        hole,
        position.current.x,
        position.current.z
      ),
    })
  }

  function finishShot(current: ShotData, holed: boolean) {
    velocity.current.set(0, 0, 0)
    active.current = false
    setPhase('STOPPED')

    if (holed) {
      position.current.x = hole.green.center.x
      position.current.z = hole.green.center.z
    }

    if (ballRef.current) {
      ballRef.current.position.copy(position.current)
    }

    setBallState(
      phase.current,
      position.current,
      velocity.current
    )

    const totalMeters = Math.hypot(
      position.current.x - startPosition.current.x,
      position.current.z - startPosition.current.z
    )

    const finalSurface = holed
      ? 'GREEN'
      : getSurfaceAtPosition(
          hole,
          position.current.x,
          position.current.z
        )

    onShotResult({
      id: current.id,
      carry: current.kind === 'PUTT' ? 0 : carryYards.current,
      totalDistance: metersToYards(totalMeters),
      lie: finalSurface,
      holed,
      finalPosition: {
        x: position.current.x,
        y: position.current.y,
        z: position.current.z,
      },
    })
  }

  function handleAirborneStep(
    current: ShotData,
    dt: number
  ) {
    stepBallFlight(velocity.current, current, dt)
    position.current.addScaledVector(velocity.current, dt)

    if (
      velocity.current.y < 0 &&
      position.current.y < 8 &&
      phase.current !== 'LANDING'
    ) {
      setPhase('LANDING')
    }

    if (
      position.current.y > 0.2 ||
      velocity.current.y >= 0
    ) {
      return
    }

    position.current.y = 0.2
    reportCarry(current)
    bounceCount.current += 1

    const surface = getSurfaceAtPosition(
      hole,
      position.current.x,
      position.current.z
    )

    const impact = applyGroundImpact(
      velocity.current,
      surface,
      bounceCount.current
    )

    if (impact.shouldRoll) {
      velocity.current.y = 0
      rolling.current = true
      setPhase('ROLLING')
    }
  }

  useFrame((_, frameDelta) => {
    if (resetToken !== lastResetToken.current) {
      lastResetToken.current = resetToken
      resetBall()
      return
    }

    if (shot && shot.id !== lastShotId.current) {
      lastShotId.current = shot.id
      startShot(shot)
    }

    if (!active.current) return

    const current = currentShot.current
    if (!current) return

    const delta = Math.min(frameDelta, 0.05)

    if (!rolling.current) {
      flightAccumulator.current += delta
      let substeps = 0

      while (
        flightAccumulator.current >= BALL_FLIGHT_STEP_SECONDS &&
        substeps < 8 &&
        !rolling.current
      ) {
        handleAirborneStep(
          current,
          BALL_FLIGHT_STEP_SECONDS
        )
        flightAccumulator.current -= BALL_FLIGHT_STEP_SECONDS
        substeps += 1
      }
    } else {
      position.current.y = 0.2
      position.current.addScaledVector(velocity.current, delta)

      let groundSpeed: number

      if (current.kind === 'PUTT') {
        groundSpeed = stepPutt(velocity.current, delta)

        if (
          isBallHoled(
            position.current,
            hole.green.center.x,
            hole.green.center.z
          )
        ) {
          finishShot(current, true)
          return
        }
      } else {
        const surface = getSurfaceAtPosition(
          hole,
          position.current.x,
          position.current.z
        )

        groundSpeed = stepGroundRoll(
          velocity.current,
          surface,
          delta
        )
      }

      const stopSpeed = current.kind === 'PUTT' ? 0.04 : 0.4

      if (groundSpeed < stopSpeed) {
        finishShot(current, false)
        return
      }
    }

    if (ballRef.current) {
      ballRef.current.position.copy(position.current)
      ballRef.current.rotation.x += velocity.current.z * delta * 0.08
      ballRef.current.rotation.z -= velocity.current.x * delta * 0.08
    }

    setBallState(
      phase.current,
      position.current,
      velocity.current
    )

    if (current.kind === 'FULL' && !rolling.current) {
      const previous =
        tracerPoints.current[tracerPoints.current.length - 1]

      if (
        !previous ||
        previous.distanceTo(position.current) > 1.15
      ) {
        const next = position.current.clone()
        tracerPoints.current.push(next)

        if (previous && tracerRef.current) {
          tracerRef.current.add(
            createTracerSegment(previous, next)
          )
        }
      }
    }
  })

  return (
    <>
      <mesh
        ref={ballRef}
        position={[hole.tee.x, 0.2, hole.tee.z]}
        castShadow
      >
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#ffffff" roughness={0.18} />
      </mesh>

      <group ref={tracerRef} />
    </>
  )
}

function createTracerSegment(
  start: THREE.Vector3,
  end: THREE.Vector3
) {
  const direction = new THREE.Vector3().subVectors(end, start)
  const length = direction.length()
  const midpoint = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)

  const group = new THREE.Group()
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, length, 6),
    tracerCoreMaterial
  )
  const glow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, length, 6),
    tracerGlowMaterial
  )
  const orientation = direction.clone().normalize()

  core.position.copy(midpoint)
  core.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    orientation
  )
  glow.position.copy(midpoint)
  glow.quaternion.copy(core.quaternion)

  group.add(core)
  group.add(glow)
  return group
}

export default GolfScene
