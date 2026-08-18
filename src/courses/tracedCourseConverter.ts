import type {
  FairwayControlPoint,
  GolfCourse,
  GolfHole,
} from './courseTypes'
import { projectToLocalMeters } from './geoProjection'
import type {
  GeoEllipse,
  TracedCourse,
  TracedHazard,
  TracedHole,
} from './courseTraceTypes'

type LocalPoint = {
  x: number
  z: number
}

type HoleBasis = {
  forwardX: number
  forwardZ: number
  rightX: number
  rightZ: number
  lengthMeters: number
}

const TEE_Z = 5

function createHoleBasis(hole: TracedHole): HoleBasis {
  const green = projectToLocalMeters(hole.tee, hole.green.center)
  const lengthMeters = Math.hypot(green.x, green.z)

  if (lengthMeters < 1) {
    throw new Error(`Hole ${hole.number} tee and green are too close together`)
  }

  const forwardX = green.x / lengthMeters
  const forwardZ = green.z / lengthMeters

  return {
    forwardX,
    forwardZ,
    rightX: -forwardZ,
    rightZ: forwardX,
    lengthMeters,
  }
}

function toHoleLocal(
  hole: TracedHole,
  basis: HoleBasis,
  latitude: number,
  longitude: number
): LocalPoint {
  const projected = projectToLocalMeters(hole.tee, {
    latitude,
    longitude,
  })

  const along =
    projected.x * basis.forwardX +
    projected.z * basis.forwardZ
  const across =
    projected.x * basis.rightX +
    projected.z * basis.rightZ

  return {
    x: across,
    z: TEE_Z - along,
  }
}

function convertEllipse(
  hole: TracedHole,
  basis: HoleBasis,
  ellipse: GeoEllipse
) {
  const center = toHoleLocal(
    hole,
    basis,
    ellipse.center.latitude,
    ellipse.center.longitude
  )

  return {
    center,
    radiusX: ellipse.radiusXMetres,
    radiusZ: ellipse.radiusZMetres,
  }
}

function convertHazard(
  hole: TracedHole,
  basis: HoleBasis,
  hazard: TracedHazard
) {
  return {
    ...convertEllipse(hole, basis, hazard),
    id: hazard.id,
    label: hazard.label,
    type: hazard.type,
  }
}

function createFairwayProfile(
  hole: TracedHole,
  basis: HoleBasis
): FairwayControlPoint[] {
  if (hole.fairwayCenterline.length < 2) {
    throw new Error(`Hole ${hole.number} needs at least two fairway trace points`)
  }

  if (
    hole.fairwayHalfWidthsMetres.length !==
    hole.fairwayCenterline.length
  ) {
    throw new Error(
      `Hole ${hole.number} fairway widths must match centerline points`
    )
  }

  return hole.fairwayCenterline.map((point, index) => {
    const local = toHoleLocal(
      hole,
      basis,
      point.latitude,
      point.longitude
    )
    const along = Math.max(0, TEE_Z - local.z)
    const t = Math.min(1, along / basis.lengthMeters)

    return {
      t,
      centerOffsetX: local.x,
      halfWidth: hole.fairwayHalfWidthsMetres[index],
    }
  })
}

export function convertTracedHole(hole: TracedHole): GolfHole {
  const basis = createHoleBasis(hole)
  const profile = createFairwayProfile(hole, basis)

  return {
    number: hole.number,
    par: hole.par,
    yardage: hole.yardage,
    tee: {
      x: 0,
      z: TEE_Z,
    },
    green: {
      center: {
        x: 0,
        z: TEE_Z - basis.lengthMeters,
      },
      radiusX: hole.green.radiusXMetres,
      radiusZ: hole.green.radiusZMetres,
    },
    bunkers: hole.bunkers.map((bunker) =>
      convertEllipse(hole, basis, bunker)
    ),
    fairway: {
      startZ: 3,
      endZ: TEE_Z - Math.max(18, basis.lengthMeters - 18),
      baseHalfWidth: profile[0]?.halfWidth ?? 10,
      middleWidthBoost: 0,
      endTaper: 0,
      curveAmplitude: 0,
      curveCycles: 1,
      endOffsetX: profile[profile.length - 1]?.centerOffsetX ?? 0,
      profile,
    },
    hazards: hole.hazards?.map((hazard) =>
      convertHazard(hole, basis, hazard)
    ),
    greenSlope: hole.greenSlope,
  }
}

export function convertTracedCourse(trace: TracedCourse): GolfCourse {
  return {
    id: trace.id,
    name: trace.name,
    location: trace.location,
    holes: trace.holes.map(convertTracedHole),
    prototype: false,
  }
}
