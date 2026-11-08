'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Check, Circle } from 'lucide-react'
import AppShell from '@/components/shell/AppShell'
import PageTitle from '@/components/catalog/PageTitle'
import EmptyState from '@/components/catalog/EmptyState'
import CatalogCard from '@/components/catalog/CatalogCard'
import Stamp from '@/components/catalog/Stamp'
import { Button } from '@/components/ui/button'
import { shortDate, plural } from '@/lib/format'
import { allLessons } from '@/lib/selectors'
import { useCurrentUser, useStore } from '@/lib/store'

function Content() {
  const user = useCurrentUser()!
  const certificates = useStore((s) => s.certificates)
  const enrollments = useStore((s) => s.enrollments)
  const courses = useStore((s) => s.courses)
  const quizzes = useStore((s) => s.quizzes)
  const attempts = useStore((s) => s.attempts)

  const mine = useMemo(() => certificates.filter((c) => c.userId === user.id).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)), [certificates, user.id])

  const inProgress = useMemo(() => {
    const earned = new Set(mine.map((c) => c.courseId))
    return enrollments
      .filter((e) => e.userId === user.id && !earned.has(e.courseId))
      .flatMap((e) => {
        const course = courses.find((c) => c.id === e.courseId)
        if (!course) return []
        const lessons = allLessons(course)
        const done = new Set(e.completedLessons)
        const lessonsLeft = lessons.filter((l) => !done.has(l.id)).length
        const courseQuizzes = quizzes.filter((q) => q.courseId === course.id && q.published && q.questions.length > 0)
        const quizzesLeft = courseQuizzes.filter((q) => !attempts.some((a) => a.userId === user.id && a.quizId === q.id && a.passed))
        return [{ course, lessonsLeft, lessonTotal: lessons.length, quizzesLeft, quizTotal: courseQuizzes.length }]
      })
  }, [mine, enrollments, courses, quizzes, attempts, user.id])

  return (
    <>
      <PageTitle title="Certificates" intro="A certificate is stamped when you finish every lesson in a course and pass every quiz that course has." />

      <section aria-labelledby="earned-h">
        <h2 id="earned-h" className="mb-3 text-xl font-bold">Earned ({mine.length})</h2>
        {mine.length === 0 ? (
          <EmptyState
            title="No certificates yet"
            action={
              <Button asChild className="h-11">
                <Link href="/courses">Browse courses</Link>
              </Button>
            }
          >
            Finish all the lessons in a course and pass each of its quizzes, and a stamped certificate appears here.
          </EmptyState>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {mine.map((c) => (
              <li key={c.id}>
                <CatalogCard
                  code={c.courseCode}
                  title={c.courseTitle}
                  subject={`Tutor ${c.tutorName}`}
                  footer={
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <dl className="callno text-sm">
                        <div>{c.hours} hours</div>
                        <div>{c.score === undefined ? 'No quiz' : `Score ${c.score}%`}</div>
                      </dl>
                      <Stamp>Completed {shortDate(c.issuedAt)}</Stamp>
                    </div>
                  }
                >
                  <Button asChild variant="outline" className="h-11">
                    <Link href={`/certificates/${c.id}`}>
                      Open certificate<span className="sr-only"> for {c.courseTitle}</span>
                    </Link>
                  </Button>
                </CatalogCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      {inProgress.length > 0 && (
        <section aria-labelledby="todo-h" className="mt-10">
          <h2 id="todo-h" className="mb-3 text-xl font-bold">Still to finish</h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {inProgress.map(({ course, lessonsLeft, lessonTotal, quizzesLeft, quizTotal }) => (
              <li key={course.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="callno text-sm text-primary">{course.code}</span>
                </div>
                <h3 className="mt-1 text-lg font-bold leading-snug">
                  <Link href={`/courses/${course.id}`} className="hover:underline">
                    {course.title}
                  </Link>
                </h3>
                <ul className="mt-3 grid gap-2 text-sm">
                  <Item done={lessonsLeft === 0} text={lessonsLeft === 0 ? `All ${plural(lessonTotal, 'lesson')} done` : `${plural(lessonsLeft, 'lesson')} left of ${lessonTotal}`} />
                  {quizTotal === 0 ? (
                    <Item done text="This course has no quiz to pass" />
                  ) : quizzesLeft.length === 0 ? (
                    <Item done text={`${plural(quizTotal, 'quiz', 'quizzes')} passed`} />
                  ) : (
                    <Item done={false} text={`Not yet passed: ${quizzesLeft.map((q) => q.title).join(', ')}`} />
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function Item({ done, text }: { done: boolean; text: string }) {
  return (
    <li className="flex items-start gap-2">
      {done ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
      <span>
        <span className="sr-only">{done ? 'Done: ' : 'To do: '}</span>
        {text}
      </span>
    </li>
  )
}

export default function CertificatesPage() {
  return (
    <AppShell roles={['student']}>
      <Content />
    </AppShell>
  )
}
