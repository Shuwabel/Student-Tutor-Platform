import { cn } from '@/lib/utils'

/** Progress drawn as a ruled line with a brass marker, plus a text equivalent. */
export default function ProgressRule({ percent, label, className }: { percent: number; label?: string; className?: string }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  return (
    <div className={className}>
      <div className="relative h-2 rounded-full bg-muted" role="img" aria-label={label ?? `${p} percent complete`}>
        <div className={cn('h-2 rounded-full', p === 100 ? 'bg-stamp' : 'bg-primary')} style={{ width: `${p}%` }} />
      </div>
      <p className="callno mt-1 text-xs text-muted-foreground">{p}% {label ? '' : 'complete'}</p>
    </div>
  )
}
