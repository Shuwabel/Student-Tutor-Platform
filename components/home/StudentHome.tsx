'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ArrowRight, Video } from 'lucide-react'
import CatalogCard from '@/components/catalog/CatalogCard'
import EmptyState from '@/components/catalog/EmptyState'
import ProgressRule from '@/components/catalog/ProgressRule'
import Stamp from '@/components/catalog/Stamp'
import { Button } from '@/components/ui/button'
import { activeEnrollments, dueAssignments, isFinished, upcomingClasses } from '@/lib/home'
import { dayDate, dayTime, dueLabel, plural, shortDate } from '@/lib/format'
import { nextLesson, progressPercent } from '@/lib/selectors'
import { useStore } from '@/lib/store'
import type { User } from '@/lib/types'

export default function StudentHome({ user }: { user: User }) {
  const courses = useStore((s) => s.courses)
  const enrollments = useStore((s) => s.enrollments)
  const assignments = useStore((s) => s.assignments)
  const submissions = useStore((s) => s.submissions)
  const liveClasses = useStore((s) => s.liveClasses)
  const attempts = useStore((s) => s.attempts)
  const quizzes = useStore((s) => s.quizzes)
  const certificates = useStore((s) => s.certificates)

  const now = useMemo(() => new Date(), [])
  const mine = useMemo(() => activeEnrollments(courses, enrollments, user.id), [courses, enrollments, user.id])
  const open = useMemo(() => mine.filter((x) => !isFinished(x.course, x.enrollment)), [mine])
  const current = open[0]
  const courseIds = useMemo(() => new Set(mine.map((x) => x.course.id)), [mine])
  const due = useMemo(() => dueAssignments(assignments, submissions, courseIds, user.id).slice(0, 4), [assignments, submissions, courseIds, user.id])
  const classes = useMemo(
    () => upcomingClasses(liveClasses, now, (l) => !l.courseId || courseIds.has(l.courseId)).slice(0, 3),
    [liveClasses, now, courseIds],
  )
  const scores = useMemo(
    () => attempts.filter((a) => a.userId === user.id).sort((a, b) => b.takenAt.localeCompare(a.takenAt)).slice(0, 5),
    [attempts, user.id],
  )
  const certs = useMemo(() => certificates.filter((c) => c.userId === user.id), [certificates, user.id])

  const next = current ? nextLesson(current.course, current.enrollment) : undefined
  const continueHref = current ? `/courses/${current.course.id}/learn${next ? `?lesson=${next.id}` : ''}` : '/courses'

  return (
    <div className="space-y-10">
      <header className="border-b-2 border-brass pb-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hello, {user.name.split(' ')[0]}</h1>
        <p className="callno mt-1 text-sm text-muted-foreground">{format(now, 'EEEE d MMMM yyyy')}</p>
      </header>

      <section aria-label="Current course and what is due" className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        {current ? (
          <CatalogCard
            code={current.course.code}
            title={current.course.title}
            subject={current.course.subject}
            meta={next ? <>Next lesson: {next.title}</> : undefined}
            footer={
              <div className="space-y-4">
                <ProgressRule percent={progressPercent(current.course, current.enrollment)} />
                <Button asChild size="lg" className="h-11">
                  <Link href={continueHref}>
                    Continue <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            }
          />
        ) : (
          <EmptyState
            title={mine.length > 0 ? 'Everything you enrolled in is finished' : 'No course on your drawer yet'}
            action={
              <Button asChild className="h-11">
                <Link href="/courses">Browse courses</Link>
              </Button>
            }
          >
            {mine.length > 0 ? 'Pick something new from the catalogue when you are ready.' : 'Find a course in the catalogue and enrol. It will show up here with a Continue button.'}
          </EmptyState>
        )}

        <div className="space-y-3">
          <h2 className="text-xl font-bold">Due</h2>
          {due.length === 0 && classes.length === 0 && (
            <p className="rounded-md border border-dashed border-border bg-card p-4 text-muted-foreground">Nothing due and no live classes coming up.</p>
          )}
          <ul className="space-y-2">
            {due.map((a) => {
              const course = courses.find((c) => c.id === a.courseId)
              const label = dueLabel(a.dueAt, now)
              return (
                <li key={a.id}>
                  <Link href={`/assignments/${a.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 transition-colors hover:border-primary">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{a.title}</span>
                      <span className="block text-sm text-muted-foreground">
                        <span className="callno">{course?.code}</span> &middot; {label.text}
                      </span>
                    </span>
                    <Stamp>{format(parseISO(a.dueAt), 'd MMM')}</Stamp>
                  </Link>
                </li>
              )
            })}
            {classes.map((l) => (
              <li key={l.id}>
                <Link href="/live-classes" className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 transition-colors hover:border-primary">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{l.title}</span>
                    <span className="block text-sm text-muted-foreground">
                      <Video className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
                      Live class, <span className="callno">{dayTime(l.startsAt)}</span>
                    </span>
                  </span>
                  <Stamp>{format(parseISO(l.startsAt), 'd MMM')}</Stamp>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="mine-h">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 id="mine-h" className="text-xl font-bold">My courses</h2>
          <Link href="/courses" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Browse the catalogue
          </Link>
        </div>
        {mine.length === 0 ? (
          <EmptyState title="You are not enrolled in anything yet" action={<Button asChild className="h-11"><Link href="/courses">See what is on offer</Link></Button>}>
            Courses are free in this demo. Enrol in one and your progress is kept here.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {mine.map(({ course, enrollment }) => {
              const n = nextLesson(course, enrollment)
              const done = isFinished(course, enrollment)
              return (
                <li key={course.id}>
                  <Link href={`/courses/${course.id}/learn${n ? `?lesson=${n.id}` : ''}`} className="grid min-h-16 items-center gap-2 px-4 py-3 transition-colors hover:bg-accent sm:grid-cols-[7rem_1fr_12rem]">
                    <span className="callno text-sm text-primary">{course.code}</span>
                    <span className="font-semibold">{course.title}</span>
                    <span>{done ? <Stamp>Completed</Stamp> : <ProgressRule percent={progressPercent(course, enrollment)} />}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section aria-labelledby="scores-h">
          <h2 id="scores-h" className="mb-3 text-xl font-bold">Recent quiz scores</h2>
          {scores.length === 0 ? (
            <EmptyState title="No quizzes taken yet" action={<Button asChild variant="outline" className="h-11"><Link href="/assessments">Find a quiz</Link></Button>} />
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {scores.map((a) => (
                <li key={a.id} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{quizzes.find((q) => q.id === a.quizId)?.title ?? 'Quiz'}</span>
                    <span className="callno block text-xs text-muted-foreground">{shortDate(a.takenAt)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="callno text-lg">{a.score}%</span>
                    {a.passed && <Stamp>Passed</Stamp>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="certs-h">
          <h2 id="certs-h" className="mb-3 text-xl font-bold">Certificates earned</h2>
          {certs.length === 0 ? (
            <EmptyState title="No certificates yet">Finish every lesson and pass the quizzes of a course to earn one.</EmptyState>
          ) : (
            <>
              <ul className="divide-y divide-border rounded-md border border-border bg-card">
                {certs.map((c) => (
                  <li key={c.id} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{c.courseTitle}</span>
                      <span className="callno block text-xs text-muted-foreground">{c.courseCode} &middot; {dayDate(c.issuedAt)}</span>
                    </span>
                    <Stamp>Completed</Stamp>
                  </li>
                ))}
              </ul>
              <Link href="/certificates" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
                View {plural(certs.length, 'certificate')}
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
