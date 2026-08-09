import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

type ShotData = {
  id: number
  ballSpeed: number
  clubSpeed: number
  launchAngle: number
  launchDirection: number
  spinRate: number
  spinAxis: number
  carry: number
}

type GolfSceneProps = {
  shot: ShotData | null
}

function GolfScene({ shot }: GolfSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: [0, 2.4, 13],
        fov: 58,
        near: 0.1,
        far: 700,
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
    >
      <color attach="background" args={['#9dcfee']} />
      <fog attach="fog" args={['#9dcfee', 180, 520]} />

      <Sky
        distance={450000}
        sunPosition={[90, 35, 40]}
        turbidity={7}
        rayleigh={1.8}
      />

      <hemisphereLight
        intensity={1.35}
        color="#e5f4ff"
        groundColor="#355234"
      />

      <directionalLight
        position={[45, 65, 30]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <GolfCourse />

      <AnimatedGolfBall shot={shot} />

      <OrbitControls
        target={[0, 1.25, -105]}
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={120}
        maxPolarAngle={Math.PI / 2.03}
      />
    </Canvas>
  )
}

function AnimatedGolfBall({
  shot,
}: {
  shot: ShotData | null
}) {
  const ballRef = useRef<THREE.Mesh>(null)
  const tracerGroupRef = useRef<THREE.Group>(null)

  const position = useRef(
    new THREE.Vector3(0, 0.24, 5)
  )

  const velocity = useRef(
    new THREE.Vector3()
  )

  const active = useRef(false)
  const rolling = useRef(false)
  const bounceCount = useRef(0)

  const tracerPoints = useRef<THREE.Vector3[]>([
    new THREE.Vector3(0, 0.24, 5),
  ])

  useEffect(() => {
    if (!shot) return

    position.current.set(0, 0.24, 5)

    if (ballRef.current) {
      ballRef.current.position.copy(
        position.current
      )
    }

    tracerPoints.current = [
      new THREE.Vector3(0, 0.24, 5),
    ]

    if (tracerGroupRef.current) {
      tracerGroupRef.current.clear()
    }

    bounceCount.current = 0
    rolling.current = false

    const speed =
      shot.ballSpeed * 0.44704

    const launchAngle =
      THREE.MathUtils.degToRad(
        shot.launchAngle
      )

    const launchDirection =
      THREE.MathUtils.degToRad(
        shot.launchDirection
      )

    const horizontalSpeed =
      speed * Math.cos(launchAngle)

    velocity.current.set(
      horizontalSpeed *
        Math.sin(launchDirection),

      speed *
        Math.sin(launchAngle),

      -horizontalSpeed *
        Math.cos(launchDirection)
    )

    active.current = true
  }, [shot])

  useFrame((_, delta) => {
    if (!active.current) return

    const dt =
      Math.min(delta, 0.02)

    if (!rolling.current) {
      // GRAVITY
      velocity.current.y -=
        9.81 * dt

      // DRAG
      const drag = 0.994

      velocity.current.multiplyScalar(
        Math.pow(drag, dt * 60)
      )

      if (shot) {
        // CURVE
        const curveStrength =
          shot.spinAxis * 0.0007

        velocity.current.x +=
          curveStrength *
          velocity.current.length() *
          dt

        // BACKSPIN LIFT
        const liftStrength =
          shot.spinRate * 0.000013

        velocity.current.y +=
          liftStrength *
          velocity.current.length() *
          dt
      }

      position.current.addScaledVector(
        velocity.current,
        dt
      )

      // LANDING
      if (
        position.current.y <= 0.2 &&
        velocity.current.y < 0
      ) {
        position.current.y = 0.2

        bounceCount.current += 1

        const verticalImpact =
          Math.abs(
            velocity.current.y
          )

        // First bounce is strongest
        const restitution =
          bounceCount.current === 1
            ? 0.32
            : 0.18

        velocity.current.y =
          verticalImpact *
          restitution

        // Ground removes speed
        velocity.current.x *= 0.78
        velocity.current.z *= 0.78

        // Stop bouncing and start rolling
        if (
          bounceCount.current >= 3 ||
          velocity.current.y < 1.2
        ) {
          velocity.current.y = 0
          rolling.current = true
        }
      }
    } else {
      // ROLLING

      position.current.y = 0.2

      position.current.x +=
        velocity.current.x * dt

      position.current.z +=
        velocity.current.z * dt

      // Fairway rolling resistance
      const rollingFriction =
        Math.pow(
          0.975,
          dt * 60
        )

      velocity.current.x *=
        rollingFriction

      velocity.current.z *=
        rollingFriction

      const horizontalSpeed =
        Math.sqrt(
          velocity.current.x *
            velocity.current.x +
            velocity.current.z *
              velocity.current.z
        )

      if (horizontalSpeed < 0.35) {
        velocity.current.set(
          0,
          0,
          0
        )

        active.current = false
      }
    }

    if (ballRef.current) {
      ballRef.current.position.copy(
        position.current
      )

      ballRef.current.rotation.x +=
        velocity.current.z *
        dt *
        0.09

      ballRef.current.rotation.z -=
        velocity.current.x *
        dt *
        0.09
    }

    // TRACER ONLY WHILE BALL IS IN AIR
    if (!rolling.current) {
      const previousPoint =
        tracerPoints.current[
          tracerPoints.current.length -
            1
        ]

      if (
        !previousPoint ||
        previousPoint.distanceTo(
          position.current
        ) > 1.1
      ) {
        const newPoint =
          position.current.clone()

        tracerPoints.current.push(
          newPoint
        )

        if (
          tracerGroupRef.current &&
          previousPoint
        ) {
          const segment =
            createTracerSegment(
              previousPoint,
              newPoint
            )

          tracerGroupRef.current.add(
            segment
          )
        }
      }
    }
  })

  return (
    <>
      {/* BALL */}
      <mesh
        ref={ballRef}
        position={[0, 0.24, 5]}
        castShadow
      >
        <sphereGeometry
          args={[0.14, 32, 32]}
        />

        <meshStandardMaterial
          color="#ffffff"
          roughness={0.2}
        />
      </mesh>

      {/* TRACER */}
      <group ref={tracerGroupRef} />
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
      .addVectors(start, end)
      .multiplyScalar(0.5)

  const geometry =
    new THREE.CylinderGeometry(
      0.10,
      0.10,
      length,
      8
    )

  const material =
    new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.9,
    })

  const segment =
    new THREE.Mesh(
      geometry,
      material
    )

  segment.position.copy(
    midpoint
  )

  segment.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction
      .clone()
      .normalize()
  )

  return segment
}

