import { cn } from '@/lib/utils'

/** A plain labelled-by-caller select styled like Input; native for best phone behaviour. */
export default function NativeSelect({ className, ...props }: React.ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        'border-input dark:bg-input/30 h-11 w-full rounded-md border bg-transparent px-3 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm',
        className,
      )}
      {...props}
    />
  )
}
