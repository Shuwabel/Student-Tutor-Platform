import { cn } from '@/lib/utils'

/** A rubber stamp. `press` plays the one-time stamping animation (skipped for reduced motion). */
export default function Stamp({ children, press = false, className }: { children: React.ReactNode; press?: boolean; className?: string }) {
  return <span className={cn('stamp text-xs', press && 'stamp-press', className)}>{children}</span>
}
