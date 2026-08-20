const googleFonts = {
  inter: 'Inter:wght@400;500;600;700',
  manrope: 'Manrope:wght@400;500;600;700',
  poppins: 'Poppins:wght@400;500;600;700',
  lato: 'Lato:wght@400;700',
  montserrat: 'Montserrat:wght@400;500;600;700',
  'playfair-display': 'Playfair+Display:wght@500;600;700',
  'noto-sans-devanagari': 'Noto+Sans+Devanagari:wght@400;500;600;700',
}

function contrastText(color, fallback = '#ffffff') {
  const match = String(color || '').trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)
  if (!match) return fallback
  const hex = match[1].length === 3 ? match[1].split('').map((value) => value + value).join('') : match[1]
  const [red, green, blue] = [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255)
  const luminance = [red, green, blue]
    .map((value) => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
    .reduce((total, value, index) => total + value * [.2126, .7152, .0722][index], 0)
  return luminance > .52 ? '#171c1b' : '#ffffff'
}

function loadAgencyFonts(agency) {
  const families = [...new Set([agency.theme.headingFontKey, agency.theme.bodyFontKey])]
    .map((key) => googleFonts[key])
    .filter(Boolean)
  let link = document.head.querySelector('link[data-nexora-fonts]')
  if (!families.length) {
    link?.remove()
    return
  }
  if (!link) {
    link = document.createElement('link')
    link.rel = 'stylesheet'
    link.dataset.nexoraFonts = 'true'
    document.head.appendChild(link)
  }
  link.href = `https://fonts.googleapis.com/css2?${families.map((family) => `family=${family}`).join('&')}&display=swap`
}

export function applyAgencyTheme(agency) {
  const root = document.documentElement
  const values = {
    '--color-primary': agency.theme.primary,
    '--color-secondary': agency.theme.secondary,
    '--color-accent': agency.theme.accent,
    '--color-on-primary': contrastText(agency.theme.primary),
    '--color-on-accent': contrastText(agency.theme.accent, '#171c1b'),
    '--font-heading': agency.theme.headingFont,
    '--font-body': agency.theme.bodyFont,
  }
  Object.entries(values).forEach(([key, value]) => root.style.setProperty(key, value))
  loadAgencyFonts(agency)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', agency.theme.primary)
}
