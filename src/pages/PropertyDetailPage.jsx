import { CalendarDays, Check, ChevronLeft, ExternalLink, Flag, MapPin, Maximize2, MessageCircle, Phone, Play, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, FieldError, PageLoader } from '../components/common/States'
import PropertyGallery from '../components/property/PropertyGallery'
import PropertyGrid from '../components/property/PropertyGrid'
import { PropertyFactStrip } from '../components/property/PropertyFacts'
import { getPropertyFacts } from '../components/property/propertyFactUtils'
import { useTenant } from '../context/TenantContext'
import { useAsync } from '../hooks/useAsync'
import { getProperty, getPropertyRecommendations, reportListing, requestSiteVisit, submitPropertyInquiry, trackPropertyEvent } from '../services/propertyService'
import { agentRoute, formatDate, formatMeasurement, formatPrice, phoneHref, titleCase, viberHref, whatsappHref } from '../utils/format'
import { setAgencySeo } from '../utils/seo'

export default function PropertyDetailPage() {
  const { agency } = useTenant()
  const { slug } = useParams()
  const location = useLocation()
  const query = useAsync(() => getProperty(agency, slug), [agency.id, slug])
  const property = query.data
  const recommendations = useAsync(() => property ? getPropertyRecommendations(agency, property) : Promise.resolve([]), [agency.id, property?.id])
  useEffect(() => {
    if (!property) return
    const description = property.seo_description || property.summary || agency.config.seo_description
    setAgencySeo(agency, {
      title: property.seo_title || `${property.title} | ${agency.name}`,
      description,
      image: property.image,
      canonical: property.canonicalUrl,
      type: 'product',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: property.title,
        description,
        image: property.images.map((item) => item.originalUrl || item.url).filter(Boolean),
        url: property.canonicalUrl,
        offers: {
          '@type': 'Offer',
          price: property.priceValue,
          priceCurrency: property.currency,
          availability: property.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability',
        },
      },
    })
    const marker = `nexora-view-${agency.id}-${property.id}`
    if (!sessionStorage.getItem(marker)) { sessionStorage.setItem(marker, '1'); trackPropertyEvent(agency, property.id, 'view').catch(() => {}) }
  }, [agency, property])
  if (query.loading) return <main className="container page-loading"><PageLoader label="Loading property details…" /></main>
  if (query.error) return <main className="container page-loading"><ErrorState title="This property is unavailable" message="It may have expired, been withdrawn, or no longer be publicly available." onRetry={query.retry} /></main>
  if (!property) return <EmptyState />

  const requestedReturn = location.state?.returnTo
  const returnTo = typeof requestedReturn === 'string' && requestedReturn.startsWith('/') ? requestedReturn : '/properties'
  const returningToProperty = /^\/properties\/[^?]+/.test(returnTo)
  const facts = getPropertyFacts(property, { detailed: true }).slice(0, 4)
  return <main className="property-detail-page">
    <div className="container detail-top"><Link className="back-link" to={returnTo}><ChevronLeft />{returningToProperty ? 'Back to previous property' : 'Back to results'}</Link><div className="property-title-row"><div><div className="detail-badges"><span>{property.purposeLabel}</span><span>{property.availability}</span>{property.verification.is_fully_verified && <span className="verified" tabIndex="0" data-tooltip="Details and availability reviewed by the agency"><ShieldCheck />Fully verified</span>}</div><h1>{property.title}</h1><p><MapPin />{property.location}</p></div><div className="detail-price"><small>Asking price</small><strong>{property.priceLabel}</strong>{property.price_per_sqft && <span>{formatPrice(property.price_per_sqft, property.currency)} / sq ft</span>}</div></div></div>
    <PropertyFactStrip facts={facts} variant="detail" className="container" />
    <PropertyGallery property={property} />
    <div className="container detail-layout"><article className="detail-content">
      {property.availability_verified_at && <div className="freshness-card"><ShieldCheck /><div><strong>Recently confirmed by {agency.name}</strong><span>Availability verified {formatDate(property.availability_verified_at)}{property.listing_expires_at ? ` · Current until ${formatDate(property.listing_expires_at)}` : ''}</span></div></div>}
      <DetailSection title="About this property"><p className="long-copy">{property.description || property.summary || 'Contact the agency for the full property details.'}</p></DetailSection>
      <PropertyInformation property={property} />
      <Utilities property={property} />
      {Array.isArray(property.amenities) && property.amenities.length > 0 && <DetailSection title="Amenities"><div className="amenities-grid">{property.amenities.map((item) => <span key={item}><Check />{item}</span>)}</div></DetailSection>}
      {(property.price_per_aana || property.price_per_dhur || property.price_per_kattha || property.price_per_land_sqft) && <DetailSection title="Price by land unit"><div className="facts-grid"><Fact label="Per Aana" value={property.price_per_aana && formatPrice(property.price_per_aana, property.currency)} /><Fact label="Per Dhur" value={property.price_per_dhur && formatPrice(property.price_per_dhur, property.currency)} /><Fact label="Per Kattha" value={property.price_per_kattha && formatPrice(property.price_per_kattha, property.currency)} /><Fact label="Per land sq ft" value={property.price_per_land_sqft && formatPrice(property.price_per_land_sqft, property.currency)} /></div></DetailSection>}
      {(property.virtual_tour_url || property.video_tour_url) && <DetailSection title="Virtual viewing"><div className="tour-links">{property.virtual_tour_url && <a className="button button-outline" href={property.virtual_tour_url} target="_blank" rel="noreferrer"><Maximize2 />Open virtual tour</a>}{property.video_tour_url && <a className="button button-outline" href={property.video_tour_url} target="_blank" rel="noreferrer"><Play />Watch video tour</a>}</div></DetailSection>}
      {property.latitude !== null && property.latitude !== undefined && property.latitude !== '' && property.longitude !== null && property.longitude !== undefined && property.longitude !== '' && <PropertyLocation property={property} />}
      <ReportListing agency={agency} property={property} />
    </article><InquiryPanel agency={agency} property={property} /></div>
    <RecommendationSection agency={agency} property={property} query={recommendations} />
    <MobileContactBar agency={agency} property={property} />
  </main>
}

