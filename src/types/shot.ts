import type { SurfaceType } from '../courses/courseTypes'

export type ShotData = {
  id: number

  ballSpeed: number
  clubSpeed: number

  launchAngle: number
  launchDirection: number

  spinRate: number
  spinAxis: number

  carry: number | null
  totalDistance: number | null

  lie: SurfaceType | null
}

export type ShotResult = {
  id: number
  carry?: number
  totalDistance?: number
  lie?: SurfaceType
}