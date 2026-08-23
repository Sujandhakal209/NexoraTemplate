import { Clock3, ExternalLink, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useEffect } from 'react'
import ContactForm from '../components/forms/ContactForm'
import { useTenant } from '../context/TenantContext'
import { phoneHref, whatsappHref } from '../utils/format'
import { setAgencySeo } from '../utils/seo'

export default function ContactPage() {
  const { agency } = useTenant(); const contact = agency.contact
  useEffect(() => setAgencySeo(agency, { title: `Contact ${agency.name}`, description: `Contact ${agency.name} for property advice, listings, and viewing requests.` }), [agency])
  const latitude = Number(contact.latitude)
  const longitude = Number(contact.longitude)
  const hasCoordinates = contact.latitude !== null && contact.latitude !== undefined && contact.latitude !== '' && contact.longitude !== null && contact.longitude !== undefined && contact.longitude !== ''
  const hasMap = hasCoordinates && Number.isFinite(latitude) && Number.isFinite(longitude)
  const embedUrl = hasMap ? `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-.01}%2C${latitude-.01}%2C${longitude+.01}%2C${latitude+.01}&layer=mapnik&marker=${latitude}%2C${longitude}` : ''
  const mapUrl = hasMap ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}` : ''

  return <main>
    <section className="page-hero"><div className="container"><p className="eyebrow">Start a conversation</p><h1>How can we help?</h1><p>Tell us what you are looking for and a member of our property team will get back to you.</p></div></section>
    <section className="section"><div className="container contact-layout"><div className="contact-information"><p className="eyebrow">Contact details</p><h2>Reach {agency.name}</h2><p>Choose the contact method that works for you, or send a message using the form.</p><div className="contact-cards">{contact.phone && <a href={phoneHref(contact.phone)}><Phone /><span><small>Call us</small><strong>{contact.phone}</strong></span></a>}{contact.email && <a href={`mailto:${contact.email}`}><Mail /><span><small>Email us</small><strong>{contact.email}</strong></span></a>}{contact.whatsapp && <a href={whatsappHref(contact.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle /><span><small>Message us</small><strong>WhatsApp</strong></span></a>}{(contact.address || contact.serviceArea) && <div><MapPin /><span><small>Visit or find us</small><strong>{contact.address || contact.serviceArea}</strong></span></div>}{contact.hours && <div><Clock3 /><span><small>Business hours</small><strong>{contact.hours}</strong></span></div>}</div></div><ContactForm agency={agency} /></div></section>
    {hasMap && <section className="section contact-map-section"><div className="container">
      <div className="section-heading"><div><p className="eyebrow">Find our office</p><h2>Visit {agency.name}</h2><p>Use the pinned location for directions and contact our team if you need help finding the office.</p></div></div>
      <div className="property-location-panel">
        <div className="property-location-copy"><MapPin /><p className="eyebrow">Office location</p><h3>{contact.address || contact.serviceArea || 'Location provided by the agency'}</h3><p>The marker shows the office location selected by the agency. Open the larger map for navigation and nearby landmarks.</p><a className="text-link" href={mapUrl} target="_blank" rel="noreferrer">Open larger map <ExternalLink /></a></div>
        <iframe className="property-map" title={`${agency.name} office map`} loading="lazy" src={embedUrl} />
      </div>
    </div></section>}
  </main>
}
