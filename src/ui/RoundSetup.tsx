import { listCourses } from '../course/CourseLoader'
import type { RoundSettings } from '../gameplay/RoundSettings'

export function RoundSetup({
  settings,
  onChange,
  onStart,
  onClose,
}: {
  settings: RoundSettings
  onChange: (settings: RoundSettings) => void
  onStart: () => void
  onClose: () => void
}) {
  const courses = listCourses()
  const selectedCourse = courses.find(
    (course) => course.id === settings.courseId
  ) ?? courses[0]

  return (
    <div className="round-setup-backdrop">
      <section className="round-setup-panel">
        <div className="round-setup-title">
          <div>
            <span>ROUND SETUP</span>
            <h2>{selectedCourse.name}</h2>
            <small>
              {selectedCourse.location} · {selectedCourse.geometryStatus.replace('_', ' ')}
            </small>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <div className="round-setup-grid">
          <label className="round-setup-wide">
            <span>COURSE</span>
            <select
              value={settings.courseId}
              onChange={(event) =>
                onChange({
                  ...settings,
                  courseId: event.target.value as RoundSettings['courseId'],
                })
              }
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>PLAYER</span>
            <input
              value={settings.playerName}
              onChange={(event) =>
                onChange({ ...settings, playerName: event.target.value })
              }
            />
          </label>

          <label>
            <span>TEES</span>
            <select
              value={settings.tee}
              onChange={(event) =>
                onChange({
                  ...settings,
                  tee: event.target.value as RoundSettings['tee'],
                })
              }
            >
              <option>BLACK</option>
              <option>BLUE</option>
              <option>WHITE</option>
              <option>GOLD</option>
            </select>
          </label>

          <label>
            <span>PIN</span>
            <select
              value={settings.pinDifficulty}
              onChange={(event) =>
                onChange({
                  ...settings,
                  pinDifficulty: event.target.value as RoundSettings['pinDifficulty'],
                })
              }
            >
              <option>EASY</option>
              <option>MEDIUM</option>
              <option>HARD</option>
              <option>RANDOM</option>
            </select>
          </label>

          <label>
            <span>WIND</span>
            <select
              value={settings.wind}
              onChange={(event) =>
                onChange({
                  ...settings,
                  wind: event.target.value as RoundSettings['wind'],
                })
              }
            >
              <option>CALM</option>
              <option>REALISTIC</option>
              <option>RANDOM</option>
            </select>
          </label>

          <label>
            <span>PUTTING</span>
            <select
              value={settings.putting}
              onChange={(event) =>
                onChange({
                  ...settings,
                  putting: event.target.value as RoundSettings['putting'],
                })
              }
            >
              <option value="ENABLED">ENABLED</option>
              <option value="AUTO_PUTT">AUTO PUTT</option>
              <option value="GIMME">GIMME</option>
            </select>
          </label>

          <label>
            <span>GIMME</span>
            <select
              value={settings.gimmeFeet}
              onChange={(event) =>
                onChange({
                  ...settings,
                  gimmeFeet: Number(event.target.value),
                })
              }
            >
              {[3, 5, 6, 8, 10].map((feet) => (
                <option key={feet} value={feet}>{feet} FT</option>
              ))}
            </select>
          </label>
        </div>

        {settings.courseId === 'plumas-lake' ? (
          <p className="course-data-note">
            Real scorecard yardages. Hole geometry is a mapped approximation until surveyed GPS tracing is available.
          </p>
        ) : (
          <p className="course-data-note">
            Development course for engine testing. Not a real-world layout.
          </p>
        )}

        <label className="round-toggle">
          <input
            type="checkbox"
            checked={settings.mulligans}
            onChange={(event) =>
              onChange({ ...settings, mulligans: event.target.checked })
            }
          />
          <span>ALLOW MULLIGANS</span>
        </label>

        <button className="primary-action" onClick={onStart}>
          START ROUND
        </button>
      </section>
    </div>
  )
}
