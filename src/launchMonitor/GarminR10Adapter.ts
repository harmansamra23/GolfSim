import type { LaunchMonitorShot } from './LaunchMonitorShot'

export type GarminR10BridgeShot = {
  timestamp?: number
  ballSpeedMph: number
  clubSpeedMph?: number | null
  launchAngleDeg: number
  launchDirectionDeg: number
  spinRateRpm: number
  spinAxisDeg?: number | null
  kind?: 'FULL' | 'PUTT'
}

export function parseGarminR10BridgeShot(
  payload: GarminR10BridgeShot
): LaunchMonitorShot {
  if (!Number.isFinite(payload.ballSpeedMph) || payload.ballSpeedMph <= 0) {
    throw new Error('R10 shot is missing a valid ball speed')
  }

  if (!Number.isFinite(payload.launchAngleDeg)) {
    throw new Error('R10 shot is missing launch angle')
  }

  if (!Number.isFinite(payload.launchDirectionDeg)) {
    throw new Error('R10 shot is missing launch direction')
  }

  if (!Number.isFinite(payload.spinRateRpm) || payload.spinRateRpm < 0) {
    throw new Error('R10 shot is missing valid spin rate')
  }

  return {
    id: payload.timestamp ?? Date.now(),
    kind: payload.kind ?? 'FULL',
    ballSpeedMph: payload.ballSpeedMph,
    clubSpeedMph: payload.clubSpeedMph ?? null,
    launchAngleDeg: payload.launchAngleDeg,
    launchDirectionDeg: payload.launchDirectionDeg,
    spinRateRpm: payload.spinRateRpm,
    spinAxisDeg: payload.spinAxisDeg ?? 0,
    source: 'MEASURED',
  }
}

/*
  Transport intentionally lives outside this adapter.

  Garmin supports the Approach R10 with third-party simulator software,
  including direct computer Bluetooth workflows, but Garmin does not expose
  a public browser SDK in the product documentation we are using here.

  GolfSim therefore keeps device transport replaceable. A Bluetooth/native
  bridge can feed GarminR10BridgeShot objects into this adapter without
  changing the simulator, physics, scoring, or course systems.
*/
