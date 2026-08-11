import {
  scoreLabel,
  scoreToPar,
  type HoleScore,
} from '../gameplay/ScoreManager'

type ScorecardProps = {
  score: HoleScore
  complete: boolean
}

export function Scorecard({
  score,
  complete,
}: ScorecardProps) {
  const relative = scoreToPar(score)

  return (
    <section className="scorecard">
      <div>
        <span>HOLE</span>
        <strong>{score.hole}</strong>
      </div>

      <div>
        <span>PAR</span>
        <strong>{score.par}</strong>
      </div>

      <div>
        <span>STROKES</span>
        <strong>{score.strokes}</strong>
      </div>

      <div>
        <span>PEN</span>
        <strong>{score.penalties}</strong>
      </div>

      <div>
        <span>RESULT</span>
        <strong>
          {complete ? scoreLabel(relative) : 'IN PLAY'}
        </strong>
      </div>
    </section>
  )
}
