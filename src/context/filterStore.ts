import { useSyncExternalStore } from 'react'

// Module-level store: /work unmounts when the user opens a series page, so the
// active category must live outside the page component to be preserved on back.
let activeFilter = 'all'
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export const filterStore = {
  getSnapshot: () => activeFilter,
  setFilter(filter: string) {
    if (filter !== activeFilter) {
      activeFilter = filter
      emit()
    }
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}

export function usePhotoFilter(): [string, (filter: string) => void] {
  const filter = useSyncExternalStore(filterStore.subscribe, filterStore.getSnapshot)
  return [filter, filterStore.setFilter]
}
