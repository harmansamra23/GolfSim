import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sky } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

import type { ShotData, ShotResult } from '../../types/shot'

import {
  getSurfaceAtPosition,
  getSurfacePhysics,
} from '../../physics/surfacePhysics'

import {
  FAIRWAY_END_Z,
  FAIRWAY_START_Z,
  cartPathCenterX,
  fairwayCenterX,
  fairwayHalfWidth,
  plumasLakeHole1,
} from '../../courses/plumasLakeHole1'

import { courseMaterials } from './CourseMaterials'

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

function GolfScene({
  shot,
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

  const getBallState: BallStateReader = () => {
    return ballState.current
  }

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

      <fog
        attach="fog"
        args={['#9bcbe6', 260, 900]}
      />

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

      <GolfCourse />

      <AnimatedGolfBall
        shot={shot}
        setBallState={setBallState}
        onShotResult={onShotResult}
      />

      <CameraRig getBallState={getBallState} />
    </Canvas>
  )
}

/* =========================================================
   CAMERA
   ========================================================= */

function CameraRig({
  getBallState,
}: {
  getBallState: BallStateReader
}) {
  const { camera } = useThree()

  const desiredPosition = useRef(
    new THREE.Vector3()
  )

  const desiredTarget = useRef(
    new THREE.Vector3()
  )

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

    const smoothing =
      1 - Math.exp(-4 * delta)

    camera.position.lerp(
      desiredPosition.current,
      smoothing
    )

    camera.lookAt(
      desiredTarget.current
    )
  })

  return null
}

