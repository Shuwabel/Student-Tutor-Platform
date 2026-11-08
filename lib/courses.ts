import type { Course, Level, Lesson } from './types'
import { courseHours, lessonCount } from './selectors'

export const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced']

/** Suggested subjects for the editor; a tutor may type any other. */
export const SUBJECT_SUGGESTIONS = ['Computing', 'Data', 'Mathematics', 'Science', 'Study skills', 'Business', 'Communication', 'English']

/** One non-empty trimmed entry per line. */
export function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

/** Comma or line separated tags, trimmed, de-duplicated. */
export function splitTags(text: string): string[] {
  return Array.from(new Set(text.split(/[,\n]/).map((t) => t.trim()).filter(Boolean)))
}

/** Accepts a bare 11 character id or a youtube.com / youtu.be link. Returns '' when it is neither. */
export function extractYouTubeId(input: string): string {
  const value = input.trim()
  if (!value) return ''
  if (/^[\w-]{11}$/.test(value)) return value
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    let id = ''
    if (host === 'youtu.be') id = url.pathname.slice(1).split('/')[0]
    else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      id = url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).pop() ?? ''
    }
    return /^[\w-]{11}$/.test(id) ? id : ''
  } catch {
    return ''
  }
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const next = items.slice()
  const held = next[index]
  next[index] = next[target]
  next[target] = held
  return next
}

export interface CourseFilter {
  query: string
  subject: string
  level: string
}

export function filterCourses(courses: Course[], f: CourseFilter, tutorName: (id: string) => string = () => ''): Course[] {
  const q = f.query.trim().toLowerCase()
  return courses.filter((c) => {
    if (f.subject && c.subject !== f.subject) return false
    if (f.level && c.level !== f.level) return false
    if (!q) return true
    const hay = [c.code, c.title, c.summary, c.subject, tutorName(c.tutorId), ...c.tags].join(' ').toLowerCase()
    return q.split(/\s+/).every((word) => hay.includes(word))
  })
}

export function courseFacts(course: Course): { hours: number; lessons: number } {
  return { hours: courseHours(course), lessons: lessonCount(course) }
}

export interface DraftLesson {
  id: string
  title: string
  minutes: number
  body: string
  videoId: string
}
export interface DraftModule {
  id: string
  title: string
  lessons: DraftLesson[]
}
export interface CourseDraft {
  code: string
  title: string
  subject: string
  level: Level
  summary: string
  description: string
  outcomesText: string
  tagsText: string
  modules: DraftModule[]
}

export type DraftErrors = Record<string, string>

/** Errors keyed by field (code, title, ...) or `m<i>` / `m<i>l<j>` for modules and lessons. A draft save needs less than a publish. */
export function validateDraft(draft: CourseDraft, others: Course[], publish: boolean): DraftErrors {
  const e: DraftErrors = {}
  const code = draft.code.trim()
  if (!code) e.code = 'Give the course a call number such as COMP 101.'
  else if (others.some((c) => c.code.trim().toLowerCase() === code.toLowerCase())) e.code = 'Another course already uses this code.'
  if (!draft.title.trim()) e.title = 'Add a title.'
  if (!draft.subject.trim()) e.subject = 'Choose or type a subject.'
  if (publish) {
    if (!draft.summary.trim()) e.summary = 'Add a one or two line summary students see in the catalogue.'
    if (draft.modules.length === 0 || draft.modules.every((m) => m.lessons.length === 0)) e.modules = 'Add at least one module with a lesson before publishing.'
  }
  draft.modules.forEach((m, i) => {
    if (!m.title.trim()) e[`m${i}`] = 'Name this module.'
    m.lessons.forEach((l, j) => {
      if (!l.title.trim()) e[`m${i}l${j}`] = 'Name this lesson.'
      else if (!Number.isFinite(l.minutes) || l.minutes < 1 || l.minutes > 600) e[`m${i}l${j}`] = 'Minutes must be between 1 and 600.'
      else if (l.videoId.trim() && !extractYouTubeId(l.videoId)) e[`m${i}l${j}`] = 'That is not a YouTube id or link.'
    })
  })
  return e
}

export function courseToDraft(course: Course): CourseDraft {
  return {
    code: course.code,
    title: course.title,
    subject: course.subject,
    level: course.level,
    summary: course.summary,
    description: course.description,
    outcomesText: course.outcomes.join('\n'),
    tagsText: course.tags.join(', '),
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l: Lesson) => ({ id: l.id, title: l.title, minutes: l.minutes, body: l.body, videoId: l.videoId ?? '' })),
    })),
  }
}

export function draftToModules(draft: CourseDraft): Course['modules'] {
  return draft.modules.map((m) => ({
    id: m.id,
    title: m.title.trim(),
    lessons: m.lessons.map((l) => {
      const videoId = extractYouTubeId(l.videoId)
      return { id: l.id, title: l.title.trim(), minutes: Math.round(l.minutes), body: l.body, ...(videoId ? { videoId } : {}) }
    }),
  }))
}
