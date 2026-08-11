export type ShotKind = 'FULL' | 'PUTT'

export type MeasurementSource = 'MEASURED' | 'ESTIMATED' | 'MOCK'

export type LaunchMonitorShot = {
  id: number
  kind: ShotKind
  ballSpeedMph: number
  clubSpeedMph: number | null
  launchAngleDeg: number
  launchDirectionDeg: number
  spinRateRpm: number
  spinAxisDeg: number
  source: MeasurementSource
}