function GolfCourse() {
  const fairwayShape =
    new THREE.Shape()

  fairwayShape.moveTo(-9, 4)

  fairwayShape.bezierCurveTo(
    -11,
    -25,
    -19,
    -55,
    -18,
    -88
  )

  fairwayShape.bezierCurveTo(
    -17,
    -125,
    -10,
    -155,
    -12,
    -185
  )

  fairwayShape.bezierCurveTo(
    -14,
    -205,
    -11,
    -222,
    -8,
    -235
  )

  fairwayShape.lineTo(8, -235)

  fairwayShape.bezierCurveTo(
    11,
    -222,
    14,
    -205,
    12,
    -185
  )

  fairwayShape.bezierCurveTo(
    10,
    -155,
    17,
    -125,
    18,
    -88
  )

  fairwayShape.bezierCurveTo(
    19,
    -55,
    11,
    -25,
    9,
    4
  )

  fairwayShape.closePath()

  return (
    <>
      <Terrain />
      <TeeBox />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.11, 0]}
        receiveShadow
      >
        <shapeGeometry
          args={[fairwayShape]}
        />

        <meshStandardMaterial
          color="#568f45"
          roughness={0.94}
        />
      </mesh>

      <Green />

      <Bunker
        position={[-13, 0.17, -224]}
        scale={[1.4, 0.65, 1]}
      />

      <Bunker
        position={[13, 0.17, -228]}
        scale={[1.25, 0.58, 1]}
      />

      <Flag />

      <TreeLine />
    </>
  )
}

