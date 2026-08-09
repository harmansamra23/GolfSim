import GolfScene from './components/simulator/GolfScene'
import { useState } from 'react'
import './App.css'

type ShotData = {
  ballSpeed: number
  clubSpeed: number
  launchAngle: number
  launchDirection: number
  spinRate: number
  carry: number
}

function App() {
  const [shot, setShot] = useState<ShotData | null>(null)

  function testShot() {
    setShot({
      ballSpeed: 148.7,
      clubSpeed: 101.2,
      launchAngle: 13.4,
      launchDirection: 2.1,
      spinRate: 2380,
      carry: 251,
    })
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
      <GolfScene />
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