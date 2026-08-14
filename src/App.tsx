import { useMemo, useState } from 'react'

import './App.css'

import type { BallPhase } from './ball/BallState'
import type { CameraPreference } from './camera/CameraManager'
import GolfScene from './components/simulator/GolfScene'
import { loadCourse } from './course/CourseLoader'
import type {
  GolfHole,
  SurfaceType,
} from './courses/courseTypes'
import { drivingRangeHole } from './courses/drivingRange'
import { aimDirectionDegrees } from './courses/holeGeometryMath'
import { recommendClub } from './gameplay/ClubManager'
import {
  advanceRound,
  createRound,
  saveHoleScore,
  totalStrokes,
} from './gameplay/RoundManager'
import {
  isSkippedScore,
  maxStrokesForPar,
  roundTotalToPar,
  scoreLabel,
  scoreToPar,
  type HoleScore,
} from './gameplay/ScoreManager'
import { toSimulatorShot } from './launchMonitor/LaunchMonitorAdapter'
import {
  createMockFullShot,
  createMockPutt,
} from './launchMonitor/MockLaunchMonitor'
import { metersToYards } from './simulator/units'
import type {
  ShotData,
  ShotPosition,
  ShotResult,
} from './types/shot'
import { Scorecard } from './ui/Scorecard'

type SimulatorMode = 'ROUND' | 'RANGE'

type RangeShot = {
  id: number
  ballSpeed: number
  carry: number
  total: number
}

const course = loadCourse('golfsim-prototype-18')

function startPositionFor(hole: GolfHole): ShotPosition {
  return {
    x: hole.tee.x,
    y: 0.2,
    z: hole.tee.z,
  }
}

function remainingYardsFor(
  hole: GolfHole,
  position: ShotPosition
) {
  return metersToYards(
    Math.hypot(
      hole.green.center.x - position.x,
      hole.green.center.z - position.z
    )
  )
}

