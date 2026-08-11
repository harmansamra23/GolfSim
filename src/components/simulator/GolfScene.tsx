import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

import { CourseHole } from '../../course/CourseHole'
import type { ShotData, ShotResult } from '../../types/shot'
import {
  getSurfaceAtPosition,
  getSurfacePhysics,
} from '../../physics/surfacePhysics'
import {
  fairwayCenterX,
  plumasLakeHole1,
} from '../../courses/plumasLakeHole1'

type GolfSceneProps = {
  shot: ShotData | null
  onShotResult: (result: ShotResult) => void
}

type BallPhase =
  | 'ADDRESS'
  | 'FLIGHT'
  | 'LANDING'
  | 'ROLLING'
  | 'STOPPED'

type BallState = {
  position: THREE.Vector3
  velocity: THREE.Vector3
  phase: BallPhase
}

type BallStateReader = () => BallState

type BallStateWriter = (
  phase: BallPhase,
  position: THREE.Vector3,
  velocity: THREE.Vector3
) => void

const tracerCoreMaterial = new THREE.MeshBasicMaterial({
  color: '#ffffff',
})

const tracerGlowMaterial = new THREE.MeshBasicMaterial({
  color: '#9fdcff',
  transparent: true,
  opacity: 0.24,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
})

function GolfScene({ shot, onShotResult }: GolfSceneProps) {
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
        toneMappingExposure: 1.05,
      }}
    >
      <color attach="background" args={['#9bcbe6']} />
      <fog attach="fog" args={['#9bcbe6', 260, 900]} />

      <Sky
        distance={450000}
        sunPosition={[80, 30, 45]}
        turbidity={7}
        rayleigh={1.7}
      />

      <hemisphereLight
        intensity={1.2}
        color="#e8f5ff"
        groundColor="#294c2c"
      />

      <directionalLight
        position={[50, 70, 35]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-camera-near={1}
        shadow-camera-far={260}
        shadow-bias={-0.00025}
      />

      <CourseHole />

      <AnimatedGolfBall
        shot={shot}
        setBallState={setBallState}
        onShotResult={onShotResult}
      />

      <CameraRig getBallState={getBallState} />
    </Canvas>
  )
}

