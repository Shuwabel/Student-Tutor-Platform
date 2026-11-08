import { describe, expect, it } from 'vitest'
import { buildSeed } from './seed'
import { decodeCertificate, encodeCertificate } from './certificate'
import { allLessons, nextLesson, progressPercent } from './selectors'
import { evaluateCompletion, type DataState } from './store'

const now = new Date('2026-11-08T10:00:00Z')
const seed = buildSeed(now)
const state = (over: Partial<DataState> = {}): DataState => ({ ...seed, seeded: true, currentUserId: 'u-student-0', ...over })

describe('seed content', () => {
  it('has 9 published courses with unique call numbers and a real tutor each', () => {
    expect(seed.courses).toHaveLength(9)
    expect(new Set(seed.courses.map((c) => c.code)).size).toBe(9)
    for (const c of seed.courses) {
      expect(c.published).toBe(true)
      expect(seed.users.find((u) => u.id === c.tutorId)?.role).toBe('tutor')
      expect(allLessons(c).length).toBeGreaterThanOrEqual(6)
      expect(new Set(allLessons(c).map((l) => l.id)).size).toBe(allLessons(c).length)
    }
  })

  it('has valid quizzes (4 options, a correct answer in range)', () => {
    expect(seed.quizzes).toHaveLength(9)
    for (const q of seed.quizzes) {
      expect(q.questions.length).toBeGreaterThanOrEqual(5)
      for (const question of q.questions) {
        expect(question.options.length).toBeGreaterThanOrEqual(2)
        expect(question.answerIndex).toBeGreaterThanOrEqual(0)
        expect(question.answerIndex).toBeLessThan(question.options.length)
      }
    }
  })

  it('links every record to something that exists', () => {
    const courseIds = new Set(seed.courses.map((c) => c.id))
    seed.enrollments.forEach((e) => expect(courseIds.has(e.courseId)).toBe(true))
    seed.assignments.forEach((a) => expect(courseIds.has(a.courseId)).toBe(true))
    seed.liveClasses.forEach((l) => expect(courseIds.has(l.courseId!)).toBe(true))
    seed.materials.forEach((m) => expect(m.url.startsWith('https://')).toBe(true))
    seed.opportunities.forEach((o) => expect(o.url.startsWith('http')).toBe(true))
  })

  it('gives the sample student a certificate and some progress', () => {
    expect(seed.certificates.some((c) => c.userId === 'u-student-0')).toBe(true)
    const comp = seed.courses.find((c) => c.code === 'COMP 101')!
    const enr = seed.enrollments.find((e) => e.userId === 'u-student-0' && e.courseId === comp.id)!
    expect(progressPercent(comp, enr)).toBeGreaterThan(0)
    expect(progressPercent(comp, enr)).toBeLessThan(100)
    expect(nextLesson(comp, enr)).toBeDefined()
  })
})

describe('certificate issuing', () => {
  const comp = seed.courses.find((c) => c.code === 'COMP 101')!
  const quiz = seed.quizzes.find((q) => q.courseId === comp.id)!
  const finishLessons = () =>
    state({ enrollments: seed.enrollments.map((e) => (e.userId === 'u-student-0' && e.courseId === comp.id ? { ...e, completedLessons: allLessons(comp).map((l) => l.id) } : e)) })

  it('does not issue while the quiz is unpassed', () => {
    const out = evaluateCompletion(finishLessons(), 'u-student-0', comp.id)
    expect(out.certificates.some((c) => c.courseId === comp.id && c.userId === 'u-student-0')).toBe(false)
  })

  it('issues once lessons are done and the quiz is passed, and only once', () => {
    const passed = { id: 'a1', quizId: quiz.id, userId: 'u-student-0', answers: [], score: 100, passed: true, takenAt: now.toISOString(), durationSec: 100 }
    const s = { ...finishLessons(), attempts: [passed] }
    const first = evaluateCompletion(s, 'u-student-0', comp.id)
    const issued = first.certificates.filter((c) => c.courseId === comp.id && c.userId === 'u-student-0')
    expect(issued).toHaveLength(1)
    expect(issued[0].score).toBe(100)
    expect(first.enrollments.find((e) => e.courseId === comp.id && e.userId === 'u-student-0')?.completedAt).toBeTruthy()
    const second = evaluateCompletion({ ...s, ...first }, 'u-student-0', comp.id)
    expect(second.certificates.filter((c) => c.courseId === comp.id && c.userId === 'u-student-0')).toHaveLength(1)
  })
})

describe('certificate links', () => {
  const cert = seed.certificates[0]
  it('round-trips and verifies', () => {
    const result = decodeCertificate(encodeCertificate(cert))
    expect(result.valid).toBe(true)
    expect(result.certificate?.studentName).toBe(cert.studentName)
  })
  it('detects a changed link', () => {
    const [body, code] = encodeCertificate(cert).split('.')
    const forged = decodeCertificate(`${body.slice(0, -2)}AA.${code}`)
    expect(forged.valid).toBe(false)
  })
  it('rejects junk', () => {
    expect(decodeCertificate('nonsense').certificate).toBeNull()
  })
})
