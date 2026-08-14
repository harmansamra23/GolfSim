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

        // A completed range shot must be cleared before the reset.
        // Otherwise the same shot id is detected again and replayed.
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
      }

      setHoleComplete(true)
      setRemainingYards(0)
      setCompletedScore(completed)
      setRound((current) =>
        saveHoleScore(current, completed, course)
      )
    }
  }

  function nextHole() {
    if (shotInProgress || round.complete) return

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
  }

  const displayedScore = completedScore ?? liveScore
  const relativeToPar = scoreToPar(displayedScore)
  const roundRelative = roundTotalToPar(round.scores)
  const hasNextHole =
    mode === 'ROUND' &&
    !round.complete &&
    round.currentHoleIndex < course.holes.length - 1

  return (
    <main className="app">
      <header>
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
            {shotInProgress ? 'SHOT ACTIVE' : 'MOCK MONITOR READY'}
          </div>
        </div>
      </header>

      <section className="hole-info">
        <div>
          <span>{mode === 'ROUND' ? 'HOLE' : 'MODE'}</span>
          <strong>{mode === 'ROUND' ? activeHole.number : 'RANGE'}</strong>
        </div>
        {mode === 'ROUND' ? (
          <div>
            <span>LAYOUT</span>
            <strong>{activeHole.name ?? `Hole ${activeHole.number}`}</strong>
          </div>
        ) : null}
        <div>
          <span>PAR</span>
          <strong>{mode === 'ROUND' ? activeHole.par : '–'}</strong>
        </div>
        <div>
          <span>DISTANCE</span>
          <strong>{activeHole.yardage} YDS</strong>
        </div>
        <div>
          <span>REMAINING</span>
          <strong>{Math.round(remainingYards)} YDS</strong>
        </div>
        <div>
          <span>CURRENT LIE</span>
          <strong>{currentLie}</strong>
        </div>
        <div>
          <span>CLUB</span>
          <strong>{recommendedClub}</strong>
        </div>
        {mode === 'ROUND' ? (
          <div>
            <span>ROUND</span>
            <strong>
              {roundRelative > 0 ? `+${roundRelative}` : roundRelative}
            </strong>
          </div>
        ) : null}
      </section>

      {mode === 'ROUND' ? (
        <Scorecard
          course={course}
          scores={round.scores}
          currentHole={activeHole.number}
        />
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
        </div>

        <aside className="shot-panel">
          <h2>
            {mode === 'RANGE'
              ? 'RANGE DATA'
              : round.complete
                ? 'ROUND COMPLETE'
                : holeComplete
                  ? `${scoreLabel(relativeToPar)} · ${strokes + penalties}`
                  : 'SHOT DATA'}
          </h2>

          <Stat
            label="Ball Speed"
            value={shot ? shot.ballSpeed.toFixed(1) : '--'}
            unit="mph"
          />
          <Stat
            label="Club Speed"
            value={
              shot?.clubSpeed != null
                ? shot.clubSpeed.toFixed(1)
                : '--'
            }
            unit="mph"
          />
          <Stat
            label="Launch"
            value={shot ? shot.launchAngle.toFixed(1) : '--'}
            unit="°"
          />
          <Stat
            label="Spin"
            value={shot ? shot.spinRate.toString() : '--'}
            unit="rpm"
          />
          <Stat
            label="Carry"
            value={
              shot?.carry != null
                ? Math.round(shot.carry).toString()
                : '--'
            }
            unit="yd"
          />
          <Stat
            label="Total"
            value={
              shot?.totalDistance != null
                ? Math.round(shot.totalDistance).toString()
                : '--'
            }
            unit="yd"
          />

          {mode === 'ROUND' ? (
            <Stat
              label="Strokes"
              value={(strokes + penalties).toString()}
              unit=""
            />
          ) : null}

          <button
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

          {hasNextHole ? (
            <button
              className={holeComplete ? '' : 'secondary-action'}
              onClick={nextHole}
              disabled={shotInProgress}
            >
              {holeComplete ? 'NEXT HOLE' : 'SKIP TO NEXT HOLE'}
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

          <button
            className="secondary-action"
            onClick={() =>
              setCameraPreference((current) =>
                current === 'AUTO' ? 'FREE' : 'AUTO'
              )
            }
            disabled={shotInProgress}
          >
            CAMERA: {cameraPreference}
          </button>

          {mode === 'ROUND' ? (
            <button
              className="secondary-action"
              onClick={addPenalty}
              disabled={holeComplete || round.complete || shotInProgress}
            >
              + PENALTY
            </button>
          ) : null}

          <button
            className="secondary-action"
            onClick={resetCurrentHole}
            disabled={shotInProgress}
          >
            {mode === 'ROUND' ? 'RESET HOLE' : 'CLEAR BALL'}
          </button>

          {mode === 'ROUND' ? (
            <button
              className="secondary-action"
              onClick={resetRound}
              disabled={shotInProgress}
            >
              NEW ROUND
            </button>
          ) : null}

          {mode === 'RANGE' ? (
            <div className="range-history">
              <h3>RECENT SHOTS</h3>
              {rangeShots.length === 0 ? (
                <p>No shots yet.</p>
              ) : (
                rangeShots.map((entry, index) => (
                  <div key={`${entry.id}-${index}`} className="range-shot-row">
                    <span>#{rangeShots.length - index}</span>
                    <strong>{Math.round(entry.carry)} yd</strong>
                    <small>{entry.ballSpeed.toFixed(1)} mph</small>
                  </div>
                ))
              )}
            </div>
          ) : null}

          <div className="round-summary">
            <span>{ballPhase}</span>
            <strong>
              X {ballPosition.x.toFixed(1)} / Z {ballPosition.z.toFixed(1)}
            </strong>
          </div>
        </aside>
      </section>
    </main>
  )
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>
        {value}
        {unit ? <small>{unit}</small> : null}
      </strong>
    </div>
  )
}

export default App
