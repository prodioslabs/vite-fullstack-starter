import { cn } from '../../lib/utils'

type SpinnerProps = {
  className?: string
  style?: React.CSSProperties
}

const NUM_AXIS = 9
const ANGLE = 360 / NUM_AXIS

export function Spinner({ className, style }: SpinnerProps) {
  return (
    <div className={cn('relative h-4 w-4 text-muted-foreground', className)} style={style}>
      {Array.from({ length: NUM_AXIS }, (_, i) => i).map((i) => (
        <div
          key={i}
          className="absolute left-1/2 top-[20%] h-[30%] w-[10%] origin-bottom transform animate-fade rounded bg-current"
          style={{
            transform: `translateX(-50%) rotate(${i * ANGLE}deg) translateY(-80%)`,
            animationDelay: `${((i * 1) / NUM_AXIS).toFixed(1)}s`,
          }}
        />
      ))}
    </div>
  )
}
