'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import CatalogCard from '@/components/catalog/CatalogCard'
import EmptyState from '@/components/catalog/EmptyState'
import PageTitle from '@/components/catalog/PageTitle'
import Stamp from '@/components/catalog/Stamp'
import ConfirmDialog from '@/components/quiz/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { averageScore, bestScore } from '@/lib/quiz'
import { plural } from '@/lib/format'
import { useCurrentUser, useStore } from '@/lib/store'
import type { Quiz } from '@/lib/types'

export default function AssessmentsPage() {
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
  const quizzes = useStore((s) => s.quizzes)
  const courses = useStore((s) => s.courses)
  const enrollments = useStore((s) => s.enrollments)
  const attempts = useStore((s) => s.attempts)

  const rows = useMemo(() => {
    const mine = new Set(enrollments.filter((e) => e.userId === userId).map((e) => e.courseId))
    return quizzes
      .filter((q) => q.published && q.questions.length > 0 && mine.has(q.courseId))
      .map((q) => ({ quiz: q, course: courses.find((c) => c.id === q.courseId), attempts: attempts.filter((a) => a.quizId === q.id && a.userId === userId) }))
      .filter((r) => r.course)
  }, [quizzes, courses, enrollments, attempts, userId])

  return (
    <>
      <PageTitle title="Quizzes" intro="Quizzes for the courses you are enrolled in. Retake as often as you like; your best score counts." />
      {rows.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          action={
            <Button asChild className="min-h-11">
              <Link href="/courses">Browse courses</Link>
            </Button>
          }
        >
          Quizzes appear here once you enrol in a course that has one.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map(({ quiz, course, attempts: mine }) => {
            const best = bestScore(mine)
            const passed = mine.some((a) => a.passed)
            return (
              <li key={quiz.id}>
                <CatalogCard
                  code={course!.code}
                  title={quiz.title}
                  subject={course!.subject}
                  meta={`${plural(quiz.questions.length, 'question')}, ${plural(quiz.minutes, 'minute')}, pass mark ${quiz.passMark}%`}
                  footer={
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="text-sm">
                        {best === null ? (
                          <span className="text-muted-foreground">Not attempted</span>
                        ) : (
                          <span>
                            Best <span className="callno">{best}%</span>
                            <span className="text-muted-foreground"> after {plural(mine.length, 'attempt')}</span>
                          </span>
                        )}
                        {passed && (
                          <span className="ml-2 align-middle">
                            <Stamp>Passed</Stamp>
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {mine.length > 0 && (
                          <Button asChild variant="outline" className="min-h-11">
                            <Link href={`/assessments/${quiz.id}/results`}>Results</Link>
                          </Button>
                        )}
                        <Button asChild className="min-h-11">
                          <Link href={`/assessments/${quiz.id}`}>{mine.length ? 'Retake' : 'Take'}</Link>
                        </Button>
                      </div>
                    </div>
                  }
                />
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

function TutorView({ userId, admin }: { userId: string; admin: boolean }) {
  const quizzes = useStore((s) => s.quizzes)
  const courses = useStore((s) => s.courses)
  const attempts = useStore((s) => s.attempts)
  const saveQuiz = useStore((s) => s.saveQuiz)
  const deleteQuiz = useStore((s) => s.deleteQuiz)
  const [toDelete, setToDelete] = useState<Quiz | null>(null)

  const rows = useMemo(() => {
    const own = new Set(courses.filter((c) => admin || c.tutorId === userId).map((c) => c.id))
    return quizzes
      .filter((q) => own.has(q.courseId))
      .map((q) => ({ quiz: q, course: courses.find((c) => c.id === q.courseId), attempts: attempts.filter((a) => a.quizId === q.id) }))
  }, [quizzes, courses, attempts, userId, admin])

  return (
    <>
      <PageTitle
        title="Quizzes"
        intro={admin ? 'Every quiz on the platform.' : 'Quizzes for your courses. Drafts stay hidden from students until you publish them.'}
        action={
          <Button asChild className="min-h-11">
            <Link href="/assessments/new">
              <Plus /> New quiz
            </Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          action={
            <Button asChild className="min-h-11">
              <Link href="/assessments/new">Write the first quiz</Link>
            </Button>
          }
        >
          Create a quiz for one of your courses. Students enrolled in the course will see it once it is published.
        </EmptyState>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {rows.map(({ quiz, course, attempts: list }) => {
            const avg = averageScore(list)
            return (
              <li key={quiz.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="callno text-sm text-primary">{course?.code ?? 'No course'}</p>
                  <p className="text-lg font-bold leading-snug">{quiz.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {plural(quiz.questions.length, 'question')}, {plural(quiz.minutes, 'minute')}, pass mark {quiz.passMark}%.{' '}
                    <span className="font-semibold">{quiz.published ? 'Published' : 'Draft'}</span>
                  </p>
                  <p className="mt-1 text-sm">
                    {plural(list.length, 'attempt')}
                    {avg !== null && (
                      <>
                        , average <span className="callno">{avg}%</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="min-h-11"
                    onClick={() => {
                      if (!quiz.published && quiz.questions.length === 0) {
                        toast.error('Add questions in the editor before publishing.')
                        return
                      }
                      saveQuiz({ ...quiz, published: !quiz.published })
                      toast.success(quiz.published ? `"${quiz.title}" is now a draft.` : `"${quiz.title}" is published.`)
                    }}
                  >
                    {quiz.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button asChild variant="outline" className="min-h-11">
                    <Link href={`/assessments/${quiz.id}/edit`}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                  <Button variant="outline" className="min-h-11" onClick={() => setToDelete(quiz)} aria-label={`Delete ${quiz.title}`}>
                    <Trash2 /> Delete
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={`Delete "${toDelete?.title ?? ''}"?`}
        description="The quiz and every student attempt at it are removed. This cannot be undone."
        confirmLabel="Delete quiz"
        onConfirm={() => {
          if (!toDelete) return
          deleteQuiz(toDelete.id)
          toast.success(`Deleted "${toDelete.title}".`)
        }}
      />
    </>
  )
}
