'use client'

import AppShell from '@/components/shell/AppShell'
import CourseEditor from '@/components/courses/CourseEditor'

export default function NewCoursePage() {
  return (
    <AppShell roles={['tutor', 'admin']}>
      <CourseEditor />
    </AppShell>
  )
}
