import type { GolfCourse } from '../courses/courseTypes'
import { prototype18Course } from '../courses/prototype18'

const COURSE_REGISTRY: Record<string, GolfCourse> = {
  [prototype18Course.id]: prototype18Course,
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
