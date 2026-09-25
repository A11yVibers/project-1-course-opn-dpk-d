import { useState } from 'react'
import { courses, getInstructors } from '../data/loadData.js'

export default function CourseCatalog({ onSelectCourse }) {
  const [query, setQuery] = useState('')
  const [instructorFilter, setInstructorFilter] = useState('all')

  const instructors = getInstructors()

  const filtered = courses.filter((course) => {
    const haystack =
      `${course.name} ${course.short_description} ${course.long_description}`.toLowerCase()
    const matchesQuery =
      query.trim() === '' || haystack.includes(query.trim().toLowerCase())
    const matchesInstructor =
      instructorFilter === 'all' || course.instructor_id === instructorFilter

    const matchesCategory = true

    return matchesQuery && matchesInstructor && matchesCategory
  })

  return (
    <main className="catalog">
      <section className="catalog-hero">
        <p className="eyebrow">History Curriculum</p>
        <h1>Explore the past,<br />one course at a time.</h1>
        <p className="hero-sub">
          Twelve courses spanning ancient civilizations to the modern age,
          taught by historians and enriched with primary materials.
        </p>
      </section>

      <section className="catalog-controls">
        <div className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search courses, topics, eras…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filter-row">
          <label className="filter-label">Instructor</label>
          <select
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
          >
            <option value="all">All instructors</option>
            {instructors.map((ins) => (
              <option key={ins.instructor_id} value={ins.instructor_id}>
                {ins.name}
              </option>
            ))}
          </select>
        </div>
        <div className="result-count">
          {filtered.length} course{filtered.length === 1 ? '' : 's'}
        </div>
      </section>

      <section className="course-grid">
        {filtered.map((course, idx) => (
          <CourseCard
            key={course.course_id}
            course={course}
            onSelect={() => onSelectCourse(course.course_id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            No courses match your search. Try a different keyword or clear the
            filters.
          </div>
        )}
      </section>
    </main>
  )
}

function CourseCard({ course, onSelect }) {
  return (
    <button className="course-card" onClick={onSelect}>
      <div className="card-image">
        <img src={course.image_url} alt={course.name} loading="lazy" />
        <span className="course-id">{course.course_id}</span>
      </div>
      <div className="card-body">
        <h2>{course.name}</h2>
        <p className="card-desc">{course.short_description}</p>
        <div className="card-meta">
          <span className="meta-chip">{course.number_of_weeks} weeks</span>
          <span className="meta-chip">{course.number_of_classes} classes</span>
          {course.instructor && (
            <span className="meta-instructor">
              <img
                src={course.instructor.photo_url}
                alt=""
                className="instructor-avatar"
              />
              {course.instructor.name}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}