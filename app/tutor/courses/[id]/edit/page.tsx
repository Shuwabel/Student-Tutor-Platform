'use client'

import { useParams } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import CourseEditor from '@/components/courses/CourseEditor'

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>()
  return (
    <AppShell roles={['tutor', 'admin']}>
      <CourseEditor key={id} courseId={id} />
    </AppShell>
  )
}
