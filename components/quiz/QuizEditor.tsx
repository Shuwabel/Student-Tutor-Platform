'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import EmptyState from '@/components/catalog/EmptyState'
import PageTitle from '@/components/catalog/PageTitle'
import { nativeField } from '@/components/quiz/fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { moveItem, validateQuestions, type DraftQuestion } from '@/lib/quiz'
import { uid, useCurrentUser, useStore } from '@/lib/store'

const blankQuestion = (): DraftQuestion => ({ id: uid('q'), prompt: '', options: ['', ''], answerIndex: 0, explanation: '' })

export default function QuizEditor({ quizId }: { quizId?: string }) {
  const user = useCurrentUser()!
  const quizzes = useStore((s) => s.quizzes)
  const allCourses = useStore((s) => s.courses)
  const saveQuiz = useStore((s) => s.saveQuiz)
  const router = useRouter()

  const existing = quizId ? quizzes.find((q) => q.id === quizId) : undefined
  const courses = useMemo(() => allCourses.filter((c) => user.role === 'admin' || c.tutorId === user.id), [allCourses, user.id, user.role])

  const [courseId, setCourseId] = useState(existing?.courseId ?? courses[0]?.id ?? '')
  const [title, setTitle] = useState(existing?.title ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [minutes, setMinutes] = useState(String(existing?.minutes ?? 10))
  const [passMark, setPassMark] = useState(String(existing?.passMark ?? 70))
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    existing ? existing.questions.map((q) => ({ id: q.id, prompt: q.prompt, options: [...q.options], answerIndex: q.answerIndex, explanation: q.explanation ?? '' })) : [blankQuestion()],
  )
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const ownsExisting = !existing || user.role === 'admin' || allCourses.find((c) => c.id === existing.courseId)?.tutorId === user.id
  if ((quizId && !existing) || !ownsExisting) {
    return (
      <EmptyState
        title={quizId && !existing ? 'Quiz not found' : 'This quiz belongs to another tutor'}
        action={
          <Button asChild className="min-h-11">
            <Link href="/assessments">Back to quizzes</Link>
          </Button>
        }
      >
        {quizId && !existing ? 'It may have been deleted.' : 'You can only edit quizzes for your own courses.'}
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
        A quiz belongs to a course, and you do not have one yet.
      </EmptyState>
    )
  }

  const patchQ = (i: number, patch: Partial<DraftQuestion>) => setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, ...patch } : q)))
  const setOption = (i: number, oi: number, value: string) =>
    setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, options: q.options.map((o, k) => (k === oi ? value : o)) } : q)))
  const addOption = (i: number) => setQuestions((qs) => qs.map((q, qi) => (qi === i && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q)))
  const removeOption = (i: number, oi: number) =>
    setQuestions((qs) =>
      qs.map((q, qi) => {
        if (qi !== i || q.options.length <= 2) return q
        const answerIndex = q.answerIndex === oi ? 0 : q.answerIndex > oi ? q.answerIndex - 1 : q.answerIndex
        return { ...q, options: q.options.filter((_, k) => k !== oi), answerIndex }
      }),
    )

  const submit = (publish: boolean) => {
    const problems: string[] = []
    if (!courseId) problems.push('Choose a course.')
    if (!title.trim()) problems.push('Give the quiz a title.')
    const mins = Number(minutes)
    const pass = Number(passMark)
    if (!Number.isInteger(mins) || mins < 1 || mins > 240) problems.push('Time limit must be a whole number of minutes from 1 to 240.')
    if (!Number.isFinite(pass) || pass < 0 || pass > 100) problems.push('Pass mark must be between 0 and 100.')
    const started = questions.filter((q) => q.prompt.trim() || q.options.some((o) => o.trim()))
    if (publish) problems.push(...validateQuestions(questions))
    else if (started.length > 0) problems.push(...validateQuestions(started))
    const unique = [...new Set(problems)]
    setErrors(unique)
    if (unique.length) {
      toast.error(`${unique.length === 1 ? 'One thing needs' : `${unique.length} things need`} fixing before you can save.`)
      requestAnimationFrame(() => document.getElementById('editor-errors')?.focus())
      return
    }
    setSaving(true)
    const kept = publish ? questions : started
    const id = existing?.id ?? uid('quiz')
    saveQuiz({
      id,
      courseId,
      title: title.trim(),
      description: description.trim(),
      minutes: mins,
      passMark: Math.round(pass),
      published: publish,
      questions: kept.map((q) => ({ id: q.id, prompt: q.prompt.trim(), options: q.options.map((o) => o.trim()), answerIndex: q.answerIndex, ...(q.explanation.trim() ? { explanation: q.explanation.trim() } : {}) })),
    })
    toast.success(publish ? `"${title.trim()}" is published.` : `Draft of "${title.trim()}" saved.`)
    router.push('/assessments')
  }

  return (
    <>
      <PageTitle title={existing ? 'Edit quiz' : 'New quiz'} intro="Drafts are hidden from students. Publishing checks that every question is complete." />
      <form
        className="max-w-3xl space-y-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          submit(existing?.published ?? false)
        }}
      >
        {errors.length > 0 && (
          <div id="editor-errors" tabIndex={-1} role="alert" className="rounded-md border-2 border-stamp bg-card p-4">
            <p className="font-bold text-stamp">Fix these first</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {errors.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="grid gap-4 rounded-md border border-border bg-card p-4 md:grid-cols-2" aria-label="Quiz details">
          <div className="md:col-span-2">
            <Label htmlFor="q-course">Course</Label>
            <select id="q-course" className={`${nativeField} mt-1`} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="q-title">Title</Label>
            <Input id="q-title" className="mt-1 h-11" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="q-desc">Description</Label>
            <Textarea id="q-desc" className="mt-1" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="q-min">Time limit (minutes)</Label>
            <Input id="q-min" type="number" inputMode="numeric" min={1} max={240} className="mt-1 h-11" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="q-pass">Pass mark (percent)</Label>
            <Input id="q-pass" type="number" inputMode="numeric" min={0} max={100} className="mt-1 h-11" value={passMark} onChange={(e) => setPassMark(e.target.value)} />
          </div>
        </section>

        <section aria-labelledby="qs-h">
          <h2 id="qs-h" className="mb-3 text-xl font-bold">
            Questions <span className="callno text-base text-muted-foreground">{questions.length}</span>
          </h2>
          <ol className="space-y-4">
            {questions.map((q, i) => (
              <li key={q.id} className="rounded-md border border-border bg-card p-4">
                <fieldset>
                  <legend className="callno mb-2 text-sm">Question {i + 1}</legend>
                  <Label htmlFor={`${q.id}-prompt`}>Prompt</Label>
                  <Textarea id={`${q.id}-prompt`} className="mt-1" rows={2} value={q.prompt} onChange={(e) => patchQ(i, { prompt: e.target.value })} />

                  <div role="radiogroup" aria-label={`Options for question ${i + 1}; choose the correct one`} className="mt-3 space-y-2">
                    {q.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center" title="Mark as the correct answer">
                          <input
                            type="radio"
                            name={`${q.id}-correct`}
                            className="h-5 w-5 accent-[var(--primary)]"
                            checked={q.answerIndex === oi}
                            onChange={() => patchQ(i, { answerIndex: oi })}
                            aria-label={`Option ${oi + 1} is correct`}
                          />
                        </label>
                        <Input aria-label={`Question ${i + 1}, option ${oi + 1}`} className="h-11" value={o} onChange={(e) => setOption(i, oi, e.target.value)} />
                        <Button type="button" variant="ghost" className="h-11 w-11 shrink-0 p-0" disabled={q.options.length <= 2} onClick={() => removeOption(i, oi)} aria-label={`Remove option ${oi + 1}`}>
                          <Trash2 />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" className="mt-2 min-h-11" disabled={q.options.length >= 6} onClick={() => addOption(i)}>
                    <Plus /> Add option
                  </Button>

                  <div className="mt-3">
                    <Label htmlFor={`${q.id}-why`}>Explanation (optional, shown after the quiz)</Label>
                    <Textarea id={`${q.id}-why`} className="mt-1" rows={2} value={q.explanation} onChange={(e) => patchQ(i, { explanation: e.target.value })} />
                  </div>
                </fieldset>

                <div className="mt-3 flex flex-wrap gap-1 border-t border-border pt-3">
                  <Button type="button" variant="ghost" className="min-h-11" disabled={i === 0} onClick={() => setQuestions((qs) => moveItem(qs, i, i - 1))} aria-label={`Move question ${i + 1} up`}>
                    <ArrowUp /> Up
                  </Button>
                  <Button type="button" variant="ghost" className="min-h-11" disabled={i === questions.length - 1} onClick={() => setQuestions((qs) => moveItem(qs, i, i + 1))} aria-label={`Move question ${i + 1} down`}>
                    <ArrowDown /> Down
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => setQuestions((qs) => [...qs.slice(0, i + 1), { ...q, id: uid('q'), options: [...q.options] }, ...qs.slice(i + 1)])}
                    aria-label={`Duplicate question ${i + 1}`}
                  >
                    <Copy /> Duplicate
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => {
                      const removed = q
                      setQuestions((qs) => qs.filter((_, k) => k !== i))
                      toast('Question removed.', { action: { label: 'Undo', onClick: () => setQuestions((qs) => [...qs.slice(0, i), removed, ...qs.slice(i)]) } })
                    }}
                    aria-label={`Remove question ${i + 1}`}
                  >
                    <Trash2 /> Remove
                  </Button>
                </div>
              </li>
            ))}
          </ol>
          <Button type="button" variant="outline" className="mt-4 min-h-11" onClick={() => setQuestions((qs) => [...qs, blankQuestion()])}>
            <Plus /> Add question
          </Button>
        </section>

        <div className="flex flex-wrap gap-2 border-t-2 border-brass pt-4">
          <Button type="button" className="min-h-11" disabled={saving} onClick={() => submit(true)}>
            {saving ? 'Saving...' : existing?.published ? 'Save and keep published' : 'Publish'}
          </Button>
          <Button type="button" variant="outline" className="min-h-11" disabled={saving} onClick={() => submit(false)}>
            Save as draft
          </Button>
          <Button asChild variant="ghost" className="min-h-11">
            <Link href="/assessments">Cancel</Link>
          </Button>
        </div>
      </form>
    </>
  )
}
