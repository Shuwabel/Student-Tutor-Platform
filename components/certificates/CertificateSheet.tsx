import Stamp from '@/components/catalog/Stamp'
import { certificateCode } from '@/lib/certificate'
import { shortDate } from '@/lib/format'
import type { Certificate } from '@/lib/types'

/** The certificate as a library-card style sheet. Used on the owner page and the public check page. */
export default function CertificateSheet({ cert, press = false }: { cert: Certificate; press?: boolean }) {
  const facts: { label: string; value: string }[] = [
    { label: 'Call number', value: cert.courseCode },
    { label: 'Tutor', value: cert.tutorName },
    { label: 'Hours', value: String(cert.hours) },
    { label: 'Score', value: cert.score === undefined ? 'No quiz' : `${cert.score}%` },
    { label: 'Issued', value: shortDate(cert.issuedAt) },
  ]
  return (
    <>
      <style>{'@media print { @page { size: A4 landscape; margin: 10mm } }'}</style>
      <section
        aria-label={`Certificate for ${cert.studentName}, ${cert.courseTitle}`}
        className="rounded-md border-4 border-double border-brass bg-card p-5 text-card-foreground md:p-10 print:border-black print:bg-white print:text-black"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-brass pb-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Certificate of completion</h1>
          <span className="callno text-sm text-primary">{cert.courseCode}</span>
        </div>

        <div className="py-8 md:py-12">
          <p className="text-muted-foreground">This certifies that</p>
          <p className="mt-1 break-words text-3xl font-bold md:text-5xl">{cert.studentName}</p>
          <p className="mt-6 text-muted-foreground">has completed every lesson and passed every quiz in</p>
          <p className="mt-1 break-words text-xl font-bold md:text-3xl">{cert.courseTitle}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-4 md:grid-cols-5">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</dt>
              <dd className="callno mt-0.5 break-words text-base">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div className="callno text-xs text-muted-foreground">
            <div>Certificate id {cert.id}</div>
            <div>Check code {certificateCode(cert)}</div>
          </div>
          <Stamp press={press} className="px-3 py-1 text-sm">
            Completed {shortDate(cert.issuedAt)}
          </Stamp>
        </div>
      </section>
    </>
  )
}