function PropertyInformation({ property }) {
  return <DetailSection title="Property information"><div className="facts-grid">
    <Fact label="Property type" value={property.propertyTypeLabel} /><Fact label="Property ID" value={property.display_property_id} /><Fact label="Status" value={property.availability} /><Fact label="Year built" value={property.year_built} />
    <Fact label="Land classification" value={titleCase(property.land_use_classification)} /><Fact label="Land area" value={formatMeasurement(property.land_area_value, property.land_area_unit)} /><Fact label="Built-up area" value={formatMeasurement(property.built_up_area_value, property.built_up_area_unit)} /><Fact label="Furnishing" value={property.furnishing_status_display} />
    <Fact label="Parking spaces" value={property.parking_spaces} /><Fact label="Parking type" value={titleCase(property.parking_type)} /><Fact label="Facing" value={property.facing_direction_display} /><Fact label="Road access" value={property.road_access_value ? `${property.road_access_value} ${property.road_access_unit || ''} · ${titleCase(property.road_type)}` : titleCase(property.road_type)} />
    <Fact label="Plot shape" value={titleCase(property.plot_shape)} /><Fact label="Mohada × Pichhad" value={property.mohada_value || property.pichhad_value ? `${property.mohada_value || '—'} × ${property.pichhad_value || '—'} ${property.plot_dimension_unit || ''}` : ''} /><Fact label="Nearest major road" value={property.major_road_distance_value ? `${property.major_road_distance_value} ${property.major_road_distance_unit} to ${property.nearest_major_road || titleCase(property.major_road_type)}` : property.nearest_major_road} />
  </div></DetailSection>
}

function DetailSection({ title, children }) { return <section className="detail-section"><h2>{title}</h2>{children}</section> }
function Fact({ label, value }) {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : value
  if (!value || ['n/a', 'null', 'undefined', 'none'].includes(normalized)) return null
  return <div><span>{label}</span><strong>{value}</strong></div>
}
function Utilities({ property }) { const items = [['Water supply', property.has_water_supply], ['Electricity', property.has_electricity], ['Drainage', property.has_drainage], ['Sewage', property.has_sewage]]; if (!items.some(([, value]) => value === true)) return null; return <DetailSection title="Utilities"><div className="amenities-grid">{items.filter(([, value]) => value === true).map(([label]) => <span key={label}><Check />{label}</span>)}</div></DetailSection> }

