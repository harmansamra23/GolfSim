import { useEffect, useMemo, useState } from 'react'

import './App.css'

import {
  playHazardCue,
  playHoleCompleteCue,
  playShotCue,
  playUiCue,
} from './audio/SimulatorAudio'
import type { BallPhase } from './ball/BallState'
import type { CameraPreference } from './camera/CameraManager'
import GolfScene from './components/simulator/GolfScene'
import { loadCourse } from './course/CourseLoader'
import type {
  GolfCourse,
  GolfHole,
  SurfaceType,
} from './courses/courseTypes'
import { drivingRangeHole } from './courses/drivingRange'
import type { PlumasTeeId } from './courses/plumasLakeApprox'
import {
  aimDirectionToTarget,
  defaultAimTarget,
  moveAimTarget,
  type AimTarget,
} from './gameplay/AimingSystem'
import {
  DEFAULT_BAG,
  findClubById,
  recommendClubFromBag,
} from './gameplay/ClubBag'
import {
  getGreenDistances,
  getHazardDistances,
} from './gameplay/DistanceInfo'
import {
  DEFAULT_ROUND_SETTINGS,
  type RoundSettings,
} from './gameplay/RoundSettings'
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
import { HoleIntro } from './ui/HoleIntro'
import { HoleMiniMap } from './ui/HoleMiniMap'
import { RoundSetup } from './ui/RoundSetup'
import { Scorecard } from './ui/Scorecard'

type SimulatorMode = 'ROUND' | 'RANGE'

type RangeShot = {
  id: number
  ballSpeed: number
  carry: number
  total: number
}

type LastShotSnapshot = {
  position: ShotPosition
  lie: SurfaceType
  remainingYards: number
  strokes: number
  penalties: number
  shot: ShotData | null
}

function teeIdFromSettings(settings: RoundSettings): PlumasTeeId {
  return settings.tee.toLowerCase() as PlumasTeeId
}

const initialCourse = loadCourse(
  DEFAULT_ROUND_SETTINGS.courseId,
  teeIdFromSettings(DEFAULT_ROUND_SETTINGS)
)

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

function initialAimFor(hole: GolfHole) {
  const position = startPositionFor(hole)
  return defaultAimTarget(
    hole,
    position,
    remainingYardsFor(hole, position)
  )
}

function courseStatusLabel(course: GolfCourse) {
  if (course.geometryStatus === 'MAPPED_APPROX') {
    return 'MAPPED APPROX'
  }

  if (course.geometryStatus === 'SURVEYED') {
    return 'SURVEYED'
  }

  return 'PROTOTYPE'
}

