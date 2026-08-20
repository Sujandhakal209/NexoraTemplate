import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import SiteLayout from './components/layout/SiteLayout'
import { isPageEnabled } from './adapters/agencyAdapter'
import { useTenant } from './context/TenantContext'
import AboutPage from './pages/AboutPage'
import AgentDetailPage from './pages/AgentDetailPage'
import AgentsPage from './pages/AgentsPage'
import ContactPage from './pages/ContactPage'
import HomePage from './pages/HomePage'
import ListPropertyPage from './pages/ListPropertyPage'
import NotFoundPage from './pages/NotFoundPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import UnavailablePage from './pages/UnavailablePage'

function PageGate({ page, children }) {
  const { agency } = useTenant()
  return isPageEnabled(agency, page) ? children : <NotFoundPage title="This page is not available" />
}

function LegacyListingRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/properties/${slug}`} replace />
}

export default function App() {
  const tenant = useTenant()
  if (tenant.status === 'loading') return <div className="app-loader"><div className="loader-logo" /><span>Loading agency website…</span></div>
  if (tenant.status === 'not-found') return <UnavailablePage />
  if (tenant.status === 'error') return <UnavailablePage type="error" message={tenant.error?.message} />
  return <Routes><Route element={<SiteLayout />}>
    <Route index element={<PageGate page="home"><HomePage /></PageGate>} />
    <Route path="properties" element={<PageGate page="properties"><PropertiesPage /></PageGate>} />
    <Route path="properties/:slug" element={<PageGate page="properties"><PropertyDetailPage /></PageGate>} />
    <Route path="buy" element={<PageGate page="properties"><PropertiesPage forcedPurpose="sale" /></PageGate>} />
    <Route path="rent" element={<PageGate page="properties"><PropertiesPage forcedPurpose="rent" /></PageGate>} />
    <Route path="agents" element={<PageGate page="agents"><AgentsPage /></PageGate>} />
    <Route path="agents/:slug" element={<PageGate page="agents"><AgentDetailPage /></PageGate>} />
    <Route path="about" element={<PageGate page="about"><AboutPage /></PageGate>} />
    <Route path="contact" element={<PageGate page="contact"><ContactPage /></PageGate>} />
    <Route path="list-your-property" element={<PageGate page="valuation"><ListPropertyPage /></PageGate>} />
    <Route path="listings/:slug" element={<LegacyListingRedirect />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>
}
