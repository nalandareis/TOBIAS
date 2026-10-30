import { Heart, Home, MapPin, PawPrint, User } from 'lucide-react'
import { useEffect } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../lib/store'
import { Logo } from './Brand'

const NAV_ITEMS = [
  { to: '/inicio', label: 'Início', icon: Home },
  { to: '/locais', label: 'Locais', icon: MapPin },
  { to: '/cuidadores', label: 'Cuidadores', icon: PawPrint },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/perfil', label: 'Perfil', icon: User },
]

export function AppShell() {
  return (
    <div className="shell">
      <nav className="nav" aria-label="Principal">
        <Link to="/inicio" className="nav-logo">
          <Logo />
        </Link>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="nav-item">
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}

export function RequireAuth() {
  const { account } = useApp()
  return account ? <Outlet /> : <Navigate to="/bem-vindo" replace />
}

export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
