import coursesA from '@/data/seed/courses-A.json'
import coursesB from '@/data/seed/courses-B.json'
import coursesC from '@/data/seed/courses-C.json'
import opportunitiesSeed from '@/data/seed/opportunities.json'
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
  SeedCourse,
  Submission,
  User,
} from './types'
import type { DataState } from './store'

/** One-click demo sign-ins. */
export const DEMO_ACCOUNTS = {
  student: 'u-student-0',
  tutor: 'u-tutor-0',
  admin: 'u-admin',
} as const

const slug = (code: string) => code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const addDays = (from: Date, days: number, hour = 10) => {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

const TUTORS: { name: string; headline: string; subjects: string[]; bio: string }[] = [
  { name: 'Ngozi Eze', headline: 'Computing lecturer', subjects: ['Computing', 'Study skills'], bio: 'Teaches programming and study technique to first-year students.' },
  { name: 'Tunde Adebayo', headline: 'Web developer and finance tutor', subjects: ['Computing', 'Business'], bio: 'Builds websites for small businesses and teaches money basics.' },
  { name: 'Amina Yusuf', headline: 'Data analyst and speaking coach', subjects: ['Data', 'Communication'], bio: 'Turns spreadsheets into stories and helps nervous speakers.' },
  { name: 'Kofi Mensah', headline: 'Maths and English tutor', subjects: ['Mathematics', 'English'], bio: 'Secondary and university tutor focused on clear explanations.' },
  { name: 'Femi Ojo', headline: 'Physics teacher', subjects: ['Science'], bio: 'Makes mechanics feel like everyday life.' },
]

const STUDENTS = ['Amara Okafor', 'Chidi Nwosu', 'Lina Haddad', 'Samuel Kiptoo', 'Esther Mwangi', 'Ibrahim Sule']

export function buildSeed(now: Date): Omit<DataState, 'seeded' | 'currentUserId'> {
  const createdAt = addDays(now, -60)

  const users: User[] = [
    { id: 'u-admin', name: 'Grace Admin', email: 'admin@demo.studenttutor', role: 'admin', headline: 'Platform administrator', createdAt, sample: true },
    ...TUTORS.map<User>((t, i) => ({
      id: `u-tutor-${i}`,
      name: t.name,
      email: `${t.name.toLowerCase().replace(/[^a-z]+/g, '.')}@demo.studenttutor`,
      role: 'tutor',
      headline: t.headline,
      bio: t.bio,
      subjects: t.subjects,
      createdAt,
      sample: true,
    })),
    ...STUDENTS.map<User>((name, i) => ({
      id: `u-student-${i}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@demo.studenttutor`,
      role: 'student',
      createdAt: addDays(now, -30 - i),
      sample: true,
    })),
  ]

  const seeds = [...(coursesA as unknown as SeedCourse[]), ...(coursesB as unknown as SeedCourse[]), ...(coursesC as unknown as SeedCourse[])]

  const courses: Course[] = []
  const quizzes: Quiz[] = []
  const assignments: Assignment[] = []
  const materials: Material[] = []
  const liveClasses: LiveClass[] = []

  seeds.forEach((s, ci) => {
    const courseId = `course-${slug(s.code)}`
    const tutorId = `u-tutor-${s.tutor}`
    let lessonNo = 0
    courses.push({
      id: courseId,
      code: s.code,
      title: s.title,
      summary: s.summary,
      description: s.description,
      subject: s.subject,
      level: s.level,
      tutorId,
      outcomes: s.outcomes,
      tags: s.tags,
      published: true,
      createdAt: addDays(now, -50 + ci),
      modules: s.modules.map((m, mi) => ({
        id: `${courseId}-m${mi + 1}`,
        title: m.title,
        lessons: m.lessons.map((l) => ({ id: `${courseId}-l${++lessonNo}`, title: l.title, minutes: l.minutes, body: l.body, ...(l.videoId ? { videoId: l.videoId } : {}) })),
      })),
    })
    quizzes.push({
      id: `quiz-${slug(s.code)}`,
      courseId,
      title: s.quiz.title,
      description: s.quiz.description,
      minutes: s.quiz.minutes,
      passMark: s.quiz.passMark,
      published: true,
      questions: s.quiz.questions.map((q, qi) => ({ id: `quiz-${slug(s.code)}-q${qi + 1}`, ...q })),
    })
    assignments.push({
      id: `asg-${slug(s.code)}`,
      courseId,
      title: s.assignment.title,
      brief: s.assignment.brief,
      points: s.assignment.points,
      dueAt: addDays(now, s.assignment.dueInDays, 23),
    })
    s.materials.forEach((m, mi) => {
      materials.push({
        id: `mat-${slug(s.code)}-${mi + 1}`,
        courseId,
        title: m.title,
        description: m.description,
        kind: m.kind,
        url: m.url,
        subject: s.subject,
        addedBy: tutorId,
        addedAt: addDays(now, -40 + ci),
      })
    })
  })

  // Live classes on the next days, in public Jitsi rooms.
  const liveFor = (code: string, title: string, description: string, days: number, hour: number): LiveClass | null => {
    const course = courses.find((c) => c.code === code)
    if (!course) return null
    return {
      id: `live-${slug(code)}-${days}`,
      courseId: course.id,
      title,
      description,
      tutorId: course.tutorId,
      startsAt: addDays(now, days, hour),
      durationMin: 60,
      room: `StudentTutorDemo-${slug(code)}-${days}-${Math.abs(days * 7919)}`,
    }
  }
  ;[
    liveFor('COMP 101', 'Python office hours', 'Bring your questions about variables, loops and functions.', 1, 17),
    liveFor('MATH 105', 'Solving equations together', 'Live worked examples and a chance to ask about the homework.', 2, 16),
    liveFor('COMM 150', 'Speaking practice circle', 'Two-minute talks and kind feedback. Cameras optional.', 4, 18),
    liveFor('STUDY 100', 'Exam planning workshop', 'Build a revision timetable you can actually follow.', 6, 15),
    liveFor('DATA 120', 'Spot the misleading chart', 'We pull apart charts from the news.', 8, 17),
  ].forEach((l) => l && liveClasses.push(l))

  const opportunities: Opportunity[] = (opportunitiesSeed as unknown as Omit<Opportunity, 'id'>[]).map((o, i) => ({ id: `opp-${i + 1}`, ...o }))

  // Sample learning history so every screen has something to show.
  const enrollments: Enrollment[] = []
  const attempts: Attempt[] = []
  const submissions: Submission[] = []
  const certificates: Certificate[] = []

  const byCode = (code: string) => courses.find((c) => c.code === code)
  const lessonIds = (c: Course) => c.modules.flatMap((m) => m.lessons.map((l) => l.id))
  const enrol = (userIndex: number, code: string, doneCount: number, daysAgo: number) => {
    const c = byCode(code)
    if (!c) return
    const ids = lessonIds(c)
    const done = ids.slice(0, Math.min(doneCount, ids.length))
    enrollments.push({
      userId: `u-student-${userIndex}`,
      courseId: c.id,
      enrolledAt: addDays(now, -daysAgo),
      completedLessons: done,
      lastLessonId: done[done.length - 1],
    })
  }

  enrol(0, 'COMP 101', 3, 12)
  enrol(0, 'MATH 105', 1, 5)
  enrol(0, 'STUDY 100', 99, 20)
  enrol(1, 'COMP 101', 5, 15)
  enrol(1, 'WEB 110', 2, 9)
  enrol(2, 'COMM 150', 4, 11)
  enrol(2, 'FIN 140', 1, 6)
  enrol(3, 'MATH 105', 6, 14)
  enrol(3, 'SCI 130', 2, 8)
  enrol(4, 'ENG 120', 3, 10)
  enrol(5, 'DATA 120', 2, 7)

  // Amara finished Study Skills: a passed quiz, a graded assignment and a certificate.
  const study = byCode('STUDY 100')
  if (study) {
    const quiz = quizzes.find((q) => q.courseId === study.id)
    if (quiz) {
      const answers = quiz.questions.map((q, i) => (i === 0 ? (q.answerIndex + 1) % q.options.length : q.answerIndex))
      attempts.push({ id: 'att-seed-1', quizId: quiz.id, userId: 'u-student-0', answers, score: Math.round(((quiz.questions.length - 1) / quiz.questions.length) * 100), passed: true, takenAt: addDays(now, -6), durationSec: 410 })
    }
    const asg = assignments.find((a) => a.courseId === study.id)
    if (asg) {
      submissions.push({
        id: 'sub-seed-1',
        assignmentId: asg.id,
        userId: 'u-student-0',
        text: 'I built a two-week revision timetable using the spaced-practice idea from lesson 3, with a short review block each evening and two full past-paper sessions. I have attached the plan as a link.',
        link: 'https://example.com/amara-revision-plan',
        submittedAt: addDays(now, -8),
        grade: Math.round(asg.points * 0.85),
        feedback: 'Clear plan and good use of spaced practice. Add buffer time before the exam week next time.',
        gradedAt: addDays(now, -7),
      })
    }
    const enr = enrollments.find((e) => e.userId === 'u-student-0' && e.courseId === study.id)
    if (enr) enr.completedAt = addDays(now, -6)
    const tutor = users.find((u) => u.id === study.tutorId)
    certificates.push({
      id: 'cert-seed-1',
      userId: 'u-student-0',
      courseId: study.id,
      studentName: 'Amara Okafor',
      courseTitle: study.title,
      courseCode: study.code,
      tutorName: tutor?.name ?? 'Course tutor',
      hours: Math.max(1, Math.round((study.modules.flatMap((m) => m.lessons).reduce((n, l) => n + l.minutes, 0) / 60) * 10) / 10),
      score: quizzes.find((q) => q.courseId === study.id) ? 83 : undefined,
      issuedAt: addDays(now, -6),
    })
  }

  // Ungraded work for the tutor's grading queue.
  const compAsg = assignments.find((a) => a.courseId === byCode('COMP 101')?.id)
  if (compAsg) {
    submissions.push({
      id: 'sub-seed-2',
      assignmentId: compAsg.id,
      userId: 'u-student-1',
      text: 'My program asks for a name and a number and prints a short message. I used a function and a loop, and I tested it with three inputs.',
      submittedAt: addDays(now, -1),
    })
  }
  const mathQuiz = quizzes.find((q) => q.courseId === byCode('MATH 105')?.id)
  if (mathQuiz) {
    attempts.push({ id: 'att-seed-2', quizId: mathQuiz.id, userId: 'u-student-3', answers: mathQuiz.questions.map((q) => q.answerIndex), score: 100, passed: true, takenAt: addDays(now, -3), durationSec: 322 })
  }

  return {
    users,
    courses,
    quizzes,
    attempts,
    enrollments,
    assignments,
    submissions,
    liveClasses,
    materials,
    certificates,
    opportunities,
    savedOpportunities: {},
    resumes: {},
  }
}
