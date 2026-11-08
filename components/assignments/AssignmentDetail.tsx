'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowDownToLine, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import EmptyState from '@/components/catalog/EmptyState'
import LessonBody from '@/components/catalog/LessonBody'
import PageTitle from '@/components/catalog/PageTitle'
import Stamp from '@/components/catalog/Stamp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { dayTime, dueLabel, plural } from '@/lib/format'
import { isHttpsUrl } from '@/lib/quiz'
import { useCurrentUser, useStore } from '@/lib/store'
import type { Assignment, Submission } from '@/lib/types'

export default function AssignmentDetail({ assignmentId }: { assignmentId: string }) {
  const user = useCurrentUser()!
  const assignment = useStore((s) => s.assignments.find((a) => a.id === assignmentId))
  const course = useStore((s) => s.courses.find((c) => c.id === assignment?.courseId))
  const enrolled = useStore((s) => s.enrollments.some((e) => e.userId === user.id && e.courseId === assignment?.courseId))

  const back = (
    <Button asChild className="min-h-11">
      <Link href="/assignments">Back to assignments</Link>
    </Button>
  )
  if (!assignment || !course) {
    return (
      <EmptyState title="Assignment not found" action={back}>
        It may have been removed.
      </EmptyState>
    )
  }
  if (user.role === 'student') {
    if (!enrolled)
      return (
        <EmptyState
          title="Enrol to see this assignment"
          action={
            <Button asChild className="min-h-11">
              <Link href={`/courses/${course.id}`}>Open {course.code}</Link>
            </Button>
          }
        >
          This assignment belongs to {course.title}.
        </EmptyState>
      )
    return <StudentPanel assignment={assignment} courseCode={course.code} courseTitle={course.title} userId={user.id} />
  }
  if (user.role === 'tutor' && course.tutorId !== user.id) {
    return (
      <EmptyState title="This assignment belongs to another tutor" action={back}>
        You can only grade work for your own courses.
      </EmptyState>
    )
  }
  return <TutorPanel assignment={assignment} courseCode={course.code} courseTitle={course.title} />
}

