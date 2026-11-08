import Link from 'next/link'
import Brand from '@/components/shell/Brand'

export default function AuthFrame({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-stock">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <Link href="/" className="flex min-h-11 items-center" aria-label="Student Tutor Platform home">
            <Brand />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 md:py-14">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-2 max-w-prose text-muted-foreground">{intro}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  )
}