function PropertyLocation({ property }) {
  const latitude = Number(property.latitude)
  const longitude = Number(property.longitude)
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-.01}%2C${latitude-.01}%2C${longitude+.01}%2C${latitude+.01}&layer=mapnik&marker=${latitude}%2C${longitude}`
  const mapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`
  return <DetailSection title="Location"><div className="property-location-panel">
    <div className="property-location-copy"><MapPin /><p className="eyebrow">Property location</p><h3>{property.location || 'Location provided by the agency'}</h3><p>The map marker is based on the location supplied with this listing. Confirm the exact access point with the property advisor before visiting.</p><a className="text-link" href={mapUrl} target="_blank" rel="noreferrer">Open larger map <ExternalLink /></a></div>
    <iframe className="property-map" title={`${property.title} location`} loading="lazy" src={embedUrl} />
  </div></DetailSection>
}

function contactActions(agency, property) {
  const message = `Hello, I am interested in ${property.title} (${property.display_property_id}).`
  return {
    phone: phoneHref(property.agent?.phone || agency.contact.phone),
    whatsapp: whatsappHref(agency.contact.whatsapp, message),
    viber: viberHref(agency.contact.viber),
  }
}

function initialInquiryForm(title, displayId) {
  return {
    full_name: '',
    phone: '',
    email: '',
    message: `I am interested in ${title}${displayId ? ` (${displayId})` : ''}.`,
    preferred_datetime: '',
  }
}

function InquiryPanel({ agency, property }) {
  const [mode, setMode] = useState('inquiry')
  const blankForm = useMemo(
    () => initialInquiryForm(property.title, property.display_property_id),
    [property.title, property.display_property_id],
  )
  const [form, setForm] = useState(blankForm)
  const [state, setState] = useState({ status: 'idle', error: '' })
  const actions = useMemo(() => contactActions(agency, property), [agency, property])
  useEffect(() => { setForm(blankForm); setState({ status: 'idle', error: '' }) }, [blankForm])
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  async function submit(event) { event.preventDefault(); setState({ status: 'submitting', error: '' }); try { if (mode === 'visit') await requestSiteVisit(agency, property.id, { ...form, preferred_datetime: new Date(form.preferred_datetime).toISOString() }); else await submitPropertyInquiry(agency, property.id, form); setForm(blankForm); setState({ status: 'success', error: '' }) } catch (error) { setState({ status: 'error', error: error.message }) } }
  return <aside className="inquiry-panel" id="property-inquiry">
    {property.agent && <div className="inquiry-agent">{property.agent.image ? <img src={property.agent.image} alt={property.agent.name} /> : <span>{property.agent.name?.slice(0, 1)}</span>}<div><small>Your property advisor</small><Link to={agentRoute(property.agent)}>{property.agent.name}</Link><span>{property.agent.designation}</span></div></div>}
    <h2>Interested in this property?</h2><p>Contact the agency directly or send an inquiry.{agency.contact.hours ? ` Typical office hours: ${agency.contact.hours}.` : ''}</p>
    <div className="primary-contact-actions">{actions.phone && <a href={actions.phone} onClick={() => trackPropertyEvent(agency, property.id, 'call_click').catch(() => {})}><Phone />Call</a>}{actions.whatsapp && <a href={actions.whatsapp} target="_blank" rel="noreferrer" onClick={() => trackPropertyEvent(agency, property.id, 'whatsapp_click').catch(() => {})}><MessageCircle />WhatsApp</a>}</div>
    {state.status === 'success' ? <div className="form-success"><ShieldCheck /><h3>Request received.</h3><p>The {agency.name} team will contact you soon.</p><button className="text-link" onClick={() => setState({ status: 'idle', error: '' })}>Send another request</button></div> : <>
      <div className="inquiry-tabs"><button className={mode === 'inquiry' ? 'active' : ''} onClick={() => setMode('inquiry')}>Send inquiry</button><button className={mode === 'visit' ? 'active' : ''} onClick={() => setMode('visit')}>Request a visit</button></div>
      <form onSubmit={submit}><label>Full name<input value={form.full_name} onChange={(event) => set('full_name', event.target.value)} required autoComplete="name" /></label><label>Phone number<input value={form.phone} onChange={(event) => set('phone', event.target.value)} required autoComplete="tel" /></label><label>Email <span>(optional)</span><input type="email" value={form.email} onChange={(event) => set('email', event.target.value)} autoComplete="email" /></label>{mode === 'visit' && <label>Preferred date and time<input type="datetime-local" value={form.preferred_datetime} min={localDateTimeMinimum()} onChange={(event) => set('preferred_datetime', event.target.value)} required /></label>}<label>Message <span>(optional)</span><textarea rows="3" value={form.message} onChange={(event) => set('message', event.target.value)} /></label><FieldError error={state.error} /><button className="button button-primary" disabled={state.status === 'submitting'}>{mode === 'visit' ? <CalendarDays /> : <ExternalLink />}{state.status === 'submitting' ? 'Sending…' : mode === 'visit' ? 'Request site visit' : 'Send inquiry'}</button></form>
    </>}
    {actions.viber && <a className="secondary-contact" href={actions.viber} onClick={() => trackPropertyEvent(agency, property.id, 'viber_click').catch(() => {})}>Also available on Viber</a>}
  </aside>
}

