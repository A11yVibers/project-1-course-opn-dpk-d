import { useEffect, useState } from 'react'
import Catalog from './components/Catalog.jsx'
import CoursePage from './components/CoursePage.jsx'

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  const parts = hash.split('/').filter(Boolean)
  if (parts[0] === 'course' && parts[1]) {
    return { view: 'course', courseId: parts[1] }
  }
  return { view: 'catalog', courseId: null }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigateToCourse = (courseId) => {
    window.location.hash = `#/course/${courseId}`
  }

  const navigateToCatalog = () => {
    window.location.hash = '#/'
  }

  return (
    <div className="app">
      <header className="site-header">
        <a className="brand" href="#/" onClick={navigateToCatalog}>
          <span className="brand__mark">H</span>
          <span className="brand__word">Historia</span>
        </a>
        <span className="brand__tagline">A digital library of the human past</span>
      </header>

      {route.view === 'course' ? (
        <CoursePage courseId={route.courseId} onBack={navigateToCatalog} />
      ) : (
        <Catalog onSelectCourse={navigateToCourse} />
      )}
    </div>
  )
}
