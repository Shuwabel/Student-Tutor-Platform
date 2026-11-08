'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, Menu, Moon, RotateCcw, Sun, UserRound } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import Brand from '@/components/shell/Brand'
import { HOME, NAV } from '@/lib/nav'
import { DEMO_ACCOUNTS } from '@/lib/seed'
import { useCurrentUser, useHydrated, useStore } from '@/lib/store'
import type { Role } from '@/lib/types'
import { cn } from '@/lib/utils'

const isActive = (pathname: string, href: string) => (href === '/dashboard' || href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(href + '/'))

/**
 * Frame for every signed-in screen: drawer-tab navigation, account menu, phone bottom bar.
 * Pass `roles` to restrict a screen; anyone else is told where to go instead.
 */
export default function AppShell({ children, roles, wide = false }: { children: React.ReactNode; roles?: Role[]; wide?: boolean }) {
  const ready = useHydrated()
  const user = useCurrentUser()
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [more, setMore] = useState(false)
  const logout = useStore((s) => s.logout)
  const loginDemo = useStore((s) => s.loginDemo)
  const resetDemo = useStore((s) => s.resetDemo)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [ready, user, router, pathname])

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-background" aria-busy="true">
        <div className="h-14 border-b border-border bg-stock" />
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-8">
          <div className="h-10 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-48 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  const items = NAV[user.role]
  const allowed = !roles || roles.includes(user.role)
  const primary = items.filter((i) => i.primary)
  const secondary = items.filter((i) => !i.primary)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-stock">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href={HOME[user.role]} className="flex min-h-11 items-center" aria-label="Student Tutor Platform home">
            <Brand />
          </Link>

          <nav aria-label="Main" className="hidden items-end gap-1 self-end md:flex">
            {items.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rounded-t-md border border-b-0 px-3 py-2 text-sm font-semibold transition-colors',
                    active ? 'border-border bg-background text-foreground' : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label={mounted && resolvedTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && resolvedTheme === 'dark' ? <Sun /> : <Moon />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="min-h-11 gap-2 px-2" aria-label="Account menu">
                  <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                  <span className="hidden max-w-32 truncate text-sm sm:block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  {user.name}
                  <span className="block text-xs font-normal capitalize text-muted-foreground">{user.role} account</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Try another role</DropdownMenuLabel>
                {(Object.keys(DEMO_ACCOUNTS) as Role[]).map((role) => (
                  <DropdownMenuItem
                    key={role}
                    onSelect={() => {
                      loginDemo(role)
                      router.push(HOME[role])
                    }}
                  >
                    <UserRound className="mr-2 h-4 w-4" /> Sample {role}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    resetDemo()
                    toast.success('Sample data restored. Sign in again to continue.')
                    router.push('/login')
                  }}
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset sample data
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    logout()
                    router.push('/')
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main id="main" className={cn('mx-auto px-4 py-6 md:py-8', wide ? 'max-w-7xl' : 'max-w-6xl')}>
        {allowed ? (
          children
        ) : (
          <section className="mx-auto max-w-xl rounded-md border border-border bg-card p-6">
            <h1 className="text-2xl font-bold">This page is for {roles?.join(' and ')} accounts</h1>
            <p className="mt-2 text-muted-foreground">You are signed in as a {user.role}. Use the account menu to try another role.</p>
            <Button asChild className="mt-4">
              <Link href={HOME[user.role]}>Go to your home</Link>
            </Button>
          </section>
        )}
      </main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-stock pb-[env(safe-area-inset-bottom)] md:hidden" style={{ gridTemplateColumns: `repeat(${primary.length + (secondary.length ? 1 : 0)}, minmax(0, 1fr))` }}>
        {primary.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn('flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </Link>
          )
        })}
        {secondary.length > 0 && (
          <button type="button" onClick={() => setMore(true)} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold text-muted-foreground">
            <Menu className="h-5 w-5" aria-hidden="true" />
            More
          </button>
        )}
      </nav>

      <Sheet open={more} onOpenChange={setMore}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <ul className="grid gap-1 px-4 pb-6">
            {secondary.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setMore(false)} className="flex min-h-12 items-center gap-3 rounded px-2 font-semibold hover:bg-accent">
                  <item.icon className="h-5 w-5" aria-hidden="true" /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </SheetContent>
      </Sheet>
    </div>
  )
}
