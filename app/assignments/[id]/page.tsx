'use client'

import { useParams } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import AssignmentDetail from '@/components/assignments/AssignmentDetail'

export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <AppShell wide>
      <AssignmentDetail assignmentId={id} />
    </AppShell>
  )
}
