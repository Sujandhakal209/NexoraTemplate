import { absoluteMediaUrl, formatArea, formatPrice, titleCase } from '../utils/format'

function normalizeMedia(raw = []) {
  return raw.map((item) => {
    const original = item.original || { url: item.file || item.external_url, width: null, height: null }
    const card = item.card || original
    const large = item.large || original
    const srcSet = [
      card?.url && card.width ? `${absoluteMediaUrl(card.url)} ${card.width}w` : '',
      large?.url && large.width ? `${absoluteMediaUrl(large.url)} ${large.width}w` : '',
      original?.url && original.width ? `${absoluteMediaUrl(original.url)} ${original.width}w` : '',
    ].filter(Boolean).join(', ')
    return {
      ...item,
      url: absoluteMediaUrl(large?.url || original?.url || item.thumbnail),
      originalUrl: absoluteMediaUrl(original?.url || large?.url),
      thumbnailUrl: absoluteMediaUrl(card?.url || item.thumbnail || original?.url),
      posterUrl: absoluteMediaUrl(item.thumbnail),
      width: large?.width || original?.width,
      height: large?.height || original?.height,
      srcSet,
      card,
      large,
      original,
    }
  }).filter((item) => item.url)
}

export function normalizeProperty(raw, placeholder = '') {
  const media = normalizeMedia(raw.media)
  const images = media.filter((item) => item.media_type === 'image')
  const videos = media.filter((item) => ['video', 'reel'].includes(item.media_type))
  const primary = images.find((item) => item.is_primary) || images[0]
  const cardImage = absoluteMediaUrl(raw.primary_image?.url)
  const compactArea = raw.area || null
  const property = {
    ...raw,
    id: raw.id,
    title: raw.title || 'Untitled property',
    canonicalUrl: raw.canonical_url || '',
    propertyType: raw.property_type,
    propertyTypeLabel: titleCase(raw.property_type),
    purpose: raw.purpose,
    purposeLabel: raw.purpose === 'rent' ? 'For Rent' : raw.purpose === 'lease' ? 'For Lease' : 'For Sale',
    priceValue: Number(raw.price),
    priceLabel: `${formatPrice(raw.price, raw.currency)}${raw.rent_period && ['rent', 'lease'].includes(raw.purpose) ? ` / ${raw.rent_period}` : ''}`,
    location: raw.location_display || [raw.tole, raw.municipality || raw.city, raw.district].filter(Boolean).join(', '),
    summary: raw.short_description || '',
    media,
    images,
    videos,
    image: primary?.url || cardImage || absoluteMediaUrl(placeholder),
    imageWidth: primary?.width || raw.primary_image?.width || null,
    imageHeight: primary?.height || raw.primary_image?.height || null,
    imageSrcSet: primary?.srcSet || '',
    beds: raw.bedrooms,
    baths: raw.bathrooms,
    floors: raw.floors,
    builtUpAreaValue: raw.built_up_area_value ?? (compactArea?.kind === 'built_up' ? compactArea.value : null),
    builtUpAreaUnit: raw.built_up_area_unit || (compactArea?.kind === 'built_up' ? compactArea.unit : ''),
    landAreaValue: raw.land_area_value ?? (compactArea?.kind === 'land' ? compactArea.value : null),
    landAreaUnit: raw.land_area_unit || (compactArea?.kind === 'land' ? compactArea.unit : ''),
    featured: Boolean(raw.is_featured),
    agent: raw.assigned_agent_detail ? normalizeAssignedAgent(raw.assigned_agent_detail) : raw.assigned_agent ? normalizeAssignedAgent(raw.assigned_agent) : null,
    verification: raw.verification_summary || raw.verification || {},
    availability: raw.availability_status_display || titleCase(raw.status),
    freshness: raw.freshness_state,
  }
  property.areaLabel = formatArea(property)
  return property
}

function normalizeAssignedAgent(raw) {
  return {
    id: raw.id,
    name: raw.full_name || raw.name,
    email: raw.email || '',
    phone: raw.phone || '',
    designation: raw.designation || 'Property advisor',
    bio: raw.bio || '',
    image: absoluteMediaUrl(raw.profile_image),
  }
}

export function propertyIdFromRoute(value = '') {
  const match = String(value).match(/^(\d+)(?:-|$)/)
  return match ? match[1] : null
}
