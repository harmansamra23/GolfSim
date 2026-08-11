import type { LaunchMonitorShot } from './LaunchMonitorShot'

function round1(value: number) {
  return Math.round(value * 10) / 10
}

export function createMockFullShot(): LaunchMonitorShot {
  return {
    id: Date.now(),
    kind: 'FULL',
    ballSpeedMph: round1(138 + Math.random() * 22),
    clubSpeedMph: round1(95 + Math.random() * 14),
    launchAngleDeg: round1(10 + Math.random() * 7),
    launchDirectionDeg: round1(-5 + Math.random() * 10),
    spinRateRpm: Math.round(2000 + Math.random() * 1300),
    spinAxisDeg: round1(-12 + Math.random() * 24),
    source: 'MOCK',
  }
}

export function createMockPutt(): LaunchMonitorShot {
  return {
    id: Date.now(),
    kind: 'PUTT',
    ballSpeedMph: round1(4.5 + Math.random() * 3.5),
    clubSpeedMph: null,
    launchAngleDeg: 0,
    launchDirectionDeg: round1(-1.5 + Math.random() * 3),
    spinRateRpm: 0,
    spinAxisDeg: 0,
    source: 'MOCK',
  }
}
