import { useState } from 'react'
import { getClasses, getMaterials } from '../data.js'
import { MaterialViewer } from './MaterialViewer.jsx'

export default function CoursePage({ course }) {
  const classList = getClasses(course.course_id)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [infoOpen, setInfoOpen] = useState(true)
  const [syllabusOpen, setSyllabusOpen] = useState(true)

  const materialsByClass = {}
  for (const c of classList) {
    materialsByClass[c.class_id] = getMaterials(c.class_id)
  }

  const weekOf = (date) => new Date(date + 'T00:00:00')
  const formatDate = (date) =>
    weekOf(date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  const totalMaterials = classList.reduce(
    (sum, c) => sum + (materialsByClass[c.class_id]?.length || 0),
    0
  )

  const weeks = [...new Set(classList.map((c) => c.week_number))]

  return (
    <div className="course-page">
      <div className="course-sidebar">
        <div className="sidebar-section">
          <button
            className="sidebar-toggle"
            onClick={() => setInfoOpen((v) => !v)}
            aria-expanded={infoOpen}
          >
            <span>Course Information</span>
            <span className="chevron">{infoOpen ? '▾' : '▸'}</span>
          </button>
          {infoOpen && (
            <div className="sidebar-content">
              <h1 className="course-title">{course.name}</h1>
              <p className="course-short">{course.short_description}</p>
              <p className="course-long">{course.long_description}</p>

              <dl className="course-facts">
                <div>
                  <dt>Instructor</dt>
                  <dd>
                    {course.instructor ? (
                      <span className="instructor-chip instructor-chip--block">
                        <img
                          src={course.instructor.photo_url}
                          alt={course.instructor.name}
                        />
                        {course.instructor.name}
                      </span>
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{course.number_of_weeks} weeks</dd>
                </div>
                <div>
                  <dt>Classes</dt>
                  <dd>{course.number_of_classes} sessions</dd>
                </div>
                <div>
                  <dt>Materials</dt>
                  <dd>{totalMaterials} resources</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="sidebar-section sidebar-section--syllabus">
          <button
            className="sidebar-toggle"
            onClick={() => setSyllabusOpen((v) => !v)}
            aria-expanded={syllabusOpen}
          >
            <span>Syllabus</span>
            <span className="chevron">{syllabusOpen ? '▾' : '▸'}</span>
          </button>
          {syllabusOpen && (
            <div className="sidebar-content">
              <table className="syllabus-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Date</th>
                    <th>Class Content</th>
                  </tr>
                </thead>
                <tbody>
                  {classList.map((c) => {
                    const mats = materialsByClass[c.class_id] || []
                    return (
                      <tr key={c.class_id}>
                        <td className="syllabus-week">{c.week_number}</td>
                        <td className="syllabus-date">{formatDate(c.date)}</td>
                        <td>
                          <div className="class-title">{c.class_name}</div>
                          {mats.length > 0 && (
                            <ul className="material-list">
                              {mats.map((m) => (
                                <li key={m.material_id}>
                                  <button
                                    className="material-item"
                                    onClick={() => setSelectedMaterial(m)}
                                  >
                                    <span
                                      className={`material-dot material-dot--${m.kind}`}
                                    />
                                    <span className="material-name">
                                      {m.material_title}
                                    </span>
                                    <span className="material-type">
                                      {m.label}
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="course-viewer">
        <div className="viewer-header">
          <div className="viewer-header__title">
            {selectedMaterial ? (
              <>
                <span className="viewer-eyebrow">{selectedMaterial.label}</span>
                <h2>{selectedMaterial.material_title}</h2>
              </>
            ) : (
              <>
                <span className="viewer-eyebrow">Course Overview</span>
                <h2>{course.name}</h2>
              </>
            )}
          </div>
        </div>

        {selectedMaterial ? (
          <MaterialViewer material={selectedMaterial} />
        ) : (
          <div className="course-hero">
            <img src={course.image_url} alt={course.name} />
            <div className="course-hero__overlay">
              <h2>{course.name}</h2>
              <p>{course.short_description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}