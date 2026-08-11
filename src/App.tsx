import { useMemo, useState } from 'react'

import './App.css'

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

const HOLE_PAR = plumasLakeHole1.par
const HOLE_NUMBER = plumasLakeHole1.number

const INITIAL_REMAINING_YARDS = metersToYards(
  Math.hypot(
    plumasLakeHole1.green.center.x - plumasLakeHole1.tee.x,
    plumasLakeHole1.green.center.z - plumasLakeHole1.tee.z
  )
)

function App() {
  const [shot, setShot] = useState<ShotData | null>(null)
  const [currentLie, setCurrentLie] = useState<SurfaceType>('TEE')
  const [ballPosition, setBallPosition] = useState<ShotPosition>({
    x: plumasLakeHole1.tee.x,
    y: 0.2,
    z: plumasLakeHole1.tee.z,
  })
  const [remainingYards, setRemainingYards] = useState(
    INITIAL_REMAINING_YARDS
  )
  const [strokes, setStrokes] = useState(0)
  const [penalties, setPenalties] = useState(0)
  const [holeComplete, setHoleComplete] = useState(false)
  const [completedScore, setCompletedScore] = useState<HoleScore | null>(null)
  const [cameraPreference, setCameraPreference] =
    useState<CameraPreference>('AUTO')

  const recommendedClub = useMemo(
    () => recommendClub(remainingYards, currentLie),
    [remainingYards, currentLie]
  )

  function takeTestShot() {
    if (holeComplete) return

    const monitorShot =
      currentLie === 'GREEN'
        ? createMockPutt()
        : createMockFullShot()

    setShot(toSimulatorShot(monitorShot))
    setStrokes((value) => value + 1)
  }

  function addPenalty() {
    if (holeComplete) return
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
          MOCK MONITOR READY
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

      <section className="simulator">
        <div className="course-3d">
          <GolfScene
            shot={shot}
            cameraPreference={cameraPreference}
            onShotResult={handleShotResult}
          />
        </div>

        <aside className="shot-panel">
          <h2>{holeComplete ? scoreLabel(relativeToPar) : 'SHOT DATA'}</h2>

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
            label="Score"
            value={
              relativeToPar > 0
                ? `+${relativeToPar}`
                : relativeToPar.toString()
            }
            unit=""
          />

          <button onClick={takeTestShot} disabled={holeComplete}>
            {currentLie === 'GREEN' ? 'TEST PUTT' : 'TEST SHOT'}
          </button>

          <button
            className="secondary-action"
            onClick={() =>
              setCameraPreference((current) =>
                current === 'AUTO' ? 'FREE' : 'AUTO'
              )
            }
          >
            CAMERA: {cameraPreference}
          </button>

          <button
            className="secondary-action"
            onClick={addPenalty}
            disabled={holeComplete}
          >
            + PENALTY
          </button>

          <div className="round-summary">
            <span>Ball</span>
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
