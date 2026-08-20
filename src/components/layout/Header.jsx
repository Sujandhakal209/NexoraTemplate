import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { isPageEnabled } from '../../adapters/agencyAdapter'

const baseNavigation = [
  ['properties', 'Properties', '/properties'], ['properties', 'Buy', '/buy'], ['properties', 'Rent', '/rent'],
  ['agents', 'Agents', '/agents'], ['about', 'About', '/about'], ['contact', 'Contact', '/contact'],
]

function configuredNavigation(agency) {
  const configured = agency.config.navigation || []
  if (!configured.length) return baseNavigation.filter(([page]) => isPageEnabled(agency, page))
  return configured
    .filter((item) => item.page !== 'portal' && isPageEnabled(agency, item.page))
    .map((item) => [item.page, item.label, item.url || `/${item.page === 'home' ? '' : item.page}`])
}

export default function Header({ agency }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  useEffect(() => setOpen(false), [location.pathname])
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 20)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  const navigation = configuredNavigation(agency)
  const primaryNavigation = navigation.filter(([, , url]) => ['/properties', '/buy', '/rent'].includes(url))
  const secondaryNavigation = navigation.filter(([, , url]) => !['/properties', '/buy', '/rent', '/'].includes(url))
  const canList = isPageEnabled(agency, 'valuation')
  return <header data-preview-section="header" className={`site-header ${scrolled ? 'site-header-scrolled' : ''}`}>
    <div className="container header-inner">
      <Link to="/" className="brand" aria-label={`${agency.name} home`}>
        {agency.logoDark ? <img src={agency.logoDark} alt={`${agency.name} logo`} /> : <span className="brand-mark">{agency.name.slice(0, 1)}</span>}
        <span>{agency.name}</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <span className="primary-nav">{primaryNavigation.map(([page, label, url], index) => <NavLink key={`${page}-${url}-${index}`} to={url}>{label}</NavLink>)}</span>
        <span className="secondary-nav">{secondaryNavigation.map(([page, label, url], index) => <NavLink key={`${page}-${url}-${index}`} to={url}>{label}</NavLink>)}</span>
      </nav>
      <div className="header-actions">
        {canList && <Link className="button button-outline header-cta" to="/list-your-property">List your property</Link>}
        <button className="menu-button" type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
      </div>
    </div>
    {open && <nav className="mobile-nav" aria-label="Mobile navigation">
      <div className="container">{navigation.map(([page, label, url], index) => <NavLink key={`${page}-${url}-${index}`} to={url} end={url === '/'}>{label}</NavLink>)}{canList && <Link className="button button-primary" to="/list-your-property">List your property</Link>}</div>
    </nav>}
  </header>
}
