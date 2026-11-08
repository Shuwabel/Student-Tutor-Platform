'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import { buildSeed, DEMO_ACCOUNTS } from './seed'
import { allLessons } from './selectors'
import type {
  Assignment,
  Attempt,
  Certificate,
  Course,
  Enrollment,
  LiveClass,
  Material,
  Opportunity,
  Quiz,
  Resume,
  Role,
  Submission,
  User,
} from './types'

export interface DataState {
  seeded: boolean
  currentUserId: string | null
  users: User[]
  courses: Course[]
  quizzes: Quiz[]
  attempts: Attempt[]
  enrollments: Enrollment[]
  assignments: Assignment[]
  submissions: Submission[]
  liveClasses: LiveClass[]
  materials: Material[]
  certificates: Certificate[]
  opportunities: Opportunity[]
  savedOpportunities: Record<string, string[]>
  resumes: Record<string, Resume>
}

export interface Actions {
  /** Fills the store with sample data the first time the app runs. */
  ensureSeeded: () => void
  /** Wipes everything back to the sample data. */
  resetDemo: () => void

  login: (userId: string) => void
  loginDemo: (role: Role) => void
  logout: () => void
  register: (input: { name: string; email: string; role: Role }) => User
  updateProfile: (userId: string, patch: Partial<Pick<User, 'name' | 'headline' | 'bio' | 'subjects'>>) => void
  removeUser: (userId: string) => void
  setUserRole: (userId: string, role: Role) => void

  /** Create or replace a course (matched by id). */
  saveCourse: (course: Course) => void
  deleteCourse: (courseId: string) => void
  setPublished: (courseId: string, published: boolean) => void

  enroll: (courseId: string) => void
  unenroll: (courseId: string) => void
  completeLesson: (courseId: string, lessonId: string) => void
  uncompleteLesson: (courseId: string, lessonId: string) => void
  setLastLesson: (courseId: string, lessonId: string) => void

  saveQuiz: (quiz: Quiz) => void
  deleteQuiz: (quizId: string) => void
  submitAttempt: (input: { quizId: string; answers: number[]; durationSec: number }) => Attempt | null

  saveAssignment: (assignment: Assignment) => void
  deleteAssignment: (assignmentId: string) => void
  submitAssignment: (input: { assignmentId: string; text: string; link?: string }) => void
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void

  saveLiveClass: (liveClass: LiveClass) => void
  deleteLiveClass: (liveClassId: string) => void

  saveMaterial: (material: Material) => void
  deleteMaterial: (materialId: string) => void

  toggleSavedOpportunity: (opportunityId: string) => void
  saveResume: (resume: Resume) => void
}

export type Store = DataState & Actions

export const uid = (prefix: string) =>
  `${prefix}-${(globalThis.crypto?.randomUUID?.() ?? `${Date.now()}${Math.random().toString(36).slice(2)}`).replace(/-/g, '').slice(0, 10)}`

const empty: DataState = {
  seeded: false,
  currentUserId: null,
  users: [],
  courses: [],
  quizzes: [],
  attempts: [],
  enrollments: [],
  assignments: [],
  submissions: [],
  liveClasses: [],
  materials: [],
  certificates: [],
  opportunities: [],
  savedOpportunities: {},
  resumes: {},
}

