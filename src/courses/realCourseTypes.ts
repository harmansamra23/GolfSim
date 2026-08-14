export type GeoCoordinate = {
  latitude: number
  longitude: number
  elevationMeters?: number
}

export type CourseTee = {
  id: string
  name: string
  totalYards: number
  rating?: number
  slope?: number
}

export type HoleScorecardRow = {
  hole: number
  par: number
  handicap?: number
  yardages: Record<string, number>
}

export type RealCourseScorecard = {
  par: number
  tees: CourseTee[]
  holes: HoleScorecardRow[]
}

export type CourseGeometryStatus =
  | 'SCORECARD_ONLY'
  | 'MAPPED'
  | 'SURVEYED'

export type RealCourseMetadata = {
  id: string
  name: string
  location: string
  center: GeoCoordinate
  scorecard: RealCourseScorecard
  geometryStatus: CourseGeometryStatus
  notes?: string[]
}
