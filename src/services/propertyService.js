import { apiRequest, publicPath } from '../api/client'
import { normalizeProperty } from '../adapters/propertyAdapter'
import { getAttribution, getVisitorId } from '../utils/format'

const supportedFilters = new Set([
  'property_type', 'purpose', 'location', 'price_min', 'price_max', 'bedrooms', 'bathrooms',
  'featured', 'search', 'province', 'district', 'city', 'municipality', 'ward_number',
  'land_use_classification', 'road_type', 'plot_shape', 'has_water_supply', 'has_electricity',
  'has_drainage', 'has_sewage', 'furnishing_status', 'facing_direction', 'land_area_min',
  'land_area_max', 'land_area_unit', 'road_access_min', 'ordering', 'min_lat', 'max_lat',
  'min_lng', 'max_lng', 'assigned_agent', 'ids', 'page', 'page_size',
])

function base(agency) {
  return publicPath(`/agencies/${encodeURIComponent(agency.license_number)}/properties`)
}

export async function getProperties(agency, filters = {}) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (supportedFilters.has(key) && value !== '' && value !== null && value !== undefined && value !== false) {
      params.set(key, String(value))
    }
  })
  const response = await apiRequest(`${base(agency)}/${params.size ? `?${params}` : ''}`)
  const list = Array.isArray(response) ? response : response.results || []
  return {
    count: Array.isArray(response) ? list.length : Number(response.count || 0),
    next: Array.isArray(response) ? null : response.next || null,
    previous: Array.isArray(response) ? null : response.previous || null,
    results: list.map((item) => normalizeProperty(item, agency.propertyPlaceholder)),
  }
}

export async function getPropertyOptions(agency) {
  return apiRequest(`${base(agency)}/filter-options/`)
}

export async function getProperty(agency, routeValue) {
  const match = String(routeValue).match(/^(\d+)(?:-|$)/)
  const response = match
    ? await apiRequest(`${base(agency)}/${match[1]}/`)
    : await apiRequest(publicPath(`/agencies/by-slug/${encodeURIComponent(agency.slug)}/listings/${encodeURIComponent(routeValue)}/`))
  return normalizeProperty(response, agency.propertyPlaceholder)
}

export async function getSimilarProperties(agency, propertyId) {
  const response = await apiRequest(`${base(agency)}/${propertyId}/similar/`)
  return (response.results || []).map((item) => normalizeProperty(item, agency.propertyPlaceholder))
}

export async function getPropertyRecommendations(agency, property, limit = 6) {
  const selected = []
  const seen = new Set([property.id])
  const add = (items = []) => {
    items.forEach((item) => {
      if (selected.length >= limit || seen.has(item.id)) return
      seen.add(item.id)
      selected.push(item)
    })
  }

  try {
    add(await getSimilarProperties(agency, property.id))
  } catch {
    // The recommendation endpoint is optional; public list filters provide a safe fallback.
  }

  const locationFilter = property.city
    ? { city: property.city }
    : property.municipality
      ? { municipality: property.municipality }
      : property.district
        ? { district: property.district }
        : {}
  const price = Number(property.priceValue)
  const fallbacks = [
    { purpose: property.purpose, property_type: property.propertyType, ...locationFilter, ordering: 'newest' },
    property.district ? { purpose: property.purpose, property_type: property.propertyType, district: property.district, ordering: 'newest' } : null,
    Number.isFinite(price) && price > 0 ? { purpose: property.purpose, price_min: Math.round(price * .8), price_max: Math.round(price * 1.2), ordering: 'newest' } : null,
    { purpose: property.purpose, ordering: 'newest' },
    { ordering: 'newest' },
  ].filter(Boolean)

  for (const filters of fallbacks) {
    if (selected.length >= limit) break
    try {
      add((await getProperties(agency, { ...filters, page_size: limit })).results)
    } catch {
      // Continue through progressively broader public fallbacks.
    }
  }
  return selected
}

export function submitPropertyInquiry(agency, propertyId, payload) {
  return apiRequest(`${base(agency)}/${propertyId}/inquire/`, { method: 'POST', body: { ...payload, ...getAttribution() } })
}

export function requestSiteVisit(agency, propertyId, payload) {
  return apiRequest(`${base(agency)}/${propertyId}/request-site-visit/`, { method: 'POST', body: { ...payload, ...getAttribution() } })
}

export function reportListing(agency, propertyId, payload) {
  return apiRequest(publicPath(`/agencies/${encodeURIComponent(agency.slug)}/submissions/`), {
    method: 'POST', body: { kind: 'listing_report', property: propertyId, source_page: window.location.pathname, ...payload },
  })
}

export function trackPropertyEvent(agency, propertyId, eventType, metadata = {}) {
  return apiRequest(`${base(agency)}/${propertyId}/events/`, {
    method: 'POST',
    body: { event_type: eventType, visitor_id: getVisitorId(), referrer: document.referrer || '', metadata, ...getAttribution() },
    timeout: 8000,
  })
}
