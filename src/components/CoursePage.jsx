import { useState } from 'react'
import MaterialViewer from './MaterialViewer.jsx'

export default function CoursePage({ course, onBack }) {
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [activeMaterial, setActiveMaterial] = useState(null)

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr + 'T00:00:00')
    if (Number.isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const weeks = groupByWeek(course.classes)

  return (
    <main className={`course-page ${leftCollapsed ? 'collapsed' : ''}`}>
      <aside className="course-sidebar">
        <button className="back-link" onClick={onBack}>
          ← All courses
        </button>

        {!leftCollapsed && (
          <div className="sidebar-content">
            <section className="course-info">
              <div className="course-head-img">
                <img src={course.image_url} alt={course.name} />
              </div>
              <p className="eyebrow">{course.course_id}</p>
              <h1>{course.name}</h1>
              <p className="course-long-desc">{course.long_description}</p>

              <dl className="course-facts">
                <div>
                  <dt>Duration</dt>
                  <dd>{course.number_of_weeks} weeks</dd>
                </div>
                <div>
                  <dt>Classes</dt>
                  <dd>{course.number_of_classes} sessions</dd>
                </div>
              </dl>

              {course.instructor && (
                <div className="instructor-card">
                  <img
                    src={course.instructor.photo_url}
                    alt={course.instructor.name}
                  />
                  <div>
                    <div className="instructor-name">{course.instructor.name}</div>
                    <a
                      className="instructor-email"
                      href={`mailto:${course.instructor.email}`}
                    >
                      {course.instructor.email}
                    </a>
                  </div>
                </div>
              )}
            </section>

            <section className="syllabus">
              <h2>Syllabus</h2>
              <div className="syllabus-hint">Select a class to view its materials</div>
              {weeks.map(({ week, classes }) => (
                <div className="week-group" key={week}>
                  <div className="week-head">Week {week}</div>
                  {classes.map((cls) => (
                    <ClassRow
                      key={cls.class_id}
                      cls={cls}
                      formatDate={formatDate}
                      activeMaterial={activeMaterial}
                      onSelectMaterial={setActiveMaterial}
                    />
                  ))}
                </div>
              ))}
            </section>
          </div>
        )}
      </aside>

      <button
        className="collapse-toggle"
        onClick={() => setLeftCollapsed((v) => !v)}
        aria-label={leftCollapsed ? 'Expand course panel' : 'Collapse course panel'}
        title={leftCollapsed ? 'Expand' : 'Collapse'}
      >
        {leftCollapsed ? '»' : '«'}
      </button>

      <section className="material-pane">
        {activeMaterial ? (
          <MaterialViewer material={activeMaterial} />
        ) : (
          <div className="default-viewer">
            <img src={course.image_url} alt={course.name} className="default-image" />
            <div className="default-overlay">
              <h2>{course.name}</h2>
              <p>Select a class material from the syllabus to begin reading it here.</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

function groupByWeek(classes) {
  const map = new Map()
  for (const cls of classes) {
    if (!map.has(cls.week_number)) map.set(cls.week_number, [])
    map.get(cls.week_number).push(cls)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([week, classes]) => ({ week, classes }))
}

function ClassRow({ cls, formatDate, activeMaterial, onSelectMaterial }) {
  return (
    <div className="class-row">
      <div className="class-header">
        <span className="class-date">{formatDate(cls.date)}</span>
        <span className="class-title">{cls.class_name}</span>
      </div>
      {cls.materials.length > 0 ? (
        <ul className="material-list">
          {cls.materials.map((mat) => {
            const isActive = activeMaterial && activeMaterial.material_id === mat.material_id
            return (
              <li key={mat.material_id}>
                <button
                  className={`material-link ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectMaterial(mat)}
                >
                  <span className="material-dot" />
                  {mat.material_title}
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="no-materials">No materials listed</div>
      )}
    </div>
  )
}