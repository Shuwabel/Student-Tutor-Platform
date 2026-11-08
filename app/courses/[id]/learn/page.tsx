'use client'

import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, ListTree } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import EmptyState from '@/components/catalog/EmptyState'
import LessonBody from '@/components/catalog/LessonBody'
import ProgressRule from '@/components/catalog/ProgressRule'
import Stamp from '@/components/catalog/Stamp'
import { Button } from '@/components/ui/button'
import YouTubeFacade from '@/components/courses/YouTubeFacade'
import { shortDate } from '@/lib/format'
import { allLessons, findLesson, nextLesson, progressPercent } from '@/lib/selectors'
import { useCurrentUser, useStore } from '@/lib/store'
import type { Course, Enrollment } from '@/lib/types'
import { cn } from '@/lib/utils'

function Syllabus({ course, enrollment, currentId }: { course: Course; enrollment?: Enrollment; currentId: string }) {
  const done = new Set(enrollment?.completedLessons ?? [])
  return (
    <nav aria-label="Syllabus">
      <ol className="space-y-4">
        {course.modules.map((m, mi) => (
          <li key={m.id}>
            <p className="text-sm font-bold">
              <span className="callno mr-1.5 text-primary">{course.code}.{mi + 1}</span>
              {m.title}
            </p>
            <ul className="mt-1">
              {m.lessons.map((l) => {
                const current = l.id === currentId
                return (
                  <li key={l.id}>
                    <Link
                      href={`/courses/${course.id}/learn?lesson=${l.id}`}
                      aria-current={current ? 'step' : undefined}
                      className={cn(
                        'flex min-h-11 items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent',
                        current && 'bg-accent font-semibold',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn('grid h-5 w-5 shrink-0 place-items-center rounded-full border', done.has(l.id) ? 'border-primary bg-primary text-primary-foreground' : 'border-input')}
                      >
                        {done.has(l.id) && <Check className="h-3 w-3" />}
                      </span>
                      <span className="min-w-0 flex-1">{l.title}</span>
                      <span className="sr-only">{done.has(l.id) ? 'Done' : 'Not done'}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Player() {
  const { id } = useParams<{ id: string }>()
  const search = useSearchParams()
  const router = useRouter()
  const user = useCurrentUser()
  const courses = useStore((s) => s.courses)
  const enrollments = useStore((s) => s.enrollments)
  const quizzes = useStore((s) => s.quizzes)
  const attempts = useStore((s) => s.attempts)
  const certificates = useStore((s) => s.certificates)
  const enroll = useStore((s) => s.enroll)
  const completeLesson = useStore((s) => s.completeLesson)
  const uncompleteLesson = useStore((s) => s.uncompleteLesson)
  const setLastLesson = useStore((s) => s.setLastLesson)
  const [stamped, setStamped] = useState<{ lessonId: string; date: string } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id])
  const enrollment = useMemo(() => enrollments.find((e) => e.userId === user?.id && e.courseId === id), [enrollments, user?.id, id])
  const isStudent = user?.role === 'student'
  const isStaff = Boolean(user && course && (user.role === 'admin' || (user.role === 'tutor' && course.tutorId === user.id)))
  const canSee = Boolean(course && (course.published || isStaff))
  const lessons = useMemo(() => (course ? allLessons(course) : []), [course])

  const requested = search.get('lesson')
  const found = course ? (requested ? findLesson(course, requested) : undefined) : undefined
  const fallback = course ? nextLesson(course, enrollment) : undefined
  const current = found?.lesson ?? fallback
  const index = current ? lessons.findIndex((l) => l.id === current.id) : -1
  const prev = index > 0 ? lessons[index - 1] : undefined
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined
  const enrolled = Boolean(enrollment)
  const lastLessonId = enrollment?.lastLessonId

  useEffect(() => {
    if (isStudent && enrolled && course && current && lastLessonId !== current.id) setLastLesson(course.id, current.id)
  }, [isStudent, enrolled, course, current, lastLessonId, setLastLesson])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  if (!course || !user || !canSee) {
    return (
      <EmptyState
        title="Course not found"
        action={
          <Button asChild className="min-h-11">
            <Link href="/courses">Back to the catalogue</Link>
          </Button>
        }
      >
        This course does not exist, or it has not been published yet.
      </EmptyState>
    )
  }

  if (isStudent && !enrollment) {
    return (
      <EmptyState
        title="Enrol to open the lessons"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11"
              onClick={() => {
                enroll(course.id)
                toast.success(`Enrolled in ${course.title}`)
              }}
            >
              Enrol in {course.code}
            </Button>
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`/courses/${course.id}`}>Course details</Link>
            </Button>
          </div>
        }
      >
        You need to be enrolled in {course.title} to read its lessons and keep your progress.
      </EmptyState>
    )
  }

  if (!current) {
    return (
      <EmptyState
        title="No lessons yet"
        action={
          <Button asChild variant="outline" className="min-h-11">
            <Link href={`/courses/${course.id}`}>Back to the course</Link>
          </Button>
        }
      >
        This course does not have any lessons.
      </EmptyState>
    )
  }

  const done = new Set(enrollment?.completedLessons ?? [])
  const isDone = done.has(current.id)
  const percent = progressPercent(course, enrollment)
  const allDone = isStudent && lessons.length > 0 && lessons.every((l) => done.has(l.id))
  const courseQuizzes = quizzes.filter((q) => q.courseId === course.id && q.published && q.questions.length > 0)
  const pending = courseQuizzes.filter((q) => !attempts.some((a) => a.userId === user.id && a.quizId === q.id && a.passed))
  const hasCertificate = certificates.some((c) => c.userId === user.id && c.courseId === course.id)
  const go = (lessonId: string) => {
    if (timer.current) clearTimeout(timer.current)
    router.push(`/courses/${course.id}/learn?lesson=${lessonId}`)
  }
  const showStamp = stamped?.lessonId === current.id

  const finish = () => {
    completeLesson(course.id, current.id)
    setStamped({ lessonId: current.id, date: shortDate(new Date().toISOString()) })
    if (next) {
      toast.success('Lesson stamped complete. Moving on.')
      timer.current = setTimeout(() => go(next.id), 1100)
    } else {
      toast.success('Lesson stamped complete.')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start" aria-label="Course outline">
        <Link href={`/courses/${course.id}`} className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {course.title}
        </Link>
        {isStudent && <ProgressRule className="mb-4" percent={percent} />}
        <details className="rounded-md border border-border bg-card lg:hidden">
          <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3 font-semibold">
            <ListTree className="h-4 w-4" aria-hidden="true" /> Syllabus
          </summary>
          <div className="border-t border-border p-3">
            <Syllabus course={course} enrollment={enrollment} currentId={current.id} />
          </div>
        </details>
        <div className="hidden max-h-[calc(100vh-10rem)] overflow-y-auto rounded-md border border-border bg-card p-3 lg:block">
          <Syllabus course={course} enrollment={enrollment} currentId={current.id} />
        </div>
      </aside>

      <article aria-labelledby="lesson-h" className="min-w-0">
        {!isStudent && (
          <p className="mb-4 rounded-md border border-border bg-secondary px-3 py-2 text-sm">
            Preview only. Completion buttons are for students.
          </p>
        )}
        <header className="mb-5 border-b-2 border-brass pb-3">
          <p className="callno text-sm text-primary">
            {course.code} / lesson {index + 1} of {lessons.length}
          </p>
          <h1 id="lesson-h" className="mt-1 text-3xl font-bold tracking-tight">{current.title}</h1>
          <p className="callno mt-1 text-sm text-muted-foreground">{current.minutes} min</p>
        </header>

        {current.videoId && <YouTubeFacade key={current.id} videoId={current.videoId} title={current.title} />}
        <LessonBody body={current.body} />

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <Button variant="outline" className="min-h-11" disabled={!prev} onClick={() => prev && go(prev.id)}>
            <ArrowLeft aria-hidden="true" /> Previous
          </Button>
          {isStudent &&
            (isDone ? (
              <>
                <Stamp press={showStamp}>{showStamp ? `Done ${stamped?.date}` : 'Lesson done'}</Stamp>
                <Button
                  variant="ghost"
                  className="min-h-11"
                  onClick={() => {
                    uncompleteLesson(course.id, current.id)
                    setStamped(null)
                    toast('Lesson marked as not done')
                  }}
                >
                  Mark as not done
                </Button>
              </>
            ) : (
              <Button className="min-h-11" onClick={finish}>
                <Check aria-hidden="true" /> Mark lesson complete
              </Button>
            ))}
          <Button variant="outline" className="min-h-11 sm:ml-auto" disabled={!next} onClick={() => next && go(next.id)}>
            Next <ArrowRight aria-hidden="true" />
          </Button>
        </div>
        <p className="sr-only" aria-live="polite">{showStamp ? 'Lesson marked complete' : ''}</p>

        {allDone && (
          <section aria-labelledby="finish-h" className="mt-10 rounded-md border-2 border-brass bg-card p-5">
            <h2 id="finish-h" className="text-xl font-bold">You have read every lesson</h2>
            {pending.length > 0 ? (
              <>
                <p className="mt-1 max-w-prose text-muted-foreground">
                  Pass {pending.length === 1 ? 'the course quiz' : 'the course quizzes'} to earn your certificate.
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {pending.map((q) => (
                    <li key={q.id}>
                      <Button asChild className="min-h-11">
                        <Link href={`/assessments/${q.id}`}>Take: {q.title}</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Stamp press>Certificate earned</Stamp>
                <Button asChild className="min-h-11">
                  <Link href="/certificates">{hasCertificate ? 'View your certificates' : 'Go to certificates'}</Link>
                </Button>
              </div>
            )}
          </section>
        )}
      </article>
    </div>
  )
}

export default function LearnPage() {
  return (
    <AppShell wide>
      <Suspense fallback={<div className="h-64 animate-pulse rounded bg-muted" aria-busy="true" />}>
        <Player />
      </Suspense>
    </AppShell>
  )
}
