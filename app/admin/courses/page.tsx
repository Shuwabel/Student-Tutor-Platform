'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import PageTitle from '@/components/catalog/PageTitle'
import EmptyState from '@/components/catalog/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { plural } from '@/lib/format'
import { useStore } from '@/lib/store'
import type { Course } from '@/lib/types'

function AllCourses() {
  const courses = useStore((s) => s.courses)
  const users = useStore((s) => s.users)
  const enrollments = useStore((s) => s.enrollments)
  const setPublished = useStore((s) => s.setPublished)
  const deleteCourse = useStore((s) => s.deleteCourse)
  const [target, setTarget] = useState<Course | null>(null)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    enrollments.forEach((e) => m.set(e.courseId, (m.get(e.courseId) ?? 0) + 1))
    return m
  }, [enrollments])

  return (
    <>
      <PageTitle title="All courses" intro="Publish or unpublish a course, or delete it with everything attached to it." />
      {courses.length === 0 ? (
        <EmptyState title="There are no courses" />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {courses.map((c) => (
            <li key={c.id} className="grid items-center gap-3 px-4 py-3 md:grid-cols-[6rem_1fr_9rem_auto]">
              <span className="callno text-sm text-primary">{c.code}</span>
              <div className="min-w-0">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-muted-foreground">
                  {users.find((u) => u.id === c.tutorId)?.name ?? 'Unknown tutor'} &middot; {plural(counts.get(c.id) ?? 0, 'enrolment')}
                </p>
              </div>
              <Button
                variant={c.published ? 'secondary' : 'outline'}
                className="h-11"
                aria-pressed={c.published}
                onClick={() => {
                  setPublished(c.id, !c.published)
                  toast.success(c.published ? `${c.code} unpublished` : `${c.code} published`)
                }}
              >
                {c.published ? 'Published' : 'Draft'}
              </Button>
              <Button variant="outline" className="h-11" onClick={() => setTarget(c)} aria-label={`Delete ${c.title}`}>
                <Trash2 aria-hidden="true" /> Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-sm text-muted-foreground">The published button is a toggle: press it to switch between published and draft.</p>

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title={`Delete ${target?.title ?? 'this course'}?`}
        description="Its enrolments, quizzes, attempts, assignments, submissions, live classes and materials are deleted too. This cannot be undone, except by resetting the demo."
        confirmLabel="Delete course"
        onConfirm={() => {
          if (!target) return
          deleteCourse(target.id)
          toast.success(`${target.code} deleted`)
        }}
      />
    </>
  )
}

export default function AdminCoursesPage() {
  return (
    <AppShell roles={['admin']}>
      <AllCourses />
    </AppShell>
  )
}
