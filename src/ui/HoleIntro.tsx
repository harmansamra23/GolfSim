import type { GolfCourse, GolfHole } from '../courses/courseTypes'

export function HoleIntro({
  course,
  hole,
}: {
  course: GolfCourse
  hole: GolfHole
}) {
  return (
    <div className="hole-intro" key={`${course.id}-${hole.number}`}>
      <span>{course.name.toUpperCase()}</span>
      <strong>HOLE {hole.number}</strong>
      <small>
        {hole.name ?? `Hole ${hole.number}`} · PAR {hole.par} · {hole.yardage} YDS
      </small>
    </div>
  )
}
