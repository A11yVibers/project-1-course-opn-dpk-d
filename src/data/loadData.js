import { parseCsv } from './parseCsv.js'

import coursesRaw from '../../project-assets/history_courses.csv?raw'
import classesRaw from '../../project-assets/history_classes.csv?raw'
import instructorsRaw from '../../project-assets/history_instructors.csv?raw'
import materialsRaw from '../../project-assets/course_materials.csv?raw'

import lecturePdfUrl from '../../project-assets/materials/silk_roads_class_01_lecture.pdf?url'
import lectureVideoUrl from '../../project-assets/materials/silk_roads_class_01_lecture.mp4?url'
import assignmentMdUrl from '../../project-assets/materials/silk_roads_class_02_assignment.md?url'
import assignmentMdRaw from '../../project-assets/materials/silk_roads_class_02_assignment.md?raw'

const LOCAL_FILE_URLS = {
  'materials/silk_roads_class_01_lecture.pdf': lecturePdfUrl,
  'materials/silk_roads_class_01_lecture.mp4': lectureVideoUrl,
  'materials/silk_roads_class_02_assignment.md': assignmentMdUrl,
}

const LOCAL_FILE_CONTENT = {
  'materials/silk_roads_class_02_assignment.md': assignmentMdRaw,
}

const instructors = parseCsv(instructorsRaw)
const instructorById = Object.fromEntries(
  instructors.map((i) => [i.instructor_id, i])
)

const rawCourses = parseCsv(coursesRaw).map((c) => ({
  ...c,
  number_of_classes: Number(c.number_of_classes),
  number_of_weeks: Number(c.number_of_weeks),
  instructor: instructorById[c.instructor_id] || null,
}))

const rawClasses = parseCsv(classesRaw).map((c) => ({
  ...c,
  week_number: Number(c.week_number),
}))

const rawMaterials = parseCsv(materialsRaw).map((m) => ({
  ...m,
  display_order: Number(m.display_order),
}))

function resolveMaterial(material) {
  const type = material.material_type
  const filePath = material.file_path

  if (type === 'youtube' && /^https?:\/\//.test(filePath)) {
    return { ...material, kind: 'youtube', url: filePath }
  }

  if (LOCAL_FILE_URLS[filePath]) {
    const url = LOCAL_FILE_URLS[filePath]
    let content = null
    if (LOCAL_FILE_CONTENT[filePath] !== undefined) {
      content = LOCAL_FILE_CONTENT[filePath]
    }
    return { ...material, kind: type, url, content }
  }

  return { ...material, kind: type, url: filePath }
}

const classes = rawClasses.map((cls) => {
  const classMaterials = rawMaterials
    .filter((m) => m.class_id === cls.class_id)
    .sort((a, b) => a.display_order - b.display_order)
    .map(resolveMaterial)

  return {
    ...cls,
    materials: classMaterials,
  }
})

const classMap = new Map()
for (const cls of classes) {
  if (!classMap.has(cls.course_id)) classMap.set(cls.course_id, [])
  classMap.get(cls.course_id).push(cls)
}

const courses = rawCourses.map((course) => {
  const courseClasses = (classMap.get(course.course_id) || []).sort(
    (a, b) =>
      a.week_number - b.week_number ||
      a.date.localeCompare(b.date) ||
      a.class_id.localeCompare(b.class_id)
  )
  return {
    ...course,
    classes: courseClasses,
  }
})

courses.sort((a, b) => a.course_id.localeCompare(b.course_id))

export function getCourses() {
  return courses
}

export function getCourse(courseId) {
  return courses.find((c) => c.course_id === courseId) || null
}

export function getInstructors() {
  return instructors
}

export { courses }