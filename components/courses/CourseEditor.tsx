'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import EmptyState from '@/components/catalog/EmptyState'
import LessonBody from '@/components/catalog/LessonBody'
import PageTitle from '@/components/catalog/PageTitle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import NativeSelect from '@/components/courses/NativeSelect'
import {
  courseToDraft,
  draftToModules,
  LEVELS,
  moveItem,
  splitLines,
  splitTags,
  SUBJECT_SUGGESTIONS,
  validateDraft,
  type CourseDraft,
  type DraftErrors,
  type DraftLesson,
  type DraftModule,
} from '@/lib/courses'
import { uid, useCurrentUser, useStore } from '@/lib/store'
import type { Course, Level } from '@/lib/types'

const blankLesson = (): DraftLesson => ({ id: uid('les'), title: '', minutes: 10, body: '', videoId: '' })
const blankModule = (): DraftModule => ({ id: uid('mod'), title: '', lessons: [blankLesson()] })
const blankDraft = (): CourseDraft => ({
  code: '',
  title: '',
  subject: '',
  level: 'Beginner',
  summary: '',
  description: '',
  outcomesText: '',
  tagsText: '',
  modules: [blankModule()],
})

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

const describe = (id: string, error?: string, hint?: string) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined)

function EditorForm({ existing }: { existing?: Course }) {
  const router = useRouter()
  const user = useCurrentUser()
  const courses = useStore((s) => s.courses)
  const saveCourse = useStore((s) => s.saveCourse)
  const initial = useMemo(() => (existing ? courseToDraft(existing) : blankDraft()), [existing])
  const [draft, setDraft] = useState<CourseDraft>(initial)
  const [errors, setErrors] = useState<DraftErrors>({})
  const [previewing, setPreviewing] = useState<Set<string>>(new Set())
  const [saved, setSaved] = useState(false)
  const [initialJson] = useState(() => JSON.stringify(initial))
  const dirty = !saved && JSON.stringify(draft) !== initialJson

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = <K extends keyof CourseDraft>(key: K, value: CourseDraft[K]) => setDraft((d) => ({ ...d, [key]: value }))
  const setModule = (i: number, fn: (m: DraftModule) => DraftModule) => setDraft((d) => ({ ...d, modules: d.modules.map((m, k) => (k === i ? fn(m) : m)) }))
  const setLesson = (i: number, j: number, patch: Partial<DraftLesson>) =>
    setModule(i, (m) => ({ ...m, lessons: m.lessons.map((l, k) => (k === j ? { ...l, ...patch } : l)) }))
  const togglePreview = (id: string) =>
    setPreviewing((p) => {
      const n = new Set(p)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  const save = (publish: boolean) => {
    if (!user) return
    const others = courses.filter((c) => c.id !== existing?.id)
    const found = validateDraft(draft, others, publish)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      toast.error('Fix the highlighted fields first.')
      return
    }
    const course: Course = {
      id: existing?.id ?? uid('course'),
      code: draft.code.trim(),
      title: draft.title.trim(),
      subject: draft.subject.trim(),
      level: draft.level,
      summary: draft.summary.trim(),
      description: draft.description.trim(),
      tutorId: existing?.tutorId ?? user.id,
      modules: draftToModules(draft),
      outcomes: splitLines(draft.outcomesText),
      tags: splitTags(draft.tagsText),
      published: publish,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    }
    saveCourse(course)
    setSaved(true)
    toast.success(publish ? `${course.code} saved and published` : `${course.code} saved as a draft`)
    router.push('/tutor/courses')
  }

  const errorCount = Object.keys(errors).length

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        save(false)
      }}
    >
      <PageTitle
        title={existing ? `Edit ${existing.code}` : 'New course'}
        intro="Fill in the catalogue card, then build the syllabus. Students only see the course once it is published."
        action={
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/tutor/courses">Back to my courses</Link>
          </Button>
        }
      />

      <div aria-live="polite" className="mb-4">
        {errorCount > 0 && (
          <p className="rounded-md border border-destructive bg-card px-3 py-2 text-sm font-semibold text-destructive">
            {errorCount === 1 ? '1 thing needs fixing' : `${errorCount} things need fixing`} before this can be saved.
          </p>
        )}
      </div>

      <section aria-labelledby="card-h" className="mb-10 space-y-4 rounded-md border border-border bg-card p-4 md:p-5">
        <h2 id="card-h" className="text-xl font-bold">Catalogue card</h2>
        <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
          <Field id="c-code" label="Code" error={errors.code} hint="Unique, for example COMP 101.">
            <Input id="c-code" className="callno h-11" value={draft.code} onChange={(e) => set('code', e.target.value)} aria-invalid={Boolean(errors.code)} aria-describedby={describe('c-code', errors.code, 'x')} />
          </Field>
          <Field id="c-title" label="Title" error={errors.title}>
            <Input id="c-title" className="h-11" value={draft.title} onChange={(e) => set('title', e.target.value)} aria-invalid={Boolean(errors.title)} aria-describedby={describe('c-title', errors.title)} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="c-subject" label="Subject" error={errors.subject}>
            <Input id="c-subject" className="h-11" list="subject-options" value={draft.subject} onChange={(e) => set('subject', e.target.value)} aria-invalid={Boolean(errors.subject)} aria-describedby={describe('c-subject', errors.subject)} />
            <datalist id="subject-options">
              {SUBJECT_SUGGESTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field id="c-level" label="Level">
            <NativeSelect id="c-level" value={draft.level} onChange={(e) => set('level', e.target.value as Level)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <Field id="c-summary" label="Summary" error={errors.summary} hint="One or two lines shown on the catalogue card. Required to publish.">
          <Textarea id="c-summary" rows={2} value={draft.summary} onChange={(e) => set('summary', e.target.value)} aria-invalid={Boolean(errors.summary)} aria-describedby={describe('c-summary', errors.summary, 'x')} />
        </Field>
        <Field id="c-desc" label="Description" hint="Separate paragraphs with a blank line.">
          <Textarea id="c-desc" rows={5} value={draft.description} onChange={(e) => set('description', e.target.value)} aria-describedby="c-desc-hint" />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="c-out" label="Outcomes" hint="One per line.">
            <Textarea id="c-out" rows={4} value={draft.outcomesText} onChange={(e) => set('outcomesText', e.target.value)} aria-describedby="c-out-hint" />
          </Field>
          <Field id="c-tags" label="Tags" hint="Separated by commas.">
            <Input id="c-tags" className="h-11" value={draft.tagsText} onChange={(e) => set('tagsText', e.target.value)} aria-describedby="c-tags-hint" />
          </Field>
        </div>
      </section>

      <section aria-labelledby="syl-h" className="mb-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b-2 border-brass pb-2">
          <h2 id="syl-h" className="text-xl font-bold">Syllabus</h2>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => set('modules', [...draft.modules, blankModule()])}>
            <Plus aria-hidden="true" /> Add module
          </Button>
        </div>
        {errors.modules && (
          <p role="alert" className="mb-3 text-sm font-semibold text-destructive">
            {errors.modules}
          </p>
        )}

        {draft.modules.length === 0 ? (
          <EmptyState title="No modules yet">Add a module, then add lessons inside it.</EmptyState>
        ) : (
          <ol className="space-y-6">
            {draft.modules.map((m, i) => (
              <li key={m.id} className="rounded-md border border-border bg-card">
                <div className="flex flex-wrap items-end gap-2 border-b border-border p-3 md:p-4">
                  <div className="min-w-0 flex-1 basis-60">
                    <Field id={`m${i}-title`} label={`Module ${i + 1} title`} error={errors[`m${i}`]}>
                      <Input id={`m${i}-title`} className="h-11" value={m.title} onChange={(e) => setModule(i, (x) => ({ ...x, title: e.target.value }))} aria-invalid={Boolean(errors[`m${i}`])} aria-describedby={describe(`m${i}-title`, errors[`m${i}`])} />
                    </Field>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="outline" size="icon" className="h-11 w-11" aria-label={`Move module ${i + 1} up`} disabled={i === 0} onClick={() => set('modules', moveItem(draft.modules, i, -1))}>
                      <ArrowUp />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="h-11 w-11" aria-label={`Move module ${i + 1} down`} disabled={i === draft.modules.length - 1} onClick={() => set('modules', moveItem(draft.modules, i, 1))}>
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 text-destructive"
                      aria-label={`Remove module ${i + 1}`}
                      onClick={() => {
                        const removed = m
                        set('modules', draft.modules.filter((_, k) => k !== i))
                        toast('Module removed', { action: { label: 'Undo', onClick: () => setDraft((d) => ({ ...d, modules: [...d.modules.slice(0, i), removed, ...d.modules.slice(i)] })) } })
                      }}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>

                <ol className="divide-y divide-border">
                  {m.lessons.map((l, j) => {
                    const lid = `m${i}l${j}`
                    const open = previewing.has(l.id)
                    return (
                      <li key={l.id} className="space-y-3 p-3 md:p-4">
                        <div className="flex flex-wrap items-end gap-2">
                          <div className="min-w-0 flex-1 basis-56">
                            <Field id={`${lid}-title`} label={`Lesson ${i + 1}.${j + 1} title`} error={errors[lid]}>
                              <Input id={`${lid}-title`} className="h-11" value={l.title} onChange={(e) => setLesson(i, j, { title: e.target.value })} aria-invalid={Boolean(errors[lid])} aria-describedby={describe(`${lid}-title`, errors[lid])} />
                            </Field>
                          </div>
                          <div className="w-24">
                            <Field id={`${lid}-min`} label="Minutes">
                              <Input id={`${lid}-min`} type="number" min={1} max={600} className="callno h-11" value={Number.isFinite(l.minutes) ? l.minutes : ''} onChange={(e) => setLesson(i, j, { minutes: e.target.value === '' ? NaN : Number(e.target.value) })} />
                            </Field>
                          </div>
                          <div className="flex gap-1">
                            <Button type="button" variant="outline" size="icon" className="h-11 w-11" aria-label={`Move lesson ${i + 1}.${j + 1} up`} disabled={j === 0} onClick={() => setModule(i, (x) => ({ ...x, lessons: moveItem(x.lessons, j, -1) }))}>
                              <ArrowUp />
                            </Button>
                            <Button type="button" variant="outline" size="icon" className="h-11 w-11" aria-label={`Move lesson ${i + 1}.${j + 1} down`} disabled={j === m.lessons.length - 1} onClick={() => setModule(i, (x) => ({ ...x, lessons: moveItem(x.lessons, j, 1) }))}>
                              <ArrowDown />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-11 w-11 text-destructive"
                              aria-label={`Remove lesson ${i + 1}.${j + 1}`}
                              onClick={() => {
                                const removed = l
                                setModule(i, (x) => ({ ...x, lessons: x.lessons.filter((_, k) => k !== j) }))
                                toast('Lesson removed', { action: { label: 'Undo', onClick: () => setModule(i, (x) => ({ ...x, lessons: [...x.lessons.slice(0, j), removed, ...x.lessons.slice(j)] })) } })
                              }}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                        <Field id={`${lid}-video`} label="YouTube video (optional)" hint="A video id or a youtube.com link.">
                          <Input id={`${lid}-video`} className="h-11" value={l.videoId} onChange={(e) => setLesson(i, j, { videoId: e.target.value })} aria-describedby={`${lid}-video-hint`} />
                        </Field>
                        <Field id={`${lid}-body`} label="Lesson text" hint="Blank line between paragraphs. Start a line with ## for a heading, - for bullets, > for a callout. Indent four spaces for a code block. Wrap `code` in backticks.">
                          <Textarea id={`${lid}-body`} rows={7} value={l.body} onChange={(e) => setLesson(i, j, { body: e.target.value })} aria-describedby={`${lid}-body-hint`} />
                        </Field>
                        <Button type="button" variant="ghost" className="min-h-11" aria-expanded={open} aria-controls={`${lid}-preview`} onClick={() => togglePreview(l.id)}>
                          {open ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />} {open ? 'Hide preview' : 'Preview lesson'}
                        </Button>
                        {open && (
                          <div id={`${lid}-preview`} className="rounded-md border border-dashed border-border bg-background p-4">
                            <p className="callno mb-2 text-xs text-muted-foreground">Preview</p>
                            <h3 className="mb-3 text-xl font-bold">{l.title || 'Untitled lesson'}</h3>
                            {l.body.trim() ? <LessonBody body={l.body} /> : <p className="text-muted-foreground">Nothing written yet.</p>}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ol>
                <div className="border-t border-border p-3 md:p-4">
                  <Button type="button" variant="outline" className="min-h-11" onClick={() => setModule(i, (x) => ({ ...x, lessons: [...x.lessons, blankLesson()] }))}>
                    <Plus aria-hidden="true" /> Add lesson to module {i + 1}
                  </Button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="sticky bottom-20 z-30 flex flex-wrap items-center gap-3 rounded-md border border-border bg-card p-3 shadow-sm md:bottom-4">
        <Button type="button" variant="outline" className="min-h-11" onClick={() => save(false)}>
          Save as draft
        </Button>
        <Button type="button" className="min-h-11" onClick={() => save(true)}>
          Save and publish
        </Button>
        <p className="text-sm text-muted-foreground">
          {existing ? (existing.published ? 'Currently published.' : 'Currently a draft.') : 'Not saved yet.'}
          {dirty && ' You have unsaved changes.'}
        </p>
      </div>
    </form>
  )
}

/** Shared by the new and edit routes. A tutor may only change their own course; an admin may change any. */
export default function CourseEditor({ courseId }: { courseId?: string }) {
  const user = useCurrentUser()
  const existing = useStore((s) => (courseId ? s.courses.find((c) => c.id === courseId) : undefined))

  if (courseId && !existing) {
    return (
      <EmptyState
        title="Course not found"
        action={
          <Button asChild className="min-h-11">
            <Link href="/tutor/courses">Back to my courses</Link>
          </Button>
        }
      >
        It may have been deleted.
      </EmptyState>
    )
  }
  if (existing && user && user.role !== 'admin' && existing.tutorId !== user.id) {
    return (
      <EmptyState
        title="This is another tutor's course"
        action={
          <Button asChild className="min-h-11">
            <Link href="/tutor/courses">Back to my courses</Link>
          </Button>
        }
      >
        You can only edit courses you teach.
      </EmptyState>
    )
  }
  return <EditorForm existing={existing} />
}