function Brief({ assignment, courseCode, courseTitle }: { assignment: Assignment; courseCode: string; courseTitle: string }) {
  const due = dueLabel(assignment.dueAt)
  return (
    <>
      <PageTitle
        title={assignment.title}
        intro={
          <>
            <span className="callno text-sm">{courseCode}</span> {courseTitle}
          </>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Stamp>{due.text}</Stamp>
        <span>
          Due <span className="callno">{dayTime(assignment.dueAt)}</span>
        </span>
        <span>{plural(assignment.points, 'point')}</span>
      </div>
      <section aria-labelledby="brief-h" className="mb-8 rounded-md border border-border bg-card p-5">
        <h2 id="brief-h" className="mb-2 text-lg font-bold">
          Brief
        </h2>
        <LessonBody body={assignment.brief} />
      </section>
    </>
  )
}

function SafeLink({ href }: { href?: string }) {
  if (!href) return null
  if (!isHttpsUrl(href)) return <span className="text-sm text-muted-foreground">Link not shown: {href}</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 break-all text-primary underline">
      {href} <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

function StudentPanel({ assignment, courseCode, courseTitle, userId }: { assignment: Assignment; courseCode: string; courseTitle: string; userId: string }) {
  const submissions = useStore((s) => s.submissions)
  const submitAssignment = useStore((s) => s.submitAssignment)
  const sub = useMemo(() => submissions.find((x) => x.assignmentId === assignment.id && x.userId === userId), [submissions, assignment.id, userId])
  const graded = !!sub && sub.grade !== undefined
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(sub?.text ?? '')
  const [link, setLink] = useState(sub?.link ?? '')
  const [errors, setErrors] = useState<{ text?: string; link?: string }>({})
  const showForm = !sub || editing

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: { text?: string; link?: string } = {}
    if (!text.trim()) next.text = 'Write your answer or a short note about your work.'
    if (link.trim() && !isHttpsUrl(link.trim())) next.link = 'Use a full link that starts with https://'
    setErrors(next)
    if (next.text || next.link) {
      toast.error('Check the highlighted fields.')
      return
    }
    submitAssignment({ assignmentId: assignment.id, text: text.trim(), link: link.trim() || undefined })
    setEditing(false)
    toast.success(sub ? 'Resubmitted. Your tutor will see the new version.' : 'Submitted. Your tutor can see it now.')
  }

  return (
    <>
      <Brief assignment={assignment} courseCode={courseCode} courseTitle={courseTitle} />

      {sub && (
        <section aria-labelledby="mine-h" className="mb-8 rounded-md border border-border bg-card p-5" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="mine-h" className="text-lg font-bold">
              Your submission
            </h2>
            {graded && (
              <Stamp press>
                Graded {sub.grade}/{assignment.points}
              </Stamp>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Submitted <span className="callno">{dayTime(sub.submittedAt)}</span>
            {!graded && '. Waiting for a grade.'}
          </p>
          <p className="mt-3 whitespace-pre-wrap">{sub.text}</p>
          <div className="mt-2">
            <SafeLink href={sub.link} />
          </div>
          {graded && (
            <div className="mt-4 border-t border-border pt-3">
              <h3 className="font-bold">Feedback</h3>
              <p className="mt-1 whitespace-pre-wrap">{sub.feedback?.trim() || 'No written feedback.'}</p>
            </div>
          )}
          {!graded && !editing && (
            <Button variant="outline" className="mt-4 min-h-11" onClick={() => setEditing(true)}>
              Edit and resubmit
            </Button>
          )}
          {graded && <p className="mt-4 text-sm text-muted-foreground">This work has been graded, so it is closed.</p>}
        </section>
      )}

      {showForm && !graded && (
        <form onSubmit={submit} noValidate className="max-w-2xl space-y-4 rounded-md border border-border bg-card p-5">
          <h2 className="text-lg font-bold">{sub ? 'Resubmit your work' : 'Hand in your work'}</h2>
          <div>
            <Label htmlFor="sub-text">Your answer</Label>
            <Textarea id="sub-text" className="mt-1" rows={8} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={!!errors.text} aria-describedby={errors.text ? 'sub-text-err' : undefined} />
            {errors.text && (
              <p id="sub-text-err" role="alert" className="mt-1 text-sm text-stamp">
                {errors.text}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="sub-link">Link to your work (optional)</Label>
            <Input id="sub-link" type="url" inputMode="url" placeholder="https://" className="mt-1 h-11" value={link} onChange={(e) => setLink(e.target.value)} aria-invalid={!!errors.link} aria-describedby="sub-link-help" />
            <p id="sub-link-help" className={errors.link ? 'mt-1 text-sm text-stamp' : 'mt-1 text-sm text-muted-foreground'} role={errors.link ? 'alert' : undefined}>
              {errors.link ?? 'Files cannot be uploaded here. Share a link to a document or repository instead.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" className="min-h-11">
              <ArrowDownToLine /> {sub ? 'Resubmit' : 'Submit'}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={() => {
                  setEditing(false)
                  setText(sub?.text ?? '')
                  setLink(sub?.link ?? '')
                  setErrors({})
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}
    </>
  )
}

function TutorPanel({ assignment, courseCode, courseTitle }: { assignment: Assignment; courseCode: string; courseTitle: string }) {
  const submissions = useStore((s) => s.submissions)
  const users = useStore((s) => s.users)
  const rows = useMemo(
    () =>
      submissions
        .filter((x) => x.assignmentId === assignment.id)
        .sort((a, b) => Number(a.grade !== undefined) - Number(b.grade !== undefined) || a.submittedAt.localeCompare(b.submittedAt)),
    [submissions, assignment.id],
  )
  const ungraded = rows.filter((r) => r.grade === undefined)

  const focusNext = (afterId?: string) => {
    const next = ungraded.find((r) => r.id !== afterId)
    if (!next) {
      toast.message('Nothing left to grade.')
      return
    }
    const el = document.getElementById(`grade-${next.id}`)
    el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' })
    ;(el as HTMLInputElement | null)?.focus({ preventScroll: true })
  }

  return (
    <>
      <Brief assignment={assignment} courseCode={courseCode} courseTitle={courseTitle} />
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">
          Submissions <span className="callno text-base text-muted-foreground">{rows.length}</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="min-h-11" disabled={ungraded.length === 0} onClick={() => focusNext()}>
            Next ungraded{ungraded.length ? ` (${ungraded.length})` : ''}
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link href={`/assignments/${assignment.id}/edit`}>Edit assignment</Link>
          </Button>
        </div>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No submissions yet">Students enrolled in this course can hand in work until you stop grading.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="w-full min-w-[640px] text-left">
            <caption className="sr-only">Submissions for {assignment.title}</caption>
            <thead>
              <tr className="border-b-2 border-brass text-sm">
                <th scope="col" className="p-3">Student</th>
                <th scope="col" className="p-3">Submitted</th>
                <th scope="col" className="p-3">Work</th>
                <th scope="col" className="p-3">Grade</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <SubmissionRow key={r.id} sub={r} assignment={assignment} name={users.find((u) => u.id === r.userId)?.name ?? 'Removed student'} onGraded={() => focusNext(r.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function SubmissionRow({ sub, assignment, name, onGraded }: { sub: Submission; assignment: Assignment; name: string; onGraded: () => void }) {
  const gradeSubmission = useStore((s) => s.gradeSubmission)
  const [grade, setGrade] = useState(sub.grade === undefined ? '' : String(sub.grade))
  const [feedback, setFeedback] = useState(sub.feedback ?? '')
  const [error, setError] = useState('')
  const graded = sub.grade !== undefined
  const late = sub.submittedAt > assignment.dueAt

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const n = Number(grade)
    if (grade.trim() === '' || !Number.isFinite(n) || n < 0 || n > assignment.points) {
      setError(`Enter a grade from 0 to ${assignment.points}.`)
      return
    }
    setError('')
    gradeSubmission(sub.id, n, feedback.trim())
    toast.success(`Saved ${n}/${assignment.points} for ${name}.`)
    if (!graded) onGraded()
  }

  return (
    <tr id={`sub-${sub.id}`} className="scroll-mt-20 border-b border-border align-top last:border-0">
      <th scope="row" className="p-3 font-bold">
        {name}
      </th>
      <td className="p-3 text-sm">
        <span className="callno">{dayTime(sub.submittedAt)}</span>
        {late && <span className="block text-stamp">Late</span>}
      </td>
      <td className="max-w-xs p-3 text-sm">
        <p className="line-clamp-6 whitespace-pre-wrap">{sub.text}</p>
        <SafeLink href={sub.link} />
      </td>
      <td className="p-3">
        <form onSubmit={save} noValidate className="grid min-w-52 gap-2">
          <div>
            <Label htmlFor={`grade-${sub.id}`} className="text-sm">
              Grade out of {assignment.points}
            </Label>
            <Input
              id={`grade-${sub.id}`}
              type="number"
              inputMode="decimal"
              min={0}
              max={assignment.points}
              className="mt-1 h-11"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? `grade-err-${sub.id}` : undefined}
            />
            {error && (
              <p id={`grade-err-${sub.id}`} role="alert" className="mt-1 text-sm text-stamp">
                {error}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor={`fb-${sub.id}`} className="text-sm">
              Feedback
            </Label>
            <Textarea id={`fb-${sub.id}`} className="mt-1" rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" className="min-h-11">
              {graded ? 'Update grade' : 'Save grade'}
            </Button>
            {graded && <Stamp>Graded</Stamp>}
          </div>
        </form>
      </td>
    </tr>
  )
}
