'use client'

import { useParams } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import AssignmentEditor from '@/components/assignments/AssignmentEditor'

export default function EditAssignmentPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <AppShell roles={['tutor', 'admin']}>
      <AssignmentEditor assignmentId={id} />
    </AppShell>
  )
}
