'use client'

import AppShell from '@/components/shell/AppShell'
import AssignmentEditor from '@/components/assignments/AssignmentEditor'

export default function NewAssignmentPage() {
  return (
    <AppShell roles={['tutor', 'admin']}>
      <AssignmentEditor />
    </AppShell>
  )
}
