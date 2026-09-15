import { useState } from 'react'
import {
  getCourse,
  getClasses,
  getMaterials,
  getInstructor,
  getMaterialView,
  materialLabel,
  formatDate,
} from '../data.js'
import MaterialViewer from './MaterialViewer.jsx'
import {
  ArrowLeftIcon,
  ChevronIcon,
  PdfIcon,
  VideoIcon,
  DocumentIcon,
  ImageIcon,
  CloseIcon,
  BookIcon,
  ClockIcon,
  CalendarIcon,
  ExternalLinkIcon,
} from './Icons.jsx'

function MaterialIcon({ type, className }) {
  if (type === 'pdf') return <PdfIcon className={className} />
  if (type === 'video') return <VideoIcon className={className} />
  if (type === 'youtube') return <VideoIcon className={className} />
  return <DocumentIcon className={className} />
}

function MaterialLink({ material, active, onSelect }) {
  const view = getMaterialView(material)
  const opensInViewer = view.kind !== 'file'
  return (
    <button
      type="button"
      className={`material-link${active ? ' is-active' : ''}`}
      onClick={() => onSelect(material)}
    >
      <MaterialIcon type={material.material_type} className="material-link__icon" />
      <span className="material-link__text">
        <span className="material-link__title">{material.material_title}</span>
        <span className="material-link__tag">{materialLabel(material.material_type)}</span>
      </span>
      {opensInViewer ? (
        <ChevronIcon direction="right" className="material-link__chevron" />
      ) : (
        <ExternalLinkIcon className="material-link__chevron" />
      )}
    </button>
  )
}

function Syllabus({ classes, activeMaterialId, onSelectMaterial }) {
  return (
    <table className="syllabus-table">
      <thead>
        <tr>
          <th className="col-week">Week</th>
          <th className="col-date">Date</th>
          <th className="col-content">Class Content</th>
        </tr>
      </thead>
      <tbody>
        {classes.map((cls) => {
          const materials = getMaterials(cls.class_id)
          return (
            <tr key={cls.class_id}>
              <td className="col-week" data-label="Week">
                {cls.week_number}
              </td>
              <td className="col-date" data-label="Date">
                {formatDate(cls.date)}
              </td>
              <td className="col-content" data-label="Class Content">
                <h4 className="class-title">{cls.class_name}</h4>
                {materials.length > 0 ? (
                  <ul className="material-list">
                    {materials.map((material) => (
                      <li key={material.material_id}>
                        <MaterialLink
                          material={material}
                          active={activeMaterialId === material.material_id}
                          onSelect={onSelectMaterial}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-materials">Materials coming soon</p>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function CoursePage({ courseId, onBack }) {
  const course = getCourse(courseId)
  const instructor = getInstructor(course)
  const classes = getClasses(courseId)

  const [collapsed, setCollapsed] = useState(false)
  const [selection, setSelection] = useState(null)

  if (!course) {
    return (
      <div className="course-page">
        <button className="back-link" onClick={onBack}>
          <ArrowLeftIcon /> Back to catalog
        </button>
        <p>Course not found.</p>
      </div>
    )
  }

  const selectedView = selection ? getMaterialView(selection) : null

  return (
    <div className={`course-page${collapsed ? ' is-collapsed' : ''}`}>
      <header className="course-header">
        <button className="back-link" onClick={onBack}>
          <ArrowLeftIcon /> Catalog
        </button>
        <div className="course-header__title">
          <span className="eyebrow">{course.course_id}</span>
          <h1>{course.name}</h1>
        </div>
        {instructor && (
          <div className="course-header__instructor">
            <img src={instructor.photo_url} alt="" className="instructor-avatar" />
            <div className="course-header__instructor-meta">
              <span className="instructor-name">{instructor.name}</span>
              <span className="instructor-email">{instructor.email}</span>
            </div>
          </div>
        )}
      </header>

      <div className="course-layout">
        <aside className="course-sidebar">
          <div className="sidebar-scroll">
            <section className="course-info card">
              <div className="course-info__media">
                <img src={course.image_url} alt={course.name} />
              </div>
              <div className="course-info__stats">
                <span>
                  <ClockIcon /> {course.number_of_weeks} weeks
                </span>
                <span>
                  <CalendarIcon /> {course.number_of_classes} classes
                </span>
              </div>
              <p className="course-info__short">{course.short_description}</p>
              <p className="course-info__long">{course.long_description}</p>
              {instructor && (
                <div className="course-info__instructor">
                  <img src={instructor.photo_url} alt="" className="instructor-avatar" />
                  <div>
                    <span className="instructor-name">{instructor.name}</span>
                    <a className="instructor-email" href={`mailto:${instructor.email}`}>
                      {instructor.email}
                    </a>
                  </div>
                </div>
              )}
            </section>

            <section className="syllabus-section card">
              <div className="section-heading">
                <BookIcon className="section-heading__icon" />
                <h2>Syllabus</h2>
              </div>
              <Syllabus
                classes={classes}
                activeMaterialId={selection ? selection.material_id : null}
                onSelectMaterial={(material) => setSelection(material)}
              />
            </section>
          </div>
        </aside>

        <main className="course-viewer">
          <div className="viewer-toolbar">
            <button
              className="collapse-toggle"
              onClick={() => setCollapsed((v) => !v)}
              title={collapsed ? 'Expand course details' : 'Collapse course details'}
            >
              <ChevronIcon direction={collapsed ? 'right' : 'down'} />
              <span>{collapsed ? 'Show details' : 'Hide details'}</span>
            </button>
            {selection && (
              <div className="viewer-context">
                <span className="viewer-context__label">Now viewing</span>
                <span className="viewer-context__title">{selection.material_title}</span>
                <button className="viewer-close" onClick={() => setSelection(null)} title="Back to course overview">
                  <CloseIcon />
                </button>
              </div>
            )}
          </div>

          {selection ? (
            <div className="viewer-pane">
              <MaterialViewer view={selectedView} material={selection} />
            </div>
          ) : (
            <div className="viewer-pane viewer-pane--overview">
              <figure className="overview-figure">
                <img src={course.image_url} alt={course.name} />
                <figcaption className="overview-caption">
                  <ImageIcon className="overview-caption__icon" />
                  <span>Course overview — select a material from the syllabus to begin reading.</span>
                </figcaption>
              </figure>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
