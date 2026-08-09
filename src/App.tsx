import {
  useState,
} from 'react'

import './App.css'

import GolfScene from './components/simulator/GolfScene'

import type {
  ShotData,
  ShotResult,
} from './types/shot'

function App() {
  const [
    shot,
    setShot,
  ] =
    useState<ShotData | null>(
      null
    )

  function testShot() {
    const newShot: ShotData =
      {
        id: Date.now(),

        ballSpeed:
          Math.round(
            (
              135 +
              Math.random() *
                28
            ) *
              10
          ) / 10,

        clubSpeed:
          Math.round(
            (
              92 +
              Math.random() *
                19
            ) *
              10
          ) / 10,

        launchAngle:
          Math.round(
            (
              8 +
              Math.random() *
                11
            ) *
              10
          ) / 10,

        launchDirection:
          Math.round(
            (
              -8 +
              Math.random() *
                16
            ) *
              10
          ) / 10,

        spinRate:
          Math.round(
            1800 +
              Math.random() *
                2200
          ),

        spinAxis:
          Math.round(
            (
              -16 +
              Math.random() *
                32
            ) *
              10
          ) / 10,

        carry: null,

        totalDistance: null,

        lie: 'TEE',
      }

    setShot(newShot)
  }

  function handleShotResult(
    result: ShotResult
  ) {
    setShot(
      (current) => {
        if (
          !current ||
          current.id !==
            result.id
        ) {
          return current
        }

        return {
          ...current,
          ...result,
        }
      }
    )
  }

  return (
    <main className="app">
      <header>
        <div>
          <h1>
            GolfSim
          </h1>

          <p>
            Plumas Lake Golf
            & Country Club
          </p>
        </div>

        <div className="connection">
          <span className="status-dot" />

          TEST MODE
        </div>
      </header>

      <section className="hole-info">
        <div>
          <span>
            HOLE
          </span>

          <strong>
            1
          </strong>
        </div>

        <div>
          <span>
            PAR
          </span>

          <strong>
            4
          </strong>
        </div>

        <div>
          <span>
            BLUE TEES
          </span>

          <strong>
            409 YDS
          </strong>
        </div>

        <div>
          <span>
            CURRENT LIE
          </span>

          <strong>
            {shot?.lie ??
              'TEE'}
          </strong>
        </div>
      </section>

      <section className="simulator">
        <div className="course-3d">
          <GolfScene
            shot={shot}
            onShotResult={
              handleShotResult
            }
          />
        </div>

        <aside className="shot-panel">
          <h2>
            SHOT DATA
          </h2>

          <Stat
            label="Ball Speed"
            value={
              shot
                ? shot
                    .ballSpeed
                    .toFixed(
                      1
                    )
                : '--'
            }
            unit="mph"
          />

          <Stat
            label="Club Speed"
            value={
              shot
                ? shot
                    .clubSpeed
                    .toFixed(
                      1
                    )
                : '--'
            }
            unit="mph"
          />

          <Stat
            label="Launch"
            value={
              shot
                ? shot
                    .launchAngle
                    .toFixed(
                      1
                    )
                : '--'
            }
            unit="°"
          />

          <Stat
            label="Direction"
            value={
              shot
                ? shot
                    .launchDirection
                    .toFixed(
                      1
                    )
                : '--'
            }
            unit="°"
          />

          <Stat
            label="Spin"
            value={
              shot
                ? shot
                    .spinRate
                    .toString()
                : '--'
            }
            unit="rpm"
          />

          <Stat
            label="Spin Axis"
            value={
              shot
                ? shot
                    .spinAxis
                    .toFixed(
                      1
                    )
                : '--'
            }
            unit="°"
          />

          <Stat
            label="Carry"
            value={
              shot?.carry !=
              null
                ? Math.round(
                    shot.carry
                  ).toString()
                : '--'
            }
            unit="yd"
          />

          <Stat
            label="Total"
            value={
              shot
                ?.totalDistance !=
              null
                ? Math.round(
                    shot
                      .totalDistance
                  ).toString()
                : '--'
            }
            unit="yd"
          />

          <button
            onClick={
              testShot
            }
          >
            TEST SHOT
          </button>
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
      <span>
        {label}
      </span>

      <strong>
        {value}

        <small>
          {unit}
        </small>
      </strong>
    </div>
  )
}

export default App