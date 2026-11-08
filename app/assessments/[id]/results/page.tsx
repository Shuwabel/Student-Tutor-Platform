'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Check, X } from 'lucide-react'
import AppShell from '@/components/shell/AppShell'
import EmptyState from '@/components/catalog/EmptyState'
import PageTitle from '@/components/catalog/PageTitle'
import Stamp from '@/components/catalog/Stamp'
import { Button } from '@/components/ui/button'
import { dayTime, plural } from '@/lib/format'
import { formatClock, scoreAnswers } from '@/lib/quiz'
import { useCurrentUser, useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export default function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <AppShell roles={['student']}>
      <Suspense fallback={<div className="h-48 animate-pulse rounded bg-muted" />}>
        <Results quizId={id} />
      </Suspense>
    </AppShell>
  )
}

function Results({ quizId }: { quizId: string }) {
  const user = useCurrentUser()!
  const params = useSearchParams()
  const quiz = useStore((s) => s.quizzes.find((q) => q.id === quizId))
  const course = useStore((s) => s.courses.find((c) => c.id === quiz?.courseId))
  const allAttempts = useStore((s) => s.attempts)
  const certificates = useStore((s) => s.certificates)

  const mine = useMemo(
    () => allAttempts.filter((a) => a.quizId === quizId && a.userId === user.id).sort((a, b) => b.takenAt.localeCompare(a.takenAt)),
    [allAttempts, quizId, user.id],
  )
  const attempt = mine.find((a) => a.id === params.get('attempt')) ?? mine[0]
  const certificate = useMemo(() => certificates.find((c) => c.userId === user.id && c.courseId === quiz?.courseId), [certificates, user.id, quiz?.courseId])

  if (!quiz || !course) {
    return (
      <EmptyState
        title="Quiz not found"
        action={
          <Button asChild className="min-h-11">
            <Link href="/assessments">Back to quizzes</Link>
          </Button>
        }
      >
        It may have been removed.
      </EmptyState>
    )
  }
  if (!attempt) {
    return (
      <EmptyState
        title="No attempts yet"
        action={
          <Button asChild className="min-h-11">
            <Link href={`/assessments/${quiz.id}`}>Take the quiz</Link>
          </Button>
        }
      >
        Your results appear here after you submit {quiz.title}.
      </EmptyState>
    )
  }

  const { correct, total } = scoreAnswers(quiz.questions, attempt.answers)

  return (
    <>
      <PageTitle title="Quiz results" intro={`${course.code}, ${quiz.title}`} />

      <section aria-labelledby="score-h" className="mb-8 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-md border border-border bg-card p-5">
        <div>
          <h2 id="score-h" className="text-sm font-semibold text-muted-foreground">
            Score
          </h2>
          <p className="callno text-5xl">{attempt.score}%</p>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {correct} of {total} correct. Pass mark {quiz.passMark}%. Taken {dayTime(attempt.takenAt)}, in {formatClock(attempt.durationSec)}.
          </p>
        </div>
        <div className="text-xl">
          <Stamp press className="text-base">
            {attempt.passed ? 'Passed' : 'Not yet'}
          </Stamp>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button asChild className="min-h-11">
            <Link href={`/assessments/${quiz.id}`}>Retake</Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link href={`/courses/${course.id}`}>Back to {course.code}</Link>
          </Button>
          {attempt.passed && certificate && (
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/certificates">See your certificate</Link>
            </Button>
          )}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <section aria-labelledby="review-h">
          <h2 id="review-h" className="mb-3 text-xl font-bold">
            Question review
          </h2>
          <ol className="space-y-4">
            {quiz.questions.map((q, i) => {
              const given = attempt.answers[i] ?? -1
              const right = given === q.answerIndex
              return (
                <li key={q.id} className="rounded-md border border-border bg-card p-4">
                  <p className="flex items-start gap-2 font-semibold">
                    <span className="callno shrink-0">{i + 1}.</span>
                    <span>{q.prompt}</span>
                  </p>
                  <p className={cn('mt-2 flex items-start gap-2', right ? 'text-foreground' : 'text-stamp')}>
                    {right ? <Check className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /> : <X className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />}
                    <span>
                      <span className="font-semibold">{right ? 'Correct. ' : 'Your answer: '}</span>
                      {given >= 0 ? q.options[given] : 'Left blank'}
                    </span>
                  </p>
                  {!right && (
                    <p className="mt-1">
                      <span className="font-semibold">Correct answer: </span>
                      {q.options[q.answerIndex]}
                    </p>
                  )}
                  {q.explanation && <p className="mt-2 text-sm text-muted-foreground">{q.explanation}</p>}
                </li>
              )
            })}
          </ol>
        </section>

        <section aria-labelledby="history-h">
          <h2 id="history-h" className="mb-3 text-xl font-bold">
            Your attempts
          </h2>
          <p className="mb-2 text-sm text-muted-foreground">{plural(mine.length, 'attempt')} so far.</p>
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {mine.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/assessments/${quiz.id}/results?attempt=${a.id}`}
                  aria-current={a.id === attempt.id ? 'true' : undefined}
                  className={cn('flex min-h-14 items-center justify-between gap-3 p-3 hover:bg-accent', a.id === attempt.id && 'bg-accent')}
                >
                  <span className="text-sm">{dayTime(a.takenAt)}</span>
                  <span className="flex items-center gap-2">
                    <span className="callno">{a.score}%</span>
                    <span className="w-16 text-right text-sm text-muted-foreground">{a.passed ? 'Passed' : 'Not yet'}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
