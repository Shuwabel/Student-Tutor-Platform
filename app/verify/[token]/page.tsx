'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Brand from '@/components/shell/Brand'
import CertificateSheet from '@/components/certificates/CertificateSheet'
import { Button } from '@/components/ui/button'
import { decodeCertificate } from '@/lib/certificate'
import type { Certificate } from '@/lib/types'

type Result = { status: 'checking' } | { status: 'valid'; cert: Certificate } | { status: 'invalid' }

export default function VerifyPage() {
  const { token } = useParams<{ token: string }>()
  const [result, setResult] = useState<Result>({ status: 'checking' })

  useEffect(() => {
    const { certificate, valid } = decodeCertificate(token ?? '')
    setResult(valid && certificate ? { status: 'valid', cert: certificate } : { status: 'invalid' })
  }, [token])

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print border-b border-border bg-stock">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex min-h-11 items-center" aria-label="Student Tutor Platform home">
            <Brand />
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary hover:underline">
            Back to the home page
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-4 py-6 md:py-10">
        <div aria-live="polite">
          {result.status === 'checking' && <p className="text-muted-foreground">Checking the link</p>}

          {result.status === 'valid' && (
            <>
              <h1 className="sr-only">Certificate check: the link matches</h1>
              <CertificateSheet cert={result.cert} />
              <p className="mt-4 max-w-prose text-sm text-muted-foreground">
                This link carries the certificate details and a matching check code. Student Tutor Platform is a demo, so this confirms the link was not altered, not that a real institution issued it.
              </p>
            </>
          )}

          {result.status === 'invalid' && (
            <section className="mx-auto max-w-xl rounded-md border border-border bg-card p-6">
              <h1 className="text-2xl font-bold">This link does not match</h1>
              <p className="mt-2 text-muted-foreground">
                The link is incomplete or has been changed, so it cannot be confirmed. Ask the certificate holder to copy the verify link again from their certificate page.
              </p>
              <Button asChild className="mt-4 h-11">
                <Link href="/">Go to the home page</Link>
              </Button>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
