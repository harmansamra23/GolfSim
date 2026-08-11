export type SurfaceType =
  | 'TEE'
  | 'FAIRWAY'
  | 'FIRST_CUT'
  | 'ROUGH'
  | 'GREEN'
  | 'BUNKER'
  | 'PATH'

export type GolfPoint = {
  x: number
  z: number
}

export type EllipseZone = {
  center: GolfPoint
  radiusX: number
  radiusZ: number
}

export type FairwayDefinition = {
  startZ: number
  endZ: number
  baseHalfWidth: number
  middleWidthBoost: number
  endTaper: number
  curveAmplitude: number
  curveCycles: number
  endOffsetX: number
}

export type CartPathDefinition = {
  offsetX: number
  halfWidth: number
  waveAmplitude: number
  waveCycles: number
}

export type GolfHole = {
  number: number
  par: number
  yardage: number
  tee: GolfPoint
  green: EllipseZone
  bunkers: EllipseZone[]
  fairway: FairwayDefinition
  cartPath?: CartPathDefinition
}

export type GolfCourse = {
  id: string
  name: string
  location?: string
  holes: GolfHole[]
  prototype?: boolean
}
