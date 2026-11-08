'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Download, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import PageTitle from '@/components/catalog/PageTitle'
import ResumePreview from '@/components/career/ResumePreview'
import { downloadResumePdf } from '@/components/career/resumePdf'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/lib/store'
import type { Resume, User } from '@/lib/types'

/** Form state: skills and bullets stay as the text being typed. */
interface Draft {
  fullName: string
  headline: string
  email: string
  phone: string
  location: string
  summary: string
  skillsText: string
  education: Resume['education']
  experience: { role: string; org: string; years: string; bulletsText: string }[]
}

const toDraft = (r: Resume): Draft => ({
  fullName: r.fullName,
  headline: r.headline,
  email: r.email,
  phone: r.phone,
  location: r.location,
  summary: r.summary,
  skillsText: r.skills.join(', '),
  education: r.education,
  experience: r.experience.map((e) => ({ role: e.role, org: e.org, years: e.years, bulletsText: e.bullets.join('\n') })),
})

const toResume = (d: Draft, userId: string): Resume => ({
  userId,
  fullName: d.fullName,
  headline: d.headline,
  email: d.email,
  phone: d.phone,
  location: d.location,
  summary: d.summary,
  skills: d.skillsText.split(',').map((s) => s.trim()).filter(Boolean),
  education: d.education,
  experience: d.experience.map((e) => ({ role: e.role, org: e.org, years: e.years, bullets: e.bulletsText.split('\n').map((b) => b.trim()).filter(Boolean) })),
})

function Field({ id, label, ...rest }: { id: string; label: string } & React.ComponentProps<'input'>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-11" {...rest} />
    </div>
  )
}

