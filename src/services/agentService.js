import { apiRequest, publicPath } from '../api/client'
import { normalizeAgent } from '../adapters/agentAdapter'

function base(agency) {
  return publicPath(`/agencies/${encodeURIComponent(agency.license_number)}/agents`)
}

export async function getAgents(agency) {
  const response = await apiRequest(`${base(agency)}/`)
  const list = Array.isArray(response) ? response : response.results || []
  return list.map(normalizeAgent)
}

export async function getAgent(agency, id) {
  return normalizeAgent(await apiRequest(`${base(agency)}/${id}/`))
}

export function submitAgentReview(agency, agentId, payload) {
  return apiRequest(publicPath(`/agencies/${encodeURIComponent(agency.slug)}/agents/${agentId}/reviews/`), {
    method: 'POST', body: payload,
  })
}
