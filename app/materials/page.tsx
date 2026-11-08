'use client'

import { useMemo, useState } from 'react'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import PageTitle from '@/components/catalog/PageTitle'
import EmptyState from '@/components/catalog/EmptyState'
import ConfirmDialog from '@/components/materials/ConfirmDialog'
import MaterialFormDialog from '@/components/materials/MaterialFormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { shortDate } from '@/lib/format'
import { KIND_LABEL, KINDS } from '@/lib/live'
import { useCurrentUser, useStore } from '@/lib/store'
import type { Material } from '@/lib/types'

function Content() {
  const user = useCurrentUser()!
  const materials = useStore((s) => s.materials)
  const courses = useStore((s) => s.courses)
  const users = useStore((s) => s.users)
  const saveMaterial = useStore((s) => s.saveMaterial)
  const deleteMaterial = useStore((s) => s.deleteMaterial)
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('all')
  const [kind, setKind] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Material | undefined>()
  const [deleting, setDeleting] = useState<Material | undefined>()

  const subjects = useMemo(() => Array.from(new Set(materials.map((m) => m.subject))).sort(), [materials])
  const formCourses = useMemo(() => (user.role === 'admin' ? courses : courses.filter((c) => c.tutorId === user.id)), [courses, user.id, user.role])
  const canAdd = user.role === 'tutor' || user.role === 'admin'
  const canManage = (m: Material) => user.role === 'admin' || (user.role === 'tutor' && m.addedBy === user.id)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return materials
      .filter((m) => subject === 'all' || m.subject === subject)
      .filter((m) => kind === 'all' || m.kind === kind)
      .filter((m) => {
        if (!q) return true
        const code = courses.find((c) => c.id === m.courseId)?.code ?? ''
        return `${m.title} ${m.description} ${m.subject} ${code}`.toLowerCase().includes(q)
      })
      .sort((a, b) => a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title))
  }, [materials, courses, query, subject, kind])

  const filtered = query.trim() !== '' || subject !== 'all' || kind !== 'all'

  return (
    <>
      <PageTitle
        title="Study materials"
        intro="Slides, notes, videos and links gathered by tutors. Each one opens on its own site in a new tab."
        action={
          canAdd ? (
            <Button className="h-11" onClick={() => { setEditing(undefined); setFormOpen(true) }}>
              <Plus /> Add a material
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem_12rem]">
        <div className="grid gap-1.5">
          <Label htmlFor="mat-search">Search</Label>
          <Input id="mat-search" type="search" className="h-11" placeholder="Title, subject or call number" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="mat-f-subject">Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger id="mat-f-subject" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="mat-f-kind">Kind</Label>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger id="mat-f-kind" className="h-11 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              {KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  {KIND_LABEL[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'material' : 'materials'}
        {filtered ? ' match your filters' : ' in the library'}
      </p>

      {visible.length === 0 ? (
        <EmptyState
          title={filtered ? 'Nothing matches those filters' : 'The library has no materials yet'}
          action={
            filtered ? (
              <Button variant="outline" className="h-11" onClick={() => { setQuery(''); setSubject('all'); setKind('all') }}>
                Clear filters
              </Button>
            ) : undefined
          }
        >
          {filtered ? 'Try a different word or clear a filter.' : canAdd ? 'Use Add a material to share the first one.' : 'Tutors add materials here as they prepare their courses.'}
        </EmptyState>
      ) : (
        <ul className="grid gap-3">
          {visible.map((m) => {
            const course = courses.find((c) => c.id === m.courseId)
            const adder = users.find((u) => u.id === m.addedBy)
            return (
              <li key={m.id} className="rounded-md border border-border bg-card">
                <div className="flex items-baseline justify-between gap-3 border-b border-brass px-4 pb-1 pt-3">
                  <span className="callno text-sm text-primary">{course ? course.code : 'GENERAL'}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {KIND_LABEL[m.kind]} · {m.subject}
                  </span>
                </div>
                <div className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold leading-snug">{m.title}</h2>
                    {m.description && <p className="mt-1 max-w-prose text-sm text-muted-foreground">{m.description}</p>}
                    <p className="callno mt-2 text-xs text-muted-foreground">
                      {adder ? `Added by ${adder.name}` : 'Added'} {shortDate(m.addedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {canManage(m) && (
                      <>
                        <Button variant="outline" size="icon" className="size-11" aria-label={`Edit ${m.title}`} onClick={() => { setEditing(m); setFormOpen(true) }}>
                          <Pencil />
                        </Button>
                        <Button variant="outline" size="icon" className="size-11" aria-label={`Delete ${m.title}`} onClick={() => setDeleting(m)}>
                          <Trash2 />
                        </Button>
                      </>
                    )}
                    <Button asChild className="h-11">
                      <a href={m.url} target="_blank" rel="noopener noreferrer">
                        Open <ExternalLink aria-hidden="true" />
                        <span className="sr-only">{m.title} in a new tab</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <MaterialFormDialog open={formOpen} onOpenChange={setFormOpen} existing={editing} userId={user.id} courses={formCourses} subjects={subjects} />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(undefined)}
        title="Delete this material?"
        description={deleting ? `${deleting.title} will be removed from the library for everyone. You can undo straight afterwards.` : ''}
        confirmLabel="Delete material"
        onConfirm={() => {
          if (!deleting) return
          const removed = deleting
          deleteMaterial(removed.id)
          toast.success('Material deleted.', { action: { label: 'Undo', onClick: () => saveMaterial(removed) } })
        }}
      />
    </>
  )
}

export default function MaterialsPage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}
