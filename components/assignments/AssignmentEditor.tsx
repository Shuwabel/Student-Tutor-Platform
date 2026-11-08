'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import EmptyState from '@/components/catalog/EmptyState'
import PageTitle from '@/components/catalog/PageTitle'
import { nativeField } from '@/components/quiz/fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { uid, useCurrentUser, useStore } from '@/lib/store'

export default function AssignmentEditor({ assignmentId }: { assignmentId?: string }) {
  const user = useCurrentUser()!
  const assignments = useStore((s) => s.assignments)
  const allCourses = useStore((s) => s.courses)
  const saveAssignment = useStore((s) => s.saveAssignment)
  const router = useRouter()

  const existing = assignmentId ? assignments.find((a) => a.id === assignmentId) : undefined
  const courses = useMemo(() => allCourses.filter((c) => user.role === 'admin' || c.tutorId === user.id), [allCourses, user.id, user.role])

  const [courseId, setCourseId] = useState(existing?.courseId ?? courses[0]?.id ?? '')
  const [title, setTitle] = useState(existing?.title ?? '')
  const [brief, setBrief] = useState(existing?.brief ?? '')
  const [date, setDate] = useState(existing ? format(parseISO(existing.dueAt), 'yyyy-MM-dd') : '')
  const [time, setTime] = useState(existing ? format(parseISO(existing.dueAt), 'HH:mm') : '23:59')
  const [points, setPoints] = useState(String(existing?.points ?? 100))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const ownsExisting = !existing || user.role === 'admin' || allCourses.find((c) => c.id === existing.courseId)?.tutorId === user.id
  if ((assignmentId && !existing) || !ownsExisting) {
    return (
      <EmptyState
        title={assignmentId && !existing ? 'Assignment not found' : 'This assignment belongs to another tutor'}
        action={
          <Button asChild className="min-h-11">
            <Link href="/assignments">Back to grading</Link>
          </Button>
        }
      >
        {assignmentId && !existing ? 'It may have been deleted.' : 'You can only edit assignments for your own courses.'}
      </EmptyState>
    )
  }
  if (courses.length === 0) {
    return (
      <EmptyState
        title="Create a course first"
        action={
          <Button asChild className="min-h-11">
            <Link href="/tutor/courses">Go to my courses</Link>
          </Button>
        }
      >
        An assignment belongs to a course, and you do not have one yet.
      </EmptyState>
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!courseId) next.course = 'Choose a course.'
    if (!title.trim()) next.title = 'Give the assignment a title.'
    if (!brief.trim()) next.brief = 'Write the brief students will read.'
    const due = date && time ? new Date(`${date}T${time}`) : null
    if (!due || Number.isNaN(due.getTime())) next.due = 'Choose a due date and time.'
    const pts = Number(points)
    if (!Number.isInteger(pts) || pts < 1 || pts > 1000) next.points = 'Points must be a whole number from 1 to 1000.'
    setErrors(next)
    const keys = Object.keys(next)
    if (keys.length) {
      toast.error('Check the highlighted fields.')
      const first = { course: 'a-course', title: 'a-title', brief: 'a-brief', due: 'a-date', points: 'a-points' }[keys[0]]
      requestAnimationFrame(() => document.getElementById(first!)?.focus())
      return
    }
    setSaving(true)
    saveAssignment({ id: existing?.id ?? uid('asg'), courseId, title: title.trim(), brief: brief.trim(), dueAt: due!.toISOString(), points: pts })
    toast.success(existing ? 'Assignment updated.' : 'Assignment created. Enrolled students can see it now.')
    router.push('/assignments')
  }

  const err = (key: string) =>
    errors[key] ? (
      <p id={`a-${key}-err`} role="alert" className="mt-1 text-sm text-stamp">
        {errors[key]}
      </p>
    ) : null

  return (
    <>
      <PageTitle title={existing ? 'Edit assignment' : 'New assignment'} intro="Students enrolled in the course see it straight away." />
      <form onSubmit={submit} noValidate className="max-w-2xl space-y-4 rounded-md border border-border bg-card p-5">
        <div>
          <Label htmlFor="a-course">Course</Label>
          <select id="a-course" className={`${nativeField} mt-1`} value={courseId} onChange={(e) => setCourseId(e.target.value)} aria-invalid={!!errors.course}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.title}
              </option>
            ))}
          </select>
          {err('course')}
        </div>
        <div>
          <Label htmlFor="a-title">Title</Label>
          <Input id="a-title" className="mt-1 h-11" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'a-title-err' : undefined} />
          {err('title')}
        </div>
        <div>
          <Label htmlFor="a-brief">Brief</Label>
          <Textarea id="a-brief" className="mt-1" rows={8} value={brief} onChange={(e) => setBrief(e.target.value)} aria-invalid={!!errors.brief} aria-describedby="a-brief-help" />
          <p id="a-brief-help" className="mt-1 text-sm text-muted-foreground">Blank lines start a new paragraph. Start a line with "- " for a bullet or "## " for a heading.</p>
          {err('brief')}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="a-date">Due date</Label>
            <input id="a-date" type="date" className={`${nativeField} mt-1`} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!!errors.due} aria-describedby={errors.due ? 'a-due-err' : undefined} />
          </div>
          <div>
            <Label htmlFor="a-time">Due time</Label>
            <input id="a-time" type="time" className={`${nativeField} mt-1`} value={time} onChange={(e) => setTime(e.target.value)} aria-invalid={!!errors.due} />
          </div>
          <div>
            <Label htmlFor="a-points">Points</Label>
            <Input id="a-points" type="number" inputMode="numeric" min={1} max={1000} className="mt-1 h-11" value={points} onChange={(e) => setPoints(e.target.value)} aria-invalid={!!errors.points} aria-describedby={errors.points ? 'a-points-err' : undefined} />
          </div>
          <div className="sm:col-span-3 -mt-2">
            {err('due')}
            {err('points')}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t-2 border-brass pt-4">
          <Button type="submit" className="min-h-11" disabled={saving}>
            {saving ? 'Saving...' : existing ? 'Save changes' : 'Create assignment'}
          </Button>
          <Button asChild variant="ghost" className="min-h-11">
            <Link href="/assignments">Cancel</Link>
          </Button>
        </div>
      </form>
    </>
  )
}
