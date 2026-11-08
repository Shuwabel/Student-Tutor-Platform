import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Brand from '@/components/shell/Brand'
import CatalogCard from '@/components/catalog/CatalogCard'
import Stamp from '@/components/catalog/Stamp'
import ThemeButton from '@/components/shell/ThemeButton'
import { Button } from '@/components/ui/button'
import { buildSeed } from '@/lib/seed'
import { courseHours, lessonCount } from '@/lib/selectors'

const INDEX = [
  { no: '100', name: 'Courses', text: 'Lessons in short sections, with your place saved and a stamp for every lesson finished.' },
  { no: '200', name: 'Quizzes', text: 'Timed multiple choice with explanations, a pass mark and every attempt kept.' },
  { no: '300', name: 'Assignments', text: 'Hand in text or a link, get a grade and written feedback from your tutor.' },
  { no: '400', name: 'Live classes', text: 'A free public video room for each session, one click from the schedule.' },
  { no: '500', name: 'Study materials', text: 'Reading lists and references that tutors attach to a course.' },
  { no: '600', name: 'Certificates', text: 'Earned when the lessons are done and the quizzes are passed, with a link anyone can check.' },
  { no: '700', name: 'Career', text: 'Programmes and scholarships to apply for, and a resume builder that exports to PDF.' },
]

export default function Home() {
  const seed = buildSeed(new Date())
  const featured = ['COMP 101', 'MATH 105', 'COMM 150'].map((code) => seed.courses.find((c) => c.code === code)).filter((c): c is NonNullable<typeof c> => !!c)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-stock">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex min-h-11 items-center" aria-label="Student Tutor Platform home">
            <Brand />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeButton />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Try the demo</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">Learn it. Prove it. Get it stamped.</h1>
            <p className="mt-5 max-w-prose text-lg text-muted-foreground md:text-xl">
              A full learning platform for students, tutors and admins: courses, quizzes, assignments, live classes and certificates that anyone can check. Open it and every role works, with sample content already in the drawer.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">
                  Open a sample drawer <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/register">Create an account</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No sign-up wall and no server: your progress is saved in this browser.</p>
          </div>

          <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
            <CatalogCard className="rotate-[-1.5deg]" code="COMP 101" subject="Computing" title="Programming Foundations with Python" meta="3 of 8 lessons stamped" />
            <div className="absolute -bottom-4 right-2 rotate-[3deg]">
              <Stamp press>Passed 83%</Stamp>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-stock" aria-labelledby="index-h">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <h2 id="index-h" className="text-3xl font-bold tracking-tight md:text-4xl">What is in the drawer</h2>
            <ol className="mt-6 divide-y divide-border border-y border-border">
              {INDEX.map((row) => (
                <li key={row.no} className="grid gap-1 py-4 sm:grid-cols-[5rem_12rem_1fr] sm:items-baseline sm:gap-4">
                  <span className="callno text-xl text-primary">{row.no}</span>
                  <span className="text-lg font-bold">{row.name}</span>
                  <span className="text-muted-foreground">{row.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:py-14" aria-labelledby="sample-h">
          <h2 id="sample-h" className="text-3xl font-bold tracking-tight md:text-4xl">A few of the sample courses</h2>
          <p className="mt-2 text-muted-foreground">All sample content, written for this demo.</p>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {featured.map((c) => (
              <li key={c.id}>
                <CatalogCard code={c.code} subject={c.subject} title={c.title} meta={`${c.level} · ${lessonCount(c)} lessons · about ${courseHours(c)} h`}>
                  <p className="text-sm">{c.summary}</p>
                </CatalogCard>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-border bg-stock px-4 py-8 text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl">
          <p>Student Tutor Platform is a portfolio demo. People, courses and results shown are sample data. Live classes open free public Jitsi rooms; nothing is sent to a server of ours.</p>
        </div>
      </footer>
    </div>
  )
}