function CameraRig({
  getBallState,
}: {
  getBallState: BallStateReader
}) {
  const { camera } = useThree()
  const desiredPosition = useRef(new THREE.Vector3())
  const desiredTarget = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    const state = getBallState()
    const ball = state.position

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
    }

    if (state.phase === 'FLIGHT') {
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
    }

    if (state.phase === 'LANDING') {
      desiredPosition.current.set(
        ball.x + 7,
        ball.y + 5,
        ball.z + 13
      )
      desiredTarget.current.copy(ball)
    }

    if (state.phase === 'ROLLING') {
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
    }

    if (state.phase === 'STOPPED') {
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
  })

  return null
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

  const startPosition = useRef(
    new THREE.Vector3(
      plumasLakeHole1.tee.x,
      0.2,
      plumasLakeHole1.tee.z
    )
  )

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

    position.current.set(
      plumasLakeHole1.tee.x,
      0.2,
      plumasLakeHole1.tee.z
    )
    startPosition.current.copy(position.current)

    if (ballRef.current) {
      ballRef.current.position.copy(position.current)
    }

    clearTracer()
    tracerPoints.current = [position.current.clone()]
    bounceCount.current = 0
    rolling.current = false
    carryReported.current = false
    carryYards.current = 0

    const speed = newShot.ballSpeed * 0.44704
    const launchAngle = THREE.MathUtils.degToRad(
      newShot.launchAngle
    )
    const direction = THREE.MathUtils.degToRad(
      newShot.launchDirection
    )
    const horizontal = speed * Math.cos(launchAngle)

    velocity.current.set(
      horizontal * Math.sin(direction),
      speed * Math.sin(launchAngle),
      -horizontal * Math.cos(direction)
    )

    active.current = true
    phase.current = 'FLIGHT'

    setBallState(
      phase.current,
      position.current,
      velocity.current
    )
  }

  useFrame((_, delta) => {
    if (shot && shot.id !== lastShotId.current) {
      lastShotId.current = shot.id
      startShot(shot)
    }

    if (!active.current) return

    const current = currentShot.current
    if (!current) return

    const dt = Math.min(delta, 0.02)

    if (!rolling.current) {
      velocity.current.y -= 9.81 * dt

      const drag = 0.994
      velocity.current.multiplyScalar(
        Math.pow(drag, dt * 60)
      )

      const speed = velocity.current.length()

      velocity.current.x +=
        current.spinAxis * 0.0007 * speed * dt

      velocity.current.y +=
        current.spinRate * 0.000013 * speed * dt

      position.current.addScaledVector(
        velocity.current,
        dt
      )

      if (
        velocity.current.y < 0 &&
        position.current.y < 8
      ) {
        phase.current = 'LANDING'
      }

      if (
        position.current.y <= 0.2 &&
        velocity.current.y < 0
      ) {
        position.current.y = 0.2

        const surface = getSurfaceAtPosition(
          position.current.x,
          position.current.z
        )
        const physics = getSurfacePhysics(surface)

        if (!carryReported.current) {
          const dx =
            position.current.x - startPosition.current.x
          const dz =
            position.current.z - startPosition.current.z
          const carryMeters = Math.sqrt(
            dx * dx + dz * dz
          )

          carryYards.current = carryMeters * 1.09361
          carryReported.current = true

          onShotResult({
            id: current.id,
            carry: carryYards.current,
            lie: surface,
          })
        }

        bounceCount.current += 1

        const impactSpeed = Math.abs(velocity.current.y)
        const bounceMultiplier =
          bounceCount.current === 1
            ? physics.bounce
            : physics.bounce * 0.52

        velocity.current.y = impactSpeed * bounceMultiplier
        velocity.current.x *= physics.horizontalRetention
        velocity.current.z *= physics.horizontalRetention

        if (
          surface === 'BUNKER' ||
          bounceCount.current >= 3 ||
          velocity.current.y < 0.9
        ) {
          velocity.current.y = 0
          rolling.current = true
          phase.current = 'ROLLING'
        }
      }
    } else {
      position.current.y = 0.2
      position.current.x += velocity.current.x * dt
      position.current.z += velocity.current.z * dt

      const surface = getSurfaceAtPosition(
        position.current.x,
        position.current.z
      )
      const physics = getSurfacePhysics(surface)
      const friction = Math.pow(
        physics.rollingFriction,
        dt * 60
      )

      velocity.current.x *= friction
      velocity.current.z *= friction

      const groundSpeed = Math.sqrt(
        velocity.current.x * velocity.current.x +
          velocity.current.z * velocity.current.z
      )

      if (groundSpeed < 0.4) {
        velocity.current.set(0, 0, 0)
        active.current = false
        phase.current = 'STOPPED'

        const dx =
          position.current.x - startPosition.current.x
        const dz =
          position.current.z - startPosition.current.z
        const totalMeters = Math.sqrt(dx * dx + dz * dz)

        const finalSurface = getSurfaceAtPosition(
          position.current.x,
          position.current.z
        )

        onShotResult({
          id: current.id,
          carry: carryYards.current,
          totalDistance: totalMeters * 1.09361,
          lie: finalSurface,
        })
      }
    }

    if (ballRef.current) {
      ballRef.current.position.copy(position.current)
      ballRef.current.rotation.x +=
        velocity.current.z * dt * 0.08
      ballRef.current.rotation.z -=
        velocity.current.x * dt * 0.08
    }

    setBallState(
      phase.current,
      position.current,
      velocity.current
    )

    if (!rolling.current) {
      const previous =
        tracerPoints.current[tracerPoints.current.length - 1]

      if (
        !previous ||
        previous.distanceTo(position.current) > 0.9
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
  const direction = new THREE.Vector3().subVectors(
    end,
    start
  )
  const length = direction.length()
  const midpoint = new THREE.Vector3()
    .addVectors(start, end)
    .multiplyScalar(0.5)

  const group = new THREE.Group()

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.055,
      0.055,
      length,
      7
    ),
    tracerCoreMaterial
  )

  const glow = new THREE.Mesh(
    new THREE.CylinderGeometry(
      0.12,
      0.12,
      length,
      7
    ),
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
