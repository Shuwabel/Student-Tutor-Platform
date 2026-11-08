'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Bookmark, BookmarkCheck, ExternalLink, FileText } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import PageTitle from '@/components/catalog/PageTitle'
import EmptyState from '@/components/catalog/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { plural, shortDate } from '@/lib/format'
import { useCurrentUser, useStore } from '@/lib/store'
import type { Opportunity } from '@/lib/types'

const EMPTY_IDS: string[] = []

function Opportunities() {
  const user = useCurrentUser()
  const opportunities = useStore((s) => s.opportunities)
  const savedMap = useStore((s) => s.savedOpportunities)
  const toggle = useStore((s) => s.toggleSavedOpportunity)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('all')
  const [remote, setRemote] = useState(false)
  const [tab, setTab] = useState<'all' | 'saved'>('all')

  const saved = (user && savedMap[user.id]) || EMPTY_IDS
  const kinds = useMemo(() => Array.from(new Set(opportunities.map((o) => o.kind))).sort(), [opportunities])

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return opportunities.filter((o) => {
      if (tab === 'saved' && !saved.includes(o.id)) return false
      if (kind !== 'all' && o.kind !== kind) return false
      if (remote && !o.remote) return false
      if (!needle) return true
      return [o.title, o.org, o.location, o.summary, ...o.tags].some((t) => t.toLowerCase().includes(needle))
    })
  }, [opportunities, saved, tab, kind, remote, q])

  const onToggle = (o: Opportunity) => {
    const was = saved.includes(o.id)
    toggle(o.id)
    toast.success(was ? 'Removed from saved' : 'Saved', was ? { action: { label: 'Undo', onClick: () => toggle(o.id) } } : undefined)
  }

  return (
    <>
      <PageTitle
        title="Career"
        intro="Internships, scholarships, jobs and programmes. These are sample listings that link to the organisers' own sites, so check each site for what is open now."
        action={
          <Button asChild className="h-11">
            <Link href="/career/resume"><FileText aria-hidden="true" /> Resume builder</Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | 'saved')}>
        <TabsList className="h-11 w-full sm:w-fit">
          <TabsTrigger value="all" className="min-h-9 px-4">All opportunities</TabsTrigger>
          <TabsTrigger value="saved" className="min-h-9 px-4">Saved ({saved.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_12rem_auto] md:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="opp-search">Search</Label>
          <Input id="opp-search" type="search" className="h-11" placeholder="Title, organisation, topic" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="opp-kind">Kind</Label>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger id="opp-kind" className="h-11 w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kinds</SelectItem>
              {kinds.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="h-5 w-5 accent-primary" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
          Remote only
        </label>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{plural(shown.length, 'opportunity', 'opportunities')} shown</p>

      {shown.length === 0 ? (
        <div className="mt-2">
          <EmptyState title={tab === 'saved' && saved.length === 0 ? 'Nothing saved yet' : 'No opportunities match'}>
            {tab === 'saved' && saved.length === 0 ? 'Use the Save button on any listing to keep it here.' : 'Try a different search or clear the filters.'}
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-2 grid gap-3 lg:grid-cols-2">
          {shown.map((o) => {
            const isSaved = saved.includes(o.id)
            return (
              <li key={o.id} className="flex flex-col rounded-md border border-border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="callno text-xs text-primary">{o.kind}</span>
                  <span className="text-xs text-muted-foreground">{o.location}{o.remote ? ', remote' : ''}</span>
                </div>
                <h2 className="mt-1 text-lg font-bold leading-snug">{o.title}</h2>
                <p className="text-sm font-semibold text-muted-foreground">{o.org}</p>
                <p className="mt-2 flex-1 text-sm">{o.summary}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {o.deadline ? <>Deadline <span className="callno">{shortDate(o.deadline)}</span></> : 'Check the site for dates'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant={isSaved ? 'secondary' : 'outline'} className="h-11" aria-pressed={isSaved} onClick={() => onToggle(o)}>
                    {isSaved ? <BookmarkCheck aria-hidden="true" /> : <Bookmark aria-hidden="true" />}
                    {isSaved ? 'Saved' : 'Save'}
                    <span className="sr-only"> {o.title}</span>
                  </Button>
                  <Button asChild variant="outline" className="h-11">
                    <a href={o.url} target="_blank" rel="noopener noreferrer">
                      Visit site <ExternalLink aria-hidden="true" /><span className="sr-only"> for {o.title} (opens in a new tab)</span>
                    </a>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default function CareerPage() {
  return (
    <AppShell roles={['student']}>
      <Opportunities />
    </AppShell>
  )
}
