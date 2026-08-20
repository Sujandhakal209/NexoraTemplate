import { apiRequest, publicPath } from '../api/client'

export function contactAgency(agency, payload) {
  return apiRequest(publicPath(`/agencies/${encodeURIComponent(agency.license_number)}/contact/`), {
    method: 'POST', body: payload,
  })
}

export function submitPublicForm(agency, payload) {
  return apiRequest(publicPath(`/agencies/${encodeURIComponent(agency.slug)}/submissions/`), {
    method: 'POST', body: { source_page: window.location.pathname, ...payload },
  })
}
