function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value || ''))
}

export function canonicalForAgency(agency, path = window.location.pathname) {
  const base = agency?.canonicalBaseUrl || window.location.origin
  const url = new URL(base, window.location.origin)
  url.pathname = path === '/' ? '/' : `/${String(path).replace(/^\/+|\/+$/g, '')}`
  url.hash = ''
  return url.toString()
}

export function setSeo({ title, description = '', image = '', canonical = window.location.href, favicon = '', type = 'website', noindex = false, structuredData = null }) {
  document.title = title
  ensureMeta('meta[name="description"]', { name: 'description', content: description })
  ensureMeta('meta[name="robots"]', { name: 'robots', content: noindex ? 'noindex, nofollow' : 'index, follow' })
  ensureMeta('meta[property="og:title"]', { property: 'og:title', content: title })
  ensureMeta('meta[property="og:description"]', { property: 'og:description', content: description })
  ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
  ensureMeta('meta[property="og:type"]', { property: 'og:type', content: type })
  ensureMeta('meta[property="og:image"]', { property: 'og:image', content: image })
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
  link.href = canonical
  if (favicon) {
    let icon = document.head.querySelector('link[rel="icon"]')
    if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon) }
    icon.href = favicon
  }
  let jsonLd = document.head.querySelector('script[data-nexora-seo="jsonld"]')
  if (structuredData) {
    if (!jsonLd) { jsonLd = document.createElement('script'); jsonLd.type = 'application/ld+json'; jsonLd.dataset.nexoraSeo = 'jsonld'; document.head.appendChild(jsonLd) }
    jsonLd.textContent = JSON.stringify(structuredData)
  } else {
    jsonLd?.remove()
  }
}

export function setAgencySeo(agency, overrides = {}) {
  const config = agency.config
  setSeo({
    title: overrides.title || config.seo_title || agency.seo_title || agency.name,
    description: overrides.description || config.seo_description || agency.seo_description || config.about || '',
    image: overrides.image || config.media?.social_share_image || agency.heroImage,
    favicon: config.media?.favicon || agency.logo,
    canonical: overrides.canonical || canonicalForAgency(agency),
    type: overrides.type,
    noindex: overrides.noindex,
    structuredData: overrides.structuredData,
  })
}
