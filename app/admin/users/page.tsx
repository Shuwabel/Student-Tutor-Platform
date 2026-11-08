'use client'

import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import PageTitle from '@/components/catalog/PageTitle'
import EmptyState from '@/components/catalog/EmptyState'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { shortDate } from '@/lib/format'
import { useCurrentUser, useStore } from '@/lib/store'
import type { Role, User } from '@/lib/types'

function People() {
  const me = useCurrentUser()
  const users = useStore((s) => s.users)
  const setUserRole = useStore((s) => s.setUserRole)
  const removeUser = useStore((s) => s.removeUser)
  const [q, setQ] = useState('')
  const [target, setTarget] = useState<User | null>(null)

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return users.filter((u) => !needle || u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle) || u.role.includes(needle))
  }, [users, q])

  return (
    <>
      <PageTitle title="People" intro="Everyone stored in this browser. Change a role or remove an account." />
      <div className="mb-4 max-w-md space-y-1.5">
        <Label htmlFor="user-search">Search by name, email or role</Label>
        <Input id="user-search" type="search" className="h-11" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <p className="mb-2 text-sm text-muted-foreground" aria-live="polite">
        {shown.length} of {users.length} people
      </p>

      {shown.length === 0 ? (
        <EmptyState title="Nobody matches that search" />
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border bg-card">
          {shown.map((u) => {
            const self = u.id === me?.id
            return (
              <li key={u.id} className="grid items-center gap-3 px-4 py-3 md:grid-cols-[1fr_9rem_8rem_auto]">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {u.name}
                    {self && <span className="ml-2 text-sm font-normal text-muted-foreground">(you)</span>}
                  </p>
                  <p className="callno truncate text-xs font-normal text-muted-foreground">{u.email}</p>
                </div>
                <div>
                  <Label htmlFor={`role-${u.id}`} className="sr-only">Role for {u.name}</Label>
                  <Select
                    value={u.role}
                    disabled={self}
                    onValueChange={(v) => {
                      setUserRole(u.id, v as Role)
                      toast.success(`${u.name} is now a ${v}`)
                    }}
                  >
                    <SelectTrigger id={`role-${u.id}`} className="h-11 w-full" title={self ? 'You cannot change your own role' : undefined}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="tutor">Tutor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="callno text-xs text-muted-foreground">{shortDate(u.createdAt)}</p>
                <Button
                  variant="outline"
                  className="h-11"
                  disabled={self}
                  onClick={() => setTarget(u)}
                  aria-label={`Remove ${u.name}`}
                  title={self ? 'You cannot remove yourself' : undefined}
                >
                  <Trash2 aria-hidden="true" /> Remove
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      <ConfirmDialog
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        title={`Remove ${target?.name ?? 'this person'}?`}
        description="Their enrolments, quiz attempts and submissions are removed too. This cannot be undone, except by resetting the demo."
        confirmLabel="Remove person"
        onConfirm={() => {
          if (!target) return
          removeUser(target.id)
          toast.success(`${target.name} removed`)
        }}
      />
    </>
  )
}

export default function AdminUsersPage() {
  return (
    <AppShell roles={['admin']}>
      <People />
    </AppShell>
  )
}