function Terrain() {
  const geometry =
    new THREE.PlaneGeometry(
      220,
      500,
      70,
      150
    )

  const positions =
    geometry.attributes.position

  for (
    let i = 0;
    i < positions.count;
    i++
  ) {
    const x =
      positions.getX(i)

    const y =
      positions.getY(i)

    const forwardRoll =
      Math.sin(y * 0.013) * 0.7

    const crossSlope =
      Math.sin(x * 0.035) * 0.4

    const outsideLift =
      Math.pow(
        Math.abs(x) / 110,
        2
      ) * 1.2

    positions.setZ(
      i,
      forwardRoll +
        crossSlope +
        outsideLift
    )
  }

  geometry.computeVertexNormals()

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.08, -125]}
      receiveShadow
    >
      <meshStandardMaterial
        color="#315d34"
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
        position={[0, 0.13, 5]}
        receiveShadow
      >
        <planeGeometry args={[10, 8]} />

        <meshStandardMaterial
          color="#74a95a"
        />
      </mesh>

      <TeeMarker
        position={[-1.45, 0.22, 5]}
      />

      <TeeMarker
        position={[1.45, 0.22, 5]}
      />
    </>
  )
}

function TeeMarker({
  position,
}: {
  position: [number, number, number]
}) {
  return (
    <mesh
      position={position}
      castShadow
    >
      <sphereGeometry
        args={[0.22, 24, 24]}
      />

      <meshStandardMaterial
        color="#255bc7"
      />
    </mesh>
  )
}

function Green() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.13, -238]}
        scale={[1.15, 0.9, 1]}
        receiveShadow
      >
        <circleGeometry
          args={[20, 64]}
        />

        <meshStandardMaterial
          color="#467a3e"
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.15, -238]}
        scale={[1.08, 0.82, 1]}
        receiveShadow
      >
        <circleGeometry
          args={[16.5, 64]}
        />

        <meshStandardMaterial
          color="#80b65e"
        />
      </mesh>
    </>
  )
}

function Flag() {
  return (
    <>
      <mesh
        position={[0, 2.3, -238]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.03,
            0.03,
            4.3,
            12,
          ]}
        />

        <meshStandardMaterial
          color="#f4f4f4"
        />
      </mesh>

      <mesh
        position={[0.7, 3.7, -238]}
        castShadow
      >
        <planeGeometry
          args={[1.4, 0.7]}
        />

        <meshStandardMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}

function Bunker({
  position,
  scale,
}: {
  position: [number, number, number]

  scale: [number, number, number]
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      scale={scale}
      receiveShadow
    >
      <circleGeometry
        args={[5, 48]}
      />

      <meshStandardMaterial
        color="#d9c59b"
      />
    </mesh>
  )
}

function TreeLine() {
  const left = [
    [-22, 0, -25, 1.05],
    [-25, 0, -47, 1.2],
    [-28, 0, -70, 1.05],
    [-29, 0, -94, 1.25],
    [-28, 0, -119, 1.05],
    [-27, 0, -145, 1.2],
  ] as const

  const right = [
    [22, 0, -27, 1.1],
    [25, 0, -49, 1],
    [28, 0, -73, 1.2],
    [29, 0, -97, 1.1],
    [28, 0, -122, 1.25],
    [27, 0, -148, 1],
  ] as const

  return (
    <>
      {left.map(
        ([x, y, z, scale], index) => (
          <Tree
            key={`left-${index}`}
            position={[x, y, z]}
            scale={scale}
          />
        )
      )}

      {right.map(
        ([x, y, z, scale], index) => (
          <Tree
            key={`right-${index}`}
            position={[x, y, z]}
            scale={scale}
          />
        )
      )}
    </>
  )
}

function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number]

  scale?: number
}) {
  return (
    <group
      position={position}
      scale={scale}
    >
      <mesh
        position={[0, 2.5, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[
            0.3,
            0.43,
            5,
            10,
          ]}
        />

        <meshStandardMaterial
          color="#5b402c"
        />
      </mesh>

      <mesh
        position={[0, 6.2, 0]}
        scale={[1.3, 0.85, 1.2]}
        castShadow
      >
        <sphereGeometry
          args={[2.4, 18, 18]}
        />

        <meshStandardMaterial
          color="#2b6532"
        />
      </mesh>
    </group>
  )
}

export default GolfScene