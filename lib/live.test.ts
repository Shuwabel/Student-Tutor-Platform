import { describe, expect, it } from 'vitest'
import { classPhase, isHttpsUrl, roomName, toIso } from './live'

describe('live helpers', () => {
  it('builds a room name', () => {
    expect(roomName('Python office hours!', 'live-abc123def4')).toBe('StudentTutor-python-office-hours-abc123def4')
  })
  it('works out the phase', () => {
    const start = '2026-01-01T10:00:00.000Z'
    expect(classPhase(start, 60, new Date('2026-01-01T09:00:00.000Z'))).toBe('upcoming')
    expect(classPhase(start, 60, new Date('2026-01-01T10:30:00.000Z'))).toBe('live')
    expect(classPhase(start, 60, new Date('2026-01-01T11:30:00.000Z'))).toBe('ended')
  })
  it('accepts only https urls', () => {
    expect(isHttpsUrl('https://example.com/a.pdf')).toBe(true)
    expect(isHttpsUrl('http://example.com')).toBe(false)
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpsUrl('nonsense')).toBe(false)
  })
  it('rejects bad dates', () => {
    expect(toIso('', '10:00')).toBeNull()
    expect(toIso('2026-01-01', '10:00')).not.toBeNull()
  })
})
