import { useEffect, useRef } from 'react'

/** Returns the value from the previous render. Handy for animation diffing. */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}
