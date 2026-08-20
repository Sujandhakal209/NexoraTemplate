const defaultSections = [
  'hero', 'statistics', 'featured_properties', 'property_categories', 'services',
  'about', 'mission', 'vision', 'agents', 'testimonials', 'faqs', 'newsletter',
  'contact_cta', 'social_links',
]

const fontStacks = {
  inter: 'Inter, ui-sans-serif, system-ui, sans-serif',
  manrope: 'Manrope, ui-sans-serif, system-ui, sans-serif',
  poppins: 'Poppins, ui-sans-serif, system-ui, sans-serif',
  lato: 'Lato, ui-sans-serif, system-ui, sans-serif',
  montserrat: 'Montserrat, ui-sans-serif, system-ui, sans-serif',
  'playfair-display': '"Playfair Display", Georgia, serif',
  'noto-sans-devanagari': '"Noto Sans Devanagari", ui-sans-serif, sans-serif',
}

export function normalizeAgency(raw) {
  const config = raw.website_config || {}
  const media = config.media || {}
  return {
    ...raw,
    config,
    media,
    name: raw.name || 'Real estate agency',
    canonicalBaseUrl: raw.canonical_base_url || '',
    logo: media.logo || raw.logo || '',
    logoLight: media.logo_light || media.logo || raw.logo || '',
    logoDark: media.logo_dark || media.logo || raw.logo || '',
    heroImage: media.hero_image || raw.cover_image || '',
    aboutImage: media.about_image || '',
    propertyPlaceholder: media.property_placeholder || '',
    contact: {
      email: config.public_email || raw.email || '',
      phone: config.public_phone || raw.phone || '',
      whatsapp: config.whatsapp_number || raw.whatsapp_number || '',
      viber: config.viber_number || raw.viber_number || '',
      address: config.address || raw.address || '',
      serviceArea: config.service_area || '',
      hours: config.business_hours || raw.business_hours || '',
      latitude: config.map_latitude,
      longitude: config.map_longitude,
    },
    social: {
      facebook: config.facebook_url || raw.facebook_url || '',
      instagram: config.instagram_url || raw.instagram_url || '',
      linkedin: config.linkedin_url || raw.linkedin_url || '',
      youtube: config.youtube_url || raw.youtube_url || '',
      tiktok: config.tiktok_url || raw.tiktok_url || '',
    },
    theme: {
      primary: config.primary_color || raw.primary_color || '#173c35',
      secondary: config.secondary_color || '#8faf9b',
      accent: config.accent_color || '#c8a96a',
      headingFontKey: config.heading_font || 'playfair-display',
      bodyFontKey: config.body_font || 'inter',
      headingFont: fontStacks[config.heading_font] || fontStacks['playfair-display'],
      bodyFont: fontStacks[config.body_font] || fontStacks.inter,
    },
    enabledPages: config.enabled_pages || {},
    sectionVisibility: config.section_visibility || {},
    sectionOrder: Array.isArray(config.section_order) && config.section_order.length
      ? config.section_order
      : defaultSections,
  }
}

export function isPageEnabled(agency, page) {
  return agency?.enabledPages?.[page] !== false
}