function Builder({ user }: { user: User }) {
  const saveResume = useStore((s) => s.saveResume)
  const [draft, setDraft] = useState<Draft>(() => {
    const existing = useStore.getState().resumes[user.id]
    return existing
      ? toDraft(existing)
      : { fullName: user.name, headline: '', email: user.email, phone: '', location: '', summary: '', skillsText: '', education: [{ school: '', degree: '', years: '' }], experience: [] }
  })
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const first = useRef(true)

  const resume = useMemo(() => toResume(draft, user.id), [draft, user.id])

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setStatus('Saving...')
    const t = setTimeout(() => {
      saveResume(resume)
      setStatus('Saved in this browser')
    }, 600)
    return () => clearTimeout(t)
  }, [resume, saveResume])

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const text = (k: 'fullName' | 'headline' | 'email' | 'phone' | 'location') => ({ value: draft[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, e.target.value) })

  const download = async () => {
    setBusy(true)
    try {
      saveResume(resume)
      await downloadResumePdf(resume)
      toast.success('PDF downloaded')
    } catch {
      toast.error('Could not make the PDF. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageTitle
        title="Resume builder"
        intro="Fill in the form and the preview updates as you type. Your resume is saved in this browser only."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-11"><Link href="/career"><ArrowLeft aria-hidden="true" /> Opportunities</Link></Button>
            <Button className="h-11" onClick={download} disabled={busy}><Download aria-hidden="true" /> {busy ? 'Making PDF...' : 'Download PDF'}</Button>
          </div>
        }
      />
      <p className="mb-4 text-sm text-muted-foreground" role="status" aria-live="polite">{status}</p>

      <div className="grid gap-8 lg:grid-cols-2">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()} aria-label="Resume details">
          <fieldset className="space-y-3">
            <legend className="mb-2 text-xl font-bold">Contact</legend>
            <Field id="r-name" label="Full name" autoComplete="name" {...text('fullName')} />
            <Field id="r-headline" label="Headline" placeholder="Computer science student" {...text('headline')} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field id="r-email" label="Email" type="email" autoComplete="email" {...text('email')} />
              <Field id="r-phone" label="Phone" type="tel" autoComplete="tel" {...text('phone')} />
            </div>
            <Field id="r-loc" label="Location" autoComplete="address-level2" {...text('location')} />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-2 text-xl font-bold">Summary and skills</legend>
            <div className="space-y-1.5">
              <Label htmlFor="r-summary">Summary</Label>
              <Textarea id="r-summary" rows={4} value={draft.summary} onChange={(e) => set('summary', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-skills">Skills, separated by commas</Label>
              <Textarea id="r-skills" rows={2} placeholder="Python, public speaking, Excel" value={draft.skillsText} onChange={(e) => set('skillsText', e.target.value)} />
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-2 text-xl font-bold">Education</legend>
            {draft.education.length === 0 && <p className="text-sm text-muted-foreground">No education added.</p>}
            {draft.education.map((ed, i) => (
              <div key={i} className="space-y-3 rounded-md border border-border bg-card p-4">
                <Field id={`ed-school-${i}`} label="School or college" value={ed.school} onChange={(e) => set('education', draft.education.map((x, j) => (j === i ? { ...x, school: e.target.value } : x)))} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id={`ed-degree-${i}`} label="Qualification" value={ed.degree} onChange={(e) => set('education', draft.education.map((x, j) => (j === i ? { ...x, degree: e.target.value } : x)))} />
                  <Field id={`ed-years-${i}`} label="Years" placeholder="2022 to 2025" value={ed.years} onChange={(e) => set('education', draft.education.map((x, j) => (j === i ? { ...x, years: e.target.value } : x)))} />
                </div>
                <Button type="button" variant="outline" className="h-11" onClick={() => set('education', draft.education.filter((_, j) => j !== i))}>
                  <Trash2 aria-hidden="true" /> Remove education {i + 1}
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" className="h-11" onClick={() => set('education', [...draft.education, { school: '', degree: '', years: '' }])}>
              <Plus aria-hidden="true" /> Add education
            </Button>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-2 text-xl font-bold">Experience</legend>
            {draft.experience.length === 0 && <p className="text-sm text-muted-foreground">No experience added. Volunteering and school projects count.</p>}
            {draft.experience.map((ex, i) => {
              const upd = (patch: Partial<Draft['experience'][number]>) => set('experience', draft.experience.map((x, j) => (j === i ? { ...x, ...patch } : x)))
              return (
                <div key={i} className="space-y-3 rounded-md border border-border bg-card p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field id={`ex-role-${i}`} label="Role" value={ex.role} onChange={(e) => upd({ role: e.target.value })} />
                    <Field id={`ex-org-${i}`} label="Organisation" value={ex.org} onChange={(e) => upd({ org: e.target.value })} />
                  </div>
                  <Field id={`ex-years-${i}`} label="Years" placeholder="Jun 2024 to Aug 2024" value={ex.years} onChange={(e) => upd({ years: e.target.value })} />
                  <div className="space-y-1.5">
                    <Label htmlFor={`ex-bul-${i}`}>What you did, one point per line</Label>
                    <Textarea id={`ex-bul-${i}`} rows={3} value={ex.bulletsText} onChange={(e) => upd({ bulletsText: e.target.value })} />
                  </div>
                  <Button type="button" variant="outline" className="h-11" onClick={() => set('experience', draft.experience.filter((_, j) => j !== i))}>
                    <Trash2 aria-hidden="true" /> Remove experience {i + 1}
                  </Button>
                </div>
              )
            })}
            <Button type="button" variant="outline" className="h-11" onClick={() => set('experience', [...draft.experience, { role: '', org: '', years: '', bulletsText: '' }])}>
              <Plus aria-hidden="true" /> Add experience
            </Button>
          </fieldset>
        </form>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-3 text-xl font-bold">Preview</h2>
          <ResumePreview resume={resume} />
        </div>
      </div>
    </>
  )
}

function Page() {
  const user = useStore((s) => s.users.find((u) => u.id === s.currentUserId) ?? null)
  if (!user) return null
  return <Builder user={user} />
}

export default function ResumePage() {
  return (
    <AppShell roles={['student']} wide>
      <Page />
    </AppShell>
  )
}
