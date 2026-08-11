import type { GolfCourse } from '../courses/courseTypes'
import {
  roundTotalToPar,
  type HoleScore,
} from '../gameplay/ScoreManager'

export function Scorecard({
  course,
  scores,
  currentHole,
}: {
  course: GolfCourse
  scores: HoleScore[]
  currentHole: number
}) {
  const scoreByHole = new Map(
    scores.map((score) => [score.hole, score])
  )
  const totalToPar = roundTotalToPar(scores)

  return (
    <section className="round-scorecard">
      <div className="scorecard-row scorecard-header-row">
        <span className="scorecard-label">HOLE</span>
        {course.holes.map((hole) => (
          <span
            key={hole.number}
            className={hole.number === currentHole ? 'active-hole-cell' : ''}
          >
            {hole.number}
          </span>
        ))}
        <span className="scorecard-total">TOT</span>
      </div>

      <div className="scorecard-row">
        <span className="scorecard-label">PAR</span>
        {course.holes.map((hole) => (
          <span key={hole.number}>{hole.par}</span>
        ))}
        <span className="scorecard-total">
          {course.holes.reduce((total, hole) => total + hole.par, 0)}
        </span>
      </div>

      <div className="scorecard-row">
        <span className="scorecard-label">SCORE</span>
        {course.holes.map((hole) => {
          const score = scoreByHole.get(hole.number)
          return (
            <span key={hole.number}>
              {score ? score.strokes + score.penalties : '–'}
            </span>
          )
        })}
        <span className="scorecard-total">
          {scores.reduce(
            (total, score) => total + score.strokes + score.penalties,
            0
          )}
        </span>
      </div>

      <div className="round-to-par">
        ROUND {totalToPar > 0 ? `+${totalToPar}` : totalToPar}
      </div>
    </section>
  )
}
