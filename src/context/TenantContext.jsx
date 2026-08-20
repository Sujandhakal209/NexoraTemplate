/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ApiError } from '../api/client'
import { loadCurrentTenant } from '../services/tenantService'
import { normalizeAgency } from '../adapters/agencyAdapter'
import {
  PREVIEW_MESSAGES,
  allowedParentOrigins,
  isPreviewMode,
  previewParentOrigin,
  sanitizePreviewAgency,
} from '../preview/protocol'
import { applyAgencyTheme } from '../utils/theme'
import { setAgencySeo } from '../utils/seo'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const preview = isPreviewMode()
  const [state, setState] = useState({ status: 'loading', agency: null, error: null, target: null, isPreview: preview })

  useEffect(() => {
    if (preview) {
      const allowed = allowedParentOrigins()
      const parentOrigin = previewParentOrigin(allowed)
      let highlightTimer

      const send = (message, origin = parentOrigin) => {
        if (origin) window.parent.postMessage(message, origin)
      }
      const highlight = (element) => {
        document.querySelectorAll('.preview-section-active').forEach((node) => node.classList.remove('preview-section-active'))
        element.classList.add('preview-section-active')
        clearTimeout(highlightTimer)
        highlightTimer = setTimeout(() => element.classList.remove('preview-section-active'), 850)
      }
      const receive = (event) => {
        if (event.source !== window.parent || !allowed.has(event.origin) || !event.data || typeof event.data !== 'object') return
        if (event.data.type === PREVIEW_MESSAGES.CONFIG) {
          const rawAgency = sanitizePreviewAgency(event.data.payload)
          if (!rawAgency) return
          const agency = normalizeAgency(rawAgency)
          applyAgencyTheme(agency)
          setAgencySeo(agency, { noindex: true })
          setState({ status: 'ready', agency, target: { type: 'preview' }, error: null, isPreview: true })
        }
        if (event.data.type === PREVIEW_MESSAGES.SCROLL_TO && typeof event.data.payload?.section === 'string') {
          window.requestAnimationFrame(() => {
            const element = document.querySelector(`[data-preview-section="${CSS.escape(event.data.payload.section)}"]`)
            if (!element) return
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            highlight(element)
          })
        }
      }
      const clickSection = (event) => {
        const element = event.target.closest?.('[data-preview-section]')
        if (!element) return
        send({ type: PREVIEW_MESSAGES.SECTION_CLICK, payload: { section: element.dataset.previewSection } })
      }

      window.addEventListener('message', receive)
      document.addEventListener('click', clickSection, true)
      send({ type: PREVIEW_MESSAGES.READY })
      return () => {
        clearTimeout(highlightTimer)
        window.removeEventListener('message', receive)
        document.removeEventListener('click', clickSection, true)
      }
    }

    let active = true
    loadCurrentTenant()
      .then(({ agency, target }) => {
        if (!active) return
        applyAgencyTheme(agency)
        setAgencySeo(agency)
        setState({ status: 'ready', agency, target, error: null, isPreview: false })
      })
      .catch((error) => {
        if (!active) return
        const status = error instanceof ApiError && error.status === 404 ? 'not-found' : 'error'
        setState({ status, agency: null, target: null, error, isPreview: false })
      })
    return () => { active = false }
  }, [preview])

  const value = useMemo(() => state, [state])
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const value = useContext(TenantContext)
  if (!value) throw new Error('useTenant must be used within TenantProvider')
  return value
}
