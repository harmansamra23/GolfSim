import type { GeoCoordinate } from './realCourseTypes'

export type GeoPath = GeoCoordinate[]

export type GeoEllipse = {
  center: GeoCoordinate
  radiusXMetres: number
  radiusZMetres: number
}

export type TracedHazard = GeoEllipse & {
  id: string
  label: string
  type: 'WATER' | 'OUT_OF_BOUNDS'
}

export type TracedHole = {
  number: number
  par: number
  yardage: number
  tee: GeoCoordinate
  green: GeoEllipse
  fairwayCenterline: GeoPath
  fairwayHalfWidthsMetres: number[]
  bunkers: GeoEllipse[]
  hazards?: TracedHazard[]
  greenSlope?: {
    xPercent: number
    zPercent: number
  }
}

export type TracedCourse = {
  id: string
  name: string
  location: string
  origin: GeoCoordinate
  holes: TracedHole[]
}
