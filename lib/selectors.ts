import type { Course, Enrollment, Lesson } from './types'

export function allLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons)
}

export function lessonCount(course: Course): number {
  return allLessons(course).length
}

export function courseMinutes(course: Course): number {
  return allLessons(course).reduce((n, l) => n + l.minutes, 0)
}

export function courseHours(course: Course): number {
  return Math.max(1, Math.round((courseMinutes(course) / 60) * 10) / 10)
}

/** Percent of lessons done, 0 to 100. */
export function progressPercent(course: Course, enrollment?: Enrollment): number {
  const total = lessonCount(course)
  if (!enrollment || total === 0) return 0
  const ids = new Set(allLessons(course).map((l) => l.id))
  const done = enrollment.completedLessons.filter((id) => ids.has(id)).length
  return Math.round((done / total) * 100)
}

/** The lesson to continue with: the first not yet completed, else the last one. */
export function nextLesson(course: Course, enrollment?: Enrollment): Lesson | undefined {
  const lessons = allLessons(course)
  if (lessons.length === 0) return undefined
  const done = new Set(enrollment?.completedLessons ?? [])
  return lessons.find((l) => !done.has(l.id)) ?? lessons[lessons.length - 1]
}

export function findLesson(course: Course, lessonId: string): { lesson: Lesson; moduleIndex: number; lessonIndex: number; flatIndex: number } | undefined {
  let flat = 0
  for (let mi = 0; mi < course.modules.length; mi++) {
    const lessons = course.modules[mi].lessons
    for (let li = 0; li < lessons.length; li++) {
      if (lessons[li].id === lessonId) return { lesson: lessons[li], moduleIndex: mi, lessonIndex: li, flatIndex: flat }
      flat++
    }
  }
  return undefined
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}