/** Issues a certificate when every lesson is done and every published quiz of the course is passed. */
export function evaluateCompletion(state: DataState, userId: string, courseId: string): Pick<DataState, 'enrollments' | 'certificates'> {
  const course = state.courses.find((c) => c.id === courseId)
  const enrollment = state.enrollments.find((e) => e.userId === userId && e.courseId === courseId)
  const user = state.users.find((u) => u.id === userId)
  if (!course || !enrollment || !user) return { enrollments: state.enrollments, certificates: state.certificates }

  const lessons = allLessons(course)
  const done = new Set(enrollment.completedLessons)
  const lessonsDone = lessons.length > 0 && lessons.every((l) => done.has(l.id))
  const quizzes = state.quizzes.filter((q) => q.courseId === courseId && q.published && q.questions.length > 0)
  const best = (quizId: string) => Math.max(0, ...state.attempts.filter((a) => a.userId === userId && a.quizId === quizId).map((a) => a.score))
  const passedAll = quizzes.every((q) => state.attempts.some((a) => a.userId === userId && a.quizId === q.id && a.passed))
  const complete = lessonsDone && passedAll

  if (!complete) {
    return {
      enrollments: enrollment.completedAt
        ? state.enrollments.map((e) => (e === enrollment ? { ...e, completedAt: undefined } : e))
        : state.enrollments,
      certificates: state.certificates,
    }
  }

  const completedAt = enrollment.completedAt ?? new Date().toISOString()
  const enrollments = state.enrollments.map((e) => (e === enrollment ? { ...e, completedAt } : e))
  if (state.certificates.some((c) => c.userId === userId && c.courseId === courseId)) return { enrollments, certificates: state.certificates }

  const tutor = state.users.find((u) => u.id === course.tutorId)
  const scores = quizzes.map((q) => best(q.id))
  const certificate: Certificate = {
    id: uid('cert'),
    userId,
    courseId,
    studentName: user.name,
    courseTitle: course.title,
    courseCode: course.code,
    tutorName: tutor?.name ?? 'Course tutor',
    hours: Math.max(1, Math.round((lessons.reduce((n, l) => n + l.minutes, 0) / 60) * 10) / 10),
    score: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : undefined,
    issuedAt: completedAt,
  }
  return { enrollments, certificates: [certificate, ...state.certificates] }
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...empty,

      ensureSeeded: () => {
        if (!get().seeded) set({ ...buildSeed(new Date()), seeded: true })
      },
      resetDemo: () => set({ ...buildSeed(new Date()), seeded: true, currentUserId: null }),

      login: (userId) => set({ currentUserId: userId }),
      loginDemo: (role) => {
        const id = DEMO_ACCOUNTS[role]
        if (get().users.some((u) => u.id === id)) set({ currentUserId: id })
      },
      logout: () => set({ currentUserId: null }),
      register: ({ name, email, role }) => {
        const existing = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
        if (existing) {
          set({ currentUserId: existing.id })
          return existing
        }
        const user: User = { id: uid('user'), name: name.trim(), email: email.trim(), role, createdAt: new Date().toISOString() }
        set((s) => ({ users: [...s.users, user], currentUserId: user.id }))
        return user
      },
      updateProfile: (userId, patch) => set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)) })),
      removeUser: (userId) =>
        set((s) => ({
          users: s.users.filter((u) => u.id !== userId),
          enrollments: s.enrollments.filter((e) => e.userId !== userId),
          attempts: s.attempts.filter((a) => a.userId !== userId),
          submissions: s.submissions.filter((x) => x.userId !== userId),
          currentUserId: s.currentUserId === userId ? null : s.currentUserId,
        })),
      setUserRole: (userId, role) => set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)) })),

      saveCourse: (course) =>
        set((s) => ({ courses: s.courses.some((c) => c.id === course.id) ? s.courses.map((c) => (c.id === course.id ? course : c)) : [course, ...s.courses] })),
      deleteCourse: (courseId) =>
        set((s) => {
          const quizIds = new Set(s.quizzes.filter((q) => q.courseId === courseId).map((q) => q.id))
          const assignmentIds = new Set(s.assignments.filter((a) => a.courseId === courseId).map((a) => a.id))
          return {
            courses: s.courses.filter((c) => c.id !== courseId),
            enrollments: s.enrollments.filter((e) => e.courseId !== courseId),
            quizzes: s.quizzes.filter((q) => q.courseId !== courseId),
            attempts: s.attempts.filter((a) => !quizIds.has(a.quizId)),
            assignments: s.assignments.filter((a) => a.courseId !== courseId),
            submissions: s.submissions.filter((x) => !assignmentIds.has(x.assignmentId)),
            liveClasses: s.liveClasses.filter((l) => l.courseId !== courseId),
            materials: s.materials.filter((m) => m.courseId !== courseId),
          }
        }),
      setPublished: (courseId, published) => set((s) => ({ courses: s.courses.map((c) => (c.id === courseId ? { ...c, published } : c)) })),

      enroll: (courseId) => {
        const userId = get().currentUserId
        if (!userId || get().enrollments.some((e) => e.userId === userId && e.courseId === courseId)) return
        set((s) => ({ enrollments: [...s.enrollments, { userId, courseId, enrolledAt: new Date().toISOString(), completedLessons: [] }] }))
      },
      unenroll: (courseId) => {
        const userId = get().currentUserId
        if (!userId) return
        set((s) => ({ enrollments: s.enrollments.filter((e) => !(e.userId === userId && e.courseId === courseId)) }))
      },
      completeLesson: (courseId, lessonId) => {
        const userId = get().currentUserId
        if (!userId) return
        set((s) => {
          const enrollments = s.enrollments.map((e) =>
            e.userId === userId && e.courseId === courseId && !e.completedLessons.includes(lessonId)
              ? { ...e, completedLessons: [...e.completedLessons, lessonId], lastLessonId: lessonId }
              : e,
          )
          return evaluateCompletion({ ...s, enrollments }, userId, courseId)
        })
      },
      uncompleteLesson: (courseId, lessonId) => {
        const userId = get().currentUserId
        if (!userId) return
        set((s) => {
          const enrollments = s.enrollments.map((e) =>
            e.userId === userId && e.courseId === courseId ? { ...e, completedLessons: e.completedLessons.filter((id) => id !== lessonId) } : e,
          )
          return evaluateCompletion({ ...s, enrollments }, userId, courseId)
        })
      },
      setLastLesson: (courseId, lessonId) => {
        const userId = get().currentUserId
        if (!userId) return
        set((s) => ({ enrollments: s.enrollments.map((e) => (e.userId === userId && e.courseId === courseId ? { ...e, lastLessonId: lessonId } : e)) }))
      },

      saveQuiz: (quiz) => set((s) => ({ quizzes: s.quizzes.some((q) => q.id === quiz.id) ? s.quizzes.map((q) => (q.id === quiz.id ? quiz : q)) : [quiz, ...s.quizzes] })),
      deleteQuiz: (quizId) => set((s) => ({ quizzes: s.quizzes.filter((q) => q.id !== quizId), attempts: s.attempts.filter((a) => a.quizId !== quizId) })),
      submitAttempt: ({ quizId, answers, durationSec }) => {
        const state = get()
        const userId = state.currentUserId
        const quiz = state.quizzes.find((q) => q.id === quizId)
        if (!userId || !quiz || quiz.questions.length === 0) return null
        const correct = quiz.questions.filter((q, i) => answers[i] === q.answerIndex).length
        const score = Math.round((correct / quiz.questions.length) * 100)
        const attempt: Attempt = { id: uid('att'), quizId, userId, answers, score, passed: score >= quiz.passMark, takenAt: new Date().toISOString(), durationSec }
        set((s) => {
          const withAttempt = { ...s, attempts: [attempt, ...s.attempts] }
          return { attempts: withAttempt.attempts, ...evaluateCompletion(withAttempt, userId, quiz.courseId) }
        })
        return attempt
      },

      saveAssignment: (assignment) =>
        set((s) => ({ assignments: s.assignments.some((a) => a.id === assignment.id) ? s.assignments.map((a) => (a.id === assignment.id ? assignment : a)) : [assignment, ...s.assignments] })),
      deleteAssignment: (assignmentId) =>
        set((s) => ({ assignments: s.assignments.filter((a) => a.id !== assignmentId), submissions: s.submissions.filter((x) => x.assignmentId !== assignmentId) })),
      submitAssignment: ({ assignmentId, text, link }) => {
        const userId = get().currentUserId
        if (!userId) return
        set((s) => {
          const existing = s.submissions.find((x) => x.assignmentId === assignmentId && x.userId === userId)
          const submittedAt = new Date().toISOString()
          if (existing) {
            return { submissions: s.submissions.map((x) => (x === existing ? { ...x, text, link, submittedAt, grade: undefined, feedback: undefined, gradedAt: undefined } : x)) }
          }
          return { submissions: [{ id: uid('sub'), assignmentId, userId, text, link, submittedAt }, ...s.submissions] }
        })
      },
      gradeSubmission: (submissionId, grade, feedback) =>
        set((s) => ({ submissions: s.submissions.map((x) => (x.id === submissionId ? { ...x, grade, feedback, gradedAt: new Date().toISOString() } : x)) })),

      saveLiveClass: (liveClass) =>
        set((s) => ({ liveClasses: s.liveClasses.some((l) => l.id === liveClass.id) ? s.liveClasses.map((l) => (l.id === liveClass.id ? liveClass : l)) : [liveClass, ...s.liveClasses] })),
      deleteLiveClass: (liveClassId) => set((s) => ({ liveClasses: s.liveClasses.filter((l) => l.id !== liveClassId) })),

      saveMaterial: (material) =>
        set((s) => ({ materials: s.materials.some((m) => m.id === material.id) ? s.materials.map((m) => (m.id === material.id ? material : m)) : [material, ...s.materials] })),
      deleteMaterial: (materialId) => set((s) => ({ materials: s.materials.filter((m) => m.id !== materialId) })),

      toggleSavedOpportunity: (opportunityId) => {
        const userId = get().currentUserId
        if (!userId) return
        set((s) => {
          const mine = s.savedOpportunities[userId] ?? []
          return { savedOpportunities: { ...s.savedOpportunities, [userId]: mine.includes(opportunityId) ? mine.filter((x) => x !== opportunityId) : [...mine, opportunityId] } }
        })
      },
      saveResume: (resume) => set((s) => ({ resumes: { ...s.resumes, [resume.userId]: resume } })),
    }),
    { name: 'student-tutor:v1', version: 1 },
  ),
)

/** True once the browser copy of the store has loaded. Render a skeleton until then. */
export function useHydrated(): boolean {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const finish = () => {
      useStore.getState().ensureSeeded()
      setReady(true)
    }
    if (useStore.persist.hasHydrated()) finish()
    else return useStore.persist.onFinishHydration(finish)
  }, [])
  return ready
}

export function useCurrentUser(): User | null {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null)
}
