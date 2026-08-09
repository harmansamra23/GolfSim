import GolfScene from './components/simulator/GolfScene'
import { useState } from 'react'
import './App.css'

type ShotData = {
  id: number
  ballSpeed: number
  clubSpeed: number
  launchAngle: number
  launchDirection: number
  spinRate: number
  spinAxis: number
  carry: number
}

function App() {
  const [shot, setShot] = useState<ShotData | null>(null)

  function testShot() {
  const newShot: ShotData = {
    id: Date.now(),

    ballSpeed:
      Math.round((135 + Math.random() * 25) * 10) / 10,

    clubSpeed:
      Math.round((92 + Math.random() * 18) * 10) / 10,

    launchAngle:
      Math.round((9 + Math.random() * 10) * 10) / 10,

    launchDirection:
      Math.round((-7 + Math.random() * 14) * 10) / 10,

    spinRate:
      Math.round(1900 + Math.random() * 2200),

    spinAxis:
      Math.round((-15 + Math.random() * 30) * 10) / 10,

    carry:
      Math.round(215 + Math.random() * 65),
  }

  setShot(newShot)
}

  return (
    <main className="app">
      <header>
        <div>
          <h1>GolfSim</h1>
          <p>Plumas Lake Golf & Country Club</p>
        </div>

        <div className="connection">
          <span className="status-dot"></span>
          R10 Simulator
        </div>
      </header>

      <section className="hole-info">
        <div>
          <span>HOLE</span>
          <strong>1</strong>
        </div>

        <div>
          <span>PAR</span>
          <strong>4</strong>
        </div>

        <div>
          <span>BLUE TEES</span>
          <strong>409 YDS</strong>
        </div>
      </section>

      <section className="simulator">
        <div className="course-3d">
      
      <GolfScene shot={shot} />
      </div>

        <aside className="shot-panel">
          <h2>SHOT DATA</h2>

          <Stat
            label="Ball Speed"
            value={shot ? shot.ballSpeed.toFixed(1) : '--'}
            unit="mph"
          />

          <Stat
            label="Club Speed"
            value={shot ? shot.clubSpeed.toFixed(1) : '--'}
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
            value={shot ? shot.carry.toString() : '--'}
            unit="yd"
          />

          <button onClick={testShot}>TEST SHOT</button>
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
        {value} <small>{unit}</small>
      </strong>
    </div>
  )
}

export default App