import type { GolfHole, GolfPoint } from '../courses/courseTypes'
import { fairwayCenterX, fairwayHalfWidth } from '../courses/holeGeometryMath'

type HoleMiniMapProps = {
  hole: GolfHole
  ball: GolfPoint
  target: GolfPoint
}

type MapTransform = {
  x: (value: number) => number
  y: (value: number) => number
}

function buildTransform(hole: GolfHole): MapTransform {
  const samples = Array.from({ length: 31 }, (_, index) => {
    const t = index / 30
    const z = hole.fairway.startZ + (hole.fairway.endZ - hole.fairway.startZ) * t
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)
    return { z, minX: center - width, maxX: center + width }
  })

  const hazardXs = (hole.hazards ?? []).flatMap((hazard) => [
    hazard.center.x - hazard.radiusX,
    hazard.center.x + hazard.radiusX,
  ])

  const bunkerXs = hole.bunkers.flatMap((bunker) => [
    bunker.center.x - bunker.radiusX,
    bunker.center.x + bunker.radiusX,
  ])

  const xs = [
    hole.tee.x,
    hole.green.center.x - hole.green.radiusX,
    hole.green.center.x + hole.green.radiusX,
    ...samples.flatMap((sample) => [sample.minX, sample.maxX]),
    ...hazardXs,
    ...bunkerXs,
  ]

  const minX = Math.min(...xs) - 18
  const maxX = Math.max(...xs) + 18
  const topZ = Math.max(hole.tee.z + 12, 16)
  const bottomZ = Math.min(hole.green.center.z - hole.green.radiusZ - 12, hole.fairway.endZ - 12)

  const width = Math.max(1, maxX - minX)
  const depth = Math.max(1, topZ - bottomZ)

  return {
    x: (value) => 12 + ((value - minX) / width) * 176,
    y: (value) => 12 + ((topZ - value) / depth) * 296,
  }
}

function ellipseProps(
  transform: MapTransform,
  center: GolfPoint,
  radiusX: number,
  radiusZ: number
) {
  const centerX = transform.x(center.x)
  const centerY = transform.y(center.z)
  const radiusMapX = Math.abs(transform.x(center.x + radiusX) - centerX)
  const radiusMapY = Math.abs(transform.y(center.z + radiusZ) - centerY)

  return {
    cx: centerX,
    cy: centerY,
    rx: radiusMapX,
    ry: radiusMapY,
  }
}

export function HoleMiniMap({
  hole,
  ball,
  target,
}: HoleMiniMapProps) {
  const transform = buildTransform(hole)
  const left: string[] = []
  const right: string[] = []

  for (let index = 0; index <= 30; index++) {
    const t = index / 30
    const z = hole.fairway.startZ + (hole.fairway.endZ - hole.fairway.startZ) * t
    const center = fairwayCenterX(hole, z)
    const width = fairwayHalfWidth(hole, z)

    left.push(`${transform.x(center - width)},${transform.y(z)}`)
    right.unshift(`${transform.x(center + width)},${transform.y(z)}`)
  }

  const fairwayPoints = [...left, ...right].join(' ')
  const teeX = transform.x(hole.tee.x)
  const teeY = transform.y(hole.tee.z)
  const green = ellipseProps(
    transform,
    hole.green.center,
    hole.green.radiusX,
    hole.green.radiusZ
  )
  const ballX = transform.x(ball.x)
  const ballY = transform.y(ball.z)
  const targetX = transform.x(target.x)
  const targetY = transform.y(target.z)

  return (
    <div className="hole-minimap" aria-label="Hole map">
      <svg viewBox="0 0 200 320" role="img">
        <rect x="0" y="0" width="200" height="320" rx="18" className="minimap-rough" />
        <polygon points={fairwayPoints} className="minimap-fairway" />

        {(hole.hazards ?? []).map((hazard) => {
          const props = ellipseProps(
            transform,
            hazard.center,
            hazard.radiusX,
            hazard.radiusZ
          )

          return (
            <ellipse
              key={hazard.id}
              {...props}
              className={hazard.type === 'WATER' ? 'minimap-water' : 'minimap-oob'}
            />
          )
        })}

        {hole.bunkers.map((bunker, index) => (
          <ellipse
            key={`bunker-${index}`}
            {...ellipseProps(
              transform,
              bunker.center,
              bunker.radiusX,
              bunker.radiusZ
            )}
            className="minimap-bunker"
          />
        ))}

        <ellipse {...green} className="minimap-green" />
        <line
          x1={ballX}
          y1={ballY}
          x2={targetX}
          y2={targetY}
          className="minimap-aim-line"
        />
        <circle cx={teeX} cy={teeY} r="3.2" className="minimap-tee" />
        <circle cx={targetX} cy={targetY} r="4" className="minimap-target" />
        <circle cx={green.cx} cy={green.cy} r="2.8" className="minimap-pin" />
        <circle cx={ballX} cy={ballY} r="4.3" className="minimap-ball" />
      </svg>
    </div>
  )
}
