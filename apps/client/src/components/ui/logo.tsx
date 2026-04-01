type LogoProps = Omit<React.ComponentProps<'svg'>, 'viewBox' | 'fill'>

export function Logo(props: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="8" y="18" width="84" height="14" rx="2" fill="currentColor" />
      <rect x="8" y="42" width="64" height="14" rx="2" fill="currentColor" />
      <rect x="8" y="66" width="74" height="14" rx="2" fill="currentColor" />
      <rect x="24" y="32" width="8" height="10" rx="1" fill="currentColor" />
      <rect x="24" y="56" width="8" height="10" rx="1" fill="currentColor" />
    </svg>
  )
}
