import type { Attempt, Question } from './types'

/** Percent score (0 to 100) for the given answers; blank (-1) and missing answers count as wrong. */
export function scoreAnswers(questions: Pick<Question, 'answerIndex'>[], answers: number[]): { correct: number; total: number; score: number } {
  const total = questions.length
  const correct = questions.filter((q, i) => answers[i] === q.answerIndex).length
  return { correct, total, score: total === 0 ? 0 : Math.round((correct / total) * 100) }
}

/** Seconds as "m:ss" (minutes keep growing past 59). */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Whole seconds left before a deadline (epoch ms), never below zero. */
export function secondsLeft(deadline: number, now: number): number {
  return Math.max(0, Math.ceil((deadline - now) / 1000))
}

export function bestScore(attempts: Pick<Attempt, 'score'>[]): number | null {
  return attempts.length ? Math.max(...attempts.map((a) => a.score)) : null
}

export function averageScore(attempts: Pick<Attempt, 'score'>[]): number | null {
  return attempts.length ? Math.round(attempts.reduce((n, a) => n + a.score, 0) / attempts.length) : null
}

export function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

export interface DraftQuestion {
  id: string
  prompt: string
  options: string[]
  answerIndex: number
  explanation: string
}

/** Human-readable problems that stop a quiz being published. */
export function validateQuestions(questions: DraftQuestion[]): string[] {
  const errors: string[] = []
  if (questions.length === 0) errors.push('Add at least one question.')
  questions.forEach((q, i) => {
    const n = i + 1
    if (!q.prompt.trim()) errors.push(`Question ${n} needs a prompt.`)
    if (q.options.length < 2 || q.options.length > 6) errors.push(`Question ${n} needs 2 to 6 options.`)
    q.options.forEach((o, oi) => {
      if (!o.trim()) errors.push(`Question ${n}, option ${oi + 1} is empty.`)
    })
    if (!(q.answerIndex >= 0 && q.answerIndex < q.options.length)) errors.push(`Question ${n} needs one correct option.`)
  })
  return errors
}
