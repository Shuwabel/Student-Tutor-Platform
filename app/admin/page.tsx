'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import AppShell from '@/components/shell/AppShell'
import PageTitle from '@/components/catalog/PageTitle'
import { Button } from '@/components/ui/button'
import { shortDate } from '@/lib/format'
import { useStore } from '@/lib/store'

function Count({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="callno mt-1 text-3xl">{value}</dd>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

function Overview() {
  const users = useStore((s) => s.users)
  const courses = useStore((s) => s.courses)
  const enrollments = useStore((s) => s.enrollments)
  const certificates = useStore((s) => s.certificates)
  const attempts = useStore((s) => s.attempts)

  const stats = useMemo(() => {
    const role = (r: string) => users.filter((u) => u.role === r).length
    const published = courses.filter((c) => c.published).length
    const avg = attempts.length ? Math.round(attempts.reduce((n, a) => n + a.score, 0) / attempts.length) : null
    const recent = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
    return { students: role('student'), tutors: role('tutor'), admins: role('admin'), published, drafts: courses.length - published, avg, recent }
  }, [users, courses, attempts])

  return (
    <>
      <PageTitle
        title="Admin overview"
        intro="Plain counts of what is stored in this browser. There is no server, so these are not platform-wide figures."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-11"><Link href="/admin/users">Manage people</Link></Button>
            <Button asChild variant="outline" className="h-11"><Link href="/admin/courses">Manage courses</Link></Button>
          </div>
        }
      />
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Count label="Students" value={stats.students} />
        <Count label="Tutors" value={stats.tutors} />
        <Count label="Admins" value={stats.admins} />
        <Count label="Enrolments" value={enrollments.length} />
        <Count label="Courses published" value={stats.published} />
        <Count label="Courses in draft" value={stats.drafts} />
        <Count label="Certificates issued" value={certificates.length} />
        <Count label="Quiz attempts" value={attempts.length} note={stats.avg === null ? 'No attempts yet' : `Average score ${stats.avg}%`} />
      </dl>

      <section aria-labelledby="recent-h" className="mt-10">
        <h2 id="recent-h" className="mb-3 text-xl font-bold">Recent signups</h2>
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {stats.recent.map((u) => (
            <li key={u.id} className="flex min-h-11 flex-wrap items-center justify-between gap-2 px-4 py-2">
              <span className="min-w-0">
                <span className="font-semibold">{u.name}</span>
                <span className="ml-2 text-sm capitalize text-muted-foreground">{u.role}{u.sample ? ', sample' : ''}</span>
              </span>
              <span className="callno text-xs text-muted-foreground">{shortDate(u.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default function AdminPage() {
  return (
    <AppShell roles={['admin']}>
      <Overview />
    </AppShell>
  )
}
