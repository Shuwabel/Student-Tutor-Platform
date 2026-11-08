'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import EmptyState from '@/components/catalog/EmptyState'
import ProgressRule from '@/components/catalog/ProgressRule'
import Stamp from '@/components/catalog/Stamp'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/courses/ConfirmDialog'
import { dayTime, dueLabel, plural, shortDate } from '@/lib/format'
import { allLessons, courseHours, lessonCount, nextLesson, progressPercent } from '@/lib/selectors'
import { initials } from '@/lib/selectors'
import { useCurrentUser, useStore } from '@/lib/store'

function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const user = useCurrentUser()
  const courses = useStore((s) => s.courses)
  const users = useStore((s) => s.users)
  const enrollments = useStore((s) => s.enrollments)
  const quizzes = useStore((s) => s.quizzes)
  const attempts = useStore((s) => s.attempts)
  const assignments = useStore((s) => s.assignments)
  const materials = useStore((s) => s.materials)
  const liveClasses = useStore((s) => s.liveClasses)
  const enroll = useStore((s) => s.enroll)
  const unenroll = useStore((s) => s.unenroll)
  const [leaving, setLeaving] = useState(false)

  const course = useMemo(() => courses.find((c) => c.id === id), [courses, id])
  const tutor = useMemo(() => users.find((u) => u.id === course?.tutorId), [users, course])
  const enrollment = useMemo(() => enrollments.find((e) => e.userId === user?.id && e.courseId === id), [enrollments, user?.id, id])
  const isStaff = user?.role === 'admin' || (user?.role === 'tutor' && course?.tutorId === user.id)
  const canSee = Boolean(course && user && (course.published || isStaff))

  const courseQuizzes = useMemo(() => quizzes.filter((q) => q.courseId === id && (q.published || isStaff)), [quizzes, id, isStaff])
  const courseAssignments = useMemo(() => assignments.filter((a) => a.courseId === id), [assignments, id])
  const courseMaterials = useMemo(() => materials.filter((m) => m.courseId === id), [materials, id])
  const courseClasses = useMemo(
    () => liveClasses.filter((l) => l.courseId === id).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
    [liveClasses, id],
  )

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

  const isStudent = user.role === 'student'
  const lessons = allLessons(course)
  const target = nextLesson(course, enrollment)
  const started = Boolean(enrollment && enrollment.completedLessons.length > 0)
  const percent = progressPercent(course, enrollment)
  const showExtras = Boolean(enrollment) || isStaff
  const passed = (quizId: string) => attempts.some((a) => a.userId === user.id && a.quizId === quizId && a.passed)

  return (
    <>
      <Link href="/courses" className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Course catalogue
      </Link>

      <header className="mb-8 border-b-2 border-brass pb-5">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="callno text-lg text-primary">{course.code}</span>
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{course.subject}</span>
          <Badge>{course.level}</Badge>
          {!course.published && <Badge>Draft, only you can see this</Badge>}
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{course.title}</h1>
        <p className="mt-2 max-w-prose text-lg text-muted-foreground">{course.summary}</p>
        <p className="callno mt-3 text-sm text-muted-foreground">
          {courseHours(course)} h / {plural(lessonCount(course), 'lesson')} / {plural(course.modules.length, 'module')}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {isStudent && !enrollment && (
            <Button
              className="min-h-11"
              onClick={() => {
                enroll(course.id)
                toast.success(`Enrolled in ${course.title}`)
              }}
            >
              Enrol in this course
            </Button>
          )}
          {isStudent && enrollment && target && (
            <>
              <Button asChild className="min-h-11">
                <Link href={`/courses/${course.id}/learn?lesson=${target.id}`}>{started ? 'Continue' : 'Start'}: {target.title}</Link>
              </Button>
              <Button variant="outline" className="min-h-11" onClick={() => setLeaving(true)}>
                Leave course
              </Button>
              {enrollment.completedAt && <Stamp>Completed {shortDate(enrollment.completedAt)}</Stamp>}
            </>
          )}
          {!isStudent && lessons[0] && (
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`/courses/${course.id}/learn?lesson=${lessons[0].id}`}>Preview the lessons</Link>
            </Button>
          )}
          {user.role === 'tutor' && course.tutorId === user.id && (
            <Button asChild variant="outline" className="min-h-11">
              <Link href={`/tutor/courses/${course.id}/edit`}>Edit course</Link>
            </Button>
          )}
        </div>
        {isStudent && enrollment && <ProgressRule className="mt-4 max-w-sm" percent={percent} />}
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-10">
          <section aria-labelledby="about-h">
            <h2 id="about-h" className="text-xl font-bold">About this course</h2>
            <div className="mt-2 max-w-prose space-y-3">
              {(course.description || course.summary).split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          {course.outcomes.length > 0 && (
            <section aria-labelledby="out-h">
              <h2 id="out-h" className="text-xl font-bold">What you will be able to do</h2>
              <ul className="mt-2 max-w-prose list-disc space-y-1 pl-5">
                {course.outcomes.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="syl-h">
            <h2 id="syl-h" className="text-xl font-bold">Syllabus</h2>
            {course.modules.length === 0 ? (
              <p className="mt-2 text-muted-foreground">No lessons have been added yet.</p>
            ) : (
              <ol className="mt-3 space-y-5">
                {course.modules.map((m, mi) => (
                  <li key={m.id} className="rounded-md border border-border bg-card">
                    <h3 className="border-b border-border px-4 py-3 font-bold">
                      <span className="callno mr-2 text-sm text-primary">{course.code}.{mi + 1}</span>
                      {m.title}
                    </h3>
                    <ul>
                      {m.lessons.map((l) => {
                        const done = enrollment?.completedLessons.includes(l.id)
                        const inner = (
                          <>
                            <span className="min-w-0 flex-1">{l.title}</span>
                            {done && <span className="text-xs font-semibold text-primary">Done</span>}
                            <span className="callno text-xs text-muted-foreground">{l.minutes} min</span>
                          </>
                        )
                        return (
                          <li key={l.id} className="border-b border-border last:border-b-0">
                            {showExtras ? (
                              <Link href={`/courses/${course.id}/learn?lesson=${l.id}`} className="flex min-h-11 items-center gap-3 px-4 py-2 hover:bg-accent">
                                {inner}
                              </Link>
                            ) : (
                              <div className="flex min-h-11 items-center gap-3 px-4 py-2">{inner}</div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-8" aria-label="Course details">
          <section aria-labelledby="tutor-h" className="rounded-md border border-border bg-card p-4">
            <h2 id="tutor-h" className="text-sm font-semibold text-muted-foreground">Your tutor</h2>
            <div className="mt-2 flex items-start gap-3">
              <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initials(tutor?.name ?? 'T')}
              </span>
              <div>
                <p className="font-bold">{tutor?.name ?? 'Tutor'}</p>
                {tutor?.headline && <p className="text-sm text-muted-foreground">{tutor.headline}</p>}
                {tutor?.bio && <p className="mt-1 text-sm">{tutor.bio}</p>}
              </div>
            </div>
          </section>

          {showExtras ? (
            <>
              <section aria-labelledby="work-h">
                <h2 id="work-h" className="text-lg font-bold">Quiz and assignment</h2>
                {courseQuizzes.length === 0 && courseAssignments.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">Nothing set for this course yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {courseQuizzes.map((q) => (
                      <li key={q.id}>
                        <Link href={`/assessments/${q.id}`} className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 hover:border-primary">
                          <span className="font-semibold">{q.title}</span>
                          <span className="callno text-xs text-muted-foreground">
                            Quiz / {q.minutes} min / pass {q.passMark}%
                          </span>
                          {isStudent && passed(q.id) && <Stamp>Passed</Stamp>}
                        </Link>
                      </li>
                    ))}
                    {courseAssignments.map((a) => (
                      <li key={a.id}>
                        <Link href={`/assignments/${a.id}`} className="flex min-h-11 flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 hover:border-primary">
                          <span className="font-semibold">{a.title}</span>
                          <span className="callno text-xs text-muted-foreground">
                            Assignment / {a.points} pts / {dueLabel(a.dueAt).text}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section aria-labelledby="mat-h">
                <h2 id="mat-h" className="text-lg font-bold">Materials</h2>
                {courseMaterials.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">No materials for this course yet.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {courseMaterials.map((m) => (
                      <li key={m.id}>
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 hover:border-primary">
                          <span>
                            <span className="block font-semibold">{m.title}</span>
                            <span className="callno text-xs uppercase text-muted-foreground">{m.kind}</span>
                          </span>
                          <ExternalLink className="h-4 w-4 shrink-0" aria-label="Opens in a new tab" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          ) : (
            isStudent && <p className="rounded-md border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">Enrol to see the quiz, assignment and study materials for this course.</p>
          )}

          <section aria-labelledby="live-h">
            <h2 id="live-h" className="text-lg font-bold">Live classes</h2>
            {courseClasses.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No live classes scheduled for this course.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {courseClasses.map((l) => (
                  <li key={l.id}>
                    <Link href="/live-classes" className="block min-h-11 rounded-md border border-border bg-card px-3 py-2 hover:border-primary">
                      <span className="block font-semibold">{l.title}</span>
                      <span className="callno text-xs text-muted-foreground">
                        {dayTime(l.startsAt)} / {l.durationMin} min
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={leaving}
        onOpenChange={setLeaving}
        title="Leave this course?"
        description="Your lesson progress for this course will be removed. Quiz attempts and any certificate you already earned are kept."
        confirmLabel="Leave course"
        onConfirm={() => {
          unenroll(course.id)
          toast.success(`You left ${course.title}`)
        }}
      />
    </>
  )
}

export default function CourseDetailPage() {
  return (
    <AppShell>
      <CourseDetail />
    </AppShell>
  )
}