/* =========================================================
   BALL + PHYSICS + TRACER
   ========================================================= */

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

  const velocity = useRef(
    new THREE.Vector3()
  )

  const currentShot =
    useRef<ShotData | null>(null)

  const lastShotId =
    useRef<number | null>(null)

  const active = useRef(false)

  const rolling = useRef(false)

  const bounceCount = useRef(0)

  const phase = useRef<BallPhase>('ADDRESS')

  const carryReported = useRef(false)

  const carryYards = useRef(0)

  const tracerPoints =
    useRef<THREE.Vector3[]>([])

  function clearTracer() {
    if (!tracerRef.current) return

    tracerRef.current.traverse(
      (object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
        }
      }
    )

    tracerRef.current.clear()
  }

  function startShot(
    newShot: ShotData
  ) {
    currentShot.current = newShot

    position.current.set(
      plumasLakeHole1.tee.x,
      0.2,
      plumasLakeHole1.tee.z
    )

    startPosition.current.copy(
      position.current
    )

    if (ballRef.current) {
      ballRef.current.position.copy(
        position.current
      )
    }

    clearTracer()

    tracerPoints.current = [
      position.current.clone(),
    ]

    bounceCount.current = 0
    rolling.current = false
    carryReported.current = false
    carryYards.current = 0

    const speed =
      newShot.ballSpeed * 0.44704

    const launchAngle =
      THREE.MathUtils.degToRad(
        newShot.launchAngle
      )

    const direction =
      THREE.MathUtils.degToRad(
        newShot.launchDirection
      )

    const horizontal =
      speed * Math.cos(launchAngle)

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
    if (
      shot &&
      shot.id !== lastShotId.current
    ) {
      lastShotId.current = shot.id
      startShot(shot)
    }

    if (!active.current) {
      return
    }

    const current =
      currentShot.current

    if (!current) {
      return
    }

    const dt =
      Math.min(delta, 0.02)

    /* -------------------------
       AIRBORNE
       ------------------------- */

    if (!rolling.current) {
      velocity.current.y -=
        9.81 * dt

      const drag = 0.994

      velocity.current.multiplyScalar(
        Math.pow(
          drag,
          dt * 60
        )
      )

      const speed =
        velocity.current.length()

      /* SIDE CURVE */

      velocity.current.x +=
        current.spinAxis *
        0.0007 *
        speed *
        dt

      /* BACKSPIN LIFT */

      velocity.current.y +=
        current.spinRate *
        0.000013 *
        speed *
        dt

      position.current.addScaledVector(
        velocity.current,
        dt
      )

      /* Landing camera */

      if (
        velocity.current.y < 0 &&
        position.current.y < 8
      ) {
        phase.current = 'LANDING'
      }

      /* IMPACT */

      if (
        position.current.y <= 0.2 &&
        velocity.current.y < 0
      ) {
        position.current.y = 0.2

        const surface =
          getSurfaceAtPosition(
            position.current.x,
            position.current.z
          )

        const physics =
          getSurfacePhysics(surface)

        /* Calculate actual carry */

        if (!carryReported.current) {
          const dx =
            position.current.x -
            startPosition.current.x

          const dz =
            position.current.z -
            startPosition.current.z

          const carryMeters =
            Math.sqrt(
              dx * dx +
              dz * dz
            )

          carryYards.current =
            carryMeters * 1.09361

          carryReported.current = true

          onShotResult({
            id: current.id,
            carry: carryYards.current,
            lie: surface,
          })
        }

        bounceCount.current += 1

        const impactSpeed =
          Math.abs(
            velocity.current.y
          )

        const bounceMultiplier =
          bounceCount.current === 1
            ? physics.bounce
            : physics.bounce * 0.52

        velocity.current.y =
          impactSpeed *
          bounceMultiplier

        velocity.current.x *=
          physics.horizontalRetention

        velocity.current.z *=
          physics.horizontalRetention

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
    }

    /* -------------------------
       ROLLING
       ------------------------- */

    else {
      position.current.y = 0.2

      position.current.x +=
        velocity.current.x * dt

      position.current.z +=
        velocity.current.z * dt

      const surface =
        getSurfaceAtPosition(
          position.current.x,
          position.current.z
        )

      const physics =
        getSurfacePhysics(surface)

      const friction =
        Math.pow(
          physics.rollingFriction,
          dt * 60
        )

      velocity.current.x *= friction
      velocity.current.z *= friction

      const groundSpeed =
        Math.sqrt(
          velocity.current.x *
            velocity.current.x +
          velocity.current.z *
            velocity.current.z
        )

      if (groundSpeed < 0.4) {
        velocity.current.set(
          0,
          0,
          0
        )

        active.current = false

        phase.current = 'STOPPED'

        const dx =
          position.current.x -
          startPosition.current.x

        const dz =
          position.current.z -
          startPosition.current.z

        const totalMeters =
          Math.sqrt(
            dx * dx +
            dz * dz
          )

        const finalSurface =
          getSurfaceAtPosition(
            position.current.x,
            position.current.z
          )

        onShotResult({
          id: current.id,
          carry: carryYards.current,
          totalDistance:
            totalMeters * 1.09361,
          lie: finalSurface,
        })
      }
    }

    /* Update ball mesh */

    if (ballRef.current) {
      ballRef.current.position.copy(
        position.current
      )

      ballRef.current.rotation.x +=
        velocity.current.z *
        dt *
        0.08

      ballRef.current.rotation.z -=
        velocity.current.x *
        dt *
        0.08
    }

    /* Update camera state */

    setBallState(
      phase.current,
      position.current,
      velocity.current
    )

    /* -------------------------
       TRACER
       ------------------------- */

    if (!rolling.current) {
      const previous =
        tracerPoints.current[
          tracerPoints.current.length - 1
        ]

      if (
        !previous ||
        previous.distanceTo(
          position.current
        ) > 0.9
      ) {
        const next =
          position.current.clone()

        tracerPoints.current.push(next)

        if (
          previous &&
          tracerRef.current
        ) {
          tracerRef.current.add(
            createTracerSegment(
              previous,
              next
            )
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
        <sphereGeometry
          args={[0.18, 32, 32]}
        />

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
  const direction =
    new THREE.Vector3().subVectors(
      end,
      start
    )

  const length =
    direction.length()

  const midpoint =
    new THREE.Vector3()
      .addVectors(
        start,
        end
      )
      .multiplyScalar(0.5)

  const group =
    new THREE.Group()

  const core =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.055,
        0.055,
        length,
        7
      ),

      tracerCoreMaterial
    )

  const glow =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.12,
        0.12,
        length,
        7
      ),

      tracerGlowMaterial
    )

  const orientation =
    direction
      .clone()
      .normalize()

  core.position.copy(midpoint)

  core.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    orientation
  )

  glow.position.copy(midpoint)

  glow.quaternion.copy(
    core.quaternion
  )

  group.add(core)
  group.add(glow)

  return group
}

/* =========================================================
   COURSE GEOMETRY
   ========================================================= */

function createCourseShape(
  extraWidth: number
) {
  const shape =
    new THREE.Shape()

  const steps = 60

  for (
    let i = 0;
    i <= steps;
    i++
  ) {
    const t =
      i / steps

    const z =
      THREE.MathUtils.lerp(
        FAIRWAY_START_Z,
        FAIRWAY_END_Z,
        t
      )

    const x =
      fairwayCenterX(z) -
      fairwayHalfWidth(z) -
      extraWidth

    if (i === 0) {
      shape.moveTo(x, z)
    } else {
      shape.lineTo(x, z)
    }
  }

  for (
    let i = steps;
    i >= 0;
    i--
  ) {
    const t =
      i / steps

    const z =
      THREE.MathUtils.lerp(
        FAIRWAY_START_Z,
        FAIRWAY_END_Z,
        t
      )

    const x =
      fairwayCenterX(z) +
      fairwayHalfWidth(z) +
      extraWidth

    shape.lineTo(x, z)
  }

  shape.closePath()

  return shape
}

