import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Restore scroll position on real route changes. Filter changes on /work are
// not route changes, so the grid keeps its position when toggling categories.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
