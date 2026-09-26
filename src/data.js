import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'

import pdfLecture from '../project-assets/materials/silk_roads_class_01_lecture.pdf'
import videoLecture from '../project-assets/materials/silk_roads_class_01_lecture.mp4'
import assignmentMd from '../project-assets/materials/silk_roads_class_02_assignment.md?raw'

function parseCsv(text) {
  const rows = []
  let row = []
  let cur = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(cur)
      cur = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cur)
      cur = ''
      if (row.length > 1 || row[0] !== '') rows.push(row)
      row = []
    } else {
      cur += c
    }
  }

  if (cur !== '' || row.length) {
    row.push(cur)
    if (row.length > 1 || row[0] !== '') rows.push(row)
  }

  const headers = rows[0]
  return rows.slice(1).map((r) => {
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h.trim()] = (r[idx] ?? '').trim()
    })
    return obj
  })
}

// Asset URL resolution for local material files
const localMaterialFiles = {
  'materials/silk_roads_class_01_lecture.pdf': pdfLecture,
  'materials/silk_roads_class_01_lecture.mp4': videoLecture,
}

const localMaterialText = {
  'materials/silk_roads_class_02_assignment.md': assignmentMd,
}

const courses = parseCsv(coursesCsv)
const classes = parseCsv(classesCsv)
const instructors = parseCsv(instructorsCsv)
const materials = parseCsv(materialsCsv)

const instructorsById = Object.fromEntries(
  instructors.map((i) => [i.instructor_id, i])
)

const materialTypeMeta = {
  pdf: { label: 'PDF Reading' },
  video: { label: 'Lecture Video' },
  youtube: { label: 'Lecture Video' },
  md: { label: 'Assignment' },
}

function resolveMaterial(material) {
  const { file_path: filePath, material_type: type } = material
  const meta = materialTypeMeta[type] || { label: 'Resource' }

  if (type === 'youtube') {
    return { ...material, ...meta, url: filePath, kind: 'youtube' }
  }
  if (filePath in localMaterialFiles) {
    return { ...material, ...meta, url: localMaterialFiles[filePath], kind: type }
  }
  if (filePath in localMaterialText) {
    return {
      ...material,
      ...meta,
      content: localMaterialText[filePath],
      kind: 'md',
    }
  }
  return { ...material, ...meta, url: filePath, kind: 'link' }
}

const materialsByClass = {}
for (const m of materials) {
  ;(materialsByClass[m.class_id] ||= []).push(resolveMaterial(m))
}
for (const key of Object.keys(materialsByClass)) {
  materialsByClass[key].sort((a, b) => a.display_order - b.display_order)
}

const classesByCourse = {}
for (const c of classes) {
  ;(classesByCourse[c.course_id] ||= []).push(c)
}
for (const key of Object.keys(classesByCourse)) {
  classesByCourse[key].sort((a, b) => {
    if (a.week_number !== b.week_number)
      return Number(a.week_number) - Number(b.week_number)
    return a.date.localeCompare(b.date)
  })
}

const enrichedCourses = courses.map((course) => ({
  ...course,
  instructor: instructorsById[course.instructor_id] || null,
  classList: classesByCourse[course.course_id] || [],
}))

export function getCourses() {
  return enrichedCourses
}

export function getCourse(courseId) {
  return enrichedCourses.find((c) => c.course_id === courseId) || null
}

export function getClasses(courseId) {
  return classesByCourse[courseId] || []
}

export function getMaterials(classId) {
  return materialsByClass[classId] || []
}

export function getInstructor(instructorId) {
  return instructorsById[instructorId] || null
}

export { materialTypeMeta }