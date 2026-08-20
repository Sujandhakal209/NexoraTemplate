import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import AgentCard from '../components/agent/AgentCard'
import { EmptyState, ErrorState, PageLoader } from '../components/common/States'
import { useTenant } from '../context/TenantContext'
import { useAsync } from '../hooks/useAsync'
import { getAgents } from '../services/agentService'
import { setAgencySeo } from '../utils/seo'

export default function AgentsPage() {
  const { agency } = useTenant(); const [search, setSearch] = useState('')
  const query = useAsync(() => getAgents(agency), [agency.id])
  useEffect(() => setAgencySeo(agency, { title: `Our agents | ${agency.name}`, description: `Meet the property advisors at ${agency.name}.` }), [agency])
  const agents = useMemo(() => (query.data || []).filter((agent) => `${agent.name} ${agent.designation} ${agent.location} ${agent.specialtiesList.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [query.data, search])
  const noAgentsAtAll = !query.loading && !query.error && !(query.data || []).length
  return <main><section className="page-hero"><div className="container"><p className="eyebrow">The people behind the properties</p><h1>Meet our agents</h1><p>Local knowledge, clear communication, and personal support for every property decision.</p></div></section><section className="section"><div className="container"><div className="directory-toolbar"><p><strong>{agents.length}</strong> {agents.length === 1 ? 'advisor' : 'advisors'}</p>{!noAgentsAtAll && <label><Search /><span className="sr-only">Search agents</span><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialty" /></label>}</div>{query.loading ? <PageLoader label="Loading the team…" /> : query.error ? <ErrorState title="The team is unavailable" message={query.error.message} onRetry={query.retry} /> : agents.length ? <div className="agent-grid agent-directory">{agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)}</div> : <EmptyState title={noAgentsAtAll ? 'Agent profiles are coming soon' : 'No agents match that search'} message={noAgentsAtAll ? `Contact ${agency.name} directly for help with a property.` : 'Try a different name or specialty.'} />}</div></section></main>
}
