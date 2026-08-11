export const WORLD_UNITS = {
  metersPerWorldUnit: 1,
} as const

export const AXIS_CONVENTION = {
  x: 'lateral',
  y: 'vertical',
  z: 'forward-backward',
} as const

export const DIRECTION_CONVENTION = {
  positiveX: 'right',
  negativeX: 'left',
  positiveY: 'up',
  negativeY: 'down',
  negativeZ: 'default target direction',
  positiveZ: 'behind default target direction',
} as const

export type WorldPosition = {
  x: number
  y: number
  z: number
}

export type WorldVelocity = {
  x: number
  y: number
  z: number
}

export const ORIGIN: WorldPosition = {
  x: 0,
  y: 0,
  z: 0,
}
