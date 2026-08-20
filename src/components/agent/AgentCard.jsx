import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { agentRoute } from '../../utils/format'

export default function AgentCard({ agent }) {
  const listingCount = agent.listingIds?.length || 0
  return <article className="agent-card">
    <Link to={agentRoute(agent)} className="agent-image">{agent.image ? <img src={agent.image} alt={agent.name} loading="lazy" /> : <span>{agent.name?.slice(0, 1)}</span>}</Link>
    <div><p className="eyebrow">{agent.designation}</p><h3><Link to={agentRoute(agent)}>{agent.name}</Link></h3>{agent.location && <p className="muted-line"><MapPin size={14} />{agent.location}</p>}<div className="agent-meta">{listingCount > 0 && <span>{listingCount} active {listingCount === 1 ? 'listing' : 'listings'}</span>}{agent.rating > 0 && <span><Star size={14} fill="currentColor" />{agent.rating}</span>}{agent.experience > 0 && <span>{agent.experience} years experience</span>}</div><Link className="text-link" to={agentRoute(agent)}>View profile <ArrowUpRight size={15} /></Link></div>
  </article>
}
