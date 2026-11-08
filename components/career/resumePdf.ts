import type { Resume } from '@/lib/types'

/** Builds and downloads a one-column A4 PDF. jspdf is loaded only when called. */
export async function downloadResumePdf(r: Resume): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 48
  const maxW = W - M * 2
  let y = M

  const ensure = (need: number) => {
    if (y + need > H - M) {
      doc.addPage()
      y = M
    }
  }
  const para = (text: string, size: number, opts: { bold?: boolean; indent?: number; gap?: number; muted?: boolean } = {}) => {
    if (!text.trim()) return
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(opts.muted ? 90 : 20)
    const indent = opts.indent ?? 0
    const lines = doc.splitTextToSize(text, maxW - indent) as string[]
    const lh = size * 1.35
    for (const line of lines) {
      ensure(lh)
      doc.text(line, M + indent, y + size)
      y += lh
    }
    y += opts.gap ?? 0
  }
  const heading = (text: string) => {
    ensure(40)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(20)
    doc.text(text.toUpperCase(), M, y + 11)
    y += 16
    doc.setDrawColor(120)
    doc.setLineWidth(0.6)
    doc.line(M, y, W - M, y)
    y += 6
  }

  para(r.fullName || 'Your name', 22, { bold: true })
  if (r.headline) para(r.headline, 12, { muted: true })
  para([r.email, r.phone, r.location].filter(Boolean).join('  |  '), 10, { muted: true, gap: 4 })

  if (r.summary.trim()) {
    heading('Summary')
    para(r.summary, 10.5, { gap: 2 })
  }
  if (r.skills.length) {
    heading('Skills')
    para(r.skills.join(', '), 10.5, { gap: 2 })
  }
  if (r.experience.some((e) => e.role || e.org)) {
    heading('Experience')
    for (const e of r.experience.filter((x) => x.role || x.org)) {
      ensure(40)
      para([e.role, e.org].filter(Boolean).join(', '), 11, { bold: true })
      if (e.years) para(e.years, 9.5, { muted: true })
      for (const b of e.bullets.filter((x) => x.trim())) para(`- ${b.trim()}`, 10.5, { indent: 10 })
      y += 6
    }
  }
  if (r.education.some((e) => e.school || e.degree)) {
    heading('Education')
    for (const e of r.education.filter((x) => x.school || x.degree)) {
      ensure(32)
      para([e.degree, e.school].filter(Boolean).join(', '), 11, { bold: true })
      if (e.years) para(e.years, 9.5, { muted: true })
      y += 6
    }
  }

  const name = (r.fullName || 'resume').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resume'
  doc.save(`${name}-resume.pdf`)
}
