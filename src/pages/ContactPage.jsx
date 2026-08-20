import { Clock3, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { useEffect } from 'react'
import ContactForm from '../components/forms/ContactForm'
import { useTenant } from '../context/TenantContext'
import { phoneHref, whatsappHref } from '../utils/format'
import { setAgencySeo } from '../utils/seo'

export default function ContactPage() {
  const { agency } = useTenant(); const contact = agency.contact
  useEffect(() => setAgencySeo(agency, { title: `Contact ${agency.name}`, description: `Contact ${agency.name} for property advice, listings, and viewing requests.` }), [agency])
  return <main><section className="page-hero"><div className="container"><p className="eyebrow">Start a conversation</p><h1>How can we help?</h1><p>Tell us what you are looking for and a member of our property team will get back to you.</p></div></section><section className="section"><div className="container contact-layout"><div className="contact-information"><p className="eyebrow">Contact details</p><h2>Reach {agency.name}</h2><p>Choose the contact method that works for you, or send a message using the form.</p><div className="contact-cards">{contact.phone && <a href={phoneHref(contact.phone)}><Phone /><span><small>Call us</small><strong>{contact.phone}</strong></span></a>}{contact.email && <a href={`mailto:${contact.email}`}><Mail /><span><small>Email us</small><strong>{contact.email}</strong></span></a>}{contact.whatsapp && <a href={whatsappHref(contact.whatsapp)} target="_blank" rel="noreferrer"><MessageCircle /><span><small>Message us</small><strong>WhatsApp</strong></span></a>}{(contact.address || contact.serviceArea) && <div><MapPin /><span><small>Visit or find us</small><strong>{contact.address || contact.serviceArea}</strong></span></div>}{contact.hours && <div><Clock3 /><span><small>Business hours</small><strong>{contact.hours}</strong></span></div>}</div></div><ContactForm agency={agency} /></div></section>
    {contact.latitude && contact.longitude && <section className="contact-map"><iframe title={`${agency.name} office map`} loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${contact.longitude-.02}%2C${contact.latitude-.02}%2C${contact.longitude+.02}%2C${contact.latitude+.02}&layer=mapnik&marker=${contact.latitude}%2C${contact.longitude}`} /></section>}
  </main>
}
