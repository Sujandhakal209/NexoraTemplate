import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isPageEnabled } from '../../adapters/agencyAdapter'
import { phoneHref, whatsappHref } from '../../utils/format'

const socialIcons = { facebook: Facebook, instagram: Instagram, linkedin: Linkedin, youtube: Youtube }

export default function Footer({ agency }) {
  const config = agency.config
  const aboutSummary = config.tagline || String(config.about || `Property guidance from ${agency.name}.`).split(/[.!?]/)[0]
  const links = config.footer_navigation?.length ? config.footer_navigation : [
    { page: 'properties', label: 'Properties', url: '/properties' }, { page: 'agents', label: 'Our agents', url: '/agents' },
    { page: 'about', label: 'About us', url: '/about' }, { page: 'contact', label: 'Contact', url: '/contact' },
  ]
  return <footer data-preview-section="footer" className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        {agency.logoLight ? <img src={agency.logoLight} alt={`${agency.name} logo`} /> : <span className="footer-wordmark">{agency.name}</span>}
        <p>{aboutSummary}{aboutSummary && !/[.!?]$/.test(aboutSummary) ? '.' : ''}</p>
        <div className="social-links">{Object.entries(agency.social).map(([platform, url]) => { const Icon = socialIcons[platform]; return url && Icon ? <a key={platform} href={url} target="_blank" rel="noreferrer" aria-label={`${agency.name} on ${platform}`}><Icon size={18} /></a> : null })}</div>
      </div>
      <div><h2>Browse property</h2><ul><li><Link to="/properties">All properties</Link></li><li><Link to="/buy">Properties for sale</Link></li><li><Link to="/rent">Properties for rent</Link></li></ul></div>
      <div><h2>Agency</h2><ul>{links.filter((item) => item.page !== 'portal' && item.page !== 'properties' && isPageEnabled(agency, item.page)).map((item) => <li key={`${item.page}-${item.url}`}><Link to={item.url || `/${item.page}`}>{item.label}</Link></li>)}{isPageEnabled(agency, 'valuation') && <li><Link to="/list-your-property">List your property</Link></li>}</ul></div>
      <div><h2>Contact</h2><ul className="contact-list">{agency.contact.address && <li><MapPin /> <span>{agency.contact.address}</span></li>}{agency.contact.phone && <li><Phone /><a href={phoneHref(agency.contact.phone)}>{agency.contact.phone}</a></li>}{agency.contact.email && <li><Mail /><a href={`mailto:${agency.contact.email}`}>{agency.contact.email}</a></li>}{agency.contact.whatsapp && <li><span className="wa-dot">W</span><a href={whatsappHref(agency.contact.whatsapp)} target="_blank" rel="noreferrer">WhatsApp</a></li>}</ul></div>
    </div>
    {(agency.media.partner_logos || []).length > 0 && <div className="container partner-strip">{agency.media.partner_logos.map((logo, index) => <img key={`${logo}-${index}`} src={logo} alt={`Partner ${index + 1}`} loading="lazy" />)}</div>}
    {config.legal_text && <div className="container footer-legal">{config.legal_text}</div>}
    <div className="container footer-bottom">
      <span>{config.copyright_text || `© ${new Date().getFullYear()} ${agency.name}. All rights reserved.`}</span>
      <nav className="footer-policy-links" aria-label="Legal">
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms-of-service">Terms of Service</Link>
      </nav>
      <span>Powered by Nexora Realty OS</span>
    </div>
  </footer>
}