function createCartPathShape() {
  const shape =
    new THREE.Shape()

  const steps = 60
  const halfWidth = 1.35

  for (
    let i = 0;
    i <= steps;
    i++
  ) {
    const t =
      i / steps

    const z =
      THREE.MathUtils.lerp(
        FAIRWAY_START_Z,
        FAIRWAY_END_Z,
        t
      )

    const x =
      cartPathCenterX(z) -
      halfWidth

    if (i === 0) {
      shape.moveTo(x, z)
    } else {
      shape.lineTo(x, z)
    }
  }

  for (
    let i = steps;
    i >= 0;
    i--
  ) {
    const t =
      i / steps

    const z =
      THREE.MathUtils.lerp(
        FAIRWAY_START_Z,
        FAIRWAY_END_Z,
        t
      )

    shape.lineTo(
      cartPathCenterX(z) +
        halfWidth,
      z
    )
  }

  shape.closePath()

  return shape
}

function GolfCourse() {
  const firstCutShape =
    useMemo(
      () =>
        createCourseShape(4),
      []
    )

  const fairwayShape =
    useMemo(
      () =>
        createCourseShape(0),
      []
    )

  const pathShape =
    useMemo(
      () =>
        createCartPathShape(),
      []
    )

  return (
    <>
      <Terrain />

      {/* FIRST CUT */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.025, 0]}
        receiveShadow
      >
        <shapeGeometry
          args={[firstCutShape]}
        />

        <meshStandardMaterial
          map={
            courseMaterials.firstCut.map
          }
          normalMap={
            courseMaterials.firstCut.normalMap
          }
          roughnessMap={
            courseMaterials.firstCut.roughnessMap
          }
          roughness={0.96}
        />
      </mesh>

      {/* FAIRWAY */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        receiveShadow
      >
        <shapeGeometry
          args={[fairwayShape]}
        />

        <meshStandardMaterial
          map={
            courseMaterials.fairway.map
          }
          normalMap={
            courseMaterials.fairway.normalMap
          }
          roughnessMap={
            courseMaterials.fairway.roughnessMap
          }
          roughness={0.88}
        />
      </mesh>

      {/* CART PATH */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.05, 0]}
        receiveShadow
      >
        <shapeGeometry
          args={[pathShape]}
        />

        <meshStandardMaterial
          map={
            courseMaterials.path.map
          }
          normalMap={
            courseMaterials.path.normalMap
          }
          roughnessMap={
            courseMaterials.path.roughnessMap
          }
          roughness={1}
        />
      </mesh>

      <TeeBox />
      <Green />

      {plumasLakeHole1.bunkers.map(
        (bunker, index) => (
          <Bunker
            key={index}
            center={[
              bunker.center.x,
              bunker.center.z,
            ]}
            radiusX={
              bunker.radiusX
            }
            radiusZ={
              bunker.radiusZ
            }
          />
        )
      )}

      <Flag />

      <TreeLine />
    </>
  )
}

function Terrain() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, -180]}
      receiveShadow
    >
      <planeGeometry
        args={[280, 820]}
      />

      <meshStandardMaterial
        map={
          courseMaterials.rough.map
        }
        normalMap={
          courseMaterials.rough.normalMap
        }
        roughnessMap={
          courseMaterials.rough.roughnessMap
        }
        roughness={1}
      />
    </mesh>
  )
}

function TeeBox() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          plumasLakeHole1.tee.x,
          0.055,
          plumasLakeHole1.tee.z,
        ]}
        receiveShadow
      >
        <planeGeometry
          args={[11, 8]}
        />

        <meshStandardMaterial
          map={
            courseMaterials.tee.map
          }
          normalMap={
            courseMaterials.tee.normalMap
          }
          roughnessMap={
            courseMaterials.tee.roughnessMap
          }
          roughness={0.82}
        />
      </mesh>

      <TeeMarker x={-1.5} />
      <TeeMarker x={1.5} />
    </>
  )
}

function TeeMarker({
  x,
}: {
  x: number
}) {
  return (
    <mesh
      position={[
        plumasLakeHole1.tee.x + x,
        0.22,
        plumasLakeHole1.tee.z,
      ]}
      castShadow
    >
      <sphereGeometry
        args={[0.23, 20, 20]}
      />

      <meshStandardMaterial
        color="#1f5fc9"
        roughness={0.4}
      />
    </mesh>
  )
}

