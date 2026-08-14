import type { LaunchMonitorShot } from './LaunchMonitorShot'

function round1(value: number) {
  return Math.round(value * 10) / 10
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export function createMockFullShot(
  remainingYards: number,
  aimDirectionDeg: number,
  clubCarryYards?: number
): LaunchMonitorShot {
  const intendedYards = Math.max(
    35,
    Math.min(remainingYards, clubCarryYards ?? remainingYards)
  )
  const ballSpeed = clamp(
    58 + intendedYards * 0.36,
    68,
    154
  )

  const launchAngle = clamp(
    27 - intendedYards * 0.065,
    11.5,
    24
  )

  const spinRate = clamp(
    7600 - intendedYards * 21,
    2300,
    7200
  )

  const estimatedClubSpeed = ballSpeed / 1.45

  return {
    id: Date.now(),
    kind: 'FULL',
    ballSpeedMph: round1(
      ballSpeed * (0.985 + Math.random() * 0.03)
    ),
    clubSpeedMph: round1(
      estimatedClubSpeed * (0.98 + Math.random() * 0.04)
    ),
    launchAngleDeg: round1(
      launchAngle + (Math.random() - 0.5) * 1.4
    ),
    launchDirectionDeg: round1(
      aimDirectionDeg + (Math.random() - 0.5) * 3.2
    ),
    spinRateRpm: Math.round(
      spinRate * (0.94 + Math.random() * 0.12)
    ),
    spinAxisDeg: round1(-6 + Math.random() * 12),
    source: 'MOCK',
  }
}

export function createMockPutt(
  remainingYards: number,
  aimDirectionDeg: number
): LaunchMonitorShot {
  const meters = Math.max(0.3, remainingYards * 0.9144)
  const targetSpeedMetersPerSecond = Math.sqrt(2 * 1.55 * meters)
  const targetSpeedMph = targetSpeedMetersPerSecond / 0.44704

  return {
    id: Date.now(),
    kind: 'PUTT',
    ballSpeedMph: round1(
      targetSpeedMph * (0.97 + Math.random() * 0.06)
    ),
    clubSpeedMph: null,
    launchAngleDeg: 0,
    launchDirectionDeg: round1(
      aimDirectionDeg + (Math.random() - 0.5) * 0.8
    ),
    spinRateRpm: 0,
    spinAxisDeg: 0,
    source: 'MOCK',
  }
}
