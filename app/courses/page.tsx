'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import AppShell from '@/components/shell/AppShell'
import CatalogCard from '@/components/catalog/CatalogCard'
import EmptyState from '@/components/catalog/EmptyState'
import PageTitle from '@/components/catalog/PageTitle'
import ProgressRule from '@/components/catalog/ProgressRule'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import NativeSelect from '@/components/courses/NativeSelect'
import { filterCourses, LEVELS } from '@/lib/courses'
import { plural } from '@/lib/format'
import { progressPercent } from '@/lib/selectors'
import { courseHours, lessonCount } from '@/lib/selectors'
import { useCurrentUser, useStore } from '@/lib/store'

function Catalogue() {
  const user = useCurrentUser()
  const courses = useStore((s) => s.courses)
  const users = useStore((s) => s.users)
  const enrollments = useStore((s) => s.enrollments)
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')

  const published = useMemo(() => courses.filter((c) => c.published), [courses])
  const subjects = useMemo(() => Array.from(new Set(published.map((c) => c.subject))).sort(), [published])
  const tutorNames = useMemo(() => new Map(users.map((u) => [u.id, u.name])), [users])
  const mine = useMemo(() => new Map(enrollments.filter((e) => e.userId === user?.id).map((e) => [e.courseId, e])), [enrollments, user?.id])
  const results = useMemo(
    () => filterCourses(published, { query, subject, level }, (id) => tutorNames.get(id) ?? ''),
    [published, query, subject, level, tutorNames],
  )
  const filtering = Boolean(query || subject || level)
  const isStudent = user?.role === 'student'

  return (
    <>
      <PageTitle
        title="Course catalogue"
        intro={isStudent ? 'Browse the published courses, enrol, and pick up where you left off.' : 'The published catalogue as students see it. This view is read only.'}
      />

      <form role="search" className="mb-6 grid gap-3 md:grid-cols-[1fr_12rem_12rem]" onSubmit={(e) => e.preventDefault()}>
        <div>
          <Label htmlFor="course-q">Search courses</Label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input id="course-q" type="search" className="h-11 pl-9" placeholder="Title, code, tutor or tag" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div>
          <Label htmlFor="course-subject">Subject</Label>
          <NativeSelect id="course-subject" className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <Label htmlFor="course-level">Level</Label>
          <NativeSelect id="course-level" className="mt-1.5" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </NativeSelect>
        </div>
      </form>

      <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
        {plural(results.length, 'course')} {filtering ? 'match your filters' : 'in the catalogue'}
      </p>

      {results.length === 0 ? (
        <EmptyState
          title={filtering ? 'No course matches' : 'No published courses yet'}
          action={
            filtering ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => {
                  setQuery('')
                  setSubject('')
                  setLevel('')
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        >
          {filtering ? 'Try a different word, or clear the filters to see everything.' : 'Courses appear here once a tutor publishes them.'}
        </EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => {
            const enrollment = mine.get(c.id)
            return (
              <li key={c.id}>
                <CatalogCard
                  className="h-full"
                  href={`/courses/${c.id}`}
                  code={c.code}
                  title={c.title}
                  subject={c.subject}
                  meta={
                    <>
                      {tutorNames.get(c.tutorId) ?? 'Tutor'}
                      <span className="mx-1.5" aria-hidden="true">
                        /
                      </span>
                      {c.level}
                    </>
                  }
                  footer={
                    enrollment && isStudent ? (
                      <div>
                        <Badge className="mb-2">{enrollment.completedAt ? 'Completed' : 'Enrolled'}</Badge>
                        <ProgressRule percent={progressPercent(c, enrollment)} />
                      </div>
                    ) : undefined
                  }
                >
                  <p className="line-clamp-3 text-sm">{c.summary}</p>
                  <p className="callno mt-2 text-xs text-muted-foreground">
                    {courseHours(c)} h / {plural(lessonCount(c), 'lesson')}
                  </p>
                </CatalogCard>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

export default function CoursesPage() {
  return (
    <AppShell>
      <Catalogue />
    </AppShell>
  )
}