function Green() {
  const green =
    plumasLakeHole1.green

  return (
    <>
      {/* FRINGE */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          green.center.x,
          0.055,
          green.center.z,
        ]}
        scale={[
          green.radiusX + 4,
          green.radiusZ + 4,
          1,
        ]}
        receiveShadow
      >
        <circleGeometry
          args={[1, 64]}
        />

        <meshStandardMaterial
          map={
            courseMaterials.firstCut.map
          }
          normalMap={
            courseMaterials.firstCut.normalMap
          }
          roughnessMap={
            courseMaterials.firstCut.roughnessMap
          }
          roughness={0.9}
        />
      </mesh>

      {/* PUTTING SURFACE */}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[
          green.center.x,
          0.07,
          green.center.z,
        ]}
        scale={[
          green.radiusX,
          green.radiusZ,
          1,
        ]}
        receiveShadow
      >
        <circleGeometry
          args={[1, 64]}
        />

        <meshStandardMaterial
          map={
            courseMaterials.green.map
          }
          normalMap={
            courseMaterials.green.normalMap
          }
          roughnessMap={
            courseMaterials.green.roughnessMap
          }
          roughness={0.7}
        />
      </mesh>
    </>
  )
}

function Bunker({
  center,
  radiusX,
  radiusZ,
}: {
  center: [number, number]
  radiusX: number
  radiusZ: number
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[
        center[0],
        0.08,
        center[1],
      ]}
      scale={[
        radiusX,
        radiusZ,
        1,
      ]}
      receiveShadow
    >
      <circleGeometry
        args={[1, 64]}
      />

      <meshStandardMaterial
        map={
          courseMaterials.sand.map
        }
        normalMap={
          courseMaterials.sand.normalMap
        }
        roughnessMap={
          courseMaterials.sand.roughnessMap
        }
        roughness={1}
      />
    </mesh>
  )
}

function Flag() {
  const green =
    plumasLakeHole1.green

  return (
    <>
      <mesh
        position={[
          green.center.x,
          2.25,
          green.center.z,
        ]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.025,
            0.025,
            4.3,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#f5f5f5"
        />
      </mesh>

      <mesh
        position={[
          green.center.x + 0.7,
          3.7,
          green.center.z,
        ]}
        castShadow
      >
        <planeGeometry
          args={[1.4, 0.72]}
        />

        <meshStandardMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

/* =========================================================
   TEMPORARY TREES
   ========================================================= */

const leftTrees = [
  [-24, -25, 1.1],
  [-28, -50, 1.25],
  [-31, -78, 1.0],
  [-33, -108, 1.3],
  [-34, -140, 1.1],
  [-33, -172, 1.25],
  [-31, -205, 1.05],
  [-30, -238, 1.2],
  [-29, -270, 1.15],
  [-27, -300, 1.25],
  [-26, -330, 1.05],
] as const

const rightTrees = [
  [25, -28, 1.15],
  [29, -55, 1.0],
  [32, -82, 1.3],
  [34, -112, 1.1],
  [35, -145, 1.25],
  [34, -178, 1.05],
  [33, -210, 1.2],
  [32, -243, 1.1],
  [30, -276, 1.25],
  [28, -307, 1.0],
  [27, -335, 1.15],
] as const

function TreeLine() {
  return (
    <>
      {leftTrees.map(
        (
          [x, z, scale],
          index
        ) => (
          <Tree
            key={`left-${index}`}
            position={[x, 0, z]}
            scale={scale}
          />
        )
      )}

      {rightTrees.map(
        (
          [x, z, scale],
          index
        ) => (
          <Tree
            key={`right-${index}`}
            position={[x, 0, z]}
            scale={scale}
          />
        )
      )}
    </>
  )
}

function Tree({
  position,
  scale,
}: {
  position: [
    number,
    number,
    number,
  ]

  scale: number
}) {
  return (
    <group
      position={position}
      scale={scale}
    >
      <mesh
        position={[0, 2.7, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.3,
            0.5,
            5.4,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#503a29"
          roughness={1}
        />
      </mesh>

      <mesh
        position={[0, 6.4, 0]}
        scale={[
          1.35,
          0.9,
          1.15,
        ]}
        castShadow
      >
        <dodecahedronGeometry
          args={[2.5, 1]}
        />

        <meshStandardMaterial
          color="#285e31"
          roughness={1}
          flatShading
        />
      </mesh>

      <mesh
        position={[
          1.5,
          5.8,
          0.3,
        ]}
        castShadow
      >
        <dodecahedronGeometry
          args={[1.8, 1]}
        />

        <meshStandardMaterial
          color="#34713a"
          roughness={1}
          flatShading
        />
      </mesh>

      <mesh
        position={[
          -1.5,
          5.9,
          -0.2,
        ]}
        castShadow
      >
        <dodecahedronGeometry
          args={[1.7, 1]}
        />

        <meshStandardMaterial
          color="#306936"
          roughness={1}
          flatShading
        />
      </mesh>
    </group>
  )
}

export default GolfScene