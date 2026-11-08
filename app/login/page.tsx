'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GraduationCap, ShieldCheck, UserRound } from 'lucide-react'
import AuthFrame from '@/components/auth/AuthFrame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HOME } from '@/lib/nav'
import { useHydrated, useStore } from '@/lib/store'
import type { Role } from '@/lib/types'

const ROLES: { role: Role; label: string; blurb: string; icon: typeof UserRound }[] = [
  { role: 'student', label: 'Student', blurb: 'Amara Okafor, halfway through two courses and with a certificate already stamped.', icon: GraduationCap },
  { role: 'tutor', label: 'Tutor', blurb: 'Ngozi Eze, with courses to edit, quizzes to set and work waiting to be graded.', icon: UserRound },
  { role: 'admin', label: 'Admin', blurb: 'Grace Admin, who sees every person and every course on the platform.', icon: ShieldCheck },
]

function LoginForm() {
  const ready = useHydrated()
  const router = useRouter()
  const params = useSearchParams()
  const loginDemo = useStore((s) => s.loginDemo)
  const users = useStore((s) => s.users)
  const login = useStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const go = (role: Role) => {
    loginDemo(role)
    const next = params.get('next')
    router.push(next && next.startsWith('/') && role !== 'admin' ? next : HOME[role])
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
      <section aria-labelledby="demo-h">
        <h2 id="demo-h" className="text-xl font-bold">Open a sample drawer</h2>
        <p className="mt-1 text-muted-foreground">No password and no account to make. Pick a role and everything is filled in for you.</p>
        <ul className="mt-4 grid gap-3">
          {ROLES.map(({ role, label, blurb, icon: Icon }) => (
            <li key={role}>
              <button
                type="button"
                disabled={!ready}
                onClick={() => go(role)}
                className="group flex min-h-20 w-full items-center gap-4 rounded-md border border-border bg-card p-4 text-left transition-colors hover:border-primary disabled:opacity-60"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-lg font-bold">Continue as {label}</span>
                  <span className="block text-sm text-muted-foreground">{blurb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="email-h" className="rounded-md border border-border bg-card p-5">
        <h2 id="email-h" className="text-xl font-bold">Come back with your email</h2>
        <p className="mt-1 text-sm text-muted-foreground">If you made an account on this device, enter its email. There is no password: your data lives in this browser only.</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            const found = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
            if (!found) {
              setError('No account with that email on this device yet.')
              return
            }
            login(found.id)
            router.push(HOME[found.role])
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} />
          </div>
          {error && (
            <p role="alert" className="text-sm font-semibold text-destructive">
              {error} <Link href="/register" className="underline underline-offset-4">Create one</Link>
            </p>
          )}
          <Button type="submit" className="w-full" disabled={!ready}>Sign in</Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          New here? <Link href="/register" className="font-semibold text-foreground underline underline-offset-4">Create an account</Link>
        </p>
      </section>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthFrame title="Sign in" intro="This is a working demo. Courses, quizzes, grades and certificates are all stored in your browser, so you can try every role.">
      <Suspense fallback={<p className="text-muted-foreground">Loading...</p>}>
        <LoginForm />
      </Suspense>
    </AuthFrame>
  )
}
