import { differenceInCalendarDays, format, formatDistanceToNowStrict, isPast, parseISO } from 'date-fns'

export const shortDate = (iso: string) => format(parseISO(iso), 'd MMM yyyy')
export const dayDate = (iso: string) => format(parseISO(iso), 'EEE d MMM')
export const dayTime = (iso: string) => format(parseISO(iso), 'EEE d MMM, HH:mm')
export const timeOnly = (iso: string) => format(parseISO(iso), 'HH:mm')

/** "due in 3 days", "due today", "2 days overdue". */
export function dueLabel(iso: string, now: Date = new Date()): { text: string; overdue: boolean; soon: boolean } {
  const days = differenceInCalendarDays(parseISO(iso), now)
  if (days < 0) return { text: `${-days} day${days === -1 ? '' : 's'} overdue`, overdue: true, soon: false }
  if (days === 0) return { text: 'due today', overdue: false, soon: true }
  if (days === 1) return { text: 'due tomorrow', overdue: false, soon: true }
  return { text: `due in ${days} days`, overdue: false, soon: days <= 3 }
}

export const startsIn = (iso: string) => (isPast(parseISO(iso)) ? 'started' : `in ${formatDistanceToNowStrict(parseISO(iso))}`)

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
