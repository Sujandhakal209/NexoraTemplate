const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
export const API_BASE_URL = rawBaseUrl.replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function errorMessage(data, fallback) {
  if (typeof data?.detail === 'string') return data.detail
  if (typeof data?.message === 'string') return data.message
  const first = data && Object.values(data)[0]
  if (Array.isArray(first)) return first[0]
  if (typeof first === 'string') return first
  return fallback
}

export async function apiRequest(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeout || 15000)
  const headers = new Headers(options.headers)
  const hasBody = options.body !== undefined
  if (hasBody && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
      body: hasBody && !(options.body instanceof FormData) && typeof options.body !== 'string'
        ? JSON.stringify(options.body)
        : options.body,
    })
    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('json') ? await response.json() : await response.text()
    if (!response.ok) {
      throw new ApiError(errorMessage(data, `Request failed (${response.status})`), response.status, data)
    }
    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error.name === 'AbortError') throw new ApiError('The server took too long to respond. Please try again.')
    throw new ApiError('We could not connect to the website service. Please try again shortly.')
  } finally {
    clearTimeout(timeout)
  }
}

export function publicPath(path) {
  return `/public${path}`
}
