/** The wordmark: a catalogue card with a rod hole, then the name. */
export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden="true">
        <rect x="3" y="5" width="22" height="18" rx="2" fill="currentColor" className="text-primary" />
        <line x1="7" y1="10" x2="21" y2="10" stroke="var(--stock)" strokeWidth="1.4" />
        <line x1="7" y1="14" x2="17" y2="14" stroke="var(--stock)" strokeWidth="1.4" />
        <circle cx="14" cy="20" r="1.5" fill="var(--brass)" />
      </svg>
      <span className={light ? 'text-base font-bold leading-tight text-white' : 'text-base font-bold leading-tight'}>
        Student Tutor
        <span className="callno block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">Platform</span>
      </span>
    </span>
  )
}
