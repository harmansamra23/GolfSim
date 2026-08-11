import type { ShotData } from '../types/shot'
import type { LaunchMonitorShot } from './LaunchMonitorShot'

export function toSimulatorShot(
  monitorShot: LaunchMonitorShot
): ShotData {
  return {
    id: monitorShot.id,
    kind: monitorShot.kind,
    source: monitorShot.source,
    ballSpeed: monitorShot.ballSpeedMph,
    clubSpeed: monitorShot.clubSpeedMph,
    launchAngle: monitorShot.launchAngleDeg,
    launchDirection: monitorShot.launchDirectionDeg,
    spinRate: monitorShot.spinRateRpm,
    spinAxis: monitorShot.spinAxisDeg,
    carry: null,
    totalDistance: null,
    lie: null,
  }
}
