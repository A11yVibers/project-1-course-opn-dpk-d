import { useState } from 'react'
import { courses } from './data/loadData.js'
import CourseCatalog from './components/CourseCatalog.jsx'
import CoursePage from './components/CoursePage.jsx'

export default function App() {
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  const selectedCourse = selectedCourseId
    ? courses.find((c) => c.course_id === selectedCourseId)
    : null

  return (
    <div className="app">
      <header className="app-header">
        <button
          className="brand"
          onClick={() => setSelectedCourseId(null)}
          aria-label="Back to course catalog"
        >
          <span className="brand-mark">Hist</span>
          <span className="brand-text">
            Histora<span className="brand-accent">·</span>Library
          </span>
        </button>
        <div className="header-tagline">The Digital Archive of Human History</div>
      </header>

      {!selectedCourse ? (
        <CourseCatalog onSelectCourse={setSelectedCourseId} />
      ) : (
        <CoursePage
          course={selectedCourse}
          onBack={() => setSelectedCourseId(null)}
        />
      )}
    </div>
  )
}