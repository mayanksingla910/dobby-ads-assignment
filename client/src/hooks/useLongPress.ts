import { useRef, useCallback } from "react"

export function useLongPress(onLongPress: () => void, delay = 500) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLongPress = useRef(false)

  const start = useCallback(
    (e: React.TouchEvent) => {
      didLongPress.current = false
      timer.current = setTimeout(() => {
        didLongPress.current = true
        onLongPress()
      }, delay)
    },
    [onLongPress, delay]
  )

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    didLongPress,
  }
}
