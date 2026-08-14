import type { SurfaceType } from '../courses/courseTypes'
import type { MeasurementSource, ShotKind } from '../launchMonitor/LaunchMonitorShot'

export type ShotData = {
  id: number
  kind: ShotKind
  source: MeasurementSource

  ballSpeed: number
  clubSpeed: number | null

  launchAngle: number
  launchDirection: number

  spinRate: number
  spinAxis: number

  carry: number | null
  totalDistance: number | null

  lie: SurfaceType | null
}

export type ShotPosition = {
  x: number
  y: number
  z: number
}

export type ShotResult = {
  id: number
  carry?: number
  totalDistance?: number
  lie?: SurfaceType
  finalPosition?: ShotPosition
  holed?: boolean
  penaltyStrokes?: number
  hazard?: Extract<SurfaceType, 'WATER' | 'OUT_OF_BOUNDS'>
}
