import { apiRequest, publicPath } from '../api/client'
import { normalizeAgency } from '../adapters/agencyAdapter'

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])
const RESERVED_SUBDOMAINS = new Set(['www', 'api', 'crm', 'template', 'app'])

export function tenantTargetFromLocation(location = window.location) {
  const hostname = location.hostname.toLowerCase().replace(/\.$/, '')
  const queryTenant = new URLSearchParams(location.search).get('tenant')?.trim()
  if (LOCAL_HOSTS.has(hostname)) {
    const slug = queryTenant || import.meta.env.VITE_DEV_TENANT
    return slug ? { type: 'slug', value: slug, development: true } : null
  }

  const platformDomain = (import.meta.env.VITE_PLATFORM_DOMAIN || 'nexorarealtyos.com').toLowerCase()
  if (hostname.endsWith(`.${platformDomain}`)) {
    const subdomain = hostname.slice(0, -(platformDomain.length + 1))
    if (subdomain && !subdomain.includes('.') && !RESERVED_SUBDOMAINS.has(subdomain)) {
      return { type: 'slug', value: subdomain }
    }
  }
  return { type: 'domain', value: hostname }
}

export async function loadCurrentTenant() {
  const target = tenantTargetFromLocation()
  if (!target) {
    throw new Error('Choose a published development tenant with ?tenant=agency-slug or VITE_DEV_TENANT.')
  }
  const path = target.type === 'slug'
    ? publicPath(`/agencies/by-slug/${encodeURIComponent(target.value)}/`)
    : publicPath(`/agencies/by-domain/?${new URLSearchParams({ domain: target.value })}`)
  return { agency: normalizeAgency(await apiRequest(path)), target }
}
