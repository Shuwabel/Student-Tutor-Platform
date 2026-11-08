import Link from 'next/link'
import { cn } from '@/lib/utils'

/**
 * A course as a library catalogue card: call number on the top rule, title,
 * subject headings, a punched rod hole at the foot. Pass `href` to make it a link.
 */
export default function CatalogCard({
  code,
  title,
  subject,
  meta,
  href,
  footer,
  children,
  className,
}: {
  code: string
  title: string
  subject?: string
  meta?: React.ReactNode
  href?: string
  footer?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  const body = (
    <>
      <div className="flex items-baseline justify-between gap-3 border-b-2 border-brass px-4 pb-1 pt-3">
        <span className="callno text-sm text-primary">{code}</span>
        {subject && <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{subject}</span>}
      </div>
      <div className="px-4 pb-10 pt-3">
        <h3 className="text-lg font-bold leading-snug">{title}</h3>
        {meta && <div className="mt-1 text-sm text-muted-foreground">{meta}</div>}
        {children && <div className="mt-3">{children}</div>}
        {footer && <div className="mt-3">{footer}</div>}
      </div>
    </>
  )
  const base = 'rodhole relative block overflow-hidden rounded-md border border-border bg-card shadow-[0_1px_0_var(--border)]'
  return href ? (
    <Link href={href} className={cn(base, 'transition-colors hover:border-primary focus-visible:outline-offset-4', className)}>
      {body}
    </Link>
  ) : (
    <div className={cn(base, className)}>{body}</div>
  )
}
