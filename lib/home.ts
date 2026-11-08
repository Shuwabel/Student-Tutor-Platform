import { parseISO } from 'date-fns'
import { progressPercent } from './selectors'
import type { Assignment, Course, Enrollment, LiveClass, Submission } from './types'

/** A student's enrolments joined to their courses, most recently enrolled first. */
export function activeEnrollments(courses: Course[], enrollments: Enrollment[], userId: string) {
  return enrollments
    .filter((e) => e.userId === userId)
    .map((e) => ({ enrollment: e, course: courses.find((c) => c.id === e.courseId) }))
    .filter((x): x is { enrollment: Enrollment; course: Course } => !!x.course)
    .sort((a, b) => b.enrollment.enrolledAt.localeCompare(a.enrollment.enrolledAt))
}

export function isFinished(course: Course, enrollment: Enrollment): boolean {
  return !!enrollment.completedAt || progressPercent(course, enrollment) === 100
}

/** Assignments the student has not handed in yet, soonest due first. */
export function dueAssignments(assignments: Assignment[], submissions: Submission[], courseIds: Set<string>, userId: string): Assignment[] {
  const handed = new Set(submissions.filter((s) => s.userId === userId).map((s) => s.assignmentId))
  return assignments
    .filter((a) => courseIds.has(a.courseId) && !handed.has(a.id))
    .sort((a, b) => parseISO(a.dueAt).getTime() - parseISO(b.dueAt).getTime())
}

export function upcomingClasses(classes: LiveClass[], now: Date, filter: (l: LiveClass) => boolean): LiveClass[] {
  const t = now.getTime() - 60 * 60 * 1000
  return classes
    .filter((l) => parseISO(l.startsAt).getTime() >= t && filter(l))
    .sort((a, b) => parseISO(a.startsAt).getTime() - parseISO(b.startsAt).getTime())
}
