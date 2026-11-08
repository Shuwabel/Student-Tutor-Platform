export default function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-card p-6">
      <p className="text-lg font-bold">{title}</p>
      {children && <p className="mt-1 max-w-prose text-muted-foreground">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
