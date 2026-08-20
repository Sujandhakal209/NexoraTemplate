import { ArrowRight, ChevronDown, Mail, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AgentCard from '../components/agent/AgentCard'
import PropertyGrid from '../components/property/PropertyGrid'
import PropertySearch from '../components/property/PropertySearch'
import { useTenant } from '../context/TenantContext'
import { useAsync } from '../hooks/useAsync'
import { getAgents } from '../services/agentService'
import { submitPublicForm } from '../services/inquiryService'
import { getProperties, getPropertyOptions } from '../services/propertyService'

const emptyProperties = []

export default function HomePage() {
  const { agency, isPreview } = useTenant()
  const homeFilters = homePropertyFilters(agency.config)
  const homeFilterKey = JSON.stringify(homeFilters)
  const propertiesQuery = useAsync(() => getProperties(agency, homeFilters), [agency.id, homeFilterKey])
  const optionsQuery = useAsync(() => getPropertyOptions(agency), [agency.id])
  const agentsQuery = useAsync(() => getAgents(agency), [agency.id])
  const properties = propertiesQuery.data?.results || emptyProperties
  const selection = useMemo(() => selectHomeProperties(agency, properties), [agency, properties])
  const discovery = useMemo(() => inventoryDiscovery(optionsQuery.data), [optionsQuery.data])

  return <main>
    <PreviewSection enabled={visible(agency, 'hero')} preview={isPreview} name="hero"><Hero agency={agency} options={optionsQuery.data || {}} /></PreviewSection>
    <PreviewSection enabled={visible(agency, 'featured_properties')} preview={isPreview} name="featured-properties">
      <PrimaryProperties agency={agency} selection={selection} query={propertiesQuery} preview={isPreview} />
    </PreviewSection>
    <PreviewSection enabled={visible(agency, 'property_categories')} preview={isPreview} name="properties">
      <DiscoverySection discovery={discovery} />
    </PreviewSection>
    {selection.secondary.length >= 3 && <PreviewSection enabled preview={isPreview} name="featured-properties"><SecondaryProperties selection={selection} /></PreviewSection>}
    <PreviewSection enabled={visible(agency, 'about') || visible(agency, 'services') || visible(agency, 'statistics')} preview={isPreview} name="about">
      <Credibility agency={agency} />
    </PreviewSection>
    <SupportingSections agency={agency} agents={agentsQuery.data || []} agentsLoading={agentsQuery.loading} preview={isPreview} />
  </main>
}

function visible(agency, name) {
  return agency.sectionVisibility[name] !== false
}

function homePropertyFilters(config) {
  const base = { page_size: 12 }
  if (config.featured_property_mode === 'manual' && config.featured_property_ids?.length) {
    return { ...base, ids: config.featured_property_ids.slice(0, 24).join(',') }
  }
  if (config.featured_property_mode === 'featured') {
    return { ...base, featured: true, ordering: 'featured' }
  }
  return { ...base, ordering: 'latest' }
}

function PreviewSection({ enabled, preview, name, children }) {
  if (!enabled) return null
  return preview ? <div data-preview-section={name}>{children}</div> : children
}

function SupportingSections({ agency, agents, agentsLoading, preview }) {
  const defaults = ['agents', 'testimonials', 'faqs', 'newsletter', 'contact_cta']
  const configured = (agency.sectionOrder || []).filter((name) => defaults.includes(name))
  const order = [...new Set([...configured, ...defaults])]
  const sections = {
    agents: <AgentsSection agents={agents} loading={agentsLoading} preview={preview} />,
    testimonials: <Testimonials items={agency.config.testimonials} />,
    faqs: <Faqs items={agency.config.faqs} />,
    newsletter: <Newsletter agency={agency} />,
    contact_cta: <ContactCta agency={agency} />,
  }

  return order.map((name) => <PreviewSection key={name} enabled={visible(agency, name)} preview={preview} name={name === 'newsletter' || name === 'contact_cta' ? 'contact' : name}>{sections[name]}</PreviewSection>)
}

function selectHomeProperties(agency, properties) {
  const config = agency.config
  const limit = Math.max(1, Math.min(config.featured_property_limit || 6, 6))
  let primary = []
  let primaryTitle = 'Latest properties'
  let primaryDescription = `The newest opportunities available from ${agency.name}.`

  if (config.featured_property_mode === 'manual') {
    const byId = new Map(properties.map((property) => [property.id, property]))
    primary = (config.featured_property_ids || []).map((id) => byId.get(id)).filter(Boolean)
  } else if (config.featured_property_mode === 'featured') {
    primary = properties.filter((property) => property.featured)
  }
  if (primary.length) {
    primaryTitle = 'Featured properties'
    primaryDescription = `A curated selection of current listings from ${agency.name}.`
  } else {
    primary = properties
  }
  primary = primary.slice(0, limit)

  const primaryIds = new Set(primary.map((property) => property.id))
  const remaining = properties.filter((property) => !primaryIds.has(property.id))
  let secondary = []
  let secondaryTitle = ''
  let secondaryHref = '/properties'
  if (primaryTitle === 'Featured properties') {
    secondary = remaining.slice(0, 6)
    secondaryTitle = 'Newly listed'
  } else {
    const rentals = remaining.filter((property) => property.purpose === 'rent')
    const sales = remaining.filter((property) => property.purpose === 'sale')
    if (rentals.length >= 3) { secondary = rentals.slice(0, 6); secondaryTitle = 'Properties for rent'; secondaryHref = '/rent' }
    else if (sales.length >= 3) { secondary = sales.slice(0, 6); secondaryTitle = 'More properties for sale'; secondaryHref = '/buy' }
  }
  return { primary, primaryTitle, primaryDescription, secondary, secondaryTitle, secondaryHref }
}

function inventoryDiscovery(options = {}) {
  const summary = options?.summary || {}
  const locations = ['cities', 'municipalities', 'neighbourhoods', 'toles', 'districts', 'provinces']
    .flatMap((key) => options?.locations?.[key] || [])
    .filter((item, index, all) => all.findIndex((candidate) => candidate.value.toLocaleLowerCase() === item.value.toLocaleLowerCase()) === index)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
  return {
    purposes: { sale: summary.sale || 0, rent: summary.rent || 0, lease: summary.lease || 0 },
    types: (options?.property_types || []).filter((item) => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 6),
    locations,
  }
}

function Hero({ agency, options }) {
  const config = agency.config
  return <section className={`hero ${agency.heroImage ? '' : 'hero-fallback'}`} style={agency.heroImage ? { backgroundImage: `linear-gradient(90deg, rgba(12,20,18,.78), rgba(12,20,18,.25)), url("${agency.heroImage}")` } : undefined}>
    <div className="container hero-layout"><div className="hero-content"><p className="hero-eyebrow">{config.hero_eyebrow || `Properties from ${agency.name}`}</p><h1>{config.hero_title || 'Find your next property.'}</h1><p className="hero-copy">{config.hero_subtitle || config.tagline || 'Search current homes, land, rentals, and commercial opportunities.'}</p></div><div className="hero-search-wrap"><PropertySearch options={options} /></div></div>
  </section>
}

function MarketplaceHeading({ title, description, href = '/properties', link = 'View all properties' }) {
  return <div className="marketplace-heading"><div><h2>{title}</h2>{description && <p>{description}</p>}</div><Link className="text-link" to={href}>{link}<ArrowRight size={16} /></Link></div>
}

function PrimaryProperties({ agency, selection, query, preview }) {
  if (!query.loading && !query.error && !selection.primary.length && !preview) return <section className="property-section property-section-empty"><div className="container"><MarketplaceHeading title="Explore properties" description={`New listings from ${agency.name} will appear here as soon as they are published.`} /><div className="inventory-empty-actions"><Link className="button button-primary" to="/properties">Browse properties</Link><Link className="button button-outline" to="/contact">Tell us what you need</Link></div></div></section>
  return <section className="property-section"><div className="container"><MarketplaceHeading title={selection.primaryTitle} description={selection.primaryDescription} /><PropertyGrid className="home-primary-grid" properties={selection.primary} loading={query.loading} error={query.error} retry={query.retry} /></div></section>
}

function SecondaryProperties({ selection }) {
  return <section className="property-section section-soft"><div className="container"><MarketplaceHeading title={selection.secondaryTitle} href={selection.secondaryHref} link="View more" /><PropertyGrid className="home-secondary-grid" properties={selection.secondary} /></div></section>
}

function DiscoverySection({ discovery }) {
  const purposeItems = [
    discovery.purposes.sale > 0 && { label: 'Properties for sale', description: `${discovery.purposes.sale} current ${discovery.purposes.sale === 1 ? 'listing' : 'listings'}`, href: '/buy' },
    discovery.purposes.rent > 0 && { label: 'Properties for rent', description: `${discovery.purposes.rent} current ${discovery.purposes.rent === 1 ? 'rental' : 'rentals'}`, href: '/rent' },
  ].filter(Boolean)
  if (!purposeItems.length && !discovery.types.length && !discovery.locations.length) return null
  return <section className="discovery-section"><div className="container">
    {purposeItems.length > 0 && <div className="intent-links">{purposeItems.map((item) => <Link key={item.href} to={item.href}><span><strong>{item.label}</strong><small>{item.description}</small></span><ArrowRight /></Link>)}</div>}
    {(discovery.types.length > 0 || discovery.locations.length > 0) && <div className="discovery-columns">
      {discovery.types.length > 0 && <div><h2>Browse by property type</h2><div className="discovery-list">{discovery.types.map((item) => <Link key={item.value} to={`/properties?property_type=${encodeURIComponent(item.value)}`}><span>{item.label}</span><small>{item.count}</small></Link>)}</div></div>}
      {discovery.locations.length > 0 && <div><h2>Explore by location</h2><div className="discovery-list">{discovery.locations.map((item) => <Link key={item.value} to={`/properties?location=${encodeURIComponent(item.value)}`}><span>{item.label}</span><small>{item.count}</small></Link>)}</div></div>}
    </div>}
  </div></section>
}

function Credibility({ agency }) {
  const config = agency.config
  const proof = [...(config.statistics || []).slice(0, 3), ...(config.services || []).slice(0, 3).map((item) => ({ value: item.title, label: item.description }))].slice(0, 3)
  if (!config.about && !proof.length) return null
  return <section className="about-home"><div className="container credibility-layout"><div><p className="eyebrow">Your local property team</p><h2>{config.tagline || `Property guidance from ${agency.name}.`}</h2><p>{config.about}</p><Link className="text-link" to="/about">Learn more about us <ArrowRight size={16} /></Link></div>{proof.length > 0 && <div className="credibility-points">{proof.map((item, index) => <div key={`${item.label}-${index}`}><strong>{item.value}</strong><span>{item.label}</span>{item.helper && <small>{item.helper}</small>}</div>)}</div>}</div></section>
}

function AgentsSection({ agents, loading, preview }) {
  if (!loading && !agents.length && !preview) return null
  return <section className="section section-standard"><div className="container"><MarketplaceHeading title="Our property advisors" description="People who know the agency’s listings and the areas they serve." href="/agents" link="Meet the team" />{loading ? <div className="agent-grid agent-grid-compact"><div className="agent-skeleton" /><div className="agent-skeleton" /></div> : preview && !agents.length ? <div className="preview-content-placeholder">Active agency profiles will appear here automatically.</div> : <div className="agent-grid agent-grid-compact">{agents.slice(0, 3).map((agent) => <AgentCard key={agent.id} agent={agent} />)}</div>}</div></section>
}

function Testimonials({ items = [] }) {
  if (!items.length) return null
  return <section className="section section-standard testimonial-section"><div className="container"><MarketplaceHeading title="Client experiences" /><div className="testimonial-grid">{items.slice(0, 3).map((item, index) => <figure key={`${item.name}-${index}`}><div className="stars">{Array.from({ length: item.rating || 5 }, (_, i) => <Star key={i} fill="currentColor" />)}</div><blockquote>{item.quote}</blockquote><figcaption><strong>{item.name}</strong><span>{[item.role, item.location].filter(Boolean).join(' · ')}</span></figcaption></figure>)}</div></div></section>
}

function Faqs({ items = [] }) {
  if (!items.length) return null
  return <section className="section section-standard"><div className="container faq-layout"><div><p className="eyebrow">Property questions</p><h2>Useful answers before your next step</h2></div><div className="faq-list">{items.slice(0, 3).map((item, index) => <details key={`${item.question}-${index}`}><summary>{item.question}<ChevronDown /></summary><p>{item.answer}</p></details>)}</div></div></section>
}

function Newsletter({ agency }) {
  const config = agency.config
  const [email, setEmail] = useState(''); const [state, setState] = useState('idle')
  if (!config.newsletter_title && !config.newsletter_description) return null
  async function submit(event) { event.preventDefault(); setState('submitting'); try { await submitPublicForm(agency, { kind: 'newsletter', email }); setEmail(''); setState('success') } catch { setState('error') } }
  return <section className="newsletter"><div className="container newsletter-inner"><div><Mail /><h2>{config.newsletter_title || 'Get new property updates.'}</h2><p>{config.newsletter_description}</p></div>{state === 'success' ? <p className="newsletter-success">You are on the list. Thank you.</p> : <form onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required /><button disabled={state === 'submitting'}>{state === 'submitting' ? 'Joining…' : 'Keep me updated'}</button>{state === 'error' && <small>Unable to subscribe. Please try again.</small>}</form>}</div></section>
}

function ContactCta({ agency }) {
  const config = agency.config
  return <section className="contact-cta"><div className="container"><div><p className="eyebrow">{config.contact_cta_eyebrow || 'Need help finding the right property?'}</p><h2>{config.contact_cta_title || `Talk to the ${agency.name} team.`}</h2><p>{config.contact_cta_subtitle || 'Tell us what you are looking for and we will help you explore the right options.'}</p></div><Link className="button button-primary" to={config.contact_cta_url || '/contact'}>{config.contact_cta_label || 'Contact the agency'}<ArrowRight size={17} /></Link></div></section>
}
