import { WithBasicProps } from '@/lib/types'
import { cn } from '@/lib/utils'

type SpinnerProps = WithBasicProps & {
  stop?: boolean
}

const NUM_AXIS = 9
const ANGLE = 360 / NUM_AXIS

export function Spinner({ stop = false, className, style }: SpinnerProps) {
  return (
    <div className={cn('text-muted-foreground relative h-4 w-4', className)} style={style}>
      {Array.from({ length: NUM_AXIS }, (_, i) => i).map((i) => (
        <div
          key={i}
          className={cn(
            'absolute top-[20%] left-1/2 h-[30%] w-[10%] origin-bottom transform rounded bg-current',
            !stop ? 'animate-fade' : undefined,
          )}
          style={{
            transform: `translateX(-50%) rotate(${i * ANGLE}deg) translateY(-80%)`,
            animationDelay: `${((i * 1) / NUM_AXIS).toFixed(1)}s`,
          }}
        />
      ))}
    </div>
  )
}
