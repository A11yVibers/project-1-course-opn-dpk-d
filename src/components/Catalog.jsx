import { useMemo, useState } from 'react'
import { getCourses } from '../data.js'

const SUBJECTS = [
  'Ancient',
  'Medieval',
  'Early Modern',
  'Modern',
  'Global',
]

function guessSubjects(name, description) {
  const text = `${name} ${description}`.toLowerCase()
  const tags = []
  if (/(ancient|egypt|greece|rome|roman|silk road|south asia|han)/.test(text))
    tags.push('Ancient')
  if (
    /(medieval|middle ages|sultanate|mughal|crusade|feudal|black death)/.test(
      text
    )
  )
    tags.push('Medieval')
  if (/(renaissance|exploration|explorers|reformation|early modern)/.test(text))
    tags.push('Early Modern')
  if (
    /(revolution|industrial|world war|wwi|wwii|napoleon|columbian)/.test(text)
  )
    tags.push('Modern')
  if (/(silk road|global|exploration|empire|exchange|network)/.test(text))
    tags.push('Global')
  return tags.length ? tags : ['Global']
}

export default function Catalog({ onSelectCourse }) {
  const courses = getCourses()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All')

  const courseSubjects = useMemo(() => {
    const map = {}
    for (const c of courses) map[c.course_id] = guessSubjects(c.name, c.short_description)
    return map
  }, [courses])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.short_description.toLowerCase().includes(q) ||
        c.long_description.toLowerCase().includes(q) ||
        (c.instructor?.name.toLowerCase().includes(q) ?? false)
      const matchesSubject =
        subject === 'All' || courseSubjects[c.course_id].includes(subject)
      return matchesQuery && matchesSubject
    })
  }, [courses, query, subject, courseSubjects])

  return (
    <main className="catalog">
      <section className="catalog-hero">
        <h1>The History Library</h1>
        <p>
          Twelve carefully curated courses spanning three thousand years of
          human history. Search, explore, and begin learning.
        </p>
      </section>

      <div className="catalog-toolbar">
        <div className="search-box">
          <span className="search-box__icon">⌕</span>
          <input
            type="text"
            placeholder="Search courses, topics, instructors…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="search-box__clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div className="filter-tabs">
          {['All', ...SUBJECTS].map((s) => (
            <button
              key={s}
              className={`filter-tab ${subject === s ? 'is-active' : ''}`}
              onClick={() => setSubject(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-meta">
        {filtered.length} {filtered.length === 1 ? 'course' : 'courses'}
      </div>

      <section className="course-grid">
        {filtered.map((course) => (
          <CourseCard
            key={course.course_id}
            course={course}
            subjects={courseSubjects[course.course_id]}
            onSelect={() => onSelectCourse(course.course_id)}
          />
        ))}
      </section>

      {filtered.length === 0 && (
        <div className="catalog-empty">
          <p>No courses match your search.</p>
          <button
            onClick={() => {
              setQuery('')
              setSubject('All')
            }}
          >
            Reset filters
          </button>
        </div>
      )}
    </main>
  )
}

function CourseCard({ course, subjects, onSelect }) {
  return (
    <button className="course-card" onClick={onSelect}>
      <div className="course-card__image">
        <img
          src={course.image_url}
          alt={course.name}
          loading="lazy"
        />
        <span className="course-card__weeks">
          {course.number_of_weeks} weeks · {course.number_of_classes} classes
        </span>
      </div>
      <div className="course-card__body">
        <div className="course-card__tags">
          {subjects.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>
        <h3>{course.name}</h3>
        <p>{course.short_description}</p>
        <div className="course-card__footer">
          {course.instructor && (
            <span className="instructor-chip">
              <img
                src={course.instructor.photo_url}
                alt={course.instructor.name}
              />
              {course.instructor.name}
            </span>
          )}
          <span className="course-card__cta">View course →</span>
        </div>
      </div>
    </button>
  )
}