'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthFrame from '@/components/auth/AuthFrame'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { HOME } from '@/lib/nav'
import { useHydrated, useStore } from '@/lib/store'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const ready = useHydrated()
  const router = useRouter()
  const register = useStore((s) => s.register)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('student')

  return (
    <AuthFrame title="Create an account" intro="Takes ten seconds. Your account and everything you do are saved in this browser only, with no password.">
      <form
        className="max-w-md space-y-5 rounded-md border border-border bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault()
          const user = register({ name, email, role })
          router.push(HOME[user.role])
        }}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">I am a</legend>
          <div className="grid grid-cols-2 gap-2">
            {(['student', 'tutor'] as const).map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={role === r}
                onClick={() => setRole(r)}
                className={cn('min-h-12 rounded-md border text-base font-bold capitalize', role === r ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary')}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>
        <Button type="submit" size="lg" className="w-full" disabled={!ready}>Create account</Button>
        <p className="text-sm text-muted-foreground">
          Already have one? <Link href="/login" className="font-semibold text-foreground underline underline-offset-4">Sign in</Link>
        </p>
      </form>
    </AuthFrame>
  )
}
