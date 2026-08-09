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

export type GolfHole = {
  number: number
  par: number
  yardage: number

  tee: GolfPoint
  green: EllipseZone

  bunkers: EllipseZone[]
}