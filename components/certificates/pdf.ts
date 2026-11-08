import { certificateCode } from '@/lib/certificate'
import { shortDate } from '@/lib/format'
import type { Certificate } from '@/lib/types'

/** Draws the certificate on an A4 landscape page with a double border and saves it. jspdf loads only when asked. */
export async function downloadCertificatePdf(cert: Certificate): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()

  doc.setDrawColor(150, 115, 30)
  doc.setLineWidth(1.2)
  doc.rect(8, 8, w - 16, h - 16)
  doc.setLineWidth(0.4)
  doc.rect(11, 11, w - 22, h - 22)

  doc.setTextColor(30, 40, 35)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.text('Certificate of completion', w / 2, 36, { align: 'center' })
  doc.setLineWidth(0.6)
  doc.line(40, 42, w - 40, 42)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.text('This certifies that', w / 2, 58, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(32)
  doc.text(doc.splitTextToSize(cert.studentName, w - 60), w / 2, 74, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(13)
  doc.text('has completed every lesson and passed every quiz in', w / 2, 90, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(21)
  doc.text(doc.splitTextToSize(cert.courseTitle, w - 60), w / 2, 104, { align: 'center' })

  const facts: [string, string][] = [
    ['Call number', cert.courseCode],
    ['Tutor', cert.tutorName],
    ['Hours', String(cert.hours)],
    ['Score', cert.score === undefined ? 'No quiz' : `${cert.score}%`],
    ['Issued', shortDate(cert.issuedAt)],
  ]
  const colW = (w - 50) / facts.length
  facts.forEach(([label, value], i) => {
    const x = 25 + colW * i + colW / 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(90, 100, 95)
    doc.text(label.toUpperCase(), x, 136, { align: 'center' })
    doc.setFont('courier', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(30, 40, 35)
    doc.text(doc.splitTextToSize(value, colW - 4), x, 143, { align: 'center' })
  })

  doc.setFont('courier', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(90, 100, 95)
  doc.text(`Certificate id ${cert.id}`, 18, h - 22)
  doc.text(`Check code ${certificateCode(cert)}`, 18, h - 17)

  doc.setDrawColor(150, 30, 40)
  doc.setTextColor(150, 30, 40)
  doc.setLineWidth(0.8)
  doc.setFont('courier', 'bold')
  doc.setFontSize(12)
  const stampText = `COMPLETED ${shortDate(cert.issuedAt).toUpperCase()}`
  const tw = doc.getTextWidth(stampText) + 8
  doc.rect(w - 18 - tw, h - 29, tw, 10)
  doc.text(stampText, w - 18 - tw / 2, h - 22.4, { align: 'center' })

  const safe = `${cert.courseCode}-${cert.studentName}`.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  doc.save(`certificate-${safe}.pdf`)
}
