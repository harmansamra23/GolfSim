import { useMemo, useState } from 'react'

import './App.css'

import type { BallPhase } from './ball/BallState'
import type { CameraPreference } from './camera/CameraManager'
import GolfScene from './components/simulator/GolfScene'
import { plumasLakeHole1 } from './courses/plumasLakeHole1'
import type { SurfaceType } from './courses/courseTypes'
import { recommendClub } from './gameplay/ClubManager'
import {
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

const HOLE_PAR = plumasLakeHole1.par
const HOLE_NUMBER = plumasLakeHole1.number

const INITIAL_POSITION: ShotPosition = {
  x: plumasLakeHole1.tee.x,
  y: 0.2,
  z: plumasLakeHole1.tee.z,
}

const INITIAL_REMAINING_YARDS = metersToYards(
  Math.hypot(
    plumasLakeHole1.green.center.x - plumasLakeHole1.tee.x,
    plumasLakeHole1.green.center.z - plumasLakeHole1.tee.z
  )
)

function App() {
  const [shot, setShot] = useState<ShotData | null>(null)
  const [currentLie, setCurrentLie] = useState<SurfaceType>('TEE')
  const [ballPosition, setBallPosition] = useState<ShotPosition>(
    INITIAL_POSITION
  )
  const [remainingYards, setRemainingYards] = useState(
    INITIAL_REMAINING_YARDS
  )
  const [strokes, setStrokes] = useState(0)
  const [penalties, setPenalties] = useState(0)
  const [holeComplete, setHoleComplete] = useState(false)
  const [completedScore, setCompletedScore] = useState<HoleScore | null>(null)
  const [cameraPreference, setCameraPreference] =
    useState<CameraPreference>('AUTO')
  const [ballPhase, setBallPhase] = useState<BallPhase>('ADDRESS')
  const [resetToken, setResetToken] = useState(0)

  const shotInProgress =
    ballPhase === 'FLIGHT' ||
    ballPhase === 'LANDING' ||
    ballPhase === 'ROLLING'

  const recommendedClub = useMemo(
    () => recommendClub(remainingYards, currentLie),
    [remainingYards, currentLie]
  )

  function getAimDirectionDeg() {
    const dx = plumasLakeHole1.green.center.x - ballPosition.x
    const dz = plumasLakeHole1.green.center.z - ballPosition.z

    return (Math.atan2(dx, -dz) * 180) / Math.PI
  }

  function takeTestShot() {
    if (holeComplete || shotInProgress) return

    const aimDirectionDeg = getAimDirectionDeg()

    const monitorShot =
      currentLie === 'GREEN'
        ? createMockPutt(remainingYards, aimDirectionDeg)
        : createMockFullShot(remainingYards, aimDirectionDeg)

    setShot(toSimulatorShot(monitorShot))
    setStrokes((value) => value + 1)
  }

  function addPenalty() {
    if (holeComplete || shotInProgress) return
    setPenalties((value) => value + 1)
  }

  function updateRemaining(position: ShotPosition) {
    const meters = Math.hypot(
      plumasLakeHole1.green.center.x - position.x,
      plumasLakeHole1.green.center.z - position.z
    )

    setRemainingYards(metersToYards(meters))
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

    if (result.lie) {
      setCurrentLie(result.lie)
    }

    if (result.finalPosition) {
      setBallPosition(result.finalPosition)
      updateRemaining(result.finalPosition)
    }

    if (result.holed) {
      setHoleComplete(true)
      setRemainingYards(0)
      setCompletedScore({
        hole: HOLE_NUMBER,
        par: HOLE_PAR,
        strokes,
        penalties,
      })
    }
  }

  function resetHole() {
    setShot(null)
    setCurrentLie('TEE')
    setBallPosition(INITIAL_POSITION)
    setRemainingYards(INITIAL_REMAINING_YARDS)
    setStrokes(0)
    setPenalties(0)
    setHoleComplete(false)
    setCompletedScore(null)
    setCameraPreference('AUTO')
    setBallPhase('ADDRESS')
    setResetToken((value) => value + 1)
  }

  const liveScore: HoleScore = {
    hole: HOLE_NUMBER,
    par: HOLE_PAR,
    strokes,
    penalties,
  }

  const displayedScore = completedScore ?? liveScore
  const relativeToPar = scoreToPar(displayedScore)

  return (
    <main className="app">
      <header>
        <div>
          <h1>GolfSim</h1>
          <p>Plumas Lake Golf & Country Club</p>
        </div>

        <div className="connection">
          <span className="status-dot" />
          {shotInProgress ? 'SHOT ACTIVE' : 'MOCK MONITOR READY'}
        </div>
      </header>

      <section className="hole-info">
        <div>
          <span>HOLE</span>
          <strong>{HOLE_NUMBER}</strong>
        </div>

        <div>
          <span>PAR</span>
          <strong>{HOLE_PAR}</strong>
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

        <div>
          <span>STROKES</span>
          <strong>{strokes + penalties}</strong>
        </div>
      </section>

      <Scorecard score={displayedScore} complete={holeComplete} />

      <section className="simulator">
        <div className="course-3d">
          <GolfScene
            shot={shot}
            cameraPreference={cameraPreference}
            resetToken={resetToken}
            onBallPhaseChange={setBallPhase}
            onShotResult={handleShotResult}
          />
        </div>

        <aside className="shot-panel">
          <h2>
            {holeComplete
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
            label="Direction"
            value={shot ? shot.launchDirection.toFixed(1) : '--'}
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

          <Stat
            label="Final Score"
            value={
              holeComplete
                ? relativeToPar > 0
                  ? `+${relativeToPar}`
                  : relativeToPar.toString()
                : '--'
            }
            unit=""
          />

          <button
            onClick={takeTestShot}
            disabled={holeComplete || shotInProgress}
          >
            {currentLie === 'GREEN' ? 'TEST PUTT' : 'TEST SHOT'}
          </button>

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

          <button
            className="secondary-action"
            onClick={addPenalty}
            disabled={holeComplete || shotInProgress}
          >
            + PENALTY
          </button>

          <button
            className="secondary-action"
            onClick={resetHole}
            disabled={shotInProgress}
          >
            RESET HOLE
          </button>

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
