import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: '首页', end: true },
  { to: '/work', label: '作品', end: false },
  { to: '/about', label: '简介', end: false },
  { to: '/contact', label: '联系', end: false },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close the mobile menu whenever the viewport grows past the breakpoint.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 760px)')
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
          Remanina
        </Link>

        <nav className={`main-nav${menuOpen ? ' main-nav--open' : ''}`} aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="menu"
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="footer-mark">Remanina Holmson</span>
        <span className="footer-note">高原之上，光自己会说话。</span>
        <span className="footer-copy">© {new Date().getFullYear()} Remanina Holmson · 保留所有权利</span>
      </div>
    </footer>
  )
}
