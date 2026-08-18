import type { GeoCoordinate } from './realCourseTypes'

const EARTH_RADIUS_METERS = 6_378_137

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

export function projectToLocalMeters(
  origin: GeoCoordinate,
  point: GeoCoordinate
) {
  const originLatitude = degreesToRadians(origin.latitude)
  const pointLatitude = degreesToRadians(point.latitude)
  const longitudeDelta = degreesToRadians(
    point.longitude - origin.longitude
  )
  const latitudeDelta = pointLatitude - originLatitude
  const meanLatitude = (originLatitude + pointLatitude) * 0.5

  return {
    x:
      longitudeDelta *
      Math.cos(meanLatitude) *
      EARTH_RADIUS_METERS,
    y:
      (point.elevationMeters ?? origin.elevationMeters ?? 0) -
      (origin.elevationMeters ?? 0),
    z: -latitudeDelta * EARTH_RADIUS_METERS,
  }
}
