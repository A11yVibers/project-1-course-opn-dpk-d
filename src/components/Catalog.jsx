import { useMemo, useState } from 'react'
import { courses, getInstructor } from '../data.js'
import { SearchIcon, BookIcon, ClockIcon, CalendarIcon, ChevronIcon } from './Icons.jsx'

const instructorList = [
  { id: '', name: 'All instructors' },
  { id: 'INS01', name: 'Dr. Leila Rahman' },
  { id: 'INS02', name: 'Prof. Marcus Hale' },
  { id: 'INS03', name: 'Dr. Sofia Kovács' },
  { id: 'INS04', name: 'Dr. Arjun Mehta' },
]

export default function Catalog({ onSelectCourse }) {
  const [query, setQuery] = useState('')
  const [instructor, setInstructor] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return courses.filter((course) => {
      const instructorData = getInstructor(course)
      const haystack = [
        course.name,
        course.short_description,
        course.long_description,
        course.course_id,
        instructorData ? instructorData.name : '',
      ]
        .join(' ')
        .toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      const matchesInstructor = !instructor || course.instructor_id === instructor
      return matchesQuery && matchesInstructor
    })
  }, [query, instructor])

  return (
    <div className="catalog">
      <header className="catalog-hero">
        <div className="catalog-hero__inner">
          <p className="eyebrow">Historia · Online History Courses</p>
          <h1 className="catalog-title">Explore the Human Past</h1>
          <p className="catalog-subtitle">
            A curated catalog of twelve history courses — from the pharaohs of the
            Nile to the connected worlds of the Silk Roads.
          </p>
          <div className="catalog-tools">
            <label className="search-box">
              <SearchIcon className="search-icon" />
              <input
                type="search"
                placeholder="Search courses, themes, or instructors…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="filter-box">
              <span className="filter-label">Instructor</span>
              <span className="select-wrap">
                <select
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                >
                  {instructorList.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <ChevronIcon className="select-chevron" />
              </span>
            </label>
          </div>
        </div>
      </header>

      <section className="catalog-grid-section">
        <div className="catalog-meta">
          <span>
            {filtered.length} course{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <BookIcon className="empty-icon" />
            <h2>No courses found</h2>
            <p>Try adjusting your search or clearing the instructor filter.</p>
          </div>
        ) : (
          <div className="course-grid">
            {filtered.map((course) => {
              const instructorData = getInstructor(course)
              return (
                <article
                  key={course.course_id}
                  className="course-card"
                  onClick={() => onSelectCourse(course.course_id)}
                >
                  <div className="course-card__media">
                    <img
                      src={course.image_url}
                      alt={course.name}
                      loading="lazy"
                    />
                    <span className="course-card__id">{course.course_id}</span>
                  </div>
                  <div className="course-card__body">
                    <h2 className="course-card__title">{course.name}</h2>
                    {instructorData && (
                      <div className="course-card__instructor">
                        <img
                          src={instructorData.photo_url}
                          alt=""
                          className="instructor-avatar"
                        />
                        <span>{instructorData.name}</span>
                      </div>
                    )}
                    <p className="course-card__desc">{course.short_description}</p>
                    <div className="course-card__meta">
                      <span>
                        <ClockIcon /> {course.number_of_weeks} weeks
                      </span>
                      <span>
                        <CalendarIcon /> {course.number_of_classes} classes
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
