export const METERS_PER_YARD = 0.9144
export const YARDS_PER_METER = 1 / METERS_PER_YARD

export const METERS_PER_FOOT = 0.3048
export const FEET_PER_METER = 1 / METERS_PER_FOOT

export const METERS_PER_SECOND_PER_MPH = 0.44704
export const MPH_PER_METER_PER_SECOND =
  1 / METERS_PER_SECOND_PER_MPH

export function yardsToMeters(
  yards: number
): number {
  return yards * METERS_PER_YARD
}

export function metersToYards(
  meters: number
): number {
  return meters * YARDS_PER_METER
}

export function feetToMeters(
  feet: number
): number {
  return feet * METERS_PER_FOOT
}

export function metersToFeet(
  meters: number
): number {
  return meters * FEET_PER_METER
}

export function mphToMetersPerSecond(
  mph: number
): number {
  return mph * METERS_PER_SECOND_PER_MPH
}

export function metersPerSecondToMph(
  metersPerSecond: number
): number {
  return metersPerSecond * MPH_PER_METER_PER_SECOND
}

export function rpmToRadiansPerSecond(
  rpm: number
): number {
  return (rpm * 2 * Math.PI) / 60
}
