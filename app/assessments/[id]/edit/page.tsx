'use client'

import { useParams } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import QuizEditor from '@/components/quiz/QuizEditor'

export default function EditQuizPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <AppShell roles={['tutor', 'admin']}>
      <QuizEditor quizId={id} />
    </AppShell>
  )
}
