import Papa from 'papaparse'

import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'

const markdownModules = import.meta.glob('../project-assets/materials/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

const assetModules = import.meta.glob('../project-assets/materials/*.{pdf,mp4}', {
  eager: true,
  import: 'default',
})

function parseCsv(text) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })
  return result.data
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const rawCourses = parseCsv(coursesCsv)
const rawClasses = parseCsv(classesCsv)
const rawInstructors = parseCsv(instructorsCsv)
const rawMaterials = parseCsv(materialsCsv)

export const instructors = Object.fromEntries(
  rawInstructors.map((instructor) => [instructor.instructor_id, instructor])
)

export const courses = rawCourses.map((course) => ({
  ...course,
  number_of_classes: toNumber(course.number_of_classes),
  number_of_weeks: toNumber(course.number_of_weeks),
}))

const classesByCourse = {}
for (const cls of rawClasses) {
  const courseId = cls.course_id
  if (!classesByCourse[courseId]) classesByCourse[courseId] = []
  classesByCourse[courseId].push({
    ...cls,
    week_number: toNumber(cls.week_number),
  })
}

for (const courseId of Object.keys(classesByCourse)) {
  classesByCourse[courseId].sort((a, b) => {
    if (a.week_number !== b.week_number) return a.week_number - b.week_number
    return a.date.localeCompare(b.date)
  })
}

const materialsByClass = {}
for (const material of rawMaterials) {
  const classId = material.class_id
  if (!materialsByClass[classId]) materialsByClass[classId] = []
  materialsByClass[classId].push({
    ...material,
    display_order: toNumber(material.display_order),
  })
}

for (const classId of Object.keys(materialsByClass)) {
  materialsByClass[classId].sort((a, b) => a.display_order - b.display_order)
}

const MATERIAL_LABELS = {
  pdf: 'PDF Reading',
  video: 'Lecture Video',
  youtube: 'Video Lecture',
  md: 'Assignment',
}

export function materialLabel(type) {
  return MATERIAL_LABELS[type] || 'Resource'
}

function toYouTubeEmbed(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}

function resolveMaterialFile(filePath) {
  const fullPath = `../project-assets/${filePath}`
  return assetModules[fullPath] || null
}

export function getMaterialView(material) {
  const type = material.material_type
  if (type === 'youtube') {
    return { kind: 'youtube', url: toYouTubeEmbed(material.file_path) }
  }
  if (type === 'md') {
    const fullPath = `../project-assets/${material.file_path}`
    return { kind: 'markdown', content: markdownModules[fullPath] || '' }
  }
  const url = resolveMaterialFile(material.file_path)
  if (type === 'pdf') return { kind: 'pdf', url }
  if (type === 'video') return { kind: 'video', url }
  return { kind: 'file', url }
}

export function getCourse(courseId) {
  return courses.find((course) => course.course_id === courseId)
}

export function getClasses(courseId) {
  return classesByCourse[courseId] || []
}

export function getMaterials(classId) {
  return materialsByClass[classId] || []
}

export function getInstructor(course) {
  return instructors[course.instructor_id] || null
}

export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function getWeekLabel(weekNumber) {
  return `Week ${weekNumber}`
}
