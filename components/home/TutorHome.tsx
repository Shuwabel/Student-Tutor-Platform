'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ClipboardList, FilePlus, FolderOpen, Library, Video } from 'lucide-react'
import EmptyState from '@/components/catalog/EmptyState'
import Stamp from '@/components/catalog/Stamp'
import { Button } from '@/components/ui/button'
import { upcomingClasses } from '@/lib/home'
import { dayTime, plural, shortDate } from '@/lib/format'
import { useStore } from '@/lib/store'
import type { User } from '@/lib/types'

const ACTIONS = [
  { href: '/tutor/courses/new', label: 'New course', icon: Library },
  { href: '/assessments/new', label: 'New quiz', icon: ClipboardList },
  { href: '/assignments/new', label: 'New assignment', icon: FilePlus },
  { href: '/live-classes', label: 'Live classes', icon: Video },
  { href: '/materials', label: 'Materials', icon: FolderOpen },
]

export default function TutorHome({ user }: { user: User }) {
  const courses = useStore((s) => s.courses)
  const enrollments = useStore((s) => s.enrollments)
  const assignments = useStore((s) => s.assignments)
  const submissions = useStore((s) => s.submissions)
  const liveClasses = useStore((s) => s.liveClasses)
  const users = useStore((s) => s.users)
  const now = useMemo(() => new Date(), [])

  const mine = useMemo(() => courses.filter((c) => c.tutorId === user.id), [courses, user.id])
  const myIds = useMemo(() => new Set(mine.map((c) => c.id)), [mine])
  const queue = useMemo(() => {
    const byAssignment = new Map(assignments.filter((a) => myIds.has(a.courseId)).map((a) => [a.id, a]))
    return submissions
      .filter((s) => byAssignment.has(s.assignmentId) && s.grade === undefined)
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
      .map((s) => ({ submission: s, assignment: byAssignment.get(s.assignmentId)! }))
  }, [assignments, submissions, myIds])
  const classes = useMemo(() => upcomingClasses(liveClasses, now, (l) => l.tutorId === user.id).slice(0, 4), [liveClasses, now, user.id])

  return (
    <div className="space-y-10">
      <header className="border-b-2 border-brass pb-4">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hello, {user.name.split(' ')[0]}</h1>
        <p className="callno mt-1 text-sm text-muted-foreground">{format(now, 'EEEE d MMMM yyyy')}</p>
      </header>

      <section aria-label="Quick actions">
        <ul className="flex flex-wrap gap-2">
          {ACTIONS.map(({ href, label, icon: Icon }, i) => (
            <li key={href}>
              <Button asChild variant={i === 0 ? 'default' : 'outline'} className="h-11">
                <Link href={href}><Icon aria-hidden="true" />{label}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="teach-h">
          <h2 id="teach-h" className="mb-3 text-xl font-bold">Courses I teach</h2>
          {mine.length === 0 ? (
            <EmptyState title="You have no courses yet" action={<Button asChild className="h-11"><Link href="/tutor/courses/new">Write your first course</Link></Button>}>
              Create a course and publish it when it is ready for students.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {mine.map((c) => {
                const n = enrollments.filter((e) => e.courseId === c.id).length
                return (
                  <li key={c.id}>
                    <Link href="/tutor/courses" className="grid min-h-16 items-center gap-1 px-4 py-3 transition-colors hover:bg-accent sm:grid-cols-[6rem_1fr_auto]">
                      <span className="callno text-sm text-primary">{c.code}</span>
                      <span>
                        <span className="block font-semibold">{c.title}</span>
                        <span className="text-sm text-muted-foreground">{plural(n, 'student')} enrolled</span>
                      </span>
                      <span className="callno text-xs font-semibold uppercase tracking-wide text-muted-foreground">{c.published ? 'Published' : 'Draft'}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <div className="space-y-8">
          <section aria-labelledby="grade-h">
            <h2 id="grade-h" className="mb-3 text-xl font-bold">Grading queue</h2>
            {queue.length === 0 ? (
              <EmptyState title="Nothing waiting to be graded" />
            ) : (
              <ul className="divide-y divide-border rounded-md border border-border bg-card">
                {queue.slice(0, 6).map(({ submission, assignment }) => (
                  <li key={submission.id}>
                    <Link href={`/assignments/${assignment.id}`} className="flex min-h-11 items-center justify-between gap-3 px-4 py-2 transition-colors hover:bg-accent">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{assignment.title}</span>
                        <span className="block truncate text-sm text-muted-foreground">{users.find((u) => u.id === submission.userId)?.name ?? 'Student'}</span>
                      </span>
                      <span className="callno shrink-0 text-xs text-muted-foreground">{shortDate(submission.submittedAt)}</span>
                    </Link>
                  </li>
                ))}
                {queue.length > 6 && <li className="px-4 py-2 text-sm text-muted-foreground">and {queue.length - 6} more</li>}
              </ul>
            )}
          </section>

          <section aria-labelledby="live-h">
            <h2 id="live-h" className="mb-3 text-xl font-bold">My next live classes</h2>
            {classes.length === 0 ? (
              <EmptyState title="No live classes scheduled" action={<Button asChild variant="outline" className="h-11"><Link href="/live-classes">Schedule one</Link></Button>} />
            ) : (
              <ul className="space-y-2">
                {classes.map((l) => (
                  <li key={l.id}>
                    <Link href="/live-classes" className="flex min-h-11 items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 transition-colors hover:border-primary">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{l.title}</span>
                        <span className="callno block text-xs text-muted-foreground">{dayTime(l.startsAt)}</span>
                      </span>
                      <Stamp>{format(parseISO(l.startsAt), 'd MMM')}</Stamp>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
