'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import { toast } from 'sonner'
import EmptyState from '@/components/catalog/EmptyState'
import PageTitle from '@/components/catalog/PageTitle'
import { Button } from '@/components/ui/button'
import { plural } from '@/lib/format'
import { formatClock, secondsLeft } from '@/lib/quiz'
import { useCurrentUser, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Session {
  startedAt: number
  answers: number[]
  index: number
  review: boolean
}

const keyFor = (quizId: string, userId: string) => `quiz-session:${quizId}:${userId}`

function readSession(key: string, count: number): Session | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const s = JSON.parse(raw) as Session
    if (typeof s.startedAt !== 'number' || !Array.isArray(s.answers)) return null
    const answers = Array.from({ length: count }, (_, i) => (typeof s.answers[i] === 'number' ? s.answers[i] : -1))
    return { startedAt: s.startedAt, answers, index: Math.min(Math.max(0, s.index || 0), count - 1), review: !!s.review }
  } catch {
    return null
  }
}

export default function QuizTaker({ quizId }: { quizId: string }) {
  const user = useCurrentUser()!
  const quiz = useStore((s) => s.quizzes.find((q) => q.id === quizId))
  const course = useStore((s) => s.courses.find((c) => c.id === quiz?.courseId))
  const enrolled = useStore((s) => s.enrollments.some((e) => e.userId === user.id && e.courseId === quiz?.courseId))
  const attempts = useStore((s) => s.attempts)
  const submitAttempt = useStore((s) => s.submitAttempt)
  const router = useRouter()

  const [session, setSession] = useState<Session | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [announce, setAnnounce] = useState('')
  const submitting = useRef(false)
  const announced = useRef(false)
  const count = quiz?.questions.length ?? 0
  const key = keyFor(quizId, user.id)

  // Resume an in-progress attempt after a refresh.
  useEffect(() => {
    if (count > 0) setSession(readSession(key, count))
    setLoaded(true)
  }, [key, count])

  // Persist every change.
  useEffect(() => {
    if (!loaded) return
    try {
      if (session) sessionStorage.setItem(key, JSON.stringify(session))
    } catch {
      /* storage may be unavailable; state still works */
    }
  }, [session, loaded, key])

  const deadline = session && quiz ? session.startedAt + quiz.minutes * 60_000 : 0
  const left = session && quiz ? secondsLeft(deadline, now) : 0

  const finish = useCallback(
    (auto: boolean) => {
      if (!session || !quiz || submitting.current) return
      submitting.current = true
      const durationSec = Math.min(quiz.minutes * 60, Math.max(1, Math.round((Date.now() - session.startedAt) / 1000)))
      const attempt = submitAttempt({ quizId: quiz.id, answers: session.answers, durationSec })
      try {
        sessionStorage.removeItem(key)
      } catch {
        /* ignore */
      }
      if (!attempt) {
        submitting.current = false
        toast.error('Your answers could not be saved. Try again.')
        return
      }
      if (auto) toast.message('Time is up, so your answers were submitted.')
      router.replace(`/assessments/${quiz.id}/results?attempt=${attempt.id}`)
    },
    [session, quiz, submitAttempt, key, router],
  )

  // Countdown, one tick a second while a quiz is running.
  const running = !!session
  useEffect(() => {
    if (!running) return
    setNow(Date.now())
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [running])

  useEffect(() => {
    if (!session || !quiz) return
    if (left === 0) finish(true)
    else if (left <= 60 && !announced.current) {
      announced.current = true
      setAnnounce('One minute left.')
    }
  }, [left, session, quiz, finish])

  const mine = useMemo(() => (quiz ? attempts.filter((a) => a.quizId === quiz.id && a.userId === user.id) : []), [attempts, quiz, user.id])

  if (!loaded) return <div className="h-48 animate-pulse rounded bg-muted" aria-busy="true" />

  if (!quiz || !quiz.published || count === 0 || !course) {
    return (
      <EmptyState
        title="This quiz is not available"
        action={
          <Button asChild className="min-h-11">
            <Link href="/assessments">Back to quizzes</Link>
          </Button>
        }
      >
        It may have been removed, or the tutor has not published it yet.
      </EmptyState>
    )
  }
  if (!enrolled) {
    return (
      <EmptyState
        title="Enrol to take this quiz"
        action={
          <Button asChild className="min-h-11">
            <Link href={`/courses/${course.id}`}>Open {course.code}</Link>
          </Button>
        }
      >
        This quiz belongs to {course.title}. Enrol in the course first.
      </EmptyState>
    )
  }

  // Intro
  if (!session) {
    return (
      <>
        <PageTitle title={quiz.title} intro={<span className="callno text-sm">{course.code}</span>} />
        <section aria-labelledby="rules-h" className="max-w-2xl rounded-md border border-border bg-card p-5">
          {quiz.description && <p className="mb-4">{quiz.description}</p>}
          <h2 id="rules-h" className="text-lg font-bold">Before you start</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>{plural(count, 'question')}, one at a time.</li>
            <li>
              You have <span className="callno">{quiz.minutes}</span> {quiz.minutes === 1 ? 'minute' : 'minutes'}. The quiz submits by itself when the clock reaches zero.
            </li>
            <li>
              You need <span className="callno">{quiz.passMark}%</span> to pass.
            </li>
            <li>You can skip a question and come back. Blank answers count as wrong.</li>
            <li>Refreshing the page keeps your answers and the clock running.</li>
            <li>You may retake it; your best score counts.{mine.length > 0 && ` You have made ${plural(mine.length, 'attempt')} so far.`}</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              className="min-h-11"
              onClick={() => {
                submitting.current = false
                announced.current = false
                setNow(Date.now())
                setSession({ startedAt: Date.now(), answers: Array(count).fill(-1), index: 0, review: false })
              }}
            >
              Start quiz
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/assessments">Not now</Link>
            </Button>
          </div>
        </section>
      </>
    )
  }

  const update = (patch: Partial<Session>) => setSession((s) => (s ? { ...s, ...patch } : s))
  const setAnswer = (qi: number, value: number) => setSession((s) => (s ? { ...s, answers: s.answers.map((a, i) => (i === qi ? value : a)) } : s))
  const answered = session.answers.filter((a) => a >= 0).length
  const low = left <= 60

  const clock = (
    <div
      role="timer"
      aria-live="off"
      aria-label="Time left"
      className={cn('callno flex min-h-11 items-center gap-2 rounded-md border px-3 text-lg', low ? 'border-stamp text-stamp' : 'border-border')}
    >
      <Clock className="h-4 w-4" aria-hidden="true" />
      {formatClock(left)}
    </div>
  )

  const live = (
    <p className="sr-only" role="status" aria-live="polite">
      {announce}
    </p>
  )

  // Review before submitting
  if (session.review) {
    const blank = count - answered
    return (
      <>
        {live}
        <PageTitle title="Review your answers" intro={quiz.title} action={clock} />
        <ol className="max-w-2xl divide-y divide-border rounded-md border border-border bg-card">
          {quiz.questions.map((q, i) => {
            const a = session.answers[i]
            return (
              <li key={q.id}>
                <button
                  type="button"
                  className="flex min-h-14 w-full items-start gap-3 p-3 text-left hover:bg-accent"
                  onClick={() => update({ review: false, index: i })}
                >
                  <span className="callno w-8 shrink-0 text-sm">{i + 1}.</span>
                  <span className="min-w-0 flex-1">
                    <span className="block">{q.prompt}</span>
                    <span className={cn('block text-sm', a < 0 ? 'font-semibold text-stamp' : 'text-muted-foreground')}>
                      {a < 0 ? 'No answer yet' : `Your answer: ${q.options[a]}`}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-primary underline">Change</span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className="mt-4" aria-live="polite">
          {blank === 0 ? 'Every question has an answer.' : `${plural(blank, 'question')} still blank. Blank answers count as wrong.`}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" className="min-h-11" onClick={() => update({ review: false })}>
            <ArrowLeft /> Back to questions
          </Button>
          <Button className="min-h-11" onClick={() => finish(false)}>
            Submit answers
          </Button>
        </div>
      </>
    )
  }

  const q = quiz.questions[session.index]
  const chosen = session.answers[session.index]
  const last = session.index === count - 1
  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const move = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!move) return
    e.preventDefault()
    const n = q.options.length
    const from = chosen >= 0 ? chosen : move === 1 ? -1 : 0
    const to = (from + move + n) % n
    setAnswer(session.index, to)
    const radios = e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]')
    radios[to]?.focus()
  }

  return (
    <>
      {live}
      <PageTitle title={quiz.title} intro={<span className="callno text-sm">{course.code}</span>} action={clock} />
      <div className="max-w-2xl">
        <div className="mb-1 flex items-baseline justify-between text-sm">
          <span className="callno">
            Question {session.index + 1} of {count}
          </span>
          <span className="text-muted-foreground">{answered} answered</span>
        </div>
        <div className="mb-5 h-2 rounded-full bg-muted" role="progressbar" aria-label="Quiz progress" aria-valuemin={1} aria-valuemax={count} aria-valuenow={session.index + 1}>
          <div className="h-2 rounded-full bg-primary" style={{ width: `${((session.index + 1) / count) * 100}%` }} />
        </div>

        <h2 id="q-prompt" className="text-xl font-bold leading-snug">
          {q.prompt}
        </h2>
        <div role="radiogroup" aria-labelledby="q-prompt" onKeyDown={onKey} className="mt-4 grid gap-2">
          {q.options.map((opt, oi) => {
            const checked = chosen === oi
            return (
              <button
                key={oi}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked || (chosen < 0 && oi === 0) ? 0 : -1}
                onClick={() => setAnswer(session.index, oi)}
                className={cn(
                  'flex min-h-12 w-full items-center gap-3 rounded-md border p-3 text-left transition-colors hover:border-primary',
                  checked ? 'border-primary bg-accent font-semibold' : 'border-border bg-card',
                )}
              >
                <span aria-hidden="true" className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', checked ? 'border-primary' : 'border-muted-foreground')}>
                  {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                </span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
        {chosen >= 0 && (
          <Button variant="ghost" className="mt-2 min-h-11" onClick={() => setAnswer(session.index, -1)}>
            Clear answer
          </Button>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <Button variant="outline" className="min-h-11" disabled={session.index === 0} onClick={() => update({ index: session.index - 1 })}>
            <ArrowLeft /> Previous
          </Button>
          {last ? (
            <Button className="min-h-11" onClick={() => update({ review: true })}>
              Review answers
            </Button>
          ) : (
            <Button className="min-h-11" onClick={() => update({ index: session.index + 1 })}>
              Next <ArrowRight />
            </Button>
          )}
        </div>
        {!last && (
          <Button variant="link" className="mt-2 min-h-11 px-0" onClick={() => update({ review: true })}>
            Go to review
          </Button>
        )}
      </div>
    </>
  )
}
