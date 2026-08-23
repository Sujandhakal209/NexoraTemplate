import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTenant } from '../../context/TenantContext'
import Header from './Header'
import Footer from './Footer'
import { canonicalForAgency, setAgencySeo } from '../../utils/seo'

export default function SiteLayout() {
  const { agency, isPreview } = useTenant()
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  useEffect(() => {
    if (/^\/properties\/[^/]+/.test(location.pathname)) return
    const route = routeSeo(location.pathname, agency)
    setAgencySeo(agency, {
      ...route,
      canonical: canonicalForAgency(agency, location.pathname),
      noindex: isPreview,
    })
  }, [agency, isPreview, location.pathname])
  return <div className={`site-shell ${isPreview ? 'site-shell-preview' : ''}`}><Header agency={agency} /><Outlet /><Footer agency={agency} /></div>
}

function routeSeo(path, agency) {
  const name = agency.name
  if (path === '/properties') return { title: `Properties | ${name}`, description: `Browse current properties represented by ${name}.` }
  if (path === '/buy') return { title: `Property for sale | ${name}`, description: `Explore current property for sale from ${name}.` }
  if (path === '/rent') return { title: `Property for rent | ${name}`, description: `Explore current rental property from ${name}.` }
  if (path === '/agents') return { title: `Property agents | ${name}`, description: `Meet the property advisors at ${name}.` }
  if (/^\/agents\//.test(path)) return { title: `Property advisor | ${name}` }
  if (path === '/about') return { title: `About | ${name}`, description: agency.config.about || agency.config.seo_description }
  if (path === '/contact') return { title: `Contact | ${name}`, description: `Contact ${name} about buying, renting, or listing property.` }
  if (path === '/list-your-property') return { title: `List your property | ${name}`, description: `Request a property valuation or listing consultation from ${name}.` }
  if (path === '/privacy-policy') return { title: `Privacy Policy | ${name}`, description: `Learn how ${name} handles information submitted through its public property website.` }
  if (path === '/terms-of-service') return { title: `Terms of Service | ${name}`, description: `Read the terms that apply when using ${name}'s public property website.` }
  return {}
}
