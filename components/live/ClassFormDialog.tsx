'use client'

import { useState } from 'react'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { isoToDateInput, isoToTimeInput, roomName, toIso } from '@/lib/live'
import { uid, useStore } from '@/lib/store'
import type { Course, LiveClass } from '@/lib/types'

type Errors = Partial<Record<'title' | 'when' | 'duration', string>>

function Form({ existing, tutorId, courses, onDone }: { existing?: LiveClass; tutorId: string; courses: Course[]; onDone: () => void }) {
  const saveLiveClass = useStore((s) => s.saveLiveClass)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [courseId, setCourseId] = useState(existing?.courseId ?? 'none')
  const [date, setDate] = useState(existing ? isoToDateInput(existing.startsAt) : format(addDays(new Date(), 1), 'yyyy-MM-dd'))
  const [time, setTime] = useState(existing ? isoToTimeInput(existing.startsAt) : '17:00')
  const [duration, setDuration] = useState(String(existing?.durationMin ?? 60))
  const [errors, setErrors] = useState<Errors>({})

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (!title.trim()) next.title = 'Give the class a title.'
    const startsAt = toIso(date, time)
    if (!startsAt) next.when = 'Pick a date and a time.'
    const mins = Number(duration)
    if (!Number.isInteger(mins) || mins < 10 || mins > 240) next.duration = 'Use a whole number of minutes from 10 to 240.'
    setErrors(next)
    if (Object.keys(next).length || !startsAt) return
    const id = existing?.id ?? uid('live')
    saveLiveClass({
      id,
      courseId: courseId === 'none' ? undefined : courseId,
      title: title.trim(),
      description: description.trim(),
      tutorId: existing?.tutorId ?? tutorId,
      startsAt,
      durationMin: mins,
      room: existing?.room ?? roomName(title, id),
      recordingUrl: existing?.recordingUrl,
    })
    toast.success(existing ? 'Class updated.' : 'Class scheduled. Students can see it now.')
    onDone()
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="lc-title">Title</Label>
        <Input id="lc-title" className="h-11" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'lc-title-e' : undefined} />
        {errors.title && <p id="lc-title-e" className="text-sm text-destructive">{errors.title}</p>}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lc-desc">Description</Label>
        <Textarea id="lc-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="lc-course">Course (optional)</Label>
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger id="lc-course" className="h-11 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No course</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.code} {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="lc-date">Date</Label>
          <Input id="lc-date" type="date" className="h-11" value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.when} aria-describedby={errors.when ? 'lc-when-e' : undefined} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lc-time">Start time</Label>
          <Input id="lc-time" type="time" className="h-11" value={time} onChange={(e) => setTime(e.target.value)} aria-invalid={!!errors.when} aria-describedby={errors.when ? 'lc-when-e' : undefined} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="lc-dur">Minutes</Label>
          <Input id="lc-dur" type="number" inputMode="numeric" min={10} max={240} className="h-11" value={duration} onChange={(e) => setDuration(e.target.value)} aria-invalid={!!errors.duration} aria-describedby={errors.duration ? 'lc-dur-e' : undefined} />
        </div>
      </div>
      {errors.when && <p id="lc-when-e" className="text-sm text-destructive">{errors.when}</p>}
      {errors.duration && <p id="lc-dur-e" className="text-sm text-destructive">{errors.duration}</p>}
      <p className="text-sm text-muted-foreground">
        The video room name is made for you{existing ? ' and stays the same when you edit' : ''}. It is a free public Jitsi room, so anyone with the link can join.
      </p>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" className="h-11" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" className="h-11">
          {existing ? 'Save changes' : 'Schedule class'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function ClassFormDialog({
  open,
  onOpenChange,
  existing,
  tutorId,
  courses,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  existing?: LiveClass
  tutorId: string
  courses: Course[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit class' : 'Schedule a class'}</DialogTitle>
          <DialogDescription>Times are in your local time zone.</DialogDescription>
        </DialogHeader>
        {open && <Form existing={existing} tutorId={tutorId} courses={courses} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
