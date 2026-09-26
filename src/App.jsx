import { useState } from 'react'
import Catalog from './components/Catalog.jsx'
import CoursePage from './components/CoursePage.jsx'
import { getCourse } from './data.js'

export default function App() {
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  const selectedCourse = selectedCourseId ? getCourse(selectedCourseId) : null

  return (
    <div className="app">
      <header className="site-header">
        <div className="site-header__inner">
          <button className="brand" onClick={() => setSelectedCourseId(null)}>
            <span className="brand__mark">⌘</span>
            <span className="brand__text">
              <strong>Timeline</strong>
              <small>History Learning</small>
            </span>
          </button>
          <nav className="site-nav">
            {selectedCourse ? (
              <button
                className="nav-link"
                onClick={() => setSelectedCourseId(null)}
              >
                ← Course Catalog
              </button>
            ) : (
              <span className="site-nav__label">A world of history, in one place</span>
            )}
          </nav>
        </div>
      </header>

      {selectedCourse ? (
        <CoursePage
          course={selectedCourse}
          onBack={() => setSelectedCourseId(null)}
        />
      ) : (
        <Catalog onSelectCourse={setSelectedCourseId} />
      )}
    </div>
  )
}