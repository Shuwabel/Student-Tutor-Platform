'use client'

import { useEffect, useState } from 'react'

/** The current time, refreshed every `ms` so countdown text stays honest. */
export function useNow(ms = 30000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}
