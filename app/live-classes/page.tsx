'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import PageTitle from '@/components/catalog/PageTitle'
import EmptyState from '@/components/catalog/EmptyState'
import ClassRow from '@/components/live/ClassRow'
import ClassFormDialog from '@/components/live/ClassFormDialog'
import { useNow } from '@/components/live/useNow'
import ConfirmDialog from '@/components/materials/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { classPhase } from '@/lib/live'
import { useCurrentUser, useStore } from '@/lib/store'
import type { LiveClass } from '@/lib/types'

function Content() {
  const user = useCurrentUser()!
  const liveClasses = useStore((s) => s.liveClasses)
  const courses = useStore((s) => s.courses)
  const users = useStore((s) => s.users)
  const enrollments = useStore((s) => s.enrollments)
  const saveLiveClass = useStore((s) => s.saveLiveClass)
  const deleteLiveClass = useStore((s) => s.deleteLiveClass)
  const now = useNow()
  const [editing, setEditing] = useState<LiveClass | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<LiveClass | undefined>()

  const enrolledIds = useMemo(() => new Set(enrollments.filter((e) => e.userId === user.id).map((e) => e.courseId)), [enrollments, user.id])
  const myCourses = useMemo(() => (user.role === 'admin' ? courses : courses.filter((c) => c.tutorId === user.id)), [courses, user.id, user.role])
  const isEnrolled = (c: LiveClass) => !!c.courseId && enrolledIds.has(c.courseId)

  const { upcoming, past } = useMemo(() => {
    const up: LiveClass[] = []
    const pa: LiveClass[] = []
    for (const c of liveClasses) (classPhase(c.startsAt, c.durationMin, now) === 'ended' ? pa : up).push(c)
    const byTime = (a: LiveClass, b: LiveClass) => a.startsAt.localeCompare(b.startsAt)
    up.sort((a, b) => (user.role === 'student' ? Number(isEnrolled(b)) - Number(isEnrolled(a)) : 0) || byTime(a, b))
    pa.sort((a, b) => byTime(b, a))
    return { upcoming: up, past: pa }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveClasses, now, enrolledIds, user.role])

  const canManage = (c: LiveClass) => user.role === 'admin' || (user.role === 'tutor' && c.tutorId === user.id)

  const renderList = (list: LiveClass[]) => (
    <ul className="grid gap-3">
      {list.map((c) => (
        <ClassRow
          key={c.id}
          liveClass={c}
          course={courses.find((x) => x.id === c.courseId)}
          tutorName={users.find((u) => u.id === c.tutorId)?.name ?? 'Tutor'}
          enrolled={user.role === 'student' && isEnrolled(c)}
          now={now}
          onEdit={canManage(c) ? () => { setEditing(c); setFormOpen(true) } : undefined}
          onDelete={canManage(c) ? () => setDeleting(c) : undefined}
        />
      ))}
    </ul>
  )

  return (
    <>
      <PageTitle
        title="Live classes"
        intro="Scheduled sessions held in free public video rooms. Students see classes for their enrolled courses first."
        action={
          user.role === 'tutor' ? (
            <Button className="h-11" onClick={() => { setEditing(undefined); setFormOpen(true) }}>
              <Plus /> Schedule a class
            </Button>
          ) : undefined
        }
      />
      <Tabs defaultValue="upcoming">
        <TabsList className="h-11 w-full sm:w-fit">
          <TabsTrigger value="upcoming" className="min-h-9 px-4">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past" className="min-h-9 px-4">Past ({past.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-3">
          {upcoming.length ? (
            renderList(upcoming)
          ) : (
            <EmptyState title="No classes are scheduled">{user.role === 'tutor' ? 'Use Schedule a class to add one. Students will see it straight away.' : 'When a tutor schedules a class it will appear here.'}</EmptyState>
          )}
        </TabsContent>
        <TabsContent value="past" className="mt-3">
          {past.length ? renderList(past) : <EmptyState title="No past classes yet">Classes that have finished are listed here.</EmptyState>}
        </TabsContent>
      </Tabs>

      <ClassFormDialog open={formOpen} onOpenChange={setFormOpen} existing={editing} tutorId={user.id} courses={myCourses} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(undefined)}
        title="Delete this class?"
        description={deleting ? `${deleting.title} will be removed for everyone. You can undo straight afterwards.` : ''}
        confirmLabel="Delete class"
        onConfirm={() => {
          if (!deleting) return
          const removed = deleting
          deleteLiveClass(removed.id)
          toast.success('Class deleted.', { action: { label: 'Undo', onClick: () => saveLiveClass(removed) } })
        }}
      />
    </>
  )
}

export default function LiveClassesPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}
