import { cn, type WithBasicProps } from '@/lib/utils'

type SettingsSectionProps = WithBasicProps<
  React.PropsWithChildren<{
    title: string
    description: string
  }>
>

export function SettingsSection({
  title,
  description,
  children,
  className,
  style,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        'grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-16 xl:gap-20',
        className,
      )}
      style={style}
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground text-sm/relaxed">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}
