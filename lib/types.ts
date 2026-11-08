export type Role = 'student' | 'tutor' | 'admin'
export type Level = 'Beginner' | 'Intermediate' | 'Advanced'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  headline?: string
  bio?: string
  /** Subjects a tutor teaches. */
  subjects?: string[]
  createdAt: string
  /** True for the seeded sample people. */
  sample?: boolean
}

export interface Lesson {
  id: string
  title: string
  minutes: number
  /** Light markup: blank-line separated paragraphs, "## " headings, "- " bullets, "> " callouts, `code`. */
  body: string
  /** Optional YouTube video id shown above the text. */
  videoId?: string
}

export interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Course {
  id: string
  /** Catalogue call number, e.g. "COMP 101". Unique. */
  code: string
  title: string
  summary: string
  description: string
  subject: string
  level: Level
  tutorId: string
  modules: Module[]
  outcomes: string[]
  tags: string[]
  published: boolean
  createdAt: string
}

export interface Question {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  explanation?: string
}

export interface Quiz {
  id: string
  courseId: string
  title: string
  description: string
  minutes: number
  /** Percent needed to pass, 0 to 100. */
  passMark: number
  questions: Question[]
  published: boolean
}

export interface Attempt {
  id: string
  quizId: string
  userId: string
  /** Chosen option index per question, -1 when left blank. */
  answers: number[]
  /** Percent, 0 to 100. */
  score: number
  passed: boolean
  takenAt: string
  durationSec: number
}

export interface Enrollment {
  userId: string
  courseId: string
  enrolledAt: string
  completedLessons: string[]
  lastLessonId?: string
  completedAt?: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  brief: string
  dueAt: string
  points: number
}

export interface Submission {
  id: string
  assignmentId: string
  userId: string
  text: string
  link?: string
  submittedAt: string
  grade?: number
  feedback?: string
  gradedAt?: string
}

export interface LiveClass {
  id: string
  courseId?: string
  title: string
  description: string
  tutorId: string
  startsAt: string
  durationMin: number
  /** Jitsi room name; the class opens at https://meet.jit.si/<room>. */
  room: string
  recordingUrl?: string
}

export type MaterialKind = 'pdf' | 'slides' | 'notes' | 'link' | 'video'

export interface Material {
  id: string
  courseId?: string
  title: string
  description: string
  kind: MaterialKind
  url: string
  subject: string
  addedBy: string
  addedAt: string
}

export interface Certificate {
  id: string
  userId: string
  courseId: string
  studentName: string
  courseTitle: string
  courseCode: string
  tutorName: string
  hours: number
  /** Best quiz score for the course, if there was one. */
  score?: number
  issuedAt: string
}

export type OpportunityKind = 'Internship' | 'Scholarship' | 'Job' | 'Competition' | 'Programme'

export interface Opportunity {
  id: string
  title: string
  org: string
  kind: OpportunityKind
  location: string
  remote: boolean
  /** ISO date or empty for rolling. */
  deadline: string
  summary: string
  url: string
  tags: string[]
}

export interface Resume {
  userId: string
  fullName: string
  headline: string
  email: string
  phone: string
  location: string
  summary: string
  skills: string[]
  education: { school: string; degree: string; years: string }[]
  experience: { role: string; org: string; years: string; bullets: string[] }[]
}

/** Shape of the seed content files in data/seed. */
export interface SeedCourse {
  code: string
  title: string
  summary: string
  description: string
  subject: string
  level: Level
  /** Index into the seed tutors list. */
  tutor: number
  outcomes: string[]
  tags: string[]
  modules: { title: string; lessons: { title: string; minutes: number; body: string; videoId?: string }[] }[]
  quiz: {
    title: string
    description: string
    minutes: number
    passMark: number
    questions: { prompt: string; options: string[]; answerIndex: number; explanation?: string }[]
  }
  assignment: { title: string; brief: string; points: number; dueInDays: number }
  materials: { title: string; description: string; kind: MaterialKind; url: string }[]
}
