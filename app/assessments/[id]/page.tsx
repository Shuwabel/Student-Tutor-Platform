'use client'

import { useParams } from 'next/navigation'
import AppShell from '@/components/shell/AppShell'
import QuizTaker from '@/components/quiz/QuizTaker'

export default function TakeQuizPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <AppShell roles={['student']}>
      <QuizTaker quizId={id} />
    </AppShell>
  )
}
