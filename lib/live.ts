import { addMinutes, parseISO } from 'date-fns'
import type { MaterialKind } from './types'

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'class'

/** Jitsi room name for a new class: StudentTutor-<slug>-<uid>. `id` is the class id, whose prefix is dropped. */
export function roomName(title: string, id: string): string {
  const suffix = id.replace(/^[a-z]+-/, '').replace(/[^a-zA-Z0-9]/g, '')
  return `StudentTutor-${slugify(title)}-${suffix}`
}

export type ClassPhase = 'upcoming' | 'live' | 'ended'

export function classPhase(startsAt: string, durationMin: number, now: Date = new Date()): ClassPhase {
  const start = parseISO(startsAt)
  if (now < start) return 'upcoming'
  return now < addMinutes(start, durationMin) ? 'live' : 'ended'
}

export function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value.trim())
    return u.protocol === 'https:' && u.hostname.includes('.')
  } catch {
    return false
  }
}

export const KIND_LABEL: Record<MaterialKind, string> = {
  pdf: 'PDF',
  slides: 'Slides',
  notes: 'Notes',
  link: 'Web link',
  video: 'Video',
}

export const KINDS = Object.keys(KIND_LABEL) as MaterialKind[]

/** "2026-11-08" and "17:00" in local time to an ISO string; null when invalid. */
export function toIso(date: string, time: string): string | null {
  if (!date || !time) return null
  const d = new Date(`${date}T${time}`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

const pad = (n: number) => String(n).padStart(2, '0')
export const isoToDateInput = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
export const isoToTimeInput = (iso: string) => {
  const d = new Date(iso)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
