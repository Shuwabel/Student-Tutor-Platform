'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import EmptyState from '@/components/catalog/EmptyState'
import PageTitle from '@/components/catalog/PageTitle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import ConfirmDialog from '@/components/courses/ConfirmDialog'
import { plural } from '@/lib/format'
import { courseHours, lessonCount } from '@/lib/selectors'
import { useCurrentUser, useStore } from '@/lib/store'
import type { Course } from '@/lib/types'

function MyCourses() {
  const user = useCurrentUser()
  const courses = useStore((s) => s.courses)
  const users = useStore((s) => s.users)
  const enrollments = useStore((s) => s.enrollments)
  const setPublished = useStore((s) => s.setPublished)
  const deleteCourse = useStore((s) => s.deleteCourse)
  const [toDelete, setToDelete] = useState<Course | null>(null)

  const isAdmin = user?.role === 'admin'
  const mine = useMemo(() => courses.filter((c) => isAdmin || c.tutorId === user?.id), [courses, isAdmin, user?.id])
  const names = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users])
  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of enrollments) m.set(e.courseId, (m.get(e.courseId) ?? 0) + 1)
    return m
  }, [enrollments])

  return (
    <>
      <PageTitle
        title={isAdmin ? 'All courses' : 'My courses'}
        intro="Drafts are visible only to you. Publish a course when it is ready for students to enrol."
        action={
          <Button asChild className="min-h-11">
            <Link href="/tutor/courses/new">
              <Plus aria-hidden="true" /> New course
            </Link>
          </Button>
        }
      />

      {mine.length === 0 ? (
        <EmptyState
          title="You have no courses yet"
          action={
            <Button asChild className="min-h-11">
              <Link href="/tutor/courses/new">Write your first course</Link>
            </Button>
          }
        >
          Start with a title and a few lessons. You can save a draft at any point.
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {mine.map((c) => (
            <li key={c.id} className="rounded-md border border-border bg-card">
              <div className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="callno text-sm text-primary">{c.code}</span>
                    <Badge>{c.published ? 'Published' : 'Draft'}</Badge>
                  </p>
                  <h2 className="mt-1 text-lg font-bold">
                    <Link href={`/courses/${c.id}`} className="hover:underline">{c.title}</Link>
                  </h2>
                  <p className="callno mt-1 text-xs text-muted-foreground">
                    {plural(counts.get(c.id) ?? 0, 'student')} / {plural(lessonCount(c), 'lesson')} / {courseHours(c)} h
                    {isAdmin && ` / ${names.get(c.tutorId) ?? 'Tutor'}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="min-h-11"
                    aria-label={c.published ? `Unpublish ${c.title}` : `Publish ${c.title}`}
                    onClick={() => {
                      if (!c.published && lessonCount(c) === 0) {
                        toast.error('Add at least one lesson before publishing.')
                        return
                      }
                      setPublished(c.id, !c.published)
                      toast.success(c.published ? `${c.code} moved back to draft` : `${c.code} is now published`)
                    }}
                  >
                    {c.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button asChild variant="outline" className="min-h-11">
                    <Link href={`/tutor/courses/${c.id}/edit`} aria-label={`Edit ${c.title}`}>Edit</Link>
                  </Button>
                  <Button variant="ghost" className="min-h-11 text-destructive hover:text-destructive" aria-label={`Delete ${c.title}`} onClick={() => setToDelete(c)}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete ${toDelete?.code ?? 'course'}?`}
        description={`This removes the course with its enrolments, quiz, assignments, live classes and materials. It cannot be undone.${
          toDelete && (counts.get(toDelete.id) ?? 0) > 0 ? ` ${plural(counts.get(toDelete.id) ?? 0, 'student')} will lose their progress.` : ''
        }`}
        confirmLabel="Delete course"
        onConfirm={() => {
          if (!toDelete) return
          deleteCourse(toDelete.id)
          toast.success(`${toDelete.code} deleted`)
          setToDelete(null)
        }}
      />
    </>
  )
}

export default function TutorCoursesPage() {
  return (
    <AppShell roles={['tutor', 'admin']}>
      <MyCourses />
    </AppShell>
  )
}
