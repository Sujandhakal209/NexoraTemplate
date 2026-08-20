import { absoluteMediaUrl } from '../utils/format'

function list(value) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean)
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean)
}

export function normalizeAgent(raw) {
  return {
    ...raw,
    id: raw.id,
    name: raw.full_name,
    phone: raw.phone || '',
    email: raw.email || '',
    image: absoluteMediaUrl(raw.profile_image_url || raw.profile_image),
    designation: raw.designation || 'Property advisor',
    location: raw.location || '',
    experience: raw.years_experience || 0,
    languagesList: list(raw.languages),
    specialtiesList: list(raw.specialties),
    bio: raw.bio || '',
    dealsClosed: raw.deals_closed || 0,
    listingIds: raw.current_listing_ids || [],
    rating: Number(raw.rating || 0),
    reviews: raw.reviews || [],
    social: {
      linkedin: raw.linkedin_url || '', instagram: raw.instagram_url || '', facebook: raw.facebook_url || '',
    },
  }
}

export function agentIdFromRoute(value = '') {
  const match = String(value).match(/^(\d+)(?:-|$)/)
  return match ? match[1] : value
}
