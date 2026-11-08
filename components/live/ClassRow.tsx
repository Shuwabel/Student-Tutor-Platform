'use client'

import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dayDate, shortDate, startsIn, timeOnly } from '@/lib/format'
import { classPhase } from '@/lib/live'
import type { Course, LiveClass } from '@/lib/types'

export function phaseLabel(c: LiveClass, now: Date): string {
  const phase = classPhase(c.startsAt, c.durationMin, now)
  if (phase === 'live') return 'In progress now'
  if (phase === 'ended') return `Ended ${shortDate(c.startsAt)}`
  return `Starts ${startsIn(c.startsAt)}`
}

export default function ClassRow({
  liveClass,
  course,
  tutorName,
  enrolled,
  now,
  onEdit,
  onDelete,
}: {
  liveClass: LiveClass
  course?: Course
  tutorName: string
  enrolled: boolean
  now: Date
  onEdit?: () => void
  onDelete?: () => void
}) {
  const phase = classPhase(liveClass.startsAt, liveClass.durationMin, now)
  return (
    <li className="rounded-md border border-border bg-card">
      <div className="grid gap-3 p-4 md:grid-cols-[9rem_1fr_auto] md:items-center">
        <div className="callno text-sm">
          <div>{dayDate(liveClass.startsAt)}</div>
          <div className="text-muted-foreground">
            {timeOnly(liveClass.startsAt)} for {liveClass.durationMin} min
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug">
            <Link href={`/live-classes/${liveClass.id}`} className="hover:underline">
              {liveClass.title}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {course ? <span className="callno text-primary">{course.code}</span> : <span>No course</span>}
            {' · '}
            {tutorName}
            {enrolled && ' · You are enrolled'}
          </p>
          <p className={phase === 'live' ? 'mt-1 text-sm font-semibold text-primary' : 'mt-1 text-sm text-muted-foreground'}>{phaseLabel(liveClass, now)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onEdit && (
            <Button type="button" variant="outline" size="icon" className="size-11" onClick={onEdit} aria-label={`Edit ${liveClass.title}`}>
              <Pencil />
            </Button>
          )}
          {onDelete && (
            <Button type="button" variant="outline" size="icon" className="size-11" onClick={onDelete} aria-label={`Delete ${liveClass.title}`}>
              <Trash2 />
            </Button>
          )}
          <Button asChild className="h-11">
            <Link href={`/live-classes/${liveClass.id}`}>{phase === 'ended' ? 'Details' : 'Open class'}</Link>
          </Button>
        </div>
      </div>
    </li>
  )
}
