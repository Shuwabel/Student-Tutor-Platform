import type { Certificate } from './types'

/**
 * Certificates verify without a server: the certificate travels in the link,
 * together with a short check code. Anyone opening the link sees exactly what
 * the link carries, and a changed link fails the check. This shows integrity of
 * the link, not that an authority issued it, and the page says so.
 */

function checksum(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).toUpperCase().padStart(7, '0').slice(0, 7)
}

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(token: string): string {
  const padded = token.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(token.length / 4) * 4, '=')
  const bin = atob(padded)
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function certificateCode(cert: Certificate): string {
  return checksum([cert.id, cert.studentName, cert.courseCode, cert.courseTitle, cert.issuedAt, cert.hours, cert.score ?? ''].join('|'))
}

/** The part after /verify/ in the public link. */
export function encodeCertificate(cert: Certificate): string {
  return `${toBase64Url(JSON.stringify(cert))}.${certificateCode(cert)}`
}

export function decodeCertificate(token: string): { certificate: Certificate | null; valid: boolean } {
  try {
    const [body, code] = decodeURIComponent(token).split('.')
    const certificate = JSON.parse(fromBase64Url(body)) as Certificate
    if (!certificate || typeof certificate.id !== 'string' || typeof certificate.studentName !== 'string') return { certificate: null, valid: false }
    return { certificate, valid: certificateCode(certificate) === code }
  } catch {
    return { certificate: null, valid: false }
  }
}

export function verifyPath(cert: Certificate): string {
  return `/verify/${encodeCertificate(cert)}`
}
