'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Copy, Download, Printer } from 'lucide-react'
import { toast } from 'sonner'
import AppShell from '@/components/shell/AppShell'
import EmptyState from '@/components/catalog/EmptyState'
import CertificateSheet from '@/components/certificates/CertificateSheet'
import { downloadCertificatePdf } from '@/components/certificates/pdf'
import { Button } from '@/components/ui/button'
import { verifyPath } from '@/lib/certificate'
import { useCurrentUser, useStore } from '@/lib/store'

function Content() {
  const { id } = useParams<{ id: string }>()
  const user = useCurrentUser()!
  const certificates = useStore((s) => s.certificates)
  const courses = useStore((s) => s.courses)
  const [busy, setBusy] = useState(false)

  const cert = certificates.find((c) => c.id === id)
  const course = courses.find((c) => c.id === cert?.courseId)
  const allowed = !!cert && (cert.userId === user.id || user.role === 'admin' || (user.role === 'tutor' && course?.tutorId === user.id))

  if (!cert || !allowed) {
    return (
      <EmptyState
        title={cert ? 'You cannot open this certificate' : 'No certificate with that id'}
        action={
          <Button asChild className="h-11">
            <Link href={user.role === 'student' ? '/certificates' : '/dashboard'}>{user.role === 'student' ? 'Back to my certificates' : 'Go to your home'}</Link>
          </Button>
        }
      >
        {cert ? 'Certificates can be opened by their owner, the tutor of the course and admins.' : 'It may have been removed, or the link may be wrong.'}
      </EmptyState>
    )
  }

  const copy = async () => {
    const link = window.location.origin + verifyPath(cert)
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Verify link copied. Anyone with it can check this certificate.')
    } catch {
      toast.error('Could not copy automatically. Open the verify page from the link below and copy it from the address bar.')
    }
  }

  const pdf = async () => {
    setBusy(true)
    try {
      await downloadCertificatePdf(cert)
      toast.success('PDF saved to your downloads.')
    } catch {
      toast.error('The PDF could not be made. Try Print and choose Save as PDF.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={user.role === 'student' ? '/certificates' : '/dashboard'} className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {user.role === 'student' ? 'My certificates' : 'Back'}
        </Link>
        <div className="flex flex-wrap gap-2">
          <Button className="h-11" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
          <Button variant="outline" className="h-11" onClick={pdf} disabled={busy}>
            <Download /> {busy ? 'Making PDF' : 'Download PDF'}
          </Button>
          <Button variant="outline" className="h-11" onClick={copy}>
            <Copy /> Copy verify link
          </Button>
        </div>
      </div>

      <CertificateSheet cert={cert} />

      <p className="no-print mt-4 max-w-prose text-sm text-muted-foreground">
        The verify link carries these details and a matching check code. Student Tutor Platform is a demo, so the link shows the details were not altered, not that a real institution issued them.{' '}
        <Link href={verifyPath(cert)} className="font-semibold text-primary underline">
          Preview the public check page
        </Link>
      </p>
    </>
  )
}

export default function CertificatePage() {
  return (
    <AppShell>
      <Content />
    </AppShell>
  )
}