function App() {
  const [mode, setMode] = useState<SimulatorMode>('ROUND')
  const [round, setRound] = useState(() => createRound(course))
  const roundHole = course.holes[round.currentHoleIndex]
  const activeHole = mode === 'ROUND' ? roundHole : drivingRangeHole

  const [shot, setShot] = useState<ShotData | null>(null)
  const [currentLie, setCurrentLie] = useState<SurfaceType>('TEE')
  const [ballPosition, setBallPosition] = useState<ShotPosition>(
    startPositionFor(roundHole)
  )
  const [remainingYards, setRemainingYards] = useState(
    remainingYardsFor(roundHole, startPositionFor(roundHole))
  )
  const [strokes, setStrokes] = useState(0)
  const [penalties, setPenalties] = useState(0)
  const [holeComplete, setHoleComplete] = useState(false)
  const [completedScore, setCompletedScore] =
    useState<HoleScore | null>(null)
  const [cameraPreference, setCameraPreference] =
    useState<CameraPreference>('AUTO')
  const [ballPhase, setBallPhase] = useState<BallPhase>('ADDRESS')
  const [resetToken, setResetToken] = useState(0)
  const [rangeShots, setRangeShots] = useState<RangeShot[]>([])

  const shotInProgress =
    ballPhase === 'FLIGHT' ||
    ballPhase === 'LANDING' ||
    ballPhase === 'ROLLING'

  const recommendedClub = useMemo(
    () => recommendClub(remainingYards, currentLie),
    [remainingYards, currentLie]
  )

  function resetForHole(hole: GolfHole, clearShot = true) {
    const position = startPositionFor(hole)

    if (clearShot) {
      setShot(null)
    }

    setCurrentLie('TEE')
    setBallPosition(position)
    setRemainingYards(remainingYardsFor(hole, position))
    setStrokes(0)
    setPenalties(0)
    setHoleComplete(false)
    setCompletedScore(null)
    setCameraPreference('AUTO')
    setBallPhase('ADDRESS')
    setResetToken((value) => value + 1)
  }

  function switchMode(nextMode: SimulatorMode) {
    if (shotInProgress || nextMode === mode) return

    setMode(nextMode)
    resetForHole(
      nextMode === 'ROUND' ? roundHole : drivingRangeHole
    )
  }

  function takeTestShot() {
    if (shotInProgress) return
    if (mode === 'ROUND' && (holeComplete || round.complete)) return

    const aimDirection = aimDirectionDegrees(
      ballPosition,
      activeHole.green.center
    )

    const monitorShot =
      mode === 'ROUND' && currentLie === 'GREEN'
        ? createMockPutt(remainingYards, aimDirection)
        : createMockFullShot(remainingYards, aimDirection)

    setShot(toSimulatorShot(monitorShot))

    if (mode === 'ROUND') {
      setStrokes((value) => value + 1)
    }
  }

  function addPenalty() {
    if (
      mode !== 'ROUND' ||
      holeComplete ||
      round.complete ||
      shotInProgress
    ) {
      return
    }

    setPenalties((value) => value + 1)
  }

  function handleShotResult(result: ShotResult) {
    setShot((current) => {
      if (!current || current.id !== result.id) {
        return current
      }

      return {
        ...current,
        ...result,
      }
    })

    if (mode === 'RANGE') {
      const carry = result.carry
      const total = result.totalDistance
      const completedShot = shot

      if (carry != null && total != null && completedShot) {
        setRangeShots((history) => [
          {
            id: result.id,
            ballSpeed: completedShot.ballSpeed,
            carry,
            total,
          },
          ...history,
        ].slice(0, 12))

        resetForHole(drivingRangeHole, true)
      }
      return
    }

    if (result.lie) {
      setCurrentLie(result.lie)
    }

    if (result.finalPosition) {
      setBallPosition(result.finalPosition)
      setRemainingYards(
        remainingYardsFor(activeHole, result.finalPosition)
      )
    }

    if (result.holed) {
      const completed: HoleScore = {
        hole: activeHole.number,
        par: activeHole.par,
        strokes,
        penalties,
        status: 'PLAYED',
      }

      setHoleComplete(true)
      setRemainingYards(0)
      setCompletedScore(completed)
      setRound((current) =>
        saveHoleScore(current, completed, course)
      )
    }
  }

  function skipHole() {
    if (
      mode !== 'ROUND' ||
      holeComplete ||
      round.complete ||
      shotInProgress
    ) {
      return
    }

    const noShotTaken = strokes === 0 && penalties === 0
    const maxScore = maxStrokesForPar(activeHole.par)
    const skippedScore: HoleScore = noShotTaken
      ? {
          hole: activeHole.number,
          par: activeHole.par,
          strokes: 0,
          penalties: 0,
          status: 'SKIPPED',
        }
      : {
          hole: activeHole.number,
          par: activeHole.par,
          strokes: maxScore,
          penalties: 0,
          status: 'MAX',
        }

    if (!noShotTaken) {
      setStrokes(maxScore)
      setPenalties(0)
    }

    setHoleComplete(true)
    setCompletedScore(skippedScore)
    setRound((current) =>
      saveHoleScore(current, skippedScore, course)
    )
  }

  function nextHole() {
    if (shotInProgress || round.complete || !holeComplete) return

    const nextRound = advanceRound(round, course)
    const nextHoleData = course.holes[nextRound.currentHoleIndex]

    setRound(nextRound)
    resetForHole(nextHoleData)
  }

  function resetCurrentHole() {
    if (shotInProgress) return
    resetForHole(activeHole)
  }

  function resetRound() {
    if (shotInProgress) return

    const freshRound = createRound(course)
    setRound(freshRound)
    setMode('ROUND')
    resetForHole(course.holes[0])
  }

  const liveScore: HoleScore = {
    hole: activeHole.number,
    par: activeHole.par,
    strokes,
    penalties,
    status: 'PLAYED',
  }

  const displayedScore = completedScore ?? liveScore
  const relativeToPar = scoreToPar(displayedScore)
  const roundRelative = roundTotalToPar(round.scores)
  const hasNextHole =
    mode === 'ROUND' &&
    !round.complete &&
    round.currentHoleIndex < course.holes.length - 1
  const showScorecard =
    mode === 'ROUND' && (holeComplete || round.complete)

  const completionSummary = completedScore
    ? isSkippedScore(completedScore)
      ? 'SKIPPED · N/A'
      : completedScore.status === 'MAX'
        ? `MAX SCORE · ${completedScore.strokes}`
        : `${scoreLabel(relativeToPar)} · ${completedScore.strokes + completedScore.penalties}`
    : `${scoreLabel(relativeToPar)} · ${strokes + penalties}`

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>GolfSim</h1>
          <p>
            {mode === 'ROUND'
              ? `${course.name} · ${activeHole.name ?? `Hole ${activeHole.number}`}`
              : 'Driving Range'}
          </p>
        </div>

        <div className="header-actions">
          <button
            className={`mode-chip ${mode === 'ROUND' ? 'mode-chip-active' : ''}`}
            onClick={() => switchMode('ROUND')}
            disabled={shotInProgress}
          >
            ROUND
          </button>
          <button
            className={`mode-chip ${mode === 'RANGE' ? 'mode-chip-active' : ''}`}
            onClick={() => switchMode('RANGE')}
            disabled={shotInProgress}
          >
            RANGE
          </button>
          <div className="connection">
            <span className="status-dot" />
            {shotInProgress ? 'SHOT ACTIVE' : 'READY'}
          </div>
        </div>
      </header>

      {showScorecard ? (
        <section className="scorecard-reveal">
          <div className="scorecard-reveal-heading">
            <div>
              <span>HOLE {activeHole.number} COMPLETE</span>
              <strong>{completionSummary}</strong>
            </div>
            <div>
              <span>ROUND</span>
              <strong>
                {roundRelative > 0 ? `+${roundRelative}` : roundRelative}
              </strong>
            </div>
          </div>
          <Scorecard
            course={course}
            scores={round.scores}
            currentHole={activeHole.number}
          />
        </section>
      ) : null}

      <section className="simulator">
        <div className="course-3d">
          <GolfScene
            key={`${mode}-${activeHole.number}`}
            hole={activeHole}
            shot={shot}
            cameraPreference={cameraPreference}
            resetToken={resetToken}
            onBallPhaseChange={setBallPhase}
            onShotResult={handleShotResult}
          />

          <div className="course-hud course-hud-top-left">
            {mode === 'ROUND' ? (
              <>
                <span className="hud-eyebrow">HOLE {activeHole.number}</span>
                <strong className="hud-title">
                  {activeHole.name ?? `Hole ${activeHole.number}`}
                </strong>
                <span className="hud-subline">
                  PAR {activeHole.par} · {activeHole.yardage} YDS
                </span>
              </>
            ) : (
              <>
                <span className="hud-eyebrow">PRACTICE</span>
                <strong className="hud-title">Driving Range</strong>
                <span className="hud-subline">SHOT TRACKING</span>
              </>
            )}
          </div>

          <div className="course-hud course-hud-top-right">
            <HudMetric
              label={mode === 'ROUND' ? 'STROKES' : 'SHOT'}
              value={mode === 'ROUND' ? `${strokes + penalties}` : `${rangeShots.length + 1}`}
            />
            <HudMetric label="TO PIN" value={`${Math.round(remainingYards)} YD`} />
            <HudMetric label="LIE" value={currentLie} />
            <HudMetric label="CLUB" value={recommendedClub} />
          </div>

          {shot ? (
            <div className="shot-hud">
              <HudMetric label="BALL" value={`${shot.ballSpeed.toFixed(1)} MPH`} />
              <HudMetric
                label="CLUB"
                value={shot.clubSpeed != null ? `${shot.clubSpeed.toFixed(1)} MPH` : '--'}
              />
              <HudMetric label="LAUNCH" value={`${shot.launchAngle.toFixed(1)}°`} />
              <HudMetric label="SPIN" value={`${shot.spinRate} RPM`} />
              <HudMetric
                label="CARRY"
                value={shot.carry != null ? `${Math.round(shot.carry)} YD` : '--'}
              />
              <HudMetric
                label="TOTAL"
                value={
                  shot.totalDistance != null
                    ? `${Math.round(shot.totalDistance)} YD`
                    : '--'
                }
              />
            </div>
          ) : null}
        </div>

        <aside className="control-panel">
          <div className="control-panel-heading">
            <span>{ballPhase}</span>
            <strong>
              {mode === 'ROUND'
                ? holeComplete
                  ? completionSummary
                  : `Hole ${activeHole.number}`
                : 'Range'}
            </strong>
          </div>

          <button
            className="primary-action"
            onClick={takeTestShot}
            disabled={
              shotInProgress ||
              (mode === 'ROUND' && (holeComplete || round.complete))
            }
          >
            {mode === 'ROUND' && currentLie === 'GREEN'
              ? 'TEST PUTT'
              : 'TEST SHOT'}
          </button>

          {mode === 'ROUND' && !round.complete ? (
            <button
              className={holeComplete ? 'primary-action' : 'secondary-action'}
              onClick={holeComplete ? nextHole : skipHole}
              disabled={shotInProgress}
            >
              {holeComplete ? 'NEXT HOLE' : 'SKIP HOLE'}
            </button>
          ) : null}

          <button
            className="secondary-action"
            onClick={() =>
              setCameraPreference((current) =>
                current === 'AUTO' ? 'FREE' : 'AUTO'
              )
            }
            disabled={shotInProgress}
          >
            CAMERA · {cameraPreference}
          </button>

          <div className="utility-actions">
            {mode === 'ROUND' ? (
              <button
                onClick={addPenalty}
                disabled={holeComplete || round.complete || shotInProgress}
              >
                + PENALTY
              </button>
            ) : null}
            <button onClick={resetCurrentHole} disabled={shotInProgress}>
              {mode === 'ROUND' ? 'RESET HOLE' : 'CLEAR BALL'}
            </button>
          </div>

          {mode === 'ROUND' ? (
            <button
              className="quiet-action"
              onClick={resetRound}
              disabled={shotInProgress}
            >
              NEW ROUND
            </button>
          ) : null}

          {mode === 'ROUND' && round.complete ? (
            <div className="round-finish-card">
              <span>FINAL</span>
              <strong>
                {roundRelative > 0 ? `+${roundRelative}` : roundRelative}
              </strong>
              <small>{totalStrokes(round.scores)} strokes</small>
            </div>
          ) : null}

          {mode === 'RANGE' ? (
            <div className="range-history">
              <h3>RECENT SHOTS</h3>
              {rangeShots.length === 0 ? (
                <p>No shots yet.</p>
              ) : (
                rangeShots.slice(0, 5).map((entry, index) => (
                  <div key={`${entry.id}-${index}`} className="range-shot-row">
                    <span>#{rangeShots.length - index}</span>
                    <strong>{Math.round(entry.carry)} yd</strong>
                    <small>{entry.ballSpeed.toFixed(1)} mph</small>
                  </div>
                ))
              )}
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  )
}

function HudMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="hud-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
