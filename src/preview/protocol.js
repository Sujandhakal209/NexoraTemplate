export const PREVIEW_MESSAGES = Object.freeze({
  READY: 'NEXORA_PREVIEW_READY',
  CONFIG: 'NEXORA_PREVIEW_CONFIG',
  SCROLL_TO: 'NEXORA_PREVIEW_SCROLL_TO',
  SECTION_CLICK: 'NEXORA_PREVIEW_SECTION_CLICK',
})

const DEFAULT_PARENT_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173'

export function isPreviewMode(location = window.location) {
  return new URLSearchParams(location.search).get('preview') === '1'
}

export function allowedParentOrigins() {
  return new Set(
    (import.meta.env.VITE_PREVIEW_ALLOWED_ORIGINS || DEFAULT_PARENT_ORIGINS)
      .split(',')
      .map((value) => value.trim().replace(/\/$/, ''))
      .filter(Boolean),
  )
}

export function previewParentOrigin(allowed) {
  try {
    const origin = new URL(document.referrer).origin
    if (allowed.has(origin)) return origin
  } catch {
    // A missing referrer is normal in a manually opened preview tab.
  }
  return [...allowed][0] || null
}

export function sanitizePreviewAgency(payload) {
  const agency = payload?.agency
  if (!agency || typeof agency !== 'object' || Array.isArray(agency)) return null
  if (!agency.website_config || typeof agency.website_config !== 'object' || Array.isArray(agency.website_config)) return null

  const text = (value) => typeof value === 'string' ? value : ''
  return {
    id: Number.isFinite(Number(agency.id)) ? Number(agency.id) : 0,
    name: text(agency.name) || 'Your agency',
    slug: text(agency.slug) || 'website-preview',
    license_number: text(agency.license_number),
    website_config: agency.website_config,
    logo: text(agency.logo),
    cover_image: text(agency.cover_image),
    email: text(agency.email),
    phone: text(agency.phone),
    address: text(agency.address),
    business_hours: text(agency.business_hours),
    primary_color: text(agency.primary_color),
    facebook_url: text(agency.facebook_url),
    instagram_url: text(agency.instagram_url),
    linkedin_url: text(agency.linkedin_url),
    youtube_url: text(agency.youtube_url),
    tiktok_url: text(agency.tiktok_url),
    whatsapp_number: text(agency.whatsapp_number),
    viber_number: text(agency.viber_number),
    is_website_published: false,
  }
}
