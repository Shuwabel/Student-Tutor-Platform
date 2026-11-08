'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { isHttpsUrl, KIND_LABEL, KINDS } from '@/lib/live'
import { uid, useStore } from '@/lib/store'
import type { Course, Material, MaterialKind } from '@/lib/types'

type Errors = Partial<Record<'title' | 'url' | 'subject', string>>

function Form({ existing, userId, courses, subjects, onDone }: { existing?: Material; userId: string; courses: Course[]; subjects: string[]; onDone: () => void }) {
  const saveMaterial = useStore((s) => s.saveMaterial)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [description, setDescription] = useState(existing?.description ?? '')
  const [courseId, setCourseId] = useState(existing?.courseId ?? 'none')
  const [kind, setKind] = useState<MaterialKind>(existing?.kind ?? 'link')
  const [url, setUrl] = useState(existing?.url ?? '')
  const [subject, setSubject] = useState(existing?.subject ?? '')
  const [errors, setErrors] = useState<Errors>({})

  const pickCourse = (id: string) => {
    setCourseId(id)
    const c = courses.find((x) => x.id === id)
    if (c && !subject.trim()) setSubject(c.subject)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Errors = {}
    if (!title.trim()) next.title = 'Give the material a title.'
    if (!isHttpsUrl(url)) next.url = 'Enter a full link that starts with https://'
    if (!subject.trim()) next.subject = 'Add a subject so people can find it.'
    setErrors(next)
    if (Object.keys(next).length) return
    saveMaterial({
      id: existing?.id ?? uid('mat'),
      courseId: courseId === 'none' ? undefined : courseId,
      title: title.trim(),
      description: description.trim(),
      kind,
      url: url.trim(),
      subject: subject.trim(),
      addedBy: existing?.addedBy ?? userId,
      addedAt: existing?.addedAt ?? new Date().toISOString(),
    })
    toast.success(existing ? 'Material updated.' : 'Material added to the library.')
    onDone()
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-1.5">
        <Label htmlFor="mat-title">Title</Label>
        <Input id="mat-title" className="h-11" value={title} onChange={(e) => setTitle(e.target.value)} aria-invalid={!!errors.title} aria-describedby={errors.title ? 'mat-title-e' : undefined} />
        {errors.title && <p id="mat-title-e" className="text-sm text-destructive">{errors.title}</p>}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="mat-desc">Description</Label>
        <Textarea id="mat-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="mat-course">Course (optional)</Label>
          <Select value={courseId} onValueChange={pickCourse}>
            <SelectTrigger id="mat-course" className="h-11 w-full">
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
        <div className="grid gap-1.5">
          <Label htmlFor="mat-kind">Kind</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as MaterialKind)}>
            <SelectTrigger id="mat-kind" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="mat-url">Link (https)</Label>
        <Input
          id="mat-url"
          type="url"
          inputMode="url"
          className="h-11"
          placeholder="https://"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-invalid={!!errors.url}
          aria-describedby={errors.url ? 'mat-url-e' : undefined}
        />
        {errors.url && <p id="mat-url-e" className="text-sm text-destructive">{errors.url}</p>}
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="mat-subject">Subject</Label>
        <Input id="mat-subject" className="h-11" list="mat-subjects" value={subject} onChange={(e) => setSubject(e.target.value)} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'mat-subject-e' : undefined} />
        <datalist id="mat-subjects">
          {subjects.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        {errors.subject && <p id="mat-subject-e" className="text-sm text-destructive">{errors.subject}</p>}
      </div>
      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" className="h-11" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" className="h-11">
          {existing ? 'Save changes' : 'Add material'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default function MaterialFormDialog({
  open,
  onOpenChange,
  existing,
  userId,
  courses,
  subjects,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  existing?: Material
  userId: string
  courses: Course[]
  subjects: string[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit material' : 'Add a material'}</DialogTitle>
          <DialogDescription>Materials are links to files or pages that already live online. Nothing is uploaded.</DialogDescription>
        </DialogHeader>
        {open && <Form existing={existing} userId={userId} courses={courses} subjects={subjects} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