function localDateTimeMinimum() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function MobileContactBar({ agency, property }) {
  const actions = contactActions(agency, property)
  const focusInquiry = () => document.getElementById('property-inquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  return <nav className="mobile-contact-bar" aria-label="Property contact actions">{actions.phone && <a href={actions.phone} onClick={() => trackPropertyEvent(agency, property.id, 'call_click').catch(() => {})}><Phone />Call</a>}{actions.whatsapp && <a href={actions.whatsapp} target="_blank" rel="noreferrer" onClick={() => trackPropertyEvent(agency, property.id, 'whatsapp_click').catch(() => {})}><MessageCircle />WhatsApp</a>}<button onClick={focusInquiry}><ExternalLink />Inquiry</button></nav>
}

function RecommendationSection({ property, query }) {
  const results = query.data || []
  const route = property.purpose === 'sale' ? '/buy' : property.purpose === 'rent' ? '/rent' : '/properties'
  const params = new URLSearchParams()
  if (property.propertyType) params.set('property_type', property.propertyType)
  const location = property.city || property.municipality || property.district
  if (location) params.set('location', location)
  const viewMore = `${route}${params.size ? `?${params}` : ''}`
  return <section className="recommendation-section section-soft"><div className="container">
    <div className="marketplace-heading"><div><h2>{results.length ? 'More properties to explore' : 'Looking for something different?'}</h2><p>{results.length ? 'Similar and recently available listings from this agency.' : 'Continue browsing the agency’s current inventory or tell the team what you need.'}</p></div>{results.length > 0 && <Link className="text-link" to={viewMore}>View more properties</Link>}</div>
    {query.loading ? <PropertyGrid properties={[]} loading loadingCount={3} className="related-grid" /> : results.length > 0 ? <PropertyGrid properties={results.slice(0, 6)} className="related-grid" /> : <div className="continuation-actions"><Link className="button button-primary" to="/properties">Browse properties</Link><Link className="button button-outline" to="/buy">Properties for sale</Link><Link className="button button-outline" to="/rent">Properties for rent</Link><Link className="text-link" to="/contact">Contact the agency</Link></div>}
  </div></section>
}

function ReportListing({ agency, property }) {
  const [open, setOpen] = useState(false); const [state, setState] = useState('idle'); const [form, setForm] = useState({ reason: '', message: '', full_name: '', email: '' })
  async function submit(event) { event.preventDefault(); setState('submitting'); try { await reportListing(agency, property.id, { full_name: form.full_name, email: form.email, message: form.message, metadata: { reason: form.reason } }); setState('success') } catch { setState('error') } }
  if (!open) return <button className="report-button" onClick={() => setOpen(true)}><Flag />Report an issue with this listing</button>
  if (state === 'success') return <div className="report-form"><strong>Thank you. The agency will review your report.</strong></div>
  return <form className="report-form" onSubmit={submit}><h3>Report this listing</h3><select required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })}><option value="">Choose a reason</option><option value="unavailable">No longer available</option><option value="already_sold">Already sold or rented</option><option value="duplicate">Duplicate listing</option><option value="incorrect_information">Incorrect information</option><option value="suspicious">Suspicious listing</option><option value="other">Other</option></select><textarea required rows="3" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="What appears to be wrong?" /><div className="form-grid"><input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Name (optional)" /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email (optional)" /></div>{state === 'error' && <p className="field-error">Unable to send the report.</p>}<div><button className="button button-primary" disabled={state === 'submitting'}>{state === 'submitting' ? 'Sending…' : 'Send report'}</button><button type="button" className="button button-plain" onClick={() => setOpen(false)}>Cancel</button></div></form>
}
