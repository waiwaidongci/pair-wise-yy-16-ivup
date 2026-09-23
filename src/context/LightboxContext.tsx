import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Photo } from '../data/photos'

interface LightboxState {
  /** The exact list the lightbox may navigate within — e.g. the filtered grid. */
  list: Photo[]
  index: number
}

interface LightboxContextValue {
  state: LightboxState | null
  /** Open the shared lightbox. `list` defines the prev/next navigation scope. */
  open: (list: Photo[], index: number) => void
  close: () => void
  show: (index: number) => void
}

const LightboxContext = createContext<LightboxContextValue | null>(null)

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LightboxState | null>(null)

  const open = useCallback((list: Photo[], index: number) => {
    if (list.length === 0) return
    setState({ list, index: Math.min(Math.max(index, 0), list.length - 1) })
  }, [])

  const close = useCallback(() => setState(null), [])

  const show = useCallback((index: number) => {
    setState((prev) =>
      prev === null
        ? prev
        : { ...prev, index: ((index % prev.list.length) + prev.list.length) % prev.list.length },
    )
  }, [])

  const value = useMemo(
    () => ({ state, open, close, show }),
    [state, open, close, show],
  )

  return <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>
}

export function useLightbox(): LightboxContextValue {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox must be used within <LightboxProvider>')
  return ctx
}
