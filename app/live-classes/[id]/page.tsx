'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ArrowLeft, ExternalLink, Pencil, Trash2, Video } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import EmptyState from '@/components/catalog/EmptyState'
import { phaseLabel } from '@/components/live/ClassRow'
import ClassFormDialog from '@/components/live/ClassFormDialog'
import { useNow } from '@/components/live/useNow'
import ConfirmDialog from '@/components/materials/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { dayTime } from '@/lib/format'
import { classPhase } from '@/lib/live'
import { useCurrentUser, useStore } from '@/lib/store'

function Content() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const user = useCurrentUser()!
  const liveClasses = useStore((s) => s.liveClasses)
  const courses = useStore((s) => s.courses)
  const users = useStore((s) => s.users)
  const saveLiveClass = useStore((s) => s.saveLiveClass)
  const deleteLiveClass = useStore((s) => s.deleteLiveClass)
  const now = useNow(15000)
  const [joined, setJoined] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const liveClass = liveClasses.find((c) => c.id === id)
  const course = courses.find((c) => c.id === liveClass?.courseId)
  const tutor = users.find((u) => u.id === liveClass?.tutorId)
  const myCourses = useMemo(() => (user.role === 'admin' ? courses : courses.filter((c) => c.tutorId === user.id)), [courses, user.id, user.role])

  if (!liveClass) {
    return (
      <EmptyState
        title="This class is not in the schedule"
        action={
          <Button asChild className="h-11">
            <Link href="/live-classes">Back to live classes</Link>
          </Button>
        }
      >
        It may have been deleted or the link may be wrong.
      </EmptyState>
    )
  }

  const phase = classPhase(liveClass.startsAt, liveClass.durationMin, now)
  const canManage = user.role === 'admin' || (user.role === 'tutor' && liveClass.tutorId === user.id)
  const roomUrl = `https://meet.jit.si/${encodeURIComponent(liveClass.room)}`
  const embedUrl = `${roomUrl}#userInfo.displayName=%22${encodeURIComponent(user.name)}%22&config.prejoinPageEnabled=true`

  return (
    <>
      <Link href="/live-classes" className="mb-4 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All live classes
      </Link>

      <article className="rounded-md border border-border bg-card">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-brass px-4 pb-1 pt-3">
          <span className="callno text-sm text-primary">{course ? course.code : 'Open session'}</span>
          <span className="callno text-sm text-muted-foreground">{dayTime(liveClass.startsAt)}</span>
        </div>
        <div className="grid gap-4 p-4 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{liveClass.title}</h1>
              <p className="mt-1 text-muted-foreground">
                {tutor?.name ?? 'Tutor'} · {liveClass.durationMin} minutes{course ? ` · ${course.title}` : ''}
              </p>
            </div>
            {canManage && (
              <div className="flex gap-2">
                <Button variant="outline" className="h-11" onClick={() => setEditOpen(true)}>
                  <Pencil /> Edit
                </Button>
                <Button variant="outline" className="h-11" onClick={() => setDeleteOpen(true)}>
                  <Trash2 /> Delete
                </Button>
              </div>
            )}
          </div>
          {liveClass.description && <p className="max-w-prose">{liveClass.description}</p>}
          <p className="font-semibold" aria-live="polite">
            {phaseLabel(liveClass, now)}
          </p>
        </div>
      </article>

      <section aria-labelledby="room-h" className="mt-6 rounded-md border border-border bg-card p-4 md:p-6">
        <h2 id="room-h" className="text-xl font-bold">Video room</h2>
        {phase === 'upcoming' && (
          <p className="mt-1 text-muted-foreground">
            The class has not started yet. For this demo you can open the room early, but the tutor may not be there until {dayTime(liveClass.startsAt)}.
          </p>
        )}
        {phase === 'ended' && <p className="mt-1 text-muted-foreground">This class has finished. The room still exists, but nobody is expected to be in it.</p>}
        {phase === 'live' && <p className="mt-1 text-muted-foreground">The class is on now.</p>}

        {!joined ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="h-11" onClick={() => setJoined(true)}>
              <Video /> Join the room
            </Button>
            <Button asChild variant="outline" className="h-11">
              <a href={roomUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open in a new tab
              </a>
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-muted">
              <iframe title={`Video room for ${liveClass.title}`} src={embedUrl} allow="camera; microphone; fullscreen; display-capture" className="h-full w-full" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild variant="outline" className="h-11">
                <a href={roomUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Open in a new tab
                </a>
              </Button>
              <Button variant="outline" className="h-11" onClick={() => setJoined(false)}>
                Leave the room
              </Button>
            </div>
          </div>
        )}
        <p className="mt-4 max-w-prose text-sm text-muted-foreground">
          This is a free public Jitsi room. Anyone with the link can join, so do not share private information in it.
        </p>
        {liveClass.recordingUrl && (
          <p className="mt-3 text-sm">
            <a href={liveClass.recordingUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
              Watch the recording
            </a>
          </p>
        )}
      </section>

      <ClassFormDialog open={editOpen} onOpenChange={setEditOpen} existing={liveClass} tutorId={user.id} courses={myCourses} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this class?"
        description={`${liveClass.title} will be removed for everyone. You can undo straight afterwards.`}
        confirmLabel="Delete class"
        onConfirm={() => {
          const removed = liveClass
          deleteLiveClass(removed.id)
          toast.success('Class deleted.', { action: { label: 'Undo', onClick: () => saveLiveClass(removed) } })
          router.push('/live-classes')
        }}
      />
    </>
  )
}

export default function LiveClassPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}
