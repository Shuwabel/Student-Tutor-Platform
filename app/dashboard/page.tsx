'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import StudentHome from '@/components/home/StudentHome'
import TutorHome from '@/components/home/TutorHome'
import { useCurrentUser } from '@/lib/store'

function Home() {
  const user = useCurrentUser()
  const router = useRouter()
  useEffect(() => {
    if (user?.role === 'admin') router.replace('/admin')
  }, [user, router])
  if (!user || user.role === 'admin') return null
  return user.role === 'tutor' ? <TutorHome user={user} /> : <StudentHome user={user} />
}

export default function DashboardPage() {
  return (
    <AppShell>
      <Home />
    </AppShell>
  )
}
