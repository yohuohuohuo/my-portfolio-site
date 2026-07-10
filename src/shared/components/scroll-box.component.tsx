import { debounce } from 'lodash'
import {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { debounceTime, fromEvent } from 'rxjs'
import { ScrollCallbackData } from '../hooks'

interface ScrollBoxType
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  scrollSelector?: string
  scrollOnWindow?: boolean
  onReachBottom?: () => void
  distance?: number
}

const ScrollBoxComponent: ForwardRefRenderFunction<any, ScrollBoxType> = (
  { scrollSelector, scrollOnWindow, distance, onReachBottom, ...props },
  ref
) => {
  const [element, setElement] = useState<any>()
  const rootRef = useRef<HTMLDivElement>(null)
  const lastDistance = useRef<number>(0)
  const lastScrollTop = useRef(0)
  const subscription$ = useRef<any>(null)

  useEffect(() => {
    if (!onReachBottom) {
      setElement(null)
      return
    }

    let current = null
    if (scrollOnWindow) {
      current = window
    } else if (scrollSelector) {
      current = document.querySelector(scrollSelector)
    } else {
      current = rootRef.current
    }

    setElement(current)
  }, [scrollSelector, scrollOnWindow, onReachBottom])

  const handleCallback = useCallback(
    debounce((distance: number) => {
      onReachBottom && onReachBottom()
    }, 300),
    [onReachBottom]
  )

  const scrollCallback = useCallback(
    (e: ScrollCallbackData) => {
      const calledDistance = distance || 200
      const currentDistance = e.scrollHeight - e.scrollTop - e.clientHeight

      if (
        currentDistance <= calledDistance &&
        currentDistance < lastDistance.current &&
        e.direction === 'down'
      ) {
        handleCallback(e.scrollTop)
      }

      lastDistance.current = currentDistance
    },
    [distance, handleCallback]
  )

  useEffect(() => {
    if (!element) return

    const observable = fromEvent(element as any, 'scroll')
    observable.pipe(debounceTime(100))

    subscription$.current = observable.subscribe((e: any) => {
      let currentTarget =
        element !== window
          ? e.target
          : document.documentElement || document.body

      let scrollHeight = currentTarget.scrollHeight
      let clientHeight = currentTarget.clientHeight
      let scrollTop = currentTarget.scrollTop

      if (element === window && !scrollTop) {
        scrollTop = window.scrollY
      }

      const scrollDirection = scrollTop > lastScrollTop.current ? 'down' : 'up'
      lastScrollTop.current = scrollTop

      scrollCallback({
        element: currentTarget,
        scrollHeight,
        scrollTop,
        clientHeight,
        direction: scrollDirection,
      })
    })

    return () => {
      subscription$.current?.unsubscribe()
      subscription$.current = null
    }
  }, [element, scrollCallback])

  return <div ref={rootRef} {...props} />
}

const ScrollBox = forwardRef(ScrollBoxComponent)
export default ScrollBox
