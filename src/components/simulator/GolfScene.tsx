import { Sky } from '@react-three/drei'
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
import { plumasLakeHole1 } from '../../courses/plumasLakeHole1'
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
  shot: ShotData | null
  cameraPreference: CameraPreference
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
  shot,
  cameraPreference,
  onShotResult,
}: GolfSceneProps) {
  const ballState = useRef<BallState>({
    position: new THREE.Vector3(
      plumasLakeHole1.tee.x,
      0.2,
      plumasLakeHole1.tee.z
    ),
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
        position: [0, 1.75, 14],
        fov: 50,
        near: 0.1,
        far: 1200,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
    >
      <color attach="background" args={['#8ebbd7']} />
      <fog attach="fog" args={['#8ebbd7', 300, 850]} />

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

      <CourseHole />

      <AnimatedGolfBall
        shot={shot}
        setBallState={setBallState}
        onShotResult={onShotResult}
      />

      <CameraManager
        getBallState={getBallState}
        preference={cameraPreference}
      />
    </Canvas>
  )
}

function AnimatedGolfBall({
  shot,
  setBallState,
  onShotResult,
}: {
  shot: ShotData | null
  setBallState: BallStateWriter
  onShotResult: (result: ShotResult) => void
}) {
  const ballRef = useRef<THREE.Mesh>(null)
  const tracerRef = useRef<THREE.Group>(null)

  const position = useRef(
    new THREE.Vector3(
      plumasLakeHole1.tee.x,
      0.2,
      plumasLakeHole1.tee.z
    )
  )
  const startPosition = useRef(position.current.clone())
  const velocity = useRef(new THREE.Vector3())
  const currentShot = useRef<ShotData | null>(null)
  const lastShotId = useRef<number | null>(null)
  const active = useRef(false)
  const rolling = useRef(false)
  const bounceCount = useRef(0)
  const phase = useRef<BallPhase>('ADDRESS')
  const carryReported = useRef(false)
  const carryYards = useRef(0)
  const tracerPoints = useRef<THREE.Vector3[]>([])
  const flightAccumulator = useRef(0)

  function clearTracer() {
    if (!tracerRef.current) return

    tracerRef.current.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
      }
    })

    tracerRef.current.clear()
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
      phase.current = 'ROLLING'
    } else {
      velocity.current.copy(createLaunchVelocity(newShot))
      rolling.current = false
      phase.current = 'FLIGHT'
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
        position.current.x,
        position.current.z
      ),
    })
  }

  function finishShot(current: ShotData, holed: boolean) {
    velocity.current.set(0, 0, 0)
    active.current = false
    phase.current = 'STOPPED'

    if (holed) {
      position.current.x = plumasLakeHole1.green.center.x
      position.current.z = plumasLakeHole1.green.center.z
    }

    const totalMeters = Math.hypot(
      position.current.x - startPosition.current.x,
      position.current.z - startPosition.current.z
    )

    const finalSurface = holed
      ? 'GREEN'
      : getSurfaceAtPosition(
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
      position.current.y < 8
    ) {
      phase.current = 'LANDING'
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
      phase.current = 'ROLLING'
    }
  }

  useFrame((_, frameDelta) => {
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
            plumasLakeHole1.green.center.x,
            plumasLakeHole1.green.center.z
          )
        ) {
          finishShot(current, true)
          return
        }
      } else {
        const surface = getSurfaceAtPosition(
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
        position={[
          plumasLakeHole1.tee.x,
          0.2,
          plumasLakeHole1.tee.z,
        ]}
        castShadow
      >
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.18}
        />
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
