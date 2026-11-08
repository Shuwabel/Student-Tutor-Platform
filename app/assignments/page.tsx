'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import EmptyState from '@/components/catalog/EmptyState'
import PageTitle from '@/components/catalog/PageTitle'
import Stamp from '@/components/catalog/Stamp'
import ConfirmDialog from '@/components/quiz/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { dayTime, dueLabel, plural } from '@/lib/format'
import { useCurrentUser, useStore } from '@/lib/store'
import type { Assignment } from '@/lib/types'

export default function AssignmentsPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}

function Content() {
  const user = useCurrentUser()!
  return user.role === 'student' ? <StudentView userId={user.id} /> : <TutorView userId={user.id} admin={user.role === 'admin'} />
}

function StudentView({ userId }: { userId: string }) {
  const assignments = useStore((s) => s.assignments)
  const courses = useStore((s) => s.courses)
  const enrollments = useStore((s) => s.enrollments)
  const submissions = useStore((s) => s.submissions)

  const rows = useMemo(() => {
    const mine = new Set(enrollments.filter((e) => e.userId === userId).map((e) => e.courseId))
    return assignments
      .filter((a) => mine.has(a.courseId))
      .map((a) => {
        const sub = submissions.find((x) => x.assignmentId === a.id && x.userId === userId)
        const group = !sub ? 0 : sub.grade === undefined ? 1 : 2
        return { a, sub, group, course: courses.find((c) => c.id === a.courseId) }
      })
      .sort((x, y) => x.group - y.group || x.a.dueAt.localeCompare(y.a.dueAt))
  }, [assignments, courses, enrollments, submissions, userId])

  return (
    <>
      <PageTitle title="Assignments" intro="Work for the courses you are enrolled in, most urgent first." />
      {rows.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          action={
            <Button asChild className="min-h-11">
              <Link href="/courses">Browse courses</Link>
            </Button>
          }
        >
          Assignments appear here once you enrol in a course that sets them.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {rows.map(({ a, sub, course }) => {
            const due = dueLabel(a.dueAt)
            const graded = sub && sub.grade !== undefined
            return (
              <li key={a.id}>
                <Link href={`/assignments/${a.id}`} className="flex min-h-16 flex-wrap items-center justify-between gap-3 p-4 hover:bg-accent focus-visible:outline-offset-[-2px]">
                  <div className="min-w-0 flex-1 basis-60">
                    <p className="callno text-sm text-primary">{course?.code}</p>
                    <p className="text-lg font-bold leading-snug">{a.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Due <span className="callno">{dayTime(a.dueAt)}</span>, {plural(a.points, 'point')}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    {graded ? (
                      <Stamp>
                        Graded {sub.grade}/{a.points}
                      </Stamp>
                    ) : sub ? (
                      <span className="font-semibold">Submitted, waiting for a grade</span>
                    ) : (
                      <>
                        <span className="font-semibold">Not submitted</span>
                        <Stamp>{due.text}</Stamp>
                      </>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

function TutorView({ userId, admin }: { userId: string; admin: boolean }) {
  const assignments = useStore((s) => s.assignments)
  const courses = useStore((s) => s.courses)
  const submissions = useStore((s) => s.submissions)
  const users = useStore((s) => s.users)
  const deleteAssignment = useStore((s) => s.deleteAssignment)
  const [toDelete, setToDelete] = useState<Assignment | null>(null)

  const own = useMemo(() => {
    const ids = new Set(courses.filter((c) => admin || c.tutorId === userId).map((c) => c.id))
    return assignments.filter((a) => ids.has(a.courseId))
  }, [assignments, courses, admin, userId])

  const queue = useMemo(() => {
    const byId = new Map(own.map((a) => [a.id, a]))
    return submissions
      .filter((s) => byId.has(s.assignmentId))
      .map((s) => ({ s, a: byId.get(s.assignmentId)!, student: users.find((u) => u.id === s.userId) }))
      .sort((x, y) => Number(x.s.grade !== undefined) - Number(y.s.grade !== undefined) || (x.s.grade === undefined ? x.s.submittedAt.localeCompare(y.s.submittedAt) : y.s.submittedAt.localeCompare(x.s.submittedAt)))
  }, [own, submissions, users])
  const waiting = queue.filter((q) => q.s.grade === undefined).length

  return (
    <>
      <PageTitle
        title="Grading"
        intro="Submissions waiting for a grade come first."
        action={
          <Button asChild className="min-h-11">
            <Link href="/assignments/new">
              <Plus /> New assignment
            </Link>
          </Button>
        }
      />

      <section aria-labelledby="queue-h" className="mb-10">
        <h2 id="queue-h" className="mb-3 text-xl font-bold">
          Grading queue <span className="callno text-base text-muted-foreground">{waiting} waiting</span>
        </h2>
        {queue.length === 0 ? (
          <EmptyState title="Nothing submitted yet">When students hand in work for your assignments it will line up here.</EmptyState>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {queue.slice(0, 12).map(({ s, a, student }) => (
              <li key={s.id}>
                <Link href={`/assignments/${a.id}#sub-${s.id}`} className="flex min-h-16 flex-wrap items-center justify-between gap-3 p-4 hover:bg-accent focus-visible:outline-offset-[-2px]">
                  <div className="min-w-0 flex-1 basis-56">
                    <p className="font-bold">{student?.name ?? 'Removed student'}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.title}, submitted <span className="callno">{dayTime(s.submittedAt)}</span>
                    </p>
                  </div>
                  {s.grade === undefined ? (
                    <span className="font-semibold text-primary">Needs grading</span>
                  ) : (
                    <Stamp>
                      Graded {s.grade}/{a.points}
                    </Stamp>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {queue.length > 12 && <p className="mt-2 text-sm text-muted-foreground">Showing the first 12 of {queue.length}. Open an assignment to see them all.</p>}
      </section>

      <section aria-labelledby="mine-h">
        <h2 id="mine-h" className="mb-3 text-xl font-bold">
          {admin ? 'All assignments' : 'Your assignments'}
        </h2>
        {own.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            action={
              <Button asChild className="min-h-11">
                <Link href="/assignments/new">Set the first assignment</Link>
              </Button>
            }
          >
            Create one for a course and students enrolled in it will see it straight away.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border rounded-md border border-border bg-card">
            {own.map((a) => {
              const course = courses.find((c) => c.id === a.courseId)
              const subs = submissions.filter((x) => x.assignmentId === a.id)
              const ungraded = subs.filter((x) => x.grade === undefined).length
              const due = dueLabel(a.dueAt)
              return (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1 basis-60">
                    <p className="callno text-sm text-primary">{course?.code}</p>
                    <Link href={`/assignments/${a.id}`} className="text-lg font-bold leading-snug hover:underline">
                      {a.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Due <span className="callno">{dayTime(a.dueAt)}</span> ({due.text}), {plural(a.points, 'point')}. {plural(subs.length, 'submission')}, {ungraded} to grade.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="min-h-11">
                      <Link href={`/assignments/${a.id}`}>Open</Link>
                    </Button>
                    <Button asChild variant="outline" className="min-h-11">
                      <Link href={`/assignments/${a.id}/edit`}>
                        <Pencil /> Edit
                      </Link>
                    </Button>
                    <Button variant="outline" className="min-h-11" onClick={() => setToDelete(a)} aria-label={`Delete ${a.title}`}>
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete "${toDelete?.title ?? ''}"?`}
        description="The assignment and every submission and grade for it are removed. This cannot be undone."
        confirmLabel="Delete assignment"
        onConfirm={() => {
          if (!toDelete) return
          deleteAssignment(toDelete.id)
          toast.success(`Deleted "${toDelete.title}".`)
        }}
      />
    </>
  )
}
