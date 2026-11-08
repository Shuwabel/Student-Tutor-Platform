'use client'

import AppShell from '@/components/shell/AppShell'
import QuizEditor from '@/components/quiz/QuizEditor'

export default function NewQuizPage() {
  return (
    <AppShell roles={['tutor', 'admin']}>
      <QuizEditor />
    </AppShell>
  )
}
