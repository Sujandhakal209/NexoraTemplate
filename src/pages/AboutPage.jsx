import { Check, Compass, Target } from 'lucide-react'
import { useEffect } from 'react'
import AgentCard from '../components/agent/AgentCard'
import { useTenant } from '../context/TenantContext'
import { useAsync } from '../hooks/useAsync'
import { getAgents } from '../services/agentService'
import { setAgencySeo } from '../utils/seo'

export default function AboutPage() {
  const { agency } = useTenant(); const c = agency.config; const agents = useAsync(() => getAgents(agency), [agency.id])
  useEffect(() => setAgencySeo(agency, { title: `About ${agency.name}`, description: c.about || c.seo_description }), [agency, c.about, c.seo_description])
  return <main><section className="about-page-hero"><div className="container about-page-grid"><div><p className="eyebrow">About {agency.name}</p><h1>{c.tagline || 'Property decisions deserve clarity, care, and local perspective.'}</h1><p>{c.about}</p></div><div>{agency.aboutImage || agency.heroImage ? <img src={agency.aboutImage || agency.heroImage} alt={`${agency.name} team and office`} /> : <span>{agency.name.slice(0,1)}</span>}</div></div></section>
    {(c.mission || c.vision) && <section className="section"><div className="container purpose-grid">{c.mission && <article><Target /><p className="eyebrow">Our mission</p><h2>What guides our work</h2><p>{c.mission}</p></article>}{c.vision && <article><Compass /><p className="eyebrow">Our vision</p><h2>What we are building toward</h2><p>{c.vision}</p></article>}</div></section>}
    {c.story && <section className="section section-soft"><div className="container story-layout"><div><p className="eyebrow">Our story</p><h2>{c.year_established ? `Serving property clients since ${c.year_established}.` : 'Built around better property experiences.'}</h2></div><p>{c.story}</p></div></section>}
    {((c.specialities || []).length > 0 || (c.areas_served || []).length > 0) && <section className="section"><div className="container specialty-grid"><div><p className="eyebrow">Our expertise</p><h2>How we can help</h2>{(c.specialities || []).map((item) => <p key={item}><Check />{item}</p>)}</div><div><p className="eyebrow">Where we work</p><h2>Areas we serve</h2><div className="tag-list">{(c.areas_served || []).map((item) => <span key={item}>{item}</span>)}</div></div></div></section>}
    {agents.data?.length > 0 && <section className="section section-soft"><div className="container"><div className="section-heading"><div><p className="eyebrow">Meet the team</p><h2>People committed to your next move</h2></div></div><div className="agent-grid">{agents.data.slice(0,3).map((agent) => <AgentCard key={agent.id} agent={agent} />)}</div></div></section>}
  </main>
}
