import { ChevronLeft, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PropertyGrid from '../components/property/PropertyGrid'
import { ErrorState, FieldError, PageLoader } from '../components/common/States'
import { useTenant } from '../context/TenantContext'
import { useAsync } from '../hooks/useAsync'
import { agentIdFromRoute } from '../adapters/agentAdapter'
import { getAgent, submitAgentReview } from '../services/agentService'
import { getProperties } from '../services/propertyService'
import { phoneHref } from '../utils/format'
import { setAgencySeo } from '../utils/seo'

export default function AgentDetailPage() {
  const { agency } = useTenant(); const { slug } = useParams(); const id = agentIdFromRoute(slug)
  const query = useAsync(() => getAgent(agency, id), [agency.id, id])
  const properties = useAsync(() => getProperties(agency, { assigned_agent: id, page_size: 24 }), [agency.id, id])
  const agent = query.data
  useEffect(() => { if (agent) setAgencySeo(agency, { title: `${agent.name} | ${agency.name}`, description: agent.bio || `Meet ${agent.name}, property advisor at ${agency.name}.`, image: agent.image }) }, [agency, agent])
  if (query.loading) return <main className="container page-loading"><PageLoader label="Loading agent profile…" /></main>
  if (query.error) return <main className="container page-loading"><ErrorState title="Agent profile unavailable" message="This profile may no longer be public." onRetry={query.retry} /></main>
  const listings = properties.data?.results || []
  return <main><section className="agent-profile-hero"><div className="container"><Link to="/agents" className="back-link"><ChevronLeft />Back to agents</Link><div className="agent-profile-grid"><div className="agent-profile-image">{agent.image ? <img src={agent.image} alt={agent.name} /> : <span>{agent.name.slice(0,1)}</span>}</div><div><p className="eyebrow">{agent.designation}</p><h1>{agent.name}</h1>{agent.location && <p className="muted-line"><MapPin />{agent.location}</p>}<div className="profile-stats">{agent.experience > 0 && <span><strong>{agent.experience}</strong>Years experience</span>}<span><strong>{agent.dealsClosed}</strong>Deals closed</span>{agent.rating > 0 && <span><strong>{agent.rating}</strong>Average rating</span>}</div><div className="profile-actions">{agent.phone && <a className="button button-accent" href={phoneHref(agent.phone)}><Phone />Call agent</a>}{agent.email && <a className="button button-ghost-light" href={`mailto:${agent.email}`}><Mail />Email agent</a>}</div></div></div></div></section>
    {(properties.loading || listings.length > 0) && <section className="property-section section-soft"><div className="container"><div className="marketplace-heading"><div><h2>Properties represented by {agent.name}</h2><p>Current public listings handled by this advisor.</p></div></div><PropertyGrid properties={listings} loading={properties.loading} loadingCount={3} /></div></section>}
    <section className="section"><div className="container profile-content profile-content-single"><article><p className="eyebrow">About your advisor</p><h2>Practical guidance, shaped around you.</h2><p className="long-copy">{agent.bio || `${agent.name} is a property advisor with ${agency.name}, ready to help with your next property decision.`}</p>{agent.specialtiesList.length > 0 && <div className="tag-list">{agent.specialtiesList.map((item) => <span key={item}>{item}</span>)}</div>}{agent.languagesList.length > 0 && <p className="profile-languages"><strong>Languages:</strong> {agent.languagesList.join(', ')}</p>}<div className="profile-social">{agent.social.facebook && <a href={agent.social.facebook} target="_blank" rel="noreferrer"><Facebook /></a>}{agent.social.instagram && <a href={agent.social.instagram} target="_blank" rel="noreferrer"><Instagram /></a>}{agent.social.linkedin && <a href={agent.social.linkedin} target="_blank" rel="noreferrer"><Linkedin /></a>}</div></article></div></section>
    {agent.reviews.length > 0 && <section className="section"><div className="container"><div className="section-heading"><div><p className="eyebrow">Client feedback</p><h2>Recent reviews</h2></div></div><div className="review-grid">{agent.reviews.map((review) => <article key={review.id}><div>{Array.from({ length: review.rating }, (_, index) => <Star key={index} fill="currentColor" />)}</div><h3>{review.title || 'Client review'}</h3><p>{review.comment}</p><strong>{review.name}</strong></article>)}</div></div></section>}
    <section className="section section-soft"><div className="container review-form-wrap"><ReviewForm agency={agency} agent={agent} /></div></section>
  </main>
}

function ReviewForm({ agency, agent }) {
  const initial = { reviewer_name: '', reviewer_email: '', rating: 5, title: '', comment: '' }; const [form, setForm] = useState(initial); const [state, setState] = useState({ status: 'idle', error: '' })
  async function submit(event) { event.preventDefault(); setState({ status: 'submitting', error: '' }); try { await submitAgentReview(agency, agent.id, form); setForm(initial); setState({ status: 'success', error: '' }) } catch (error) { setState({ status: 'error', error: error.message }) } }
  if (state.status === 'success') return <aside className="review-form form-success"><h3>Thank you for your review.</h3><p>It has been sent to the agency for moderation.</p></aside>
  return <form className="review-form" onSubmit={submit}><p className="eyebrow">Worked with {agent.name}?</p><h2>Share your experience</h2><label>Your name<input required value={form.reviewer_name} onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })} /></label><label>Email <span>(optional)</span><input type="email" value={form.reviewer_email} onChange={(e) => setForm({ ...form, reviewer_email: e.target.value })} /></label><label>Rating<select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}</select></label><label>Review title <span>(optional)</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Your review<textarea required rows="4" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} /></label><FieldError error={state.error} /><button className="button button-primary" disabled={state.status === 'submitting'}>{state.status === 'submitting' ? 'Submitting…' : 'Submit review'}</button></form>
}
