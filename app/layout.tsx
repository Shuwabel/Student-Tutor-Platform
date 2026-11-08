import type { Metadata, Viewport } from 'next'
import { Courier_Prime, Public_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const text = Public_Sans({ subsets: ['latin'], variable: '--font-text', display: 'swap' })
const mono = Courier_Prime({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-mono', display: 'swap' })

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Student Tutor Platform: courses, quizzes and live classes', template: '%s | Student Tutor Platform' },
  description:
    'A complete learning platform for students, tutors and admins: courses, quizzes, assignments, live classes, study materials, certificates and career tools. Everything runs in your browser with sample data.',
  openGraph: { title: 'Student Tutor Platform', description: 'Courses, quizzes, assignments, live classes and verifiable certificates in one place.', type: 'website' },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e4ece7' },
    { media: '(prefers-color-scheme: dark)', color: '#16231d' },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${text.variable} ${mono.variable}`}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
