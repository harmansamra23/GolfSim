export type SurfaceType =
  | 'TEE'
  | 'FAIRWAY'
  | 'ROUGH'
  | 'GREEN'
  | 'BUNKER'

export type CourseZone = {
  surface: SurfaceType
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}