export type WithBasicProps<T = unknown> = T & {
  className?: string
  style?: React.CSSProperties
}