function App() {
  const [mode, setMode] = useState<SimulatorMode>('ROUND')
  const [course, setCourse] = useState<GolfCourse>(initialCourse)
  const [round, setRound] = useState(() => createRound(initialCourse))
  const roundHole =
    course.holes[Math.min(round.currentHoleIndex, course.holes.length - 1)]
  const activeHole = mode === 'ROUND' ? roundHole : drivingRangeHole

  const [shot, setShot] = useState<ShotData | null>(null)
  const [currentLie, setCurrentLie] = useState<SurfaceType>('TEE')
  const [ballPosition, setBallPosition] = useState<ShotPosition>(
    startPositionFor(roundHole)
  )
  const [resetPosition, setResetPosition] = useState<ShotPosition>(
    startPositionFor(roundHole)
  )
  const [remainingYards, setRemainingYards] = useState(
    remainingYardsFor(roundHole, startPositionFor(roundHole))
  )
  const [aimTarget, setAimTarget] = useState<AimTarget>(
    initialAimFor(roundHole)
  )
  const [selectedClubId, setSelectedClubId] = useState('driver')
  const [clubMenuOpen, setClubMenuOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(true)
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
  const [lastShotSnapshot, setLastShotSnapshot] =
    useState<LastShotSnapshot | null>(null)
  const [lastHazard, setLastHazard] = useState<string | null>(null)
  const [roundSettings, setRoundSettings] = useState<RoundSettings>(
    DEFAULT_ROUND_SETTINGS
  )
  const [showRoundSetup, setShowRoundSetup] = useState(true)

  const shotInProgress =
    ballPhase === 'FLIGHT' ||
    ballPhase === 'LANDING' ||
    ballPhase === 'ROLLING'

  const recommendedClub = useMemo(
    () => recommendClubFromBag(
      remainingYards,
      currentLie === 'GREEN'
    ),
    [remainingYards, currentLie]
  )
  const selectedClub = findClubById(selectedClubId)
  const greenDistances = useMemo(
    () => getGreenDistances(activeHole, ballPosition),
    [activeHole, ballPosition]
  )
  const hazardDistances = useMemo(
    () => getHazardDistances(activeHole, ballPosition),
    [activeHole, ballPosition]
  )

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
  const showScorecard =
    mode === 'ROUND' && (holeComplete || round.complete)
  const canAdvance =
    mode === 'ROUND' &&
    holeComplete &&
    !round.complete &&
    round.currentHoleIndex < course.holes.length - 1

  const completionSummary = completedScore
    ? isSkippedScore(completedScore)
      ? 'SKIPPED · N/A'
      : completedScore.status === 'MAX'
        ? `MAX SCORE · ${completedScore.strokes}`
        : `${scoreLabel(relativeToPar)} · ${completedScore.strokes + completedScore.penalties}`
    : `${scoreLabel(relativeToPar)} · ${strokes + penalties}`

  useEffect(() => {
    function handleAimKey(event: KeyboardEvent) {
      if (
        shotInProgress ||
        holeComplete ||
        showRoundSetup ||
        (event.key !== 'a' &&
          event.key !== 'A' &&
          event.key !== 'd' &&
          event.key !== 'D' &&
          event.key !== 'ArrowLeft' &&
          event.key !== 'ArrowRight')
      ) {
        return
      }

      event.preventDefault()
      const left =
        event.key === 'a' ||
        event.key === 'A' ||
        event.key === 'ArrowLeft'
      setAimTarget((target) =>
        moveAimTarget(target, left ? -4 : 4)
      )
    }

    window.addEventListener('keydown', handleAimKey)
    return () => window.removeEventListener('keydown', handleAimKey)
  }, [shotInProgress, holeComplete, showRoundSetup])

  function resetForHole(hole: GolfHole) {
    const position = startPositionFor(hole)
    const yards = remainingYardsFor(hole, position)
    const recommendation = recommendClubFromBag(yards, false)

    setShot(null)
    setCurrentLie('TEE')
    setBallPosition(position)
    setResetPosition(position)
    setRemainingYards(yards)
    setAimTarget(defaultAimTarget(hole, position, yards))
    setSelectedClubId(recommendation.id)
    setStrokes(0)
    setPenalties(0)
    setHoleComplete(false)
    setCompletedScore(null)
    setLastShotSnapshot(null)
    setLastHazard(null)
    setCameraPreference('AUTO')
    setBallPhase('ADDRESS')
    setResetToken((value) => value + 1)
  }

  function switchMode(nextMode: SimulatorMode) {
    if (shotInProgress || nextMode === mode) return

    playUiCue()
    setMode(nextMode)
    setShowRoundSetup(false)
    resetForHole(
      nextMode === 'ROUND' ? roundHole : drivingRangeHole
    )
  }

  function startConfiguredRound() {
    const nextCourse = loadCourse(
      roundSettings.courseId,
      teeIdFromSettings(roundSettings)
    )
    const freshRound = createRound(nextCourse)

    playUiCue()
    setCourse(nextCourse)
    setRound(freshRound)
    setMode('ROUND')
    resetForHole(nextCourse.holes[0])
    setShowRoundSetup(false)
  }

  function takeTestShot() {
    if (shotInProgress) return
    if (mode === 'ROUND' && (holeComplete || round.complete)) return

    setLastShotSnapshot({
      position: { ...ballPosition },
      lie: currentLie,
      remainingYards,
      strokes,
      penalties,
      shot,
    })
    setLastHazard(null)

    const aimDirection = aimDirectionToTarget(
      ballPosition,
      aimTarget
    )

    const monitorShot =
      mode === 'ROUND' && currentLie === 'GREEN'
        ? createMockPutt(remainingYards, aimDirection)
        : createMockFullShot(
            remainingYards,
            aimDirection,
            selectedClub.defaultCarryYards
          )

    playShotCue()
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

    playHazardCue()
    setPenalties((value) => value + 1)
  }

  function handleShotResult(result: ShotResult) {
    setShot((current) => {
      if (!current || current.id !== result.id) return current
      return { ...current, ...result }
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
        resetForHole(drivingRangeHole)
      }
      return
    }

    if (result.penaltyStrokes) {
      playHazardCue()
      setPenalties((value) => value + result.penaltyStrokes!)
      setLastHazard(
        result.hazard === 'WATER'
          ? 'WATER · +1 · DROPPED AT LAST POSITION'
          : 'OUT OF BOUNDS · +1 · RETURNED TO LAST POSITION'
      )
    }

    const nextLie = result.lie ?? currentLie
    let nextPosition = ballPosition
    let nextRemaining = remainingYards

    if (result.finalPosition) {
      nextPosition = result.finalPosition
      nextRemaining = remainingYardsFor(
        activeHole,
        result.finalPosition
      )
      setBallPosition(result.finalPosition)
      setResetPosition(result.finalPosition)
      setRemainingYards(nextRemaining)
    }

    if (result.lie) {
      setCurrentLie(result.lie)
    }

    if (!result.holed) {
      const recommendation = recommendClubFromBag(
        nextRemaining,
        nextLie === 'GREEN'
      )
      setSelectedClubId(recommendation.id)
      setAimTarget(
        defaultAimTarget(activeHole, nextPosition, nextRemaining)
      )
      return
    }

    const completed: HoleScore = {
      hole: activeHole.number,
      par: activeHole.par,
      strokes,
      penalties,
      status: 'PLAYED',
    }

    playHoleCompleteCue()
    setHoleComplete(true)
    setRemainingYards(0)
    setCompletedScore(completed)
    setRound((current) => saveHoleScore(current, completed, course))
  }

  function mulliganLastShot() {
    if (
      !lastShotSnapshot ||
      shotInProgress ||
      holeComplete ||
      mode !== 'ROUND' ||
      !roundSettings.mulligans
    ) {
      return
    }

    playUiCue()
    setShot(lastShotSnapshot.shot)
    setBallPosition({ ...lastShotSnapshot.position })
    setResetPosition({ ...lastShotSnapshot.position })
    setCurrentLie(lastShotSnapshot.lie)
    setRemainingYards(lastShotSnapshot.remainingYards)
    setStrokes(lastShotSnapshot.strokes)
    setPenalties(lastShotSnapshot.penalties)
    setAimTarget(
      defaultAimTarget(
        activeHole,
        lastShotSnapshot.position,
        lastShotSnapshot.remainingYards
      )
    )
    setSelectedClubId(
      recommendClubFromBag(
        lastShotSnapshot.remainingYards,
        lastShotSnapshot.lie === 'GREEN'
      ).id
    )
    setLastShotSnapshot(null)
    setLastHazard(null)
    setResetToken((value) => value + 1)
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

    const noShotTaken = strokes === 0
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

    playHoleCompleteCue()
    setHoleComplete(true)
    setCompletedScore(skippedScore)
    setRound((current) =>
      saveHoleScore(current, skippedScore, course)
    )
  }

  function nextHole() {
    if (shotInProgress || !canAdvance) return

    const nextRound = advanceRound(round, course)
    const nextHoleData = course.holes[nextRound.currentHoleIndex]

    playUiCue()
    setRound(nextRound)
    resetForHole(nextHoleData)
  }

  function resetCurrentHole() {
    if (shotInProgress) return
    playUiCue()
    resetForHole(activeHole)
  }

  function resetRound() {
    if (shotInProgress) return
    playUiCue()
    setShowRoundSetup(true)
  }

  return (
    <main className="app">
      {showRoundSetup ? (
        <RoundSetup
          settings={roundSettings}
          onChange={setRoundSettings}
          onStart={startConfiguredRound}
          onClose={() => setShowRoundSetup(false)}
        />
      ) : null}

      <header className="app-header">
        <div>
          <h1>GolfSim</h1>
          <p>
            {mode === 'ROUND'
              ? `${course.name} · ${roundSettings.playerName} · ${roundSettings.tee} TEES`
              : 'Driving Range'}
          </p>
        </div>

        <div className="header-actions">
          {mode === 'ROUND' ? (
            <div className="course-status-chip">
              {courseStatusLabel(course)}
            </div>
          ) : null}
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
          <button
            className="mode-chip"
            onClick={() => setShowRoundSetup(true)}
            disabled={shotInProgress}
          >
            SETUP
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
            key={`${course.id}-${mode}-${activeHole.number}`}
            hole={activeHole}
            shot={shot}
            aimTarget={aimTarget}
            cameraPreference={cameraPreference}
            resetToken={resetToken}
            resetPosition={resetPosition}
            onBallPhaseChange={setBallPhase}
            onShotResult={handleShotResult}
          />

          {mode === 'ROUND' && !showRoundSetup ? (
            <HoleIntro course={course} hole={activeHole} />
          ) : null}

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
              value={
                mode === 'ROUND'
                  ? `${strokes + penalties}`
                  : `${rangeShots.length + 1}`
              }
            />
            <HudMetric label="FRONT" value={`${greenDistances.front} YD`} />
            <HudMetric label="PIN" value={`${greenDistances.pin} YD`} />
            <HudMetric label="BACK" value={`${greenDistances.back} YD`} />
            <HudMetric label="LIE" value={currentLie} />
            <HudMetric label="CLUB" value={selectedClub.shortName} />
          </div>

          {mapOpen ? (
            <div className="minimap-wrap">
              <HoleMiniMap
                hole={activeHole}
                ball={ballPosition}
                target={aimTarget}
              />
            </div>
          ) : null}

          <div className="aim-controls">
            <button
              onClick={() => setAimTarget((target) => moveAimTarget(target, -4))}
              disabled={shotInProgress || holeComplete}
            >
              ◀ AIM
            </button>
            <span>A / D</span>
            <button
              onClick={() => setAimTarget((target) => moveAimTarget(target, 4))}
              disabled={shotInProgress || holeComplete}
            >
              AIM ▶
            </button>
          </div>

          {lastHazard ? (
            <div className="hazard-alert">{lastHazard}</div>
          ) : null}

          {shot ? (
            <div className="shot-hud">
              <HudMetric
                label="BALL"
                value={`${shot.ballSpeed.toFixed(1)} MPH`}
              />
              <HudMetric
                label="CLUB"
                value={
                  shot.clubSpeed != null
                    ? `${shot.clubSpeed.toFixed(1)} MPH`
                    : '--'
                }
              />
              <HudMetric
                label="LAUNCH"
                value={`${shot.launchAngle.toFixed(1)}°`}
              />
              <HudMetric label="SPIN" value={`${shot.spinRate} RPM`} />
              <HudMetric
                label="CARRY"
                value={
                  shot.carry != null
                    ? `${Math.round(shot.carry)} YD`
                    : '--'
                }
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
            className="club-select-button"
            onClick={() => setClubMenuOpen((open) => !open)}
            disabled={shotInProgress}
          >
            <span>CLUB</span>
            <strong>{selectedClub.name}</strong>
            <small>
              {selectedClub.defaultCarryYards || 'PUTT'}{' '}
              {selectedClub.defaultCarryYards ? 'YD AVG' : ''}
            </small>
          </button>

          {clubMenuOpen ? (
            <div className="club-menu">
              {DEFAULT_BAG.map((club) => (
                <button
                  key={club.id}
                  className={
                    club.id === selectedClubId
                      ? 'club-option club-option-active'
                      : 'club-option'
                  }
                  onClick={() => {
                    playUiCue()
                    setSelectedClubId(club.id)
                    setClubMenuOpen(false)
                  }}
                >
                  <span>{club.shortName}</span>
                  <strong>{club.name}</strong>
                  <small>
                    {club.category === 'PUTTER'
                      ? 'PUTTER'
                      : `${club.defaultCarryYards} YD`}
                  </small>
                </button>
              ))}
            </div>
          ) : null}

          <div className="recommended-club">
            RECOMMENDED · <strong>{recommendedClub.shortName}</strong>
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

          <div className="distance-card">
            <div>
              <span>FRONT</span>
              <strong>{greenDistances.front}</strong>
            </div>
            <div>
              <span>PIN</span>
              <strong>{greenDistances.pin}</strong>
            </div>
            <div>
              <span>BACK</span>
              <strong>{greenDistances.back}</strong>
            </div>
          </div>

          {hazardDistances.length > 0 ? (
            <div className="hazard-distances">
              {hazardDistances.slice(0, 3).map((hazard) => (
                <div key={hazard.id}>
                  <span>{hazard.label}</span>
                  <strong>{hazard.carryYards} YD</strong>
                </div>
              ))}
            </div>
          ) : null}

          <div className="utility-actions">
            <button
              onClick={() => setMapOpen((open) => !open)}
              disabled={shotInProgress}
            >
              MAP {mapOpen ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() =>
                setCameraPreference((current) =>
                  current === 'AUTO' ? 'FREE' : 'AUTO'
                )
              }
              disabled={shotInProgress}
            >
              CAMERA {cameraPreference}
            </button>
          </div>

          {mode === 'ROUND' ? (
            <div className="utility-actions">
              <button
                onClick={mulliganLastShot}
                disabled={
                  !lastShotSnapshot ||
                  shotInProgress ||
                  holeComplete ||
                  !roundSettings.mulligans
                }
              >
                MULLIGAN
              </button>
              <button
                onClick={addPenalty}
                disabled={
                  holeComplete || round.complete || shotInProgress
                }
              >
                + PENALTY
              </button>
            </div>
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
              className="quiet-action"
              onClick={resetRound}
              disabled={shotInProgress}
            >
              ROUND SETUP
            </button>
          ) : null}

          {mode === 'ROUND' && course.sourceNote ? (
            <div className="course-source-note">
              <span>COURSE DATA</span>
              <small>{course.sourceNote}</small>
            </div>
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
                  <div
                    key={`${entry.id}-${index}`}
                    className="range-shot-row"
                  >
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
