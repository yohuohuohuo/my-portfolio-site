import Styles from './loadmore.module.scss'

export default function LoadMore({
  className,
  color,
}: {
  className?: string
  color?: string
}) {
  return (
    <div className={Styles.loader + ` ${className}`}>
      <svg className={Styles.circular} viewBox="25 25 50 50">
        <circle
          className={Styles.path}
          cx="50"
          cy="50"
          r="20"
          fill="none"
          strokeWidth="3"
          strokeMiterlimit="10"
          stroke={color ? color : 'var(--primary-color)'}
        />
      </svg>
    </div>
  )
}
