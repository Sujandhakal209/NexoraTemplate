import { API_BASE_URL } from '../api/client'

export function absoluteMediaUrl(value) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const origin = new URL(API_BASE_URL, window.location.origin).origin
  return new URL(value.startsWith('/') ? value : `/${value}`, origin).href
}

export function titleCase(value = '') {
  return String(value).split('_').filter(Boolean).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ')
}

export function formatPrice(value, currency = 'NPR', compact = true) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return [currency, value].filter(Boolean).join(' ')
  if (currency === 'NPR' && compact) {
    if (amount >= 10_000_000) return `NPR ${(amount / 10_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Cr`
    if (amount >= 100_000) return `NPR ${(amount / 100_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} Lakh`
  }
  return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function formatNumber(value, maximumFractionDigits = 2) {
  const number = Number(value)
  if (!Number.isFinite(number)) return String(value || '')
  return number.toLocaleString(undefined, { maximumFractionDigits })
}

export function formatAreaUnit(unit = '') {
  const units = {
    sqft: 'sq ft',
    sqm: 'm²',
    aana: 'Aana',
    ropani: 'Ropani',
    paisa: 'Paisa',
    daam: 'Daam',
    kattha: 'Kattha',
    dhur: 'Dhur',
    bigha: 'Bigha',
  }
  return units[String(unit).toLowerCase()] || titleCase(unit)
}

export function formatMeasurement(value, unit) {
  if (value === null || value === undefined || value === '') return ''
  return [formatNumber(value), formatAreaUnit(unit)].filter(Boolean).join(' ')
}

export function formatArea(property) {
  const preferLand = property.propertyType === 'land'
  if (preferLand && property.landAreaValue && property.landAreaUnit) return formatMeasurement(property.landAreaValue, property.landAreaUnit)
  if (property.builtUpAreaValue && property.builtUpAreaUnit) return formatMeasurement(property.builtUpAreaValue, property.builtUpAreaUnit)
  if (property.landAreaValue && property.landAreaUnit) return formatMeasurement(property.landAreaValue, property.landAreaUnit)
  return ''
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date)
}

export function formatRelativeDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000))
  if (days === 0) return 'Added today'
  if (days === 1) return 'Added yesterday'
  if (days < 14) return `Added ${days} days ago`
  return ''
}

export function propertyRoute(property) {
  const slug = String(property.title || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `/properties/${property.id}-${slug}`
}

export function agentRoute(agent) {
  const slug = String(agent.name || 'agent').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `/agents/${agent.id}-${slug}`
}

export function phoneHref(phone = '') {
  const cleaned = String(phone).replace(/[^+\d]/g, '')
  return cleaned ? `tel:${cleaned}` : ''
}

export function whatsappHref(phone = '', message = '') {
  const cleaned = String(phone).replace(/\D/g, '')
  return cleaned ? `https://wa.me/${cleaned}${message ? `?text=${encodeURIComponent(message)}` : ''}` : ''
}

export function viberHref(phone = '') {
  const cleaned = String(phone).replace(/[^+\d]/g, '')
  return cleaned ? `viber://chat?number=${encodeURIComponent(cleaned)}` : ''
}

export function getAttribution() {
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    distribution_code: params.get('nexora_link') || '',
  }
}

export function getVisitorId() {
  const key = 'nexora_public_visitor_id'
  let value = localStorage.getItem(key)
  if (!value) {
    value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
    localStorage.setItem(key, value)
  }
  return value
}
