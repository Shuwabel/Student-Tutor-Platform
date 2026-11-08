export default function PageTitle({ title, intro, action }: { title: string; intro?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b-2 border-brass pb-3">
      <div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {intro && <p className="mt-1 max-w-prose text-muted-foreground">{intro}</p>}
      </div>
      {action}
    </div>
  )
}
