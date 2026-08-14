import type { GolfCourse, GolfHole, HazardZone } from '../courses/courseTypes'
import { prototype18Course } from '../courses/prototype18'

function prototypeHazards(hole: GolfHole): HazardZone[] {
  const lengthMeters = hole.yardage * 0.9144
  const fairwaySide = hole.number % 2 === 0 ? 1 : -1
  const hazards: HazardZone[] = []

  if (hole.number % 3 === 0 || hole.number % 5 === 0) {
    hazards.push({
      id: `water-${hole.number}`,
      label: 'Water Carry',
      type: 'WATER',
      center: {
        x: fairwaySide * 28 + hole.green.center.x * 0.3,
        z: -lengthMeters * 0.56,
      },
      radiusX: hole.par === 3 ? 13 : 20,
      radiusZ: hole.par === 3 ? 9 : 15,
    })
  }

  if (hole.number % 4 === 0 || hole.number === 18) {
    hazards.push({
      id: `oob-${hole.number}`,
      label: 'Out of Bounds',
      type: 'OUT_OF_BOUNDS',
      center: {
        x: -fairwaySide * 72,
        z: -lengthMeters * 0.66,
      },
      radiusX: 18,
      radiusZ: 52,
    })
  }

  return hazards
}

function enrichPrototypeCourse(course: GolfCourse): GolfCourse {
  return {
    ...course,
    holes: course.holes.map((hole) => ({
      ...hole,
      hazards: prototypeHazards(hole),
      outOfBoundsHalfWidth: 125,
      greenSlope: {
        xPercent: ((hole.number % 5) - 2) * 0.32,
        zPercent: ((hole.number % 4) - 1.5) * 0.24,
      },
    })),
  }
}

const playablePrototype = enrichPrototypeCourse(prototype18Course)

const COURSE_REGISTRY: Record<string, GolfCourse> = {
  [playablePrototype.id]: playablePrototype,
}

export function listCourses() {
  return Object.values(COURSE_REGISTRY)
}

export function loadCourse(courseId: string) {
  const course = COURSE_REGISTRY[courseId]

  if (!course) {
    throw new Error(`Unknown course: ${courseId}`)
  }

  return course
}
